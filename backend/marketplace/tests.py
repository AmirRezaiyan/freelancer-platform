import io
import tempfile
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from django.db import connection
from django.db import close_old_connections
from django.test import TestCase, TransactionTestCase
from django.test.utils import CaptureQueriesContext
from django.test import SimpleTestCase
from django.test import override_settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Project, Proposal, ProjectMessage, Portfolio, Wallet, ActivityLog, Rating
from .serializers import ProjectSerializer
from rest_framework.test import APIClient, APIRequestFactory
from unittest import skipUnless
from unittest.mock import patch
from django.db import IntegrityError, transaction
from PIL import Image
from core.upload_validation import (
	AVATAR_UPLOAD_MAX_BYTES,
	MESSAGE_UPLOAD_MAX_BYTES,
	PORTFOLIO_UPLOAD_MAX_BYTES,
	validate_upload,
)

User = get_user_model()

class ProjectModelTest(TestCase):
	def setUp(self):
		self.client_user = User.objects.create_user(email="client@test.com", password="pass", user_type="client")
		self.project = Project.objects.create(title="Test Project", description="desc", budget_min=100, budget_max=200, category="web", client=self.client_user)

	def test_project_str(self):
		self.assertEqual(str(self.project), "Test Project")

class ProposalModelTest(TestCase):
	def setUp(self):
		self.client_user = User.objects.create_user(email="client2@test.com", password="pass", user_type="client")
		self.freelancer = User.objects.create_user(email="free@test.com", password="pass", user_type="freelancer")
		self.project = Project.objects.create(title="Proj", description="desc", budget_min=10, budget_max=20, category="web", client=self.client_user)
		self.proposal = Proposal.objects.create(project=self.project, freelancer=self.freelancer, message="msg", bid_amount=15)

	def test_proposal_str(self):
		self.assertIn(self.freelancer.email, str(self.proposal))

class ProjectMessageModelTest(TestCase):
	def setUp(self):
		self.client_user = User.objects.create_user(email="client3@test.com", password="pass", user_type="client")
		self.project = Project.objects.create(title="Proj2", description="desc", budget_min=10, budget_max=20, category="web", client=self.client_user)
		self.message = ProjectMessage.objects.create(project=self.project, sender=self.client_user, message="hi")

	def test_message_str(self):
		self.assertIn(self.project.title, str(self.message))

class PortfolioModelTest(TestCase):
	def setUp(self):
		self.freelancer = User.objects.create_user(email="free2@test.com", password="pass", user_type="freelancer")
		self.portfolio = Portfolio.objects.create(freelancer=self.freelancer, title="My Portfolio", description="desc")

	def test_portfolio_str(self):
		self.assertEqual(
			str(self.portfolio),
			f"Portfolio by {self.freelancer.email}: {self.portfolio.title}",
		)

class WalletModelTest(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(email="wallet@test.com", password="pass")
		self.wallet = Wallet.objects.create(user=self.user, balance=100)

	def test_wallet_str(self):
		self.assertIn(self.user.email, str(self.wallet))

class ActivityLogModelTest(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(email="activity@test.com", password="pass")
		self.log = ActivityLog.objects.create(user=self.user, action="login")

	def test_activitylog_str(self):
		self.assertIn(self.user.email, str(self.log))

class RatingModelTest(TestCase):
	def setUp(self):
		self.client_user = User.objects.create_user(email="client4@test.com", password="pass", user_type="client")
		self.freelancer = User.objects.create_user(email="free3@test.com", password="pass", user_type="freelancer")
		self.project = Project.objects.create(title="Proj3", description="desc", budget_min=10, budget_max=20, category="web", client=self.client_user)
		self.rating = Rating.objects.create(project=self.project, from_user=self.client_user, to_user=self.freelancer, rating=5)

	def test_rating_str(self):
		self.assertIn(str(self.rating.rating), str(self.rating))


class MarketplaceAuthorizationAPITests(TestCase):
	def setUp(self):
		self.client_user = User.objects.create_user(email="owner@test.com", password="pass", user_type="client")
		self.other_client = User.objects.create_user(email="other-client@test.com", password="pass", user_type="client")
		self.freelancer = User.objects.create_user(email="freelancer@test.com", password="pass", user_type="freelancer")
		self.other_freelancer = User.objects.create_user(email="other-freelancer@test.com", password="pass", user_type="freelancer")
		self.project = self.create_project()
		self.proposal = Proposal.objects.create(
			project=self.project,
			freelancer=self.freelancer,
			message="Confidential proposal",
			bid_amount=150,
		)
		self.api = APIClient()

	def create_project(self, client=None, title="API Project"):
		return Project.objects.create(
			title=title,
			description="Project description",
			budget_min=100,
			budget_max=200,
			category="web",
			client=client or self.client_user,
		)

	def test_anonymous_user_cannot_list_project_proposals(self):
		response = self.api.get(f"/api/market/projects/{self.project.id}/proposals/")

		self.assertNotEqual(response.status_code, 200)

	def test_unrelated_user_cannot_read_project_proposals(self):
		self.api.force_authenticate(user=self.other_client)

		response = self.api.get(f"/api/market/projects/{self.project.id}/proposals/")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["count"], 0)
		self.assertIsNone(response.data["next"])
		self.assertIsNone(response.data["previous"])
		self.assertEqual(response.data["results"], [])

	def test_project_owner_can_review_all_project_proposals(self):
		other_proposal = Proposal.objects.create(
			project=self.project,
			freelancer=self.other_freelancer,
			message="Second confidential proposal",
			bid_amount=175,
		)
		self.api.force_authenticate(user=self.client_user)

		response = self.api.get(f"/api/market/projects/{self.project.id}/proposals/")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["count"], 2)
		self.assertEqual({item["id"] for item in response.data["results"]}, {self.proposal.id, other_proposal.id})

	def test_freelancer_can_edit_and_withdraw_only_own_pending_proposal(self):
		self.api.force_authenticate(user=self.freelancer)
		response = self.api.patch(
			f"/api/market/proposals/{self.proposal.id}/",
			{"message": "Updated cover letter", "bid_amount": 175, "status": "accepted", "freelancer": self.other_freelancer.id},
			format="json",
		)
		self.assertEqual(response.status_code, 200)
		self.proposal.refresh_from_db()
		self.assertEqual(self.proposal.message, "Updated cover letter")
		self.assertEqual(self.proposal.bid_amount, 175)
		self.assertEqual(self.proposal.status, "pending")
		self.assertEqual(self.proposal.freelancer, self.freelancer)

		self.assertEqual(self.api.delete(f"/api/market/proposals/{self.proposal.id}/").status_code, 204)
		self.assertFalse(Proposal.objects.filter(pk=self.proposal.id).exists())

	def test_accepted_proposal_cannot_be_edited_or_withdrawn(self):
		self.project.status = "in_progress"
		self.project.hired_freelancer = self.freelancer
		self.project.save(update_fields=["status", "hired_freelancer"])
		self.proposal.status = "accepted"
		self.proposal.save(update_fields=["status"])
		self.api.force_authenticate(user=self.freelancer)

		update_response = self.api.patch(
			f"/api/market/proposals/{self.proposal.id}/",
			{"message": "Changed after hiring"},
			format="json",
		)
		delete_response = self.api.delete(f"/api/market/proposals/{self.proposal.id}/")

		self.assertEqual(update_response.status_code, 400)
		self.assertEqual(delete_response.status_code, 400)
		self.proposal.refresh_from_db()
		self.assertEqual(self.proposal.status, "accepted")
		self.assertEqual(self.proposal.message, "Confidential proposal")

	def test_unrelated_user_cannot_edit_or_withdraw_proposal(self):
		self.api.force_authenticate(user=self.other_freelancer)
		response = self.api.patch(
			f"/api/market/proposals/{self.proposal.id}/",
			{"message": "Unauthorized edit"},
			format="json",
		)
		self.assertEqual(response.status_code, 404)
		self.assertEqual(self.api.delete(f"/api/market/proposals/{self.proposal.id}/").status_code, 404)

	def test_freelancer_can_review_own_proposal_status_only(self):
		Proposal.objects.create(
			project=self.project,
			freelancer=self.other_freelancer,
			message="Other freelancer confidential proposal",
			bid_amount=175,
		)
		self.api.force_authenticate(user=self.freelancer)

		response = self.api.get(f"/api/market/projects/{self.project.id}/proposals/")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["count"], 1)
		self.assertEqual(len(response.data["results"]), 1)
		self.assertEqual(response.data["results"][0]["id"], self.proposal.id)
		self.assertEqual(response.data["results"][0]["status"], "pending")
		self.assertNotEqual(response.data["results"][0]["message"], "Other freelancer confidential proposal")

	def test_project_list_is_paginated_ordered_filtered_and_bounded(self):
		Project.objects.bulk_create([
			Project(
				title=f"Additional project {index}",
				description="Pagination fixture",
				budget_min=100,
				budget_max=200,
				category="web",
				client=self.client_user,
			)
			for index in range(55)
		])
		self.api.force_authenticate(user=self.client_user)

		response = self.api.get("/api/market/projects/?page_size=500")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["count"], 56)
		self.assertEqual(len(response.data["results"]), 50)
		self.assertIsNotNone(response.data["next"])
		project_ids = [item["id"] for item in response.data["results"]]
		self.assertEqual(project_ids, sorted(project_ids, reverse=True))

		filtered = self.api.get("/api/market/projects/?status=open&q=API%20Project")
		self.assertEqual(filtered.data["count"], 1)
		self.assertEqual(filtered.data["results"][0]["id"], self.project.id)
		self.assertEqual(self.api.get("/api/market/projects/?page=invalid").status_code, 404)
		self.assertEqual(self.api.get("/api/market/projects/?page=99").status_code, 404)

	def test_project_list_proposal_annotations_prevent_per_project_queries(self):
		projects = [self.project]
		for index in range(5):
			projects.append(self.create_project(title=f"Query project {index}"))
		self.api.force_authenticate(user=self.freelancer)
		request = APIRequestFactory().get("/api/market/projects/")
		request.user = self.freelancer
		legacy_queryset = Project.objects.select_related("client", "hired_freelancer").order_by("-created_at", "-pk")
		with CaptureQueriesContext(connection) as legacy_queries:
			ProjectSerializer(legacy_queryset, many=True, context={"request": request}).data

		with CaptureQueriesContext(connection) as captured:
			response = self.api.get("/api/market/projects/")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["count"], 6)
		self.assertEqual(len(response.data["results"]), 6)
		self.assertEqual(len(legacy_queries), 13)
		self.assertEqual(len(captured), 2, [query["sql"] for query in captured])
		applied_project = next(item for item in response.data["results"] if item["id"] == projects[0].id)
		self.assertTrue(applied_project["has_applied"])
		self.assertEqual(applied_project["user_proposal_id"], Proposal.objects.get(project=projects[0]).id)
		for index in range(10):
			self.create_project(title=f"More query project {index}")
		with CaptureQueriesContext(connection) as larger_capture:
			larger_response = self.api.get("/api/market/projects/")
		self.assertEqual(larger_response.data["count"], 16)
		self.assertEqual(len(larger_capture), len(captured))

	def test_dashboard_counts_preserve_user_scope_and_require_authentication(self):
		unauthenticated = self.api.get("/api/market/dashboard/")
		self.assertEqual(unauthenticated.status_code, 401)

		self.api.force_authenticate(user=self.client_user)
		client_response = self.api.get("/api/market/dashboard/")
		self.assertEqual(client_response.status_code, 200)
		self.assertEqual(client_response.data["counts"], {
			"projects_total": 1,
			"in_progress": 0,
			"proposals_received": 1,
		})

		self.api.force_authenticate(user=self.freelancer)
		freelancer_response = self.api.get("/api/market/dashboard/")
		self.assertEqual(freelancer_response.status_code, 200)
		self.assertEqual(freelancer_response.data["counts"], {
			"proposals_sent": 1,
			"active_contracts": 0,
			"earnings": 0,
		})

	def test_conversation_list_is_paginated_and_scoped_to_hired_projects(self):
		Project.objects.bulk_create([
			Project(
				title=f"Conversation {index}",
				description="Conversation project",
				budget_min=100,
				budget_max=200,
				category="web",
				client=self.client_user,
				hired_freelancer=self.freelancer,
				status="in_progress",
			)
			for index in range(21)
		])
		foreign_project = Project.objects.create(
			title="Another client's conversation",
			description="Private conversation",
			budget_min=100,
			budget_max=200,
			category="web",
			client=self.other_client,
			hired_freelancer=self.other_freelancer,
			status="in_progress",
		)
		self.api.force_authenticate(user=self.client_user)

		response = self.api.get("/api/market/conversations/")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["count"], 21)
		self.assertEqual(len(response.data["results"]), 20)
		self.assertIsNotNone(response.data["next"])
		self.assertNotIn(foreign_project.pk, {item["project"]["id"] for item in response.data["results"]})
		second_page = self.api.get("/api/market/conversations/?page=2")
		self.assertEqual(len(second_page.data["results"]), 1)
		self.assertNotIn(
			second_page.data["results"][0]["project"]["id"],
			{item["project"]["id"] for item in response.data["results"]},
		)

		self.api.force_authenticate(user=self.freelancer)
		freelancer_response = self.api.get("/api/market/conversations/")
		self.assertEqual(freelancer_response.data["count"], 21)
		self.assertNotIn(foreign_project.pk, {item["project"]["id"] for item in freelancer_response.data["results"]})

	def test_mark_all_read_updates_every_owned_project_and_no_foreign_messages(self):
		projects = Project.objects.bulk_create([
			Project(
				title=f"Unread project {index}",
				description="Unread fixture",
				budget_min=100,
				budget_max=200,
				category="web",
				client=self.client_user,
				hired_freelancer=self.freelancer,
				status="in_progress",
			)
			for index in range(21)
		])
		own_messages = ProjectMessage.objects.bulk_create([
			ProjectMessage(project=project, sender=self.freelancer, message="Unread", read=False)
			for project in projects
		])
		foreign_message = ProjectMessage.objects.create(
			project=self.create_project(client=self.other_client),
			sender=self.other_freelancer,
			message="Foreign unread",
			read=False,
		)
		self.api.force_authenticate(user=self.client_user)

		response = self.api.post("/api/market/messages/mark-all-read/")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["updated"], 21)
		self.assertFalse(ProjectMessage.objects.filter(pk__in=[message.pk for message in own_messages], read=False).exists())
		foreign_message.refresh_from_db()
		self.assertFalse(foreign_message.read)
		self.api.force_authenticate(user=self.freelancer)
		self.assertEqual(self.api.post("/api/market/messages/mark-all-read/").status_code, 403)
		self.api.force_authenticate(user=self.other_client)
		other_client_response = self.api.post("/api/market/messages/mark-all-read/")
		self.assertEqual(other_client_response.status_code, 200)
		self.assertEqual(other_client_response.data["updated"], 1)
		foreign_message.refresh_from_db()
		self.assertTrue(foreign_message.read)

	def test_public_project_response_omits_hired_freelancer_email(self):
		self.project.hired_freelancer = self.freelancer
		self.project.status = "in_progress"
		self.project.save()

		response = self.api.get(f"/api/market/projects/{self.project.id}/")

		self.assertEqual(response.status_code, 200)
		self.assertNotIn("email", response.data["hired_freelancer"])
		self.assertEqual(response.data["hired_freelancer"]["id"], self.freelancer.id)

	def test_freelancer_cannot_create_project_through_either_route(self):
		self.api.force_authenticate(user=self.freelancer)
		payload = {
			"title": "Freelancer project",
			"description": "Description",
			"budget_min": 100,
			"budget_max": 200,
			"category": "web",
		}

		for path in ("/api/market/projects/", "/api/market/projects/create/"):
			with self.subTest(path=path):
				response = self.api.post(path, payload, format="json")
				self.assertEqual(response.status_code, 403)

	def test_client_can_create_project_through_both_routes(self):
		self.api.force_authenticate(user=self.client_user)
		payload = {
			"title": "Client project",
			"description": "Description",
			"budget_min": 100,
			"budget_max": 200,
			"category": "web",
		}

		for path in ("/api/market/projects/", "/api/market/projects/create/"):
			with self.subTest(path=path):
				response = self.api.post(path, payload, format="json")
				self.assertEqual(response.status_code, 201)
				self.assertEqual(Project.objects.get(pk=response.data["id"]).client, self.client_user)

	def test_proposal_status_cannot_be_supplied_by_request(self):
		for index, (freelancer, requested_status) in enumerate(
			((self.other_freelancer, "accepted"), (self.freelancer, "rejected"))
		):
			with self.subTest(status=requested_status):
				project = self.create_project(title=f"Status project {index}")
				self.api.force_authenticate(user=freelancer)
				response = self.api.post(
					"/api/market/proposals/",
					{
						"project": project.id,
						"message": "Valid proposal",
						"bid_amount": 150,
						"status": requested_status,
					},
					format="json",
				)

				self.assertEqual(response.status_code, 201)
				self.assertEqual(Proposal.objects.get(project=project).status, "pending")

	def test_unexpected_proposal_creation_error_is_not_returned(self):
		self.api.force_authenticate(user=self.other_freelancer)

		with patch(
			"marketplace.serializers.ProposalCreateSerializer.create",
			side_effect=RuntimeError("sensitive database detail"),
		):
			for path in ("/api/market/proposals/", "/api/market/proposals/create/"):
				with self.subTest(path=path):
					response = self.api.post(
						path,
						{
							"project": self.project.id,
							"message": "Valid proposal",
							"bid_amount": 150,
					},
						format="json",
					)

					self.assertEqual(response.status_code, 500)
					self.assertNotIn("sensitive database detail", str(response.data))

	def test_legacy_proposal_creation_preserves_frontend_payload_and_server_ownership(self):
		self.api.force_authenticate(user=self.other_freelancer)

		response = self.api.post(
			"/api/market/proposals/",
			{
				"project": self.project.id,
				"cover_letter": "Frontend cover letter",
				"bid": 125,
				"freelancer": self.freelancer.id,
			},
			format="json",
		)

		self.assertEqual(response.status_code, 201)
		proposal = Proposal.objects.get(pk=response.data["id"])
		self.assertEqual(proposal.freelancer, self.other_freelancer)
		self.assertEqual(proposal.status, "pending")
		self.assertEqual(proposal.message, "Frontend cover letter")
		self.assertEqual(proposal.bid_amount, 125)

	def test_active_proposal_creation_accepts_message_and_bid_aliases(self):
		self.api.force_authenticate(user=self.other_freelancer)

		response = self.api.post(
			"/api/market/proposals/create/",
			{
				"project": self.project.id,
				"message": "Active endpoint proposal",
				"bid": 125,
			},
			format="json",
		)

		self.assertEqual(response.status_code, 201)
		proposal = Proposal.objects.get(project=self.project, freelancer=self.other_freelancer)
		self.assertEqual(proposal.status, "pending")
		self.assertEqual(proposal.message, "Active endpoint proposal")
		self.assertEqual(proposal.bid_amount, 125)

	def test_both_proposal_endpoints_reject_negative_bids(self):
		self.api.force_authenticate(user=self.other_freelancer)
		requests = (
			("/api/market/proposals/", {"cover_letter": "Proposal", "bid": -1}),
			("/api/market/proposals/create/", {"message": "Proposal", "bid_amount": -1}),
		)

		for path, proposal_fields in requests:
			with self.subTest(path=path):
				response = self.api.post(
					path,
					{"project": self.project.id, **proposal_fields},
					format="json",
				)
				self.assertEqual(response.status_code, 400)
				self.assertFalse(
					Proposal.objects.filter(project=self.project, freelancer=self.other_freelancer).exists()
				)


class MarketplaceProposalIntegrityTests(TestCase):
	def setUp(self):
		self.client_user = User.objects.create_user(email="integrity-client@test.com", password="pass", user_type="client")
		self.freelancer = User.objects.create_user(email="integrity-freelancer@test.com", password="pass", user_type="freelancer")
		self.other_freelancer = User.objects.create_user(email="integrity-other@test.com", password="pass", user_type="freelancer")
		self.project = Project.objects.create(
			title="Budgeted project",
			description="Project description",
			budget_min=100,
			budget_max=200,
			category="web",
			client=self.client_user,
		)
		self.api = APIClient()

	def post_legacy(self, user, payload):
		self.api.force_authenticate(user=user)
		return self.api.post("/api/market/proposals/", payload, format="json")

	def test_client_cannot_submit_proposal(self):
		self.api.force_authenticate(user=self.client_user)
		for path in ("/api/market/proposals/", "/api/market/proposals/create/"):
			with self.subTest(path=path):
				response = self.api.post(
					path,
					{
						"project": self.project.id,
						"message": "Proposal",
						"bid_amount": 150,
					},
					format="json",
				)
				self.assertEqual(response.status_code, 403)
		self.assertFalse(Proposal.objects.filter(project=self.project).exists())

	def test_freelancer_cannot_propose_on_own_project(self):
		self_owned_project = Project.objects.create(
			title="Freelancer's project",
			description="Project description",
			budget_min=100,
			budget_max=200,
			category="web",
			client=self.freelancer,
		)

		self.api.force_authenticate(user=self.freelancer)
		for path in ("/api/market/proposals/", "/api/market/proposals/create/"):
			with self.subTest(path=path):
				response = self.api.post(
					path,
					{"project": self_owned_project.id, "message": "Proposal", "bid_amount": 150},
					format="json",
				)
				self.assertEqual(response.status_code, 400)
		self.assertFalse(Proposal.objects.filter(project=self_owned_project).exists())

	def test_proposal_requires_open_project(self):
		self.project.status = "cancelled"
		self.project.save(update_fields=["status"])

		self.api.force_authenticate(user=self.freelancer)
		for path in ("/api/market/proposals/", "/api/market/proposals/create/"):
			with self.subTest(path=path):
				response = self.api.post(
					path,
					{"project": self.project.id, "message": "Proposal", "bid_amount": 150},
					format="json",
				)
				self.assertEqual(response.status_code, 400)
		self.assertFalse(Proposal.objects.filter(project=self.project).exists())

	def test_bid_must_be_positive_and_within_each_configured_bound(self):
		self.api.force_authenticate(user=self.freelancer)
		for index, bid in enumerate((0, -1, 99, 201)):
			with self.subTest(bid=bid):
				response = self.api.post(
					"/api/market/proposals/create/",
					{
						"project": self.project.id,
						"message": f"Proposal {index}",
						"bid": bid,
					},
					format="json",
				)
				self.assertEqual(response.status_code, 400)
				self.assertFalse(Proposal.objects.filter(project=self.project).exists())

	def test_duplicate_proposal_is_rejected(self):
		Proposal.objects.create(project=self.project, freelancer=self.freelancer, message="Existing", bid_amount=150)

		response = self.post_legacy(self.freelancer, {
			"project": self.project.id,
			"message": "Duplicate",
			"bid": 150,
		})

		self.assertEqual(response.status_code, 400)
		self.assertEqual(Proposal.objects.filter(project=self.project, freelancer=self.freelancer).count(), 1)

	def test_price_and_cover_letter_aliases_remain_supported(self):
		response = self.post_legacy(self.freelancer, {
			"project_id": self.project.id,
			"cover_letter": "Legacy cover letter",
			"price": 150,
		})

		self.assertEqual(response.status_code, 201)
		proposal = Proposal.objects.get(project=self.project, freelancer=self.freelancer)
		self.assertEqual(proposal.message, "Legacy cover letter")
		self.assertEqual(proposal.bid_amount, 150)
		self.assertEqual(proposal.status, "pending")

	def test_optional_budget_bounds_can_be_created_independently(self):
		self.api.force_authenticate(user=self.client_user)
		payload = {
			"title": "One-sided budget",
			"description": "Project description",
			"category": "web",
		}

		min_response = self.api.post(
			"/api/market/projects/create/",
			{**payload, "budget_min": 100},
			format="json",
		)
		max_response = self.api.post(
			"/api/market/projects/create/",
			{**payload, "title": "Max-only budget", "budget_max": 200},
			format="json",
		)
		unbounded_response = self.api.post(
			"/api/market/projects/create/",
			{**payload, "title": "Unbounded project"},
			format="json",
		)

		self.assertEqual(min_response.status_code, 201)
		self.assertEqual(max_response.status_code, 201)
		self.assertEqual(unbounded_response.status_code, 201)
		self.assertIsNone(Project.objects.get(pk=min_response.data["id"]).budget_max)
		self.assertIsNone(Project.objects.get(pk=max_response.data["id"]).budget_min)
		self.assertIsNone(Project.objects.get(pk=unbounded_response.data["id"]).budget_min)
		self.assertIsNone(Project.objects.get(pk=unbounded_response.data["id"]).budget_max)

	def test_proposals_apply_only_the_configured_budget_bound(self):
		minimum_only = Project.objects.create(
			title="Minimum only",
			description="Description",
			budget_min=100,
			budget_max=None,
			category="web",
			client=self.client_user,
		)
		maximum_only = Project.objects.create(
			title="Maximum only",
			description="Description",
			budget_min=None,
			budget_max=200,
			category="web",
			client=self.client_user,
		)
		self.api.force_authenticate(user=self.freelancer)

		below_minimum = self.api.post(
			"/api/market/proposals/",
			{"project": minimum_only.id, "message": "Low", "bid": 99},
			format="json",
		)
		minimum_only_valid = self.api.post(
			"/api/market/proposals/",
			{"project": minimum_only.id, "message": "Valid", "bid": 100},
			format="json",
		)
		above_maximum = self.api.post(
			"/api/market/proposals/",
			{"project": maximum_only.id, "message": "High", "bid": 201},
			format="json",
		)
		maximum_only_valid = self.api.post(
			"/api/market/proposals/",
			{"project": maximum_only.id, "message": "Valid", "bid": 200},
			format="json",
		)

		self.assertEqual(below_minimum.status_code, 400)
		self.assertEqual(minimum_only_valid.status_code, 201)
		self.assertEqual(above_maximum.status_code, 400)
		self.assertEqual(maximum_only_valid.status_code, 201)

	def test_project_creation_rejects_contradictory_budgets(self):
		self.api.force_authenticate(user=self.client_user)
		payload = {
			"title": "Invalid budget",
			"description": "Project description",
			"budget_min": 201,
			"budget_max": 200,
			"category": "web",
		}

		for path in ("/api/market/projects/", "/api/market/projects/create/"):
			with self.subTest(path=path):
				response = self.api.post(path, payload, format="json")
				self.assertEqual(response.status_code, 400)
		self.assertFalse(Project.objects.filter(title="Invalid budget").exists())

	def test_database_rejects_nonpositive_bids(self):
		with self.assertRaises(IntegrityError):
			with transaction.atomic():
				Proposal.objects.create(
					project=self.project,
					freelancer=self.freelancer,
					message="Invalid bid",
					bid_amount=0,
				)

	def test_database_rejects_invalid_project_budget_ranges(self):
		with self.assertRaises(IntegrityError):
			with transaction.atomic():
				Project.objects.create(
					title="Invalid project range",
					description="Description",
					budget_min=201,
					budget_max=200,
					category="web",
					client=self.client_user,
				)


class MarketplaceHiringWorkflowTests(TestCase):
	def setUp(self):
		self.client_user = User.objects.create_user(email="hire-client@test.com", password="pass", user_type="client")
		self.other_client = User.objects.create_user(email="hire-other@test.com", password="pass", user_type="client")
		self.freelancer = User.objects.create_user(email="hire-freelancer@test.com", password="pass", user_type="freelancer")
		self.other_freelancer = User.objects.create_user(email="hire-other-freelancer@test.com", password="pass", user_type="freelancer")
		self.project = Project.objects.create(
			title="Hiring workflow project",
			description="Project description",
			budget_min=100,
			budget_max=200,
			category="web",
			client=self.client_user,
		)
		self.proposal = self.create_proposal(self.freelancer, "Selected proposal")
		self.competing_proposal = self.create_proposal(self.other_freelancer, "Competing proposal")
		self.api = APIClient()

	def create_proposal(self, freelancer, message):
		return Proposal.objects.create(
			project=self.project,
			freelancer=freelancer,
			message=message,
			bid_amount=150,
		)

	def hire(self, proposal, user=None):
		self.api.force_authenticate(user=user or self.client_user)
		return self.api.post(f"/api/market/proposals/{proposal.id}/hire/")

	def test_successful_hire_updates_all_related_state_and_logs(self):
		activity_count = ActivityLog.objects.count()

		response = self.hire(self.proposal)

		self.assertEqual(response.status_code, 200)
		self.project.refresh_from_db()
		self.proposal.refresh_from_db()
		self.competing_proposal.refresh_from_db()
		self.assertEqual(self.project.status, "in_progress")
		self.assertEqual(self.project.hired_freelancer, self.freelancer)
		self.assertEqual(self.proposal.status, "accepted")
		self.assertEqual(self.competing_proposal.status, "rejected")
		self.assertEqual(ActivityLog.objects.count(), activity_count + 2)

	def test_rejected_proposal_cannot_be_hired(self):
		self.proposal.status = "rejected"
		self.proposal.save(update_fields=["status"])
		activity_count = ActivityLog.objects.count()

		response = self.hire(self.proposal)

		self.assertEqual(response.status_code, 400)
		self.project.refresh_from_db()
		self.proposal.refresh_from_db()
		self.assertEqual(self.project.status, "open")
		self.assertIsNone(self.project.hired_freelancer)
		self.assertEqual(self.proposal.status, "rejected")
		self.assertEqual(ActivityLog.objects.count(), activity_count)

	def test_hiring_is_rejected_for_closed_project(self):
		self.project.status = "cancelled"
		self.project.save(update_fields=["status"])
		activity_count = ActivityLog.objects.count()

		response = self.hire(self.proposal)

		self.assertEqual(response.status_code, 400)
		self.proposal.refresh_from_db()
		self.assertEqual(self.proposal.status, "pending")
		self.assertEqual(ActivityLog.objects.count(), activity_count)

	def test_only_project_owner_can_hire_or_reject(self):
		self.api.force_authenticate(user=self.other_client)
		hire_response = self.api.post(f"/api/market/proposals/{self.proposal.id}/hire/")
		reject_response = self.api.post(f"/api/market/proposals/{self.proposal.id}/reject/")

		self.assertEqual(hire_response.status_code, 403)
		self.assertEqual(reject_response.status_code, 403)
		self.proposal.refresh_from_db()
		self.assertEqual(self.proposal.status, "pending")

	def test_failure_during_hire_rolls_back_statuses_and_activity(self):
		activity_count = ActivityLog.objects.count()
		self.api.raise_request_exception = False
		create_activity = ActivityLog.objects.create
		calls = 0

		def fail_second_activity(*args, **kwargs):
			nonlocal calls
			calls += 1
			if calls == 2:
				raise RuntimeError("activity write failed")
			return create_activity(*args, **kwargs)

		with patch("marketplace.views.ActivityLog.objects.create", side_effect=fail_second_activity):
			response = self.hire(self.proposal)

		self.assertEqual(response.status_code, 500)
		self.project.refresh_from_db()
		self.proposal.refresh_from_db()
		self.competing_proposal.refresh_from_db()
		self.assertEqual(self.project.status, "open")
		self.assertIsNone(self.project.hired_freelancer)
		self.assertEqual(self.proposal.status, "pending")
		self.assertEqual(self.competing_proposal.status, "pending")
		self.assertEqual(ActivityLog.objects.count(), activity_count)

	def test_repeated_or_conflicting_hire_does_not_create_multiple_acceptances(self):
		first_response = self.hire(self.proposal)
		activity_count = ActivityLog.objects.count()
		second_response = self.hire(self.competing_proposal)

		self.assertEqual(first_response.status_code, 200)
		self.assertEqual(second_response.status_code, 400)
		self.assertEqual(Proposal.objects.filter(project=self.project, status="accepted").count(), 1)
		self.assertEqual(ActivityLog.objects.count(), activity_count)

	def test_project_completion_rolls_back_when_activity_logging_fails(self):
		self.project.status = "in_progress"
		self.project.hired_freelancer = self.freelancer
		self.project.save(update_fields=["status", "hired_freelancer"])
		self.api.force_authenticate(user=self.client_user)
		self.api.raise_request_exception = False
		activity_count = ActivityLog.objects.count()
		create_activity = ActivityLog.objects.create
		calls = 0

		def fail_second_activity(*args, **kwargs):
			nonlocal calls
			calls += 1
			if calls == 2:
				raise RuntimeError("activity failed")
			return create_activity(*args, **kwargs)

		with patch("marketplace.views.ActivityLog.objects.create", side_effect=fail_second_activity):
			response = self.api.post(f"/api/market/projects/{self.project.id}/complete/")

		self.assertEqual(response.status_code, 500)
		self.project.refresh_from_db()
		self.assertEqual(self.project.status, "in_progress")
		self.assertEqual(ActivityLog.objects.count(), activity_count)

	def test_database_prevents_multiple_accepted_proposals_for_project(self):
		self.proposal.status = "accepted"
		self.proposal.save(update_fields=["status"])

		with self.assertRaises(IntegrityError):
			with transaction.atomic():
				Proposal.objects.filter(pk=self.competing_proposal.pk).update(status="accepted")

		self.competing_proposal.refresh_from_db()
		self.assertEqual(self.competing_proposal.status, "pending")

	def test_rejecting_pending_proposal_records_one_transition(self):
		self.api.force_authenticate(user=self.client_user)

		response = self.api.post(f"/api/market/proposals/{self.proposal.id}/reject/")

		self.assertEqual(response.status_code, 200)
		self.proposal.refresh_from_db()
		self.assertEqual(self.proposal.status, "rejected")
		self.assertEqual(
			ActivityLog.objects.filter(user=self.client_user, action__contains="Rejected proposal").count(),
			1,
		)


@skipUnless(connection.features.has_select_for_update, "Requires database row-lock support")
class MarketplaceProposalConcurrencyTests(TransactionTestCase):
	reset_sequences = True

	def setUp(self):
		self.client_user = User.objects.create_user(email="race-client@test.com", password="pass", user_type="client")
		self.freelancer = User.objects.create_user(email="race-freelancer@test.com", password="pass", user_type="freelancer")
		self.project = Project.objects.create(
			title="Concurrent project",
			description="Race test",
			budget_min=100,
			budget_max=200,
			category="web",
			client=self.client_user,
		)
		self.proposal = Proposal.objects.create(
			project=self.project,
			freelancer=self.freelancer,
			message="Original proposal",
			bid_amount=150,
		)

	def run_race(self, competing_action):
		barrier = Barrier(3)

		def send_request(user, method, path, data=None):
			close_old_connections()
			try:
				client = APIClient()
				client.force_authenticate(user=user)
				barrier.wait(timeout=10)
				return getattr(client, method)(path, data or {}, format="json").status_code
			finally:
				close_old_connections()

		with ThreadPoolExecutor(max_workers=2) as executor:
			hire = executor.submit(
				send_request,
				self.client_user,
				"post",
				f"/api/market/proposals/{self.proposal.pk}/hire/",
			)
			mutation = executor.submit(*competing_action(send_request))
			barrier.wait(timeout=10)
			return hire.result(timeout=30), mutation.result(timeout=30)

	def test_concurrent_hire_and_withdraw_leave_consistent_state(self):
		hire_status, withdraw_status = self.run_race(lambda send: (
			send,
			self.freelancer,
			"delete",
			f"/api/market/proposals/{self.proposal.pk}/",
		))
		self.project.refresh_from_db()
		proposal_exists = Proposal.objects.filter(pk=self.proposal.pk).exists()

		if withdraw_status == 204:
			self.assertEqual(hire_status, 404)
			self.assertFalse(proposal_exists)
			self.assertEqual(self.project.status, "open")
			self.assertIsNone(self.project.hired_freelancer_id)
		else:
			self.assertEqual((hire_status, withdraw_status), (200, 400))
			self.assertTrue(proposal_exists)
			self.proposal.refresh_from_db()
			self.assertEqual(self.proposal.status, "accepted")
			self.assertEqual(self.project.status, "in_progress")
			self.assertEqual(self.project.hired_freelancer_id, self.freelancer.pk)

	def test_concurrent_hire_and_edit_never_changes_an_accepted_proposal(self):
		hire_status, edit_status = self.run_race(lambda send: (
			send,
			self.freelancer,
			"patch",
			f"/api/market/proposals/{self.proposal.pk}/",
			{"message": "Concurrent edit"},
		))
		self.proposal.refresh_from_db()
		self.project.refresh_from_db()

		self.assertEqual(hire_status, 200)
		self.assertIn(edit_status, (200, 400))
		self.assertEqual(self.proposal.status, "accepted")
		self.assertIn(self.proposal.message, ("Original proposal", "Concurrent edit"))
		self.assertEqual(self.project.status, "in_progress")
		self.assertEqual(self.project.hired_freelancer_id, self.freelancer.pk)


class MarketplaceRatingIntegrityTests(TestCase):
	def setUp(self):
		self.client_user = User.objects.create_user(email="rating-client@test.com", password="pass", user_type="client")
		self.freelancer = User.objects.create_user(email="rating-freelancer@test.com", password="pass", user_type="freelancer")
		self.outsider = User.objects.create_user(email="rating-outsider@test.com", password="pass", user_type="freelancer")
		self.project = Project.objects.create(
			title="Completed rating project",
			description="Project description",
			budget_min=100,
			budget_max=200,
			category="web",
			client=self.client_user,
			hired_freelancer=self.freelancer,
			status="completed",
		)
		self.api = APIClient()

	def rate(self, user, recipient, value=5):
		self.api.force_authenticate(user=user)
		return self.api.post(
			f"/api/market/projects/{self.project.id}/rate/",
			{"user_to": recipient.id, "rating": value, "review": "Good work"},
			format="json",
		)

	def test_eligible_participants_can_rate_each_other_once(self):
		client_rating = self.rate(self.client_user, self.freelancer)
		freelancer_rating = self.rate(self.freelancer, self.client_user, 4)

		self.assertEqual(client_rating.status_code, 201)
		self.assertEqual(freelancer_rating.status_code, 201)
		self.assertEqual(Rating.objects.filter(project=self.project).count(), 2)

	def test_nonparticipant_cannot_rate_project(self):
		response = self.rate(self.outsider, self.freelancer)

		self.assertEqual(response.status_code, 403)
		self.assertFalse(Rating.objects.filter(project=self.project).exists())

	def test_rating_must_be_between_one_and_five(self):
		for value in (0, 6):
			with self.subTest(value=value):
				response = self.rate(self.client_user, self.freelancer, value)
				self.assertEqual(response.status_code, 400)
		self.assertFalse(Rating.objects.filter(project=self.project).exists())

	def test_duplicate_rating_in_same_direction_is_rejected(self):
		first_response = self.rate(self.client_user, self.freelancer)
		second_response = self.rate(self.client_user, self.freelancer, 4)

		self.assertEqual(first_response.status_code, 201)
		self.assertEqual(second_response.status_code, 400)
		self.assertEqual(Rating.objects.filter(project=self.project, from_user=self.client_user, to_user=self.freelancer).count(), 1)

	def test_database_enforces_rating_range_and_directional_uniqueness(self):
		for invalid_rating in (0, 6):
			with self.subTest(rating=invalid_rating):
				with self.assertRaises(IntegrityError):
					with transaction.atomic():
						Rating.objects.create(
							project=self.project,
							from_user=self.client_user,
							to_user=self.freelancer,
							rating=invalid_rating,
						)

		Rating.objects.create(
			project=self.project,
			from_user=self.client_user,
			to_user=self.freelancer,
			rating=5,
		)
		with self.assertRaises(IntegrityError):
			with transaction.atomic():
				Rating.objects.create(
					project=self.project,
					from_user=self.client_user,
					to_user=self.freelancer,
					rating=4,
				)

	def test_rating_list_from_user_filter_is_limited_to_the_authenticated_user(self):
		own_rating = Rating.objects.create(
			project=self.project,
			from_user=self.client_user,
			to_user=self.freelancer,
			rating=5,
		)
		Rating.objects.create(
			project=self.project,
			from_user=self.freelancer,
			to_user=self.client_user,
			rating=4,
		)
		self.api.force_authenticate(user=self.client_user)

		own_response = self.api.get(f"/api/market/ratings/?from_user={self.client_user.pk}")
		other_response = self.api.get(f"/api/market/ratings/?from_user={self.freelancer.pk}")

		self.assertEqual(own_response.status_code, 200)
		self.assertEqual({item["id"] for item in own_response.data["results"]}, {own_rating.pk})
		self.assertEqual(other_response.status_code, 200)
		self.assertEqual(other_response.data["count"], 0)


class UploadValidationTests(SimpleTestCase):
	def image_upload(self, name="pixel.png"):
		buffer = io.BytesIO()
		Image.new("RGB", (2, 2), color="red").save(buffer, format="PNG")
		return SimpleUploadedFile(name, buffer.getvalue(), content_type="application/octet-stream")

	def test_valid_image_and_pdf_signatures_are_accepted(self):
		image = self.image_upload()
		pdf = SimpleUploadedFile("brief.pdf", b"%PDF-1.7\n%%EOF", content_type="text/plain")
		mp4 = SimpleUploadedFile(
			"clip.mp4",
			b"\x00\x00\x00\x18ftypisom\x00\x00\x02\x00isom",
			content_type="application/octet-stream",
		)
		svg = SimpleUploadedFile(
			"icon.svg",
			b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><rect width="2" height="2" fill="#fff"/></svg>',
		)

		self.assertEqual(validate_upload(image, max_bytes=1024, allowed_extensions={".png"}), "image/png")
		self.assertEqual(validate_upload(pdf, max_bytes=1024, allowed_extensions={".pdf"}), "application/pdf")
		self.assertEqual(validate_upload(mp4, max_bytes=1024, allowed_extensions={".mp4"}), "video/mp4")
		self.assertEqual(validate_upload(svg, max_bytes=1024, allowed_extensions={".svg"}), "image/svg+xml")

	def test_disallowed_and_misleading_extensions_are_rejected(self):
		with self.assertRaises(ValueError):
			validate_upload(
				SimpleUploadedFile("payload.exe", b"MZ" + b"0" * 20),
				max_bytes=1024,
				allowed_extensions={".png", ".pdf"},
			)
		with self.assertRaises(ValueError):
			validate_upload(
				SimpleUploadedFile("spoofed.png", b"%PDF-1.7\n%%EOF"),
				max_bytes=1024,
				allowed_extensions={".png"},
			)
		for unsafe_svg in (
			b'<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>',
			b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
			b'<svg xmlns="http://www.w3.org/2000/svg"><image href="https://evil.example/x"/></svg>',
		):
			with self.subTest(svg=unsafe_svg), self.assertRaises(ValueError):
				validate_upload(
					SimpleUploadedFile("unsafe.svg", unsafe_svg),
					max_bytes=1024,
					allowed_extensions={".svg"},
				)

	def test_oversized_file_is_rejected_before_content_read(self):
		limits = (
			(MESSAGE_UPLOAD_MAX_BYTES, "25 MB"),
			(PORTFOLIO_UPLOAD_MAX_BYTES, "50 MB"),
			(AVATAR_UPLOAD_MAX_BYTES, "5 MB"),
		)
		for max_bytes, message in limits:
			with self.subTest(max_bytes=max_bytes):
				oversized_file = type(
					"OversizedFile",
					(),
					{"name": "large.pdf", "size": max_bytes + 1},
				)()
				with self.assertRaisesRegex(ValueError, message):
					validate_upload(
						oversized_file,
						max_bytes=max_bytes,
						allowed_extensions={".pdf"},
					)


class MarketplacePrivateAttachmentTests(TestCase):
	def setUp(self):
		self.temp_storage = tempfile.TemporaryDirectory()
		self.storage = ProjectMessage._meta.get_field("attachment").storage
		self.original_location = self.storage._location
		self.storage._location = self.temp_storage.name
		self.storage.__dict__.pop("location", None)
		self.storage.__dict__.pop("base_location", None)
		self.client_user = User.objects.create_user(email="file-client@test.com", password="pass", user_type="client")
		self.freelancer = User.objects.create_user(email="file-freelancer@test.com", password="pass", user_type="freelancer")
		self.outsider = User.objects.create_user(email="file-outsider@test.com", password="pass", user_type="freelancer")
		self.project = self.make_project("Project with file", self.client_user, self.freelancer)
		self.other_project = self.make_project("Other project", self.outsider, self.other_freelancer())
		self.api = APIClient()

	def tearDown(self):
		self.storage._location = self.original_location
		self.storage.__dict__.pop("location", None)
		self.storage.__dict__.pop("base_location", None)
		self.temp_storage.cleanup()

	def other_freelancer(self):
		return User.objects.create_user(email="file-other-hired@test.com", password="pass", user_type="freelancer")

	def make_project(self, title, client, freelancer):
		return Project.objects.create(
			title=title,
			description="Project description",
			budget_min=100,
			budget_max=200,
			category="web",
			client=client,
			hired_freelancer=freelancer,
			status="in_progress",
		)

	def make_png(self):
		buffer = io.BytesIO()
		Image.new("RGB", (2, 2), color="blue").save(buffer, format="PNG")
		return buffer.getvalue()

	def upload_message(self, project, filename, content, content_type="application/octet-stream"):
		self.api.force_authenticate(user=project.client)
		return self.api.post(
			"/api/market/user_messages/create/",
			{
				"project": project.id,
				"message": "Attached file",
				"attachment": SimpleUploadedFile(filename, content, content_type=content_type),
			},
			format="multipart",
		)

	def test_authorized_participants_can_stream_private_attachment(self):
		upload_response = self.upload_message(self.project, "pixel.png", self.make_png(), "image/png")
		self.assertEqual(upload_response.status_code, 201)
		self.assertIn("/api/market/messages/", upload_response.data["attachment_url"])
		self.assertNotIn("/media/", upload_response.data["attachment_url"])

		message = ProjectMessage.objects.get(pk=upload_response.data["id"])
		self.api.force_authenticate(user=self.freelancer)
		download_response = self.api.get(f"/api/market/messages/{message.id}/attachment/")

		self.assertEqual(download_response.status_code, 200)
		self.assertEqual(download_response["Content-Type"], "image/png")
		self.assertEqual(b"".join(download_response.streaming_content), self.make_png())
		self.assertEqual(download_response["X-Content-Type-Options"], "nosniff")
		self.assertEqual(download_response["Cache-Control"], "private, no-store")

	def test_message_list_serializes_private_download_urls(self):
		upload_response = self.upload_message(self.project, "pixel.png", self.make_png(), "image/png")
		self.api.force_authenticate(user=self.freelancer)

		response = self.api.get(f"/api/market/projects/{self.project.id}/user_messages/")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["count"], 1)
		self.assertEqual(response.data["results"][0]["id"], upload_response.data["id"])
		self.assertIn(f"/api/market/messages/{upload_response.data['id']}/attachment/", response.data["results"][0]["attachment"])

	def test_message_creation_ignores_client_controlled_read_and_sender_fields(self):
		self.api.force_authenticate(user=self.freelancer)
		response = self.api.post(
			"/api/market/user_messages/create/",
			{
				"project": self.project.id,
				"message": "Unread message",
				"read": True,
				"sender": self.outsider.id,
			},
			format="json",
		)

		self.assertEqual(response.status_code, 201)
		message = ProjectMessage.objects.get(pk=response.data["id"])
		self.assertEqual(message.sender, self.freelancer)
		self.assertFalse(message.read)

		self.api.force_authenticate(user=self.client_user)
		read_response = self.api.post(f"/api/market/messages/{self.project.id}/mark-read/")
		self.assertEqual(read_response.status_code, 200)
		message.refresh_from_db()
		self.assertTrue(message.read)

		self.api.force_authenticate(user=self.outsider)
		forbidden_response = self.api.post(f"/api/market/messages/{self.project.id}/mark-read/")
		self.assertEqual(forbidden_response.status_code, 403)

	def test_message_list_query_count_does_not_grow_with_message_count(self):
		self.api.force_authenticate(user=self.client_user)
		ProjectMessage.objects.bulk_create([
			ProjectMessage(project=self.project, sender=self.client_user, message=f"Message {index}")
			for index in range(25)
		])
		with CaptureQueriesContext(connection) as captured:
			response = self.api.get(f"/api/market/projects/{self.project.id}/user_messages/")
		ProjectMessage.objects.bulk_create([
			ProjectMessage(project=self.project, sender=self.client_user, message=f"More messages {index}")
			for index in range(35)
		])
		with CaptureQueriesContext(connection) as larger_capture:
			larger_response = self.api.get(f"/api/market/projects/{self.project.id}/user_messages/")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["count"], 25)
		self.assertEqual(len(response.data["results"]), 20)
		self.assertEqual(len(captured), 3, [query["sql"] for query in captured])
		self.assertEqual(larger_response.data["count"], 60)
		self.assertEqual(len(larger_capture), len(captured))

	def test_anonymous_and_unrelated_users_cannot_download_attachments(self):
		upload_response = self.upload_message(self.project, "pixel.png", self.make_png(), "image/png")
		message_id = upload_response.data["id"]

		self.api.force_authenticate(user=None)
		anonymous_response = self.api.get(f"/api/market/messages/{message_id}/attachment/")
		self.assertEqual(anonymous_response.status_code, 401)

		self.api.force_authenticate(user=self.outsider)
		unrelated_response = self.api.get(f"/api/market/messages/{message_id}/attachment/")
		self.assertEqual(unrelated_response.status_code, 404)

	def test_participant_cannot_access_another_projects_attachment(self):
		upload_response = self.upload_message(self.other_project, "pixel.png", self.make_png(), "image/png")
		self.api.force_authenticate(user=self.client_user)

		response = self.api.get(f"/api/market/messages/{upload_response.data['id']}/attachment/")

		self.assertEqual(response.status_code, 404)

	def test_invalid_upload_content_and_misleading_extension_are_rejected(self):
		disallowed = self.upload_message(self.project, "script.exe", b"MZ" + b"0" * 20)
		misleading = self.upload_message(self.project, "fake.png", b"%PDF-1.7\n%%EOF")

		self.assertEqual(disallowed.status_code, 400)
		self.assertEqual(misleading.status_code, 400)
		self.assertFalse(ProjectMessage.objects.filter(project=self.project).exists())

	def test_public_media_route_does_not_serve_message_files(self):
		response = self.api.get("/media/messages/known-name.png")

		self.assertEqual(response.status_code, 404)


class PortfolioAndAvatarUploadTests(TestCase):
	def setUp(self):
		self.media_directory = tempfile.TemporaryDirectory()
		self.media_settings = override_settings(MEDIA_ROOT=self.media_directory.name)
		self.media_settings.enable()
		self.freelancer = User.objects.create_user(email="upload-freelancer@test.com", password="pass", user_type="freelancer")
		self.api = APIClient()
		self.api.force_authenticate(user=self.freelancer)

	def tearDown(self):
		self.media_settings.disable()
		self.media_directory.cleanup()

	def image_bytes(self):
		buffer = io.BytesIO()
		Image.new("RGB", (2, 2), color="green").save(buffer, format="PNG")
		return buffer.getvalue()

	def test_valid_portfolio_image_and_avatar_uploads_are_accepted(self):
		portfolio_response = self.api.post(
			"/api/market/portfolio/",
			{
				"title": "Valid work sample",
				"description": "Description",
				"media": SimpleUploadedFile("work.png", self.image_bytes(), content_type="image/png"),
			},
			format="multipart",
		)
		video_response = self.api.post(
			"/api/market/portfolio/",
			{
				"title": "Valid video sample",
				"description": "Description",
				"media": SimpleUploadedFile(
					"clip.mp4",
					b"\x00\x00\x00\x18ftypisom\x00\x00\x02\x00isom",
					content_type="video/mp4",
				),
			},
			format="multipart",
		)
		avatar_response = self.api.patch(
			"/api/users/me/",
			{"avatar": SimpleUploadedFile("avatar.png", self.image_bytes(), content_type="image/png")},
			format="multipart",
		)

		self.assertEqual(portfolio_response.status_code, 201)
		self.assertEqual(video_response.status_code, 201)
		self.assertEqual(avatar_response.status_code, 200)

	def test_portfolio_and_avatar_reject_misleading_or_disallowed_content(self):
		portfolio_response = self.api.post(
			"/api/market/portfolio/",
			{
				"title": "Misleading sample",
				"description": "Description",
				"media": SimpleUploadedFile("spoof.png", b"%PDF-1.7\n%%EOF", content_type="image/png"),
			},
			format="multipart",
		)
		avatar_response = self.api.patch(
			"/api/users/me/",
			{"avatar": SimpleUploadedFile("spoof.svg", b"<svg/onload=alert(1)>", content_type="image/svg+xml")},
			format="multipart",
		)

		self.assertEqual(portfolio_response.status_code, 400)
		self.assertEqual(avatar_response.status_code, 400)
