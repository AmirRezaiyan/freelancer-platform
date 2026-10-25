from pathlib import Path
import tempfile
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured
from django.test import override_settings
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.settings import build_security_settings
from .profile_completion import BIO_MIN_LENGTH, get_profile_completion
from .models import User

class UserModelTest(TestCase):
	def test_create_user(self):
		user = User.objects.create_user(email="test@example.com", password="testpass123", first_name="Ali", last_name="Rezaei")
		self.assertEqual(user.email, "test@example.com")
		self.assertTrue(user.check_password("testpass123"))
		self.assertEqual(user.first_name, "Ali")
		self.assertEqual(user.last_name, "Rezaei")
		self.assertTrue(user.is_active)

	def test_create_superuser(self):
		admin = User.objects.create_superuser(email="admin@example.com", password="adminpass123")
		self.assertTrue(admin.is_superuser)
		self.assertTrue(admin.is_staff)

class UserAdminTest(TestCase):
	def setUp(self):
		self.admin_user = User.objects.create_superuser(email="admin@admin.com", password="adminpass")
		self.client.force_login(self.admin_user)

	def test_admin_user_listed(self):
		url = reverse("admin:users_user_changelist")
		res = self.client.get(url)
		self.assertContains(res, self.admin_user.email)

	def test_admin_user_change_page(self):
		url = reverse("admin:users_user_change", args=[self.admin_user.id])
		res = self.client.get(url)
		self.assertEqual(res.status_code, 200)

	def test_admin_user_add_page(self):
		url = reverse("admin:users_user_add")
		res = self.client.get(url)
		self.assertEqual(res.status_code, 200)


class SecurityConfigurationTests(TestCase):
	def production_values(self):
		return {
			"DJANGO_ENV": "production",
			"SECRET_KEY": "A1b2C3d4E5f6G7h8J9k0L1m2N3o4P5q6R7s8T9u0V1w2X3y4Z5a6B7c8",
			"DEBUG": "False",
			"ALLOWED_HOSTS": "api.example.com",
			"CORS_ALLOWED_ORIGINS": "https://app.example.com",
			"DATABASE_URL": "postgresql://marketplace:secret@db.internal:5432/marketplace",
			"RATE_LIMIT_CACHE_URL": "redis://redis.internal:6379/0",
			"PRIVATE_MEDIA_ROOT": str(Path(tempfile.gettempdir()) / "freelancer-private-media"),
		}

	def test_development_configuration_has_safe_local_defaults(self):
		config = build_security_settings({"DJANGO_ENV": "development"})

		self.assertTrue(config["DEBUG"])
		self.assertEqual(config["ALLOWED_HOSTS"], ["127.0.0.1", "localhost"])
		self.assertEqual(
			config["CORS_ALLOWED_ORIGINS"],
			["http://localhost:5173", "http://127.0.0.1:5173"],
		)

	def test_production_configuration_rejects_unsafe_values(self):
		valid = self.production_values()
		invalid_values = (
			{"SECRET_KEY": ""},
			{"SECRET_KEY": "short"},
			{"SECRET_KEY": "s" * 64},
			{"SECRET_KEY": "development-only-insecure-key-not-for-production-xxxxxxxx"},
			{"DEBUG": "True"},
			{"ALLOWED_HOSTS": ""},
			{"ALLOWED_HOSTS": "*"},
			{"CORS_ALLOWED_ORIGINS": ""},
			{"CORS_ALLOWED_ORIGINS": "http://app.example.com"},
			{"CORS_ALLOW_CREDENTIALS": "True"},
			{"DATABASE_URL": ""},
			{"DATABASE_URL": "sqlite:///db.sqlite3"},
			{"RATE_LIMIT_CACHE_URL": ""},
			{"RATE_LIMIT_CACHE_URL": "http://redis.internal:6379/0"},
			{"PRIVATE_MEDIA_ROOT": ""},
			{"PRIVATE_MEDIA_ROOT": str(Path(__file__).resolve().parents[1] / "media" / "private")},
		)

		for override in invalid_values:
			with self.subTest(override=override), self.assertRaises(ImproperlyConfigured):
				build_security_settings({**valid, **override})

	def test_debug_false_without_explicit_environment_requires_production_settings(self):
		with self.assertRaises(ImproperlyConfigured):
			build_security_settings({"DEBUG": "False"})

	def test_missing_environment_mode_fails_closed(self):
		for environment in ({}, {"DEBUG": "True"}, {"DEBUG": "False"}):
			with self.subTest(environment=environment), self.assertRaises(ImproperlyConfigured):
				build_security_settings(environment)

	def test_production_credentials_default_to_disabled(self):
		config = build_security_settings(self.production_values())

		self.assertFalse(config["CORS_ALLOW_CREDENTIALS"])

	def test_database_url_selects_sqlite_for_development_and_postgresql_for_production(self):
		from core.settings import build_database_settings

		self.assertEqual(
			build_database_settings("sqlite:///db.sqlite3")["default"]["NAME"],
			str(Path(__file__).resolve().parents[1] / "db.sqlite3"),
		)
		postgres = build_database_settings("postgresql://marketplace:secret@db.internal:5432/marketplace?sslmode=require", production=True)["default"]
		self.assertEqual(postgres["ENGINE"], "django.db.backends.postgresql")
		self.assertEqual(postgres["NAME"], "marketplace")
		self.assertEqual(postgres["OPTIONS"], {"sslmode": "require"})

	@override_settings(
		CORS_ALLOWED_ORIGINS=["https://app.example.com"],
		CORS_ALLOW_CREDENTIALS=True,
		CORS_ALLOW_ALL_ORIGINS=False,
	)
	def test_untrusted_origin_does_not_receive_cors_credentials(self):
		response = self.client.options(
			"/api/users/login/",
			HTTP_ORIGIN="https://untrusted.example",
			HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
		)

		self.assertNotIn("Access-Control-Allow-Origin", response)
		self.assertNotIn("Access-Control-Allow-Credentials", response)

	@override_settings(
		CORS_ALLOWED_ORIGINS=["https://app.example.com"],
		CORS_ALLOW_CREDENTIALS=False,
		CORS_ALLOW_ALL_ORIGINS=False,
	)
	def test_allowlisted_origin_is_allowed_without_credentials(self):
		response = self.client.options(
			"/api/users/login/",
			HTTP_ORIGIN="https://app.example.com",
			HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
		)

		self.assertEqual(response["Access-Control-Allow-Origin"], "https://app.example.com")
		self.assertNotIn("Access-Control-Allow-Credentials", response)


class AuthenticationSecurityTests(TestCase):
	def setUp(self):
		self.api = APIClient()
		cache.clear()

	def test_registration_rejects_weak_password(self):
		response = self.api.post(
			"/api/users/register/",
			{"email": "weak@example.com", "password": "password", "user_type": "freelancer"},
			format="json",
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn("password", response.data)
		self.assertFalse(User.objects.filter(email="weak@example.com").exists())

	def test_registration_accepts_a_valid_password(self):
		response = self.api.post(
			"/api/users/register/",
			{"email": "valid@example.com", "password": "Brisk!Mango_9462", "user_type": "freelancer"},
			format="json",
		)

		self.assertEqual(response.status_code, 201)
		self.assertTrue(User.objects.get(email="valid@example.com").check_password("Brisk!Mango_9462"))

	def test_inactive_account_cannot_obtain_jwt_tokens(self):
		user = User.objects.create_user(email="inactive@example.com", password="Correct!Horse_7291")
		user.is_active = False
		user.save(update_fields=["is_active"])

		response = self.api.post(
			"/api/users/login/",
			{"email": user.email, "password": "Correct!Horse_7291"},
			format="json",
		)

		self.assertEqual(response.status_code, 400)
		self.assertNotIn("access", response.data)
		self.assertNotIn("refresh", response.data)

	def test_login_error_does_not_distinguish_unknown_email_from_bad_password(self):
		User.objects.create_user(email="known-login@example.com", password="Correct!Horse_7291")

		unknown_response = self.api.post(
			"/api/users/login/",
			{"email": "missing-login@example.com", "password": "Wrong!Horse_7291"},
			format="json",
			REMOTE_ADDR="203.0.113.41",
		)
		wrong_password_response = self.api.post(
			"/api/users/login/",
			{"email": "known-login@example.com", "password": "Wrong!Horse_7291"},
			format="json",
			REMOTE_ADDR="203.0.113.42",
		)

		self.assertEqual(unknown_response.status_code, 400)
		self.assertEqual(unknown_response.status_code, wrong_password_response.status_code)
		self.assertEqual(unknown_response.data, wrong_password_response.data)

	def test_repeated_login_attempts_are_throttled(self):
		statuses = []
		for _ in range(6):
			response = self.api.post(
				"/api/users/login/",
				{"email": "missing@example.com", "password": "wrong-password"},
				format="json",
				REMOTE_ADDR="203.0.113.25",
			)
			statuses.append(response.status_code)

		self.assertEqual(statuses[:5], [400] * 5)
		self.assertEqual(statuses[5], 429)

	def test_repeated_registration_attempts_are_throttled(self):
		statuses = []
		for attempt in range(11):
			response = self.api.post(
				"/api/users/register/",
				{
					"email": f"register-{attempt}@example.com",
					"password": "Brisk!Mango_9462",
					"user_type": "freelancer",
				},
				format="json",
				REMOTE_ADDR="203.0.113.26",
				HTTP_X_FORWARDED_FOR=f"198.51.100.{attempt + 1}",
			)
			statuses.append(response.status_code)

		self.assertEqual(statuses[:10], [201] * 10)
		self.assertEqual(statuses[10], 429)

	def test_admin_login_alternate_path_is_throttled(self):
		statuses = []
		for _ in range(11):
			response = self.api.post(
				"/admin/login/",
				{"username": "admin@example.com", "password": "wrong-password"},
				REMOTE_ADDR="203.0.113.27",
			)
			statuses.append(response.status_code)

		self.assertEqual(statuses[:10], [200] * 10)
		self.assertEqual(statuses[10], 429)

	def test_refresh_route_is_mounted_at_frontend_path(self):
		self.assertEqual(reverse("token_refresh"), "/api/token/refresh/")

	def test_valid_refresh_rotates_tokens_and_blacklists_the_old_refresh(self):
		user = User.objects.create_user(email="refresh@example.com", password="pass")
		old_refresh = str(RefreshToken.for_user(user))

		response = self.api.post("/api/token/refresh/", {"refresh": old_refresh}, format="json")

		self.assertEqual(response.status_code, 200)
		self.assertIn("access", response.data)
		self.assertIn("refresh", response.data)
		self.assertNotEqual(response.data["refresh"], old_refresh)
		reused_response = self.api.post("/api/token/refresh/", {"refresh": old_refresh}, format="json")
		self.assertEqual(reused_response.status_code, 401)

	def test_invalid_and_expired_refresh_tokens_are_rejected(self):
		invalid_response = self.api.post("/api/token/refresh/", {"refresh": "not-a-token"}, format="json")
		self.assertEqual(invalid_response.status_code, 401)

		user = User.objects.create_user(email="expired@example.com", password="pass")
		expired_refresh = RefreshToken.for_user(user)
		expired_refresh.set_exp(from_time=timezone.now() - timedelta(days=8))
		expired_response = self.api.post(
			"/api/token/refresh/",
			{"refresh": str(expired_refresh)},
			format="json",
		)
		self.assertEqual(expired_response.status_code, 401)


class ProfileCompletionTests(TestCase):
	def make_user(self, user_type="freelancer", **fields):
		return User.objects.create_user(
			email=f"{user_type}-{User.objects.count()}@profile.test",
			password="pass",
			user_type=user_type,
			**fields,
		)

	def test_empty_profile_is_incomplete_for_role(self):
		user = self.make_user()

		result = get_profile_completion(user)

		self.assertFalse(result["is_complete"])
		self.assertEqual(result["percentage"], 0)
		self.assertEqual(result["missing"], ["first_name", "last_name", "bio", "skills"])
		self.assertFalse(result["can_create_project"])
		self.assertFalse(result["can_initiate_chat"])
		self.assertFalse(result["can_submit_proposal"])

	def test_whitespace_names_and_bio_do_not_count(self):
		user = self.make_user(
			first_name="  ",
			last_name="\t",
			bio=" " * BIO_MIN_LENGTH,
			skills=["Python"],
		)

		result = get_profile_completion(user)

		self.assertEqual(result["missing"], ["first_name", "last_name", "bio"])
		self.assertEqual(result["percentage"], 25)

	def test_bio_must_meet_trimmed_minimum_length(self):
		bio = "x" * (BIO_MIN_LENGTH - 1)
		user = self.make_user(first_name="Ada", last_name="Lovelace", bio=f" {bio} ", skills=["Python"])

		result = get_profile_completion(user)

		self.assertEqual(result["missing"], ["bio"])
		self.assertFalse(result["is_complete"])

	def test_freelancer_requires_at_least_one_nonempty_string_skill(self):
		user = self.make_user(
			first_name="Ada",
			last_name="Lovelace",
			bio="A sufficiently long profile biography.",
			skills=[" ", None, 4],
		)

		result = get_profile_completion(user)

		self.assertEqual(result["missing"], ["skills"])
		self.assertFalse(result["can_initiate_chat"])

	def test_complete_freelancer_can_initiate_chat_but_not_create_projects(self):
		user = self.make_user(
			first_name="Ada",
			last_name="Lovelace",
			bio="A sufficiently long profile biography.",
			skills=[" Python ", ""],
		)

		result = get_profile_completion(user)

		self.assertTrue(result["is_complete"])
		self.assertEqual(result["percentage"], 100)
		self.assertTrue(result["can_initiate_chat"])
		self.assertFalse(result["can_create_project"])
		self.assertTrue(result["can_submit_proposal"])

	def test_complete_client_uses_nonempty_business_field(self):
		user = self.make_user(
			user_type="client",
			first_name="Ada",
			last_name="Lovelace",
			bio="A sufficiently long profile biography.",
			business_fields=["  ", "Software"],
		)

		result = get_profile_completion(user)

		self.assertTrue(result["is_complete"])
		self.assertTrue(result["can_create_project"])
		self.assertTrue(result["can_initiate_chat"])
		self.assertFalse(result["can_submit_proposal"])

	def test_current_user_api_exposes_role_correct_proposal_capability(self):
		complete_freelancer = self.make_user(
			first_name="Ada",
			last_name="Lovelace",
			bio="A sufficiently long profile biography.",
			skills=["Python"],
		)
		incomplete_freelancer = self.make_user(user_type="freelancer")
		client = self.make_user(
			user_type="client",
			first_name="Grace",
			last_name="Hopper",
			bio="A sufficiently long profile biography.",
			business_fields=["Software"],
		)
		unknown_role = self.make_user(
			user_type="unknown",
			first_name="Grace",
			last_name="Hopper",
			bio="A sufficiently long profile biography.",
			skills=["Python"],
		)
		api = APIClient()

		for user, expected in (
			(complete_freelancer, True),
			(incomplete_freelancer, False),
			(client, False),
			(unknown_role, False),
		):
			with self.subTest(user_type=user.user_type, expected=expected):
				api.force_authenticate(user=user)
				response = api.get("/api/users/me/")
				self.assertEqual(response.status_code, 200)
				self.assertEqual(response.data["profile_completion"]["can_submit_proposal"], expected)

	def test_client_can_use_meaningful_company_description_instead(self):
		user = self.make_user(
			user_type="client",
			first_name="Ada",
			last_name="Lovelace",
			bio="A sufficiently long profile biography.",
			business_fields=[],
			company_description="Our company builds useful products for local businesses.",
		)

		self.assertTrue(get_profile_completion(user)["is_complete"])

	def test_malformed_role_data_does_not_satisfy_completion(self):
		freelancer = self.make_user(
			first_name="Ada",
			last_name="Lovelace",
			bio="A sufficiently long profile biography.",
			skills={"skill": "Python"},
		)
		client = self.make_user(
			user_type="client",
			first_name="Grace",
			last_name="Hopper",
			bio="A sufficiently long profile biography.",
			business_fields={"field": "Software"},
			company_description="short",
		)

		self.assertEqual(get_profile_completion(freelancer)["missing"], ["skills"])
		self.assertEqual(
			get_profile_completion(client)["missing"],
			["business_fields_or_company_description"],
		)

	def test_unknown_user_role_never_gets_proposal_capability(self):
		user = self.make_user(
			user_type="unknown",
			first_name="Ada",
			last_name="Lovelace",
			bio="A sufficiently long profile biography.",
			skills=["Python"],
		)

		result = get_profile_completion(user)

		self.assertFalse(result["can_submit_proposal"])
		self.assertFalse(result["is_complete"])
		self.assertIn("user_type", result["missing"])

	def test_authenticated_profile_exposes_completion_but_public_profile_does_not(self):
		user = self.make_user()
		api = APIClient()
		api.force_authenticate(user=user)

		private_response = api.get("/api/users/me/")
		public_response = api.get(f"/api/users/{user.pk}/")

		self.assertEqual(private_response.status_code, 200)
		self.assertIn("profile_completion", private_response.data)
		self.assertEqual(private_response.data["profile_completion"], get_profile_completion(user))
		self.assertEqual(public_response.status_code, 200)
		self.assertNotIn("profile_completion", public_response.data)
		self.assertNotIn("email", public_response.data)

	def test_user_role_remains_read_only_on_profile_updates(self):
		user = self.make_user(user_type="freelancer")
		api = APIClient()
		api.force_authenticate(user=user)

		response = api.patch("/api/users/me/", {"user_type": "client"}, format="json")

		self.assertEqual(response.status_code, 200)
		user.refresh_from_db()
		self.assertEqual(user.user_type, "freelancer")

	def test_profile_list_fields_reject_malformed_object_values(self):
		freelancer = self.make_user(user_type="freelancer")
		client = self.make_user(user_type="client")
		api = APIClient()
		api.force_authenticate(user=freelancer)
		invalid_skill_payloads = (
			{"skills": {"skill": "Python"}},
			{"skills": '{"skill":"Python"}'},
			{"skills_json": '{"skill":"Python"}'},
		)

		for payload in invalid_skill_payloads:
			with self.subTest(payload=payload):
				self.assertEqual(api.patch("/api/users/me/", payload, format="json").status_code, 400)

		api.force_authenticate(user=client)
		invalid_business_payloads = (
			{"business_fields": {"field": "Software"}},
			{"business_fields_json": '{"field":"Software"}'},
		)
		for payload in invalid_business_payloads:
			with self.subTest(payload=payload):
				self.assertEqual(api.patch("/api/users/me/", payload, format="json").status_code, 400)

		freelancer.refresh_from_db()
		client.refresh_from_db()
		self.assertEqual(freelancer.skills, [])
		self.assertEqual(client.business_fields, [])

	def test_experience_years_rejects_negative_null_and_malformed_values(self):
		user = self.make_user()
		api = APIClient()
		api.force_authenticate(user=user)

		for value in (-1, None, "not-an-integer"):
			with self.subTest(value=value):
				response = api.patch("/api/users/me/", {"experience_years": value}, format="json")
				self.assertEqual(response.status_code, 400)

		valid_response = api.patch("/api/users/me/", {"experience_years": 12}, format="json")
		self.assertEqual(valid_response.status_code, 200)
		self.assertEqual(valid_response.data["experience_years"], 12)
		blank_response = api.patch("/api/users/me/", {"experience_years": ""}, format="json")
		self.assertEqual(blank_response.status_code, 200)
		user.refresh_from_db()
		self.assertEqual(user.experience_years, 12)

	def test_malformed_website_type_returns_validation_error(self):
		user = self.make_user()
		api = APIClient()
		api.force_authenticate(user=user)

		response = api.patch("/api/users/me/", {"website": {"url": "https://example.com"}}, format="json")

		self.assertEqual(response.status_code, 400)

	def test_profile_editor_json_array_payloads_are_preserved(self):
		freelancer = self.make_user(user_type="freelancer")
		client = self.make_user(user_type="client")
		api = APIClient()
		api.force_authenticate(user=freelancer)
		freelancer_response = api.patch(
			"/api/users/me/",
			{
				"first_name": "Ada",
				"last_name": "Lovelace",
				"bio": "A sufficiently long profile biography.",
				"skills": '["Python", " Django "]',
				"skills_json": '["Python", " Django "]',
			},
			format="json",
		)
		api.force_authenticate(user=client)
		client_response = api.patch(
			"/api/users/me/",
			{
				"first_name": "Grace",
				"last_name": "Hopper",
				"bio": "A sufficiently long profile biography.",
				"business_fields": '["Software"]',
				"business_fields_json": '["Software"]',
			},
			format="json",
		)

		self.assertEqual(freelancer_response.status_code, 200)
		self.assertEqual(client_response.status_code, 200)
		freelancer.refresh_from_db()
		client.refresh_from_db()
		self.assertEqual(freelancer.skills, ["Python", "Django"])
		self.assertEqual(client.business_fields, ["Software"])
		self.assertTrue(freelancer_response.data["profile_completion"]["is_complete"])
		self.assertTrue(client_response.data["profile_completion"]["is_complete"])
