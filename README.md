# HostelDrop

A full-stack web application built with Next.js frontend and Django backend for hostel management and delivery services.

## 🏗️ Project Structure

```
HostelDrop/
├── frontend/          # Next.js 15 with TypeScript
│   ├── app/          # App Router pages
│   ├── components/   # Reusable UI components
│   └── lib/         # Utility functions
└── backend/          # Django REST API
    └── backend/     # Django project configuration
```

## 🚀 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with custom theme
- **Shadcn/ui** - UI component library
- **Lucide React** - Icon library

### Backend
- **Django 5.2.3** - Python web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database (Neon cloud)
- **Django CORS Headers** - Cross-origin requests

## 📋 Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Python** 3.13.5
- **pip** for Python package management
- **Git** for version control

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/aayushxtech/hostel-drop.git
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000)

### 3. Backend Setup

```bash
# Navigate to backend directory
cd ../backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

The backend API will be available at [http://localhost:8000](http://localhost:8000)

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=
SECRET_KEY=
```

The project is currently configured with a Neon PostgreSQL database. Update the `DATABASE_URL` in [`backend/.env`](backend/.env) with your database credentials.

## 🎨 UI Components

This project uses Shadcn/ui components with:
- **Style**: New York
- **Base Color**: Neutral
- **CSS Variables**: Enabled
- **Icon Library**: Lucide React

Component configuration can be found in [`frontend/components.json`](frontend/components.json).

## 📁 Key Files

### Frontend
- [`app/page.tsx`](frontend/app/page.tsx) - Main landing page
- [`app/layout.tsx`](frontend/app/layout.tsx) - Root layout with fonts
- [`app/globals.css`](frontend/app/globals.css) - Global styles and theme
- [`lib/utils.ts`](frontend/lib/utils.ts) - Utility functions (cn helper)

### Backend
- [`backend/settings.py`](backend/backend/settings.py) - Django configuration
- [`backend/urls.py`](backend/backend/urls.py) - URL routing
- [`manage.py`](backend/manage.py) - Django management commands

## 🔄 Development Workflow

### Frontend Scripts
```bash
npm run dev     # Start development server with Turbopack
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

### Backend Commands
```bash
python manage.py runserver    # Start development server
python manage.py makemigrations  # Create migrations
python manage.py migrate      # Apply migrations
python manage.py shell        # Django shell
python manage.py test         # Run tests
```

## 🌐 CORS Configuration

The backend is configured to allow requests from `http://localhost:3000` (frontend). Update [`CORS_ALLOWED_ORIGINS`](backend/backend/settings.py) for production deployment.


### Common Issues

1. **Port conflicts**: Ensure ports 3000 (frontend) and 8000 (backend) are available
2. **Database connection**: Verify PostgreSQL credentials in `.env`
3. **CORS errors**: Check `CORS_ALLOWED_ORIGINS` in Django settings 
4. **Node.js version**: Use Node.js 18+ for frontend compatibility

> **Note**: The CORS allowed origins are pre-configured for development. Please do not modify the `CORS_ALLOWED_ORIGINS` setting without proper authorization.
