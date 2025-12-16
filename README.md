# 🚀 Freelancer Marketplace Platform

> A modern, full-stack freelancer marketplace connecting clients with skilled freelancers worldwide. Built with Django REST Framework and React, featuring real-time messaging, project management, and a beautiful animated UI.

<div align="center">

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-4.2.0-092E20?style=flat-square&logo=django)](https://www.djangoproject.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#-architecture)
- [💻 Tech Stack](#-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🎯 API Documentation](#-api-documentation)
- [🎨 UI & Components](#-ui--components)
- [🔧 Configuration](#-configuration)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📞 Support](#-support)

---

## ✨ Features

### 🎯 Core Functionality

#### 👥 **Dual User System**
- **Clients**: Post projects, browse proposals, hire freelancers, manage payments
- **Freelancers**: Discover opportunities, submit competitive bids, build portfolios, earn ratings

#### 📋 **Project Management**
- Create detailed project posts with budget ranges and skill requirements
- Real-time project status tracking (Open → In Progress → Completed)
- Project categorization (Web, Mobile, Design, Other)
- Comprehensive project search and filtering

#### 💰 **Competitive Bidding System**
- Freelancers submit custom proposals with personalized bids
- Cover letter support for better communication
- Transparent proposal management for clients
- Unique constraint: One proposal per freelancer per project

#### 🤝 **Smart Hiring Workflow**
- Review and compare multiple freelancer proposals
- One-click hiring with automatic status updates
- Automatic rejection of other proposals when hiring
- Activity logging for all hiring events

#### 💬 **Real-time Messaging**
- Per-project communication threads
- Support for text messages, attachments, and emojis
- Message read/unread tracking
- Media upload capabilities
- Sticker support for quick reactions

#### ⭐ **Mutual Rating & Review System**
- 1-5 star ratings with written reviews
- Bi-directional ratings (client rates freelancer & vice versa)
- Public rating display on user profiles
- Historical review tracking

#### 📁 **Portfolio Showcase**
- Freelancers display work samples and achievements
- Media upload support (images, videos, documents)
- Project descriptions and links
- Chronological portfolio organization

#### 💳 **Wallet System**
- Balance tracking per user
- Transaction history
- Payment integration ready
- Earnings display for freelancers
- Budget tracking for clients

#### 📊 **Activity Logging**
- Comprehensive audit trail of all platform actions
- User action tracking with timestamps
- Historical record for accountability
- Analytics-ready data structure

---

### 🎨 User Experience

- **🌙 Modern Dark Theme**: Gradient backgrounds with blue/purple color scheme
- **✨ Smooth Animations**: CSS transitions on all interactive elements
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile
- **🌐 Multi-language Support**: Persian (Farsi) language integration
- **🔍 Advanced Filtering**: Search and filter by skills, budget, status, category
- **📊 Dashboard Analytics**: Personalized insights and statistics

---

### 🛠️ Technical Features

- **🔐 JWT Authentication**: Secure token-based authentication with refresh mechanism
- **📡 RESTful API**: Well-structured, clean API endpoints with standard HTTP methods
- **🗄️ Database Flexibility**: SQLite for development, PostgreSQL-ready for production
- **📎 File Uploads**: Support for avatars, portfolios, and message attachments
- **⚡ Fast Development**: Vite-powered hot module replacement and fast builds
- **🔒 Security**: CORS configuration, secure headers, input validation, rate limiting

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Browser                               │
│              (Desktop / Tablet / Mobile)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    ┌────▼─────┐
                    │  React    │
                    │   Vite    │
                    └────┬──────┘
                         │
                    ┌────▼──────────┐
                    │  Axios HTTP   │
                    │  Client       │
                    └────┬──────────┘
                         │
        ┌────────────────▼────────────────┐
        │   Django REST API               │
        │   (Backend Server)              │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   Django ORM & Models           │
        │   (Data Layer)                  │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   SQLite/PostgreSQL             │
        │   (Database)                    │
        └─────────────────────────────────┘
```

---

## 💻 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.0 | UI Library |
| **Vite** | 7.2.2 | Build Tool & Dev Server |
| **React Router** | 7.9.6 | Client-side Routing |
| **Axios** | 1.13.2 | HTTP Client |
| **Lucide React** | 0.554.0 | Icon Library |
| **CSS3** | - | Styling & Animations |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Django** | 4.2.0 | Web Framework |
| **Django REST Framework** | 3.14.0 | REST API |
| **Simple JWT** | 5.3.0 | JWT Authentication |
| **Django CORS** | 4.0.0 | CORS Management |
| **Pillow** | 10.0.0 | Image Processing |
| **Python** | 3.8+ | Language |

### Optional (Production)
- PostgreSQL - Production Database
- Redis - Caching
- Gunicorn - WSGI Server
- Nginx - Reverse Proxy

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Git

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend runs on: **http://localhost:8000**

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## 📁 Project Structure

```
project_root/
│
├── backend/                          # Django REST API
│   ├── core/                         # Django settings & config
│   │   ├── settings.py              # Project configuration
│   │   ├── urls.py                  # URL routing
│   │   ├── wsgi.py                  # Production entry point
│   │   └── asgi.py                  # Async entry point
│   │
│   ├── marketplace/                  # Main app
│   │   ├── models.py                # Database models
│   │   │   ├── Project
│   │   │   ├── Proposal
│   │   │   ├── ProjectMessage
│   │   │   ├── Portfolio
│   │   │   ├── Wallet
│   │   │   ├── Rating
│   │   │   └── ActivityLog
│   │   ├── views.py                 # API endpoints
│   │   ├── serializers.py           # Data serialization
│   │   ├── permissions.py           # Custom permissions
│   │   ├── urls.py                  # URL routes
│   │   └── migrations/              # Database migrations
│   │
│   ├── users/                        # User management
│   │   ├── models.py                # Custom User model
│   │   ├── views.py                 # User endpoints
│   │   ├── serializers.py           # User serialization
│   │   └── migrations/              # User migrations
│   │
│   ├── manage.py                     # Django CLI
│   ├── requirements.txt              # Python dependencies
│   └── db.sqlite3                    # SQLite database
│
├── frontend/                         # React application
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── ChatBox.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── ProposalForm.jsx
│   │   │   ├── SearchBox.jsx
│   │   │   ├── TagInput.jsx
│   │   │   └── UserAvatar.jsx
│   │   │
│   │   ├── pages/                   # Full-page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetails.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── Proposals.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── api/                     # API integration
│   │   │   ├── axios.js
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   ├── proposals.js
│   │   │   ├── messages.js
│   │   │   └── users.js
│   │   │
│   │   ├── context/                 # React context
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── styles/                  # Global styles
│   │   │   ├── global.css
│   │   │   └── fonts.css
│   │   │
│   │   ├── App.jsx                  # Root component
│   │   └── main.jsx                 # Entry point
│   │
│   ├── package.json                 # Node dependencies
│   ├── vite.config.js               # Vite config
│   └── index.html                   # HTML template
│
└── README.md                         # This file
```

---

## 🎯 API Documentation

### Base URL
```
Development: http://localhost:8000/api
Production: https://yourdomain.com/api
```

### Authentication
All protected endpoints require JWT token:
```bash
Authorization: Bearer {access_token}
```

### Key Endpoints

#### Authentication
- `POST /auth/login/` - User login
- `POST /auth/register/` - User registration
- `POST /auth/refresh/` - Refresh JWT token
- `POST /auth/logout/` - User logout

#### Projects
- `GET /market/projects/` - List all projects
- `POST /market/projects/` - Create new project
- `GET /market/projects/{id}/` - Get project details
- `PUT /market/projects/{id}/` - Update project
- `DELETE /market/projects/{id}/` - Delete project

#### Proposals
- `GET /market/proposals/` - List user proposals
- `POST /market/proposals/` - Submit proposal
- `POST /market/proposals/{id}/hire/` - Hire freelancer
- `PUT /market/proposals/{id}/` - Update proposal

#### Messages
- `GET /market/messages/?project_id={id}` - Get project messages
- `POST /market/messages/` - Send message
- `PATCH /market/messages/{id}/` - Mark message as read

#### Ratings
- `POST /market/rate/{project_id}/` - Rate user
- `GET /market/ratings/` - Get user ratings

#### Users
- `GET /users/profile/` - Get current user profile
- `PUT /users/profile/` - Update profile
- `GET /users/{id}/` - Get user details
- `PATCH /users/{id}/avatar/` - Upload avatar

---

## 🎨 UI & Components

### Key Components

#### 🏠 **Dashboard**
- Personalized overview with user statistics
- Recent activity feed
- Quick action buttons
- Responsive grid layout

#### 📋 **ProjectCard**
- Beautiful project display with hover effects
- Budget range and category badges
- Skills tags
- Proposal count indicator
- Action buttons (View Details, Apply)

#### 💬 **ChatBox**
- Real-time messaging interface
- Message history with timestamps
- User avatars and status
- Attachment upload support
- Auto-scroll to latest messages

#### 📝 **ProposalForm**
- Cover letter text area
- Bid amount input with validation
- Submit button with loading state
- Form validation and error handling

#### 🔍 **SearchBox**
- Real-time project search
- Advanced filtering options:
  - Filter by skills
  - Filter by budget range
  - Filter by status
  - Filter by category
- Sort options

#### 👤 **UserAvatar**
- Profile picture display
- Fallback to user initials
- Customizable sizes
- Click to navigate to profile

### Design System

**Colors:**
- Primary: `#6366f1` (Indigo)
- Secondary: `#a855f7` (Purple)
- Accent: `#3b82f6` (Blue)
- Dark Background: `#0a0a0f`
- Text Light: `#ffffff`

**Animations:**
- Smooth fade-in/fade-out transitions
- Hover effects on interactive elements
- Loading spinners
- Slide animations on page navigation

---

## 🔧 Configuration

### Environment Variables

**Backend** (`.env`):
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
DATABASE_URL=sqlite:///db.sqlite3
```

**Frontend** (`.env.local`):
```env
VITE_API_URL=http://localhost:8000/api
```

### Database Setup

**Development (SQLite):**
```bash
python manage.py migrate
```

**Production (PostgreSQL):**
Update `settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'freelancer_db',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

---

## 🚀 Deployment

### Backend Deployment

```bash
# Install production dependencies
pip install gunicorn whitenoise

# Collect static files
python manage.py collectstatic --noinput

# Run with Gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:8000
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Output is in dist/ folder
# Deploy to Vercel, Netlify, or your own server
```

### Using Docker

**Dockerfile (Backend):**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://user:pass@db:5432/freelancer
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Steps

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/freelancer-marketplace.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Coding Standards

- Follow PEP 8 (Python) and ESLint (JavaScript)
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes

---

## 📞 Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/issues)
- **Discussions**: Join community discussions
- **Email**: ezio.rzn80@gmail.com
- **Documentation**: Check README sections

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### Made with ❤️ by AmirRezaiyan

⭐ **If you found this helpful, please star this repository!**

[Back to Top ⬆️](#-freelancer-marketplace-platform)

</div>

---

HTML content removed - converted to clean Markdown
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Freelance Marketplace - Complete Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #6366f1;
            --secondary: #8b5cf6;
            --accent: #ec4899;
            --dark: #0a0a0f;
            --darker: #0f172a;
            --light: #f1f5f9;
            --text: #e2e8f0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--text);
            background: linear-gradient(135deg, var(--dark) 0%, var(--darker) 50%, #1e1b4b 100%);
            min-height: 100vh;
        }

        /* ANIMATIONS */
        @keyframes slideInFromLeft {
            from {
                opacity: 0;
                transform: translateX(-50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideInFromRight {
            from {
                opacity: 0;
                transform: translateX(50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes glow {
            0%, 100% {
                box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
            }
            50% {
                box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
            }
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }

        @keyframes float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-20px);
            }
        }

        @keyframes shimmer {
            0% {
                background-position: -1000px 0;
            }
            100% {
                background-position: 1000px 0;
            }
        }

        /* HEADER STYLES */
        .header {
            text-align: center;
            padding: 60px 20px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
            border-bottom: 1px solid rgba(99, 102, 241, 0.3);
            animation: slideInFromLeft 0.8s ease-out;
        }

        .header h1 {
            font-size: 3.5em;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #6366f1, #ec4899, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: glow 3s ease-in-out infinite;
        }

        .header .subtitle {
            font-size: 1.3em;
            color: rgba(226, 232, 240, 0.8);
            animation: fadeInUp 1s ease-out 0.2s backwards;
        }

        .badge-container {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 30px;
            flex-wrap: wrap;
            animation: fadeInUp 1s ease-out 0.4s backwards;
        }

        .badge {
            padding: 8px 16px;
            background: rgba(99, 102, 241, 0.2);
            border: 1px solid rgba(99, 102, 241, 0.5);
            border-radius: 20px;
            font-size: 0.9em;
            color: #a5b4fc;
            animation: slideInFromLeft 0.6s ease-out;
        }

        /* SECTION STYLES */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .section {
            margin-bottom: 60px;
            animation: fadeInUp 0.8s ease-out;
        }

        .section h2 {
            font-size: 2.2em;
            margin-bottom: 30px;
            color: var(--primary);
            border-left: 4px solid var(--primary);
            padding-left: 20px;
            animation: slideInFromLeft 0.6s ease-out;
        }

        .section h3 {
            font-size: 1.5em;
            margin: 25px 0 15px 0;
            color: var(--secondary);
            animation: fadeInUp 0.6s ease-out;
        }

        .section p {
            font-size: 1.05em;
            line-height: 1.8;
            color: rgba(226, 232, 240, 0.9);
            margin-bottom: 15px;
            animation: fadeInUp 0.6s ease-out;
        }

        /* GRID LAYOUT */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }

        .feature-card {
            padding: 25px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 12px;
            transition: all 0.3s ease;
            animation: fadeInUp 0.8s ease-out;
            position: relative;
            overflow: hidden;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            animation: shimmer 3s infinite;
        }

        .feature-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
            border-color: var(--accent);
        }

        .feature-card h4 {
            font-size: 1.3em;
            color: var(--accent);
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .feature-icon {
            font-size: 1.8em;
            animation: float 3s ease-in-out infinite;
        }

        .feature-card p {
            margin: 0;
            font-size: 0.95em;
            color: rgba(226, 232, 240, 0.8);
        }

        /* CODE BLOCKS */
        .code-block {
            background: rgba(0, 0, 0, 0.4);
            border-left: 4px solid var(--primary);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            line-height: 1.5;
            animation: fadeInUp 0.8s ease-out;
        }

        .code-block code {
            color: #a5b4fc;
        }

        /* TECH STACK */
        .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin: 20px 0;
        }

        .tech-badge {
            padding: 8px 14px;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.3));
            border: 1px solid rgba(236, 72, 153, 0.3);
            border-radius: 8px;
            font-size: 0.9em;
            color: #d8b4fe;
            animation: fadeInUp 0.6s ease-out;
            transition: all 0.3s ease;
        }

        .tech-badge:hover {
            border-color: var(--accent);
            box-shadow: 0 0 15px rgba(236, 72, 153, 0.2);
        }

        /* ARCHITECTURE DIAGRAM */
        .architecture {
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin: 40px 0;
            flex-wrap: wrap;
            gap: 30px;
        }

        .arch-box {
            padding: 25px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1));
            border: 2px solid var(--primary);
            border-radius: 12px;
            min-width: 200px;
            text-align: center;
            animation: fadeInUp 0.8s ease-out;
            position: relative;
        }

        .arch-box h4 {
            color: var(--accent);
            margin-bottom: 10px;
            font-size: 1.2em;
        }

        .arch-box p {
            font-size: 0.9em;
            margin: 0;
        }

        .arrow {
            font-size: 2em;
            color: var(--accent);
            animation: pulse 2s ease-in-out infinite;
        }

        /* TABLES */
        .table-wrapper {
            overflow-x: auto;
            margin: 25px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.2));
            padding: 15px;
            text-align: left;
            border: 1px solid rgba(99, 102, 241, 0.3);
            color: var(--accent);
            font-weight: 600;
        }

        td {
            padding: 12px 15px;
            border: 1px solid rgba(99, 102, 241, 0.2);
            color: rgba(226, 232, 240, 0.9);
        }

        tr:nth-child(even) {
            background: rgba(99, 102, 241, 0.05);
        }

        tr:hover {
            background: rgba(99, 102, 241, 0.1);
        }

        /* LISTS */
        ul, ol {
            margin: 20px 0 20px 30px;
        }

        li {
            margin: 10px 0;
            color: rgba(226, 232, 240, 0.9);
            animation: fadeInUp 0.6s ease-out;
        }

        li strong {
            color: var(--accent);
        }

        /* BLOCKQUOTE */
        .highlight-box {
            background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(99, 102, 241, 0.1));
            border-left: 4px solid var(--accent);
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            animation: fadeInUp 0.8s ease-out;
        }

        .highlight-box strong {
            color: var(--accent);
        }

        /* BUTTONS */
        .button-group {
            display: flex;
            gap: 15px;
            margin: 30px 0;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 24px;
            border: 2px solid;
            border-radius: 8px;
            font-size: 1em;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            animation: fadeInUp 0.8s ease-out;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            border-color: var(--primary);
        }

        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
        }

        .btn-secondary {
            background: transparent;
            color: var(--accent);
            border-color: var(--accent);
        }

        .btn-secondary:hover {
            background: rgba(236, 72, 153, 0.1);
            transform: translateY(-3px);
        }

        /* FOOTER */
        .footer {
            text-align: center;
            padding: 40px 20px;
            border-top: 1px solid rgba(99, 102, 241, 0.3);
            background: rgba(10, 10, 15, 0.5);
            animation: slideInFromLeft 0.8s ease-out;
            margin-top: 60px;
        }

        .footer p {
            margin: 5px 0;
            font-size: 0.95em;
        }

        /* TIMELINE */
        .timeline {
            position: relative;
            padding-left: 40px;
            margin: 30px 0;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(180deg, var(--primary), var(--accent), transparent);
        }

        .timeline-item {
            margin-bottom: 30px;
            position: relative;
            animation: fadeInUp 0.8s ease-out;
        }

        .timeline-item::before {
            content: '';
            position: absolute;
            left: -48px;
            top: 0;
            width: 12px;
            height: 12px;
            background: var(--accent);
            border-radius: 50%;
            border: 3px solid var(--dark);
            box-shadow: 0 0 15px rgba(236, 72, 153, 0.5);
        }

        .timeline-item h4 {
            color: var(--accent);
            margin-bottom: 5px;
        }

        .timeline-item p {
            margin: 0;
            font-size: 0.95em;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2.2em;
            }

            .section h2 {
                font-size: 1.8em;
            }

            .architecture {
                flex-direction: column;
            }

            .badge-container {
                gap: 10px;
            }

            table {
                font-size: 0.9em;
            }

            th, td {
                padding: 8px 10px;
            }
        }

        /* GLOWING EFFECT */
        .glow-effect {
            position: relative;
            display: inline-block;
        }

        .glow-effect::after {
            content: '';
            position: absolute;
            inset: -2px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            border-radius: 8px;
            opacity: 0;
            animation: glow 2s ease-in-out infinite;
            z-index: -1;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Freelance Marketplace Platform</h1>
        <p class="subtitle">A modern, full-stack solution connecting clients with talented freelancers</p>
        <div class="badge-container">
            <span class="badge">💼 Django REST API</span>
            <span class="badge">⚛️ React Frontend</span>
            <span class="badge">🔐 JWT Authentication</span>
            <span class="badge">📱 Responsive Design</span>
        </div>
    </div>

    <div class="container">
        <!-- OVERVIEW SECTION -->
        <div class="section">
            <h2>📋 Project Overview</h2>
            
            <div class="highlight-box">
                <strong>Welcome to the Freelance Marketplace!</strong> A comprehensive platform that bridges the gap between businesses seeking specialized talent and freelancers looking for exciting projects. Built with modern technologies and designed with scalability in mind.
            </div>

            <h3>🎯 Core Purpose</h3>
            <p>This platform enables:</p>
            <ul>
                <li><strong>Clients</strong> to post projects, review proposals, and hire qualified freelancers</li>
                <li><strong>Freelancers</strong> to discover opportunities, submit proposals, and build portfolios</li>
                <li><strong>Real-time Communication</strong> between project stakeholders through integrated messaging</li>
                <li><strong>Rating & Review System</strong> to build trust and credibility within the community</li>
            </ul>

            <h3>🌟 Key Features</h3>
            <div class="features-grid">
                <div class="feature-card">
                    <h4><span class="feature-icon">📝</span> Project Management</h4>
                    <p>Create, edit, and manage projects with detailed specifications, budget ranges, and skill requirements.</p>
                </div>
                <div class="feature-card">
                    <h4><span class="feature-icon">💬</span> Real-time Messaging</h4>
                    <p>Communicate seamlessly with file attachments and sticker support for a better collaboration experience.</p>
                </div>
                <div class="feature-card">
                    <h4><span class="feature-icon">🤝</span> Proposal System</h4>
                    <p>Freelancers can submit detailed proposals with custom bids, and clients review and accept the best fit.</p>
                </div>
                <div class="feature-card">
                    <h4><span class="feature-icon">⭐</span> Rating & Reviews</h4>
                    <p>Build reputation through ratings and detailed reviews after project completion.</p>
                </div>
                <div class="feature-card">
                    <h4><span class="feature-icon">👤</span> Portfolio System</h4>
                    <p>Freelancers showcase their best work with media attachments and project descriptions.</p>
                </div>
                <div class="feature-card">
                    <h4><span class="feature-icon">💳</span> Wallet System</h4>
                    <p>Secure payment handling and financial tracking for transactions.</p>
                </div>
            </div>
        </div>

        <!-- TECHNOLOGY STACK -->
        <div class="section">
            <h2>🛠️ Technology Stack</h2>
            
            <h3>Backend - Django REST Framework</h3>
            <div class="tech-stack">
                <span class="tech-badge">Django 4.2.0</span>
                <span class="tech-badge">Django REST Framework 3.14</span>
                <span class="tech-badge">JWT Authentication</span>
                <span class="tech-badge">CORS Headers</span>
                <span class="tech-badge">SQLite/PostgreSQL</span>
                <span class="tech-badge">Celery</span>
                <span class="tech-badge">Redis</span>
                <span class="tech-badge">Pillow (Image Processing)</span>
                <span class="tech-badge">Rate Limiting</span>
            </div>

            <h3>Frontend - React with Vite</h3>
            <div class="tech-stack">
                <span class="tech-badge">React 19.2.0</span>
                <span class="tech-badge">Vite</span>
                <span class="tech-badge">React Router DOM 7.9</span>
                <span class="tech-badge">Axios</span>
                <span class="tech-badge">Lucide React Icons</span>
                <span class="tech-badge">Context API</span>
                <span class="tech-badge">ESLint</span>
                <span class="tech-badge">Responsive Design</span>
            </div>

            <h3>Infrastructure & Deployment</h3>
            <div class="tech-stack">
                <span class="tech-badge">Gunicorn (WSGI)</span>
                <span class="tech-badge">WhiteNoise (Static Files)</span>
                <span class="tech-badge">PostgreSQL</span>
                <span class="tech-badge">Docker-Ready</span>
                <span class="tech-badge">Environment Variables</span>
            </div>
        </div>

        <!-- ARCHITECTURE -->
        <div class="section">
            <h2>🏗️ System Architecture</h2>
            
            <div class="architecture">
                <div class="arch-box">
                    <h4>🖥️ Frontend</h4>
                    <p>React SPA with routing, context-based state management, and real-time updates via axios</p>
                </div>
                <div class="arrow">→</div>
                <div class="arch-box">
                    <h4>🔌 API Gateway</h4>
                    <p>RESTful endpoints with JWT-based authentication and CORS support</p>
                </div>
                <div class="arrow">→</div>
                <div class="arch-box">
                    <h4>🗄️ Backend</h4>
                    <p>Django with apps for users, marketplace, and core configuration</p>
                </div>
                <div class="arrow">→</div>
                <div class="arch-box">
                    <h4>💾 Database</h4>
                    <p>SQLite for development, PostgreSQL for production</p>
                </div>
            </div>

            <p>The platform follows a clean separation of concerns with dedicated apps for different domains:</p>
            <ul>
                <li><strong>users/</strong> - User authentication, profiles, and account management</li>
                <li><strong>marketplace/</strong> - Projects, proposals, messages, ratings, and portfolio management</li>
                <li><strong>core/</strong> - Global settings, URL routing, and WSGI/ASGI configuration</li>
            </ul>
        </div>

        <!-- BACKEND STRUCTURE -->
        <div class="section">
            <h2>🔧 Backend Structure</h2>

            <h3>Database Models</h3>
            
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Model</th>
                            <th>Purpose</th>
                            <th>Key Fields</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>User</strong></td>
                            <td>User accounts with dual roles</td>
                            <td>email, user_type, skills, avatar, rating, experience_years</td>
                        </tr>
                        <tr>
                            <td><strong>Project</strong></td>
                            <td>Posted projects by clients</td>
                            <td>title, description, budget, category, skills, status, hired_freelancer</td>
                        </tr>
                        <tr>
                            <td><strong>Proposal</strong></td>
                            <td>Freelancer bids on projects</td>
                            <td>project, freelancer, bid_amount, message, status</td>
                        </tr>
                        <tr>
                            <td><strong>ProjectMessage</strong></td>
                            <td>Communication on projects</td>
                            <td>project, sender, message, attachment, read status</td>
                        </tr>
                        <tr>
                            <td><strong>Portfolio</strong></td>
                            <td>Freelancer work samples</td>
                            <td>title, description, media, created_at</td>
                        </tr>
                        <tr>
                            <td><strong>Rating</strong></td>
                            <td>Project reviews & ratings</td>
                            <td>project, from_user, to_user, rating, review</td>
                        </tr>
                        <tr>
                            <td><strong>Wallet</strong></td>
                            <td>Payment processing</td>
                            <td>user, balance, transactions</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3>API Endpoints Structure</h3>
            <div class="code-block"><code>
/api/users/
  ├── register/          (POST) - User registration
  ├── login/             (POST) - User login
  ├── me/                (GET/PUT) - Current user profile
  └── profile/&lt;id&gt;/     (GET) - Public user profiles

/api/marketplace/
  ├── projects/          (GET/POST) - List and create projects
  ├── projects/&lt;id&gt;/    (GET/PUT) - Project details
  ├── proposals/         (GET/POST) - Submit proposals
  ├── proposals/&lt;id&gt;/   (GET/PUT) - Proposal management
  ├── hire/&lt;id&gt;/        (POST) - Accept proposal & hire
  ├── messages/          (GET/POST) - Project messaging
  ├── portfolio/         (GET/POST) - Portfolio management
  ├── rate/&lt;id&gt;/        (POST) - Rate users
  └── dashboard/         (GET) - User dashboard stats
            </code></div>

            <h3>Key Backend Features</h3>
            <ul>
                <li><strong>JWT Authentication:</strong> Secure token-based authentication with refresh tokens</li>
                <li><strong>Permission Classes:</strong> Custom permissions (IsClient, IsOwner) for fine-grained access control</li>
                <li><strong>File Uploads:</strong> Support for avatars, portfolio media, and message attachments</li>
                <li><strong>Rate Limiting:</strong> Prevent abuse with request rate limiting</li>
                <li><strong>Activity Logging:</strong> Track important user actions</li>
                <li><strong>Async Tasks:</strong> Celery integration for background processing</li>
            </ul>
        </div>

        <!-- FRONTEND STRUCTURE -->
        <div class="section">
            <h2>⚛️ Frontend Structure</h2>

            <h3>Project Pages</h3>
            <div class="timeline">
                <div class="timeline-item">
                    <h4>Authentication Pages</h4>
                    <p><strong>Login & Register:</strong> User authentication with email and password</p>
                </div>
                <div class="timeline-item">
                    <h4>Dashboard</h4>
                    <p><strong>Home:</strong> Welcome screen with platform overview</p>
                </div>
                <div class="timeline-item">
                    <h4>Project Management</h4>
                    <p><strong>Projects:</strong> Browse and search available projects | <strong>ProjectCreate:</strong> Create new projects | <strong>ProjectEdit:</strong> Modify existing projects | <strong>ProjectDetails:</strong> View full project information</p>
                </div>
                <div class="timeline-item">
                    <h4>Proposals</h4>
                    <p><strong>Proposals:</strong> Submit bids and manage proposal submissions</p>
                </div>
                <div class="timeline-item">
                    <h4>Messaging</h4>
                    <p><strong>Messages:</strong> Real-time communication between project participants</p>
                </div>
                <div class="timeline-item">
                    <h4>User Profiles</h4>
                    <p><strong>Profile:</strong> User profile management and portfolio viewing</p>
                </div>
            </div>

            <h3>Component Architecture</h3>
            <div class="features-grid">
                <div class="feature-card">
                    <h4>🔐 AuthContext</h4>
                    <p>Global authentication state management with user data and login/logout functionality</p>
                </div>
                <div class="feature-card">
                    <h4>🔌 API Modules</h4>
                    <p>Axios instances for auth, messages, projects, proposals, and user interactions</p>
                </div>
                <div class="feature-card">
                    <h4>📦 Reusable Components</h4>
                    <p>Header, ChatBox, ProjectCard, ProposalForm, SearchBox, TagInput, UserAvatar</p>
                </div>
                <div class="feature-card">
                    <h4>🎨 Styling System</h4>
                    <p>Global styles, fonts, responsive design with modern dark theme</p>
                </div>
            </div>

            <h3>State Management</h3>
            <p>The frontend uses React Context API for state management:</p>
            <ul>
                <li><strong>AuthContext:</strong> Stores user data, authentication tokens, and loading states</li>
                <li><strong>Custom Hooks:</strong> useAuth hook for easy access to authentication data</li>
                <li><strong>Local Component State:</strong> useState for form data and UI state</li>
            </ul>
        </div>

        <!-- USER WORKFLOWS -->
        <div class="section">
            <h2>👥 User Workflows</h2>

            <h3>Client Workflow</h3>
            <div class="highlight-box">
                <strong>Step 1: Register/Login</strong> → <strong>Step 2: Create Project</strong> → <strong>Step 3: Review Proposals</strong> → <strong>Step 4: Hire Freelancer</strong> → <strong>Step 5: Communicate & Collaborate</strong> → <strong>Step 6: Rate & Review</strong>
            </div>

            <h3>Freelancer Workflow</h3>
            <div class="highlight-box">
                <strong>Step 1: Register/Login</strong> → <strong>Step 2: Build Portfolio</strong> → <strong>Step 3: Search Projects</strong> → <strong>Step 4: Submit Proposals</strong> → <strong>Step 5: Collaborate on Projects</strong> → <strong>Step 6: Earn & Get Rated</strong>
            </div>

            <h3>Key Interactions</h3>
            <ul>
                <li><strong>Project Discovery:</strong> Freelancers filter projects by category, budget, and skills</li>
                <li><strong>Bidding Process:</strong> Freelancers submit custom proposals with bids and messages</li>
                <li><strong>Hiring:</strong> Clients accept proposals and formalize the engagement</li>
                <li><strong>Collaboration:</strong> Real-time messaging with file sharing capabilities</li>
                <li><strong>Completion & Rating:</strong> After project completion, both parties can rate each other</li>
            </ul>
        </div>

        <!-- AUTHENTICATION & SECURITY -->
        <div class="section">
            <h2>🔐 Authentication & Security</h2>

            <h3>Authentication System</h3>
            <div class="highlight-box">
                <strong>JWT (JSON Web Tokens)</strong> - The platform uses djangorestframework-simplejwt for secure, stateless authentication. Access tokens are short-lived, with refresh tokens for long-term sessions.
            </div>

            <h3>Security Features</h3>
            <ul>
                <li><strong>CORS Configuration:</strong> Proper CORS headers to prevent unauthorized cross-origin requests</li>
                <li><strong>CSRF Protection:</strong> Django's built-in CSRF middleware</li>
                <li><strong>Password Validation:</strong> Strong password requirements with minimum length of 8 characters</li>
                <li><strong>Permission Classes:</strong> Custom permission classes for role-based access control</li>
                <li><strong>Rate Limiting:</strong> Protection against brute-force attacks and API abuse</li>
                <li><strong>User Roles:</strong> Dual-role system (Client/Freelancer) with appropriate restrictions</li>
            </ul>

            <h3>Data Protection</h3>
            <ul>
                <li>Sensitive data stored securely in database</li>
                <li>Password hashing using Django's built-in algorithms</li>
                <li>Media files served through Django's media routing</li>
                <li>Environment variables for sensitive configuration</li>
            </ul>
        </div>

        <!-- INSTALLATION & SETUP -->
        <div class="section">
            <h2>⚙️ Installation & Setup</h2>

            <h3>Backend Setup</h3>
            <div class="code-block"><code>
# Clone repository
git clone &lt;repository-url&gt;
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
            </code></div>

            <h3>Frontend Setup</h3>
            <div class="code-block"><code>
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
            </code></div>

            <h3>Environment Configuration</h3>
            <p>Create a <code>.env</code> file in the backend directory:</p>
            <div class="code-block"><code>
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173
JWT_SECRET=your-jwt-secret
            </code></div>
        </div>

        <!-- API USAGE EXAMPLES -->
        <div class="section">
            <h2>📚 API Usage Examples</h2>

            <h3>Authentication</h3>
            <div class="code-block"><code>
# Register
POST /api/users/register/
{
  "email": "user@example.com",
  "password": "securepassword",
  "user_type": "freelancer"
}

# Login
POST /api/users/login/
{
  "email": "user@example.com",
  "password": "securepassword"
}
Response: { "access": "token...", "refresh": "token...", "user": {...} }
            </code></div>

            <h3>Project Management</h3>
            <div class="code-block"><code>
# Create Project
POST /api/marketplace/projects/
Headers: Authorization: Bearer {access_token}
{
  "title": "Build Website",
  "description": "Need a professional website",
  "budget_min": 1000,
  "budget_max": 5000,
  "category": "web",
  "skills": ["React", "Node.js", "MongoDB"]
}

# List Projects
GET /api/marketplace/projects/

# Get Project Details
GET /api/marketplace/projects/{id}/
            </code></div>

            <h3>Proposals</h3>
            <div class="code-block"><code>
# Submit Proposal
POST /api/marketplace/proposals/
Headers: Authorization: Bearer {access_token}
{
  "project": 1,
  "bid_amount": 2500,
  "message": "I'm interested in this project..."
}

# List Proposals for Project
GET /api/marketplace/proposals/?project=1

# Accept Proposal & Hire
POST /api/marketplace/hire/{proposal_id}/
Headers: Authorization: Bearer {access_token}
            </code></div>

            <h3>Messaging</h3>
            <div class="code-block"><code>
# Send Message
POST /api/marketplace/messages/
Headers: Authorization: Bearer {access_token}
{
  "project": 1,
  "message": "Hello! Let's discuss the project details.",
  "attachment": null
}

# Get Project Messages
GET /api/marketplace/messages/?project=1
            </code></div>
        </div>

        <!-- DEVELOPMENT GUIDELINES -->
        <div class="section">
            <h2>📖 Development Guidelines</h2>

            <h3>Backend Development</h3>
            <ul>
                <li><strong>Models:</strong> Always define clear relationships and use ForeignKey/OneToOneField appropriately</li>
                <li><strong>Serializers:</strong> Create separate serializers for list views and detail views when needed</li>
                <li><strong>Views:</strong> Use ViewSets and Generics for consistency, implement custom permission classes</li>
                <li><strong>URLs:</strong> Use simple, RESTful naming conventions (e.g., /api/resource/ for lists)</li>
                <li><strong>Testing:</strong> Write unit tests for critical business logic</li>
            </ul>

            <h3>Frontend Development</h3>
            <ul>
                <li><strong>Components:</strong> Keep components focused and reusable</li>
                <li><strong>API Calls:</strong> Use the centralized axios modules, never import axios directly</li>
                <li><strong>State:</strong> Use Context API for global state, useState for local state</li>
                <li><strong>Styling:</strong> Use inline styles or the global CSS file for consistency</li>
                <li><strong>Performance:</strong> Implement lazy loading for images and use React.memo for expensive components</li>
            </ul>

            <h3>Best Practices</h3>
            <ul>
                <li>Use descriptive commit messages</li>
                <li>Keep secrets out of version control (use .env files)</li>
                <li>Write clean, readable code with comments for complex logic</li>
                <li>Test thoroughly before deploying to production</li>
                <li>Monitor error logs and performance metrics</li>
            </ul>
        </div>

        <!-- DEPLOYMENT -->
        <div class="section">
            <h2>🚀 Deployment</h2>

            <h3>Backend Deployment (Production)</h3>
            <ul>
                <li>Set <code>DEBUG=False</code> in settings</li>
                <li>Use PostgreSQL instead of SQLite</li>
                <li>Configure allowed hosts with your domain</li>
                <li>Use Gunicorn as WSGI server: <code>gunicorn core.wsgi:application</code></li>
                <li>Serve static files with WhiteNoise or a CDN</li>
                <li>Use environment variables for sensitive data</li>
                <li>Set up SSL certificates with Let's Encrypt</li>
            </ul>

            <h3>Frontend Deployment (Production)</h3>
            <ul>
                <li>Build optimized bundle: <code>npm run build</code></li>
                <li>Serve from static files directory or CDN</li>
                <li>Update API endpoints to production URLs</li>
                <li>Enable gzip compression</li>
                <li>Implement caching strategies</li>
                <li>Use a reverse proxy (nginx) for routing</li>
            </ul>

            <h3>Database Migration</h3>
            <div class="code-block"><code>
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Backup database
pg_dump database_name > backup.sql

# Restore database
psql database_name &lt; backup.sql
            </code></div>
        </div>

        <!-- TROUBLESHOOTING -->
        <div class="section">
            <h2>🔧 Troubleshooting</h2>

            <h3>Common Issues</h3>
            <div class="timeline">
                <div class="timeline-item">
                    <h4>CORS Errors</h4>
                    <p>Ensure backend CORS_ALLOWED_ORIGINS matches frontend URL. Check corsheaders middleware is installed.</p>
                </div>
                <div class="timeline-item">
                    <h4>Authentication Failures</h4>
                    <p>Verify JWT tokens are being sent in Authorization header. Check token expiration and refresh token validity.</p>
                </div>
                <div class="timeline-item">
                    <h4>Database Connection Issues</h4>
                    <p>Verify database URL in settings. For PostgreSQL, ensure psycopg2 is installed and database exists.</p>
                </div>
                <div class="timeline-item">
                    <h4>Static Files Not Loading</h4>
                    <p>Run <code>python manage.py collectstatic</code> and verify STATIC_ROOT setting is correct.</p>
                </div>
                <div class="timeline-item">
                    <h4>Frontend API Calls Not Working</h4>
                    <p>Check browser console for errors. Verify axios baseURL matches backend URL. Check CORS headers in response.</p>
                </div>
            </div>
        </div>

        <!-- PROJECT STATISTICS -->
        <div class="section">
            <h2>📊 Project Statistics</h2>

            <div class="features-grid">
                <div class="feature-card">
                    <h4>📦 Models</h4>
                    <p><strong>7 Core Models:</strong> User, Project, Proposal, ProjectMessage, Portfolio, Rating, Wallet</p>
                </div>
                <div class="feature-card">
                    <h4>📄 Pages</h4>
                    <p><strong>9 Main Pages:</strong> Home, Dashboard, Projects, Details, Create, Edit, Messages, Profile, Proposals</p>
                </div>
                <div class="feature-card">
                    <h4>🔌 API Endpoints</h4>
                    <p><strong>20+ Endpoints</strong> covering authentication, CRUD operations, and business logic</p>
                </div>
                <div class="feature-card">
                    <h4>⚛️ Components</h4>
                    <p><strong>7 Reusable Components</strong> for consistent UI and reduced code duplication</p>
                </div>
                <div class="feature-card">
                    <h4>🔑 Features</h4>
                    <p><strong>Real-time messaging, Proposals, Portfolio, Rating system, Wallet</strong></p>
                </div>
                <div class="feature-card">
                    <h4>🗄️ Database</h4>
                    <p><strong>SQLite for dev, PostgreSQL ready</strong> with proper indexing and constraints</p>
                </div>
            </div>
        </div>

        <!-- ROADMAP & FUTURE FEATURES -->
        <div class="section">
            <h2>🗺️ Roadmap & Future Features</h2>

            <h3>Planned Enhancements</h3>
            <ul>
                <li>✅ <strong>Video Conferencing:</strong> Integrate WebRTC for video calls between clients and freelancers</li>
                <li>✅ <strong>Payment Integration:</strong> Stripe/PayPal integration for secure payments</li>
                <li>✅ <strong>Escrow System:</strong> Secure fund holding during project execution</li>
                <li>✅ <strong>Advanced Search:</strong> Elasticsearch integration for better search capabilities</li>
                <li>✅ <strong>Mobile App:</strong> React Native mobile application</li>
                <li>✅ <strong>AI Matching:</strong> Machine learning-based project-freelancer matching</li>
                <li>✅ <strong>Analytics Dashboard:</strong> Comprehensive analytics for clients and freelancers</li>
                <li>✅ <strong>Dispute Resolution:</strong> Built-in mediation system</li>
                <li>✅ <strong>Notifications:</strong> Real-time push notifications</li>
            </ul>
        </div>

        <!-- CONTRIBUTION GUIDELINES -->
        <div class="section">
            <h2>🤝 Contribution Guidelines</h2>

            <p>We welcome contributions! Here's how you can help:</p>
            <ol>
                <li>Fork the repository</li>
                <li>Create a feature branch: <code>git checkout -b feature/amazing-feature</code></li>
                <li>Commit your changes: <code>git commit -m 'Add amazing feature'</code></li>
                <li>Push to the branch: <code>git push origin feature/amazing-feature</code></li>
                <li>Open a Pull Request</li>
            </ol>

            <h3>Code Standards</h3>
            <ul>
                <li>Follow PEP 8 for Python code</li>
                <li>Use ESLint for JavaScript/React</li>
                <li>Write meaningful commit messages</li>
                <li>Add tests for new features</li>
                <li>Update documentation</li>
            </ul>
        </div>

        <!-- SUPPORT & CONTACT -->
        <div class="section">
            <h2>💬 Support & Contact</h2>

            <div class="highlight-box">
                <strong>Need Help?</strong> Contact the development team or check the documentation for solutions. For bug reports, please open an issue on GitHub with detailed information.
            </div>

            <h3>Resources</h3>
            <ul>
                <li><a href="https://www.djangoproject.com/" target="_blank" style="color: var(--accent);">Django Documentation</a></li>
                <li><a href="https://www.django-rest-framework.org/" target="_blank" style="color: var(--accent);">Django REST Framework</a></li>
                <li><a href="https://react.dev/" target="_blank" style="color: var(--accent);">React Documentation</a></li>
                <li><a href="https://vitejs.dev/" target="_blank" style="color: var(--accent);">Vite Documentation</a></li>
            </ul>
        </div>

        <!-- LICENSE -->
        <div class="section">
            <h2>📜 License</h2>
            <p>This project is licensed under the MIT License - see the LICENSE file for details.</p>
        </div>
    </div>

    <div class="footer">
        <p><strong>🚀 Freelance Marketplace Platform</strong></p>
        <p>Built with ❤️ using Django, React, and modern web technologies</p>
        <p>© 2024 All Rights Reserved | Last Updated: December 2024</p>
    </div>

    <!-- SCRIPT FOR ADDITIONAL ANIMATIONS -->
    <script>
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.section').forEach(el => {
            observer.observe(el);
        });

        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
    </script>
</body>
</html>
