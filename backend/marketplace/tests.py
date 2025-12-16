from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Project, Proposal, ProjectMessage, Portfolio, Wallet, ActivityLog, Rating

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
		self.assertIn(self.portfolio.title, str(self.portfolio))

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
