from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
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
