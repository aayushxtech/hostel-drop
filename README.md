# HostelDrop

A full-stack web application built with Next.js frontend and Django backend for hostel parcel management system.

## 🏗️ Project Structure

```
HostelDrop/
├── frontend/          # Next.js 15 with TypeScript
│   ├── app/          # App Router pages
│   ├── components/   # Reusable UI components
│   └── lib/         # Utility functions
└── backend/          # Django REST API
    ├── students/    # Student management app
    ├── parcels/     # Parcel management app
    └── backend/     # Django project configuration
```

## 🚀 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with custom theme
- **Clerk** - Authentication and user management
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
cd hostel-drop
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

# Create environment file
cp .env.example .env.local
# or create .env.local manually and add required variables

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

# Create environment file
cp .env.example .env
# or create .env manually and add required variables

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

#### Frontend (.env.local)
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

#### Backend (.env)
Create a `.env` file in the backend directory:
```env
DATABASE_URL=
SECRET_KEY=
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

The project is currently configured with a Neon PostgreSQL database. Update the `DATABASE_URL` in [`backend/.env`](backend/.env) with your database credentials.

## 🎨 UI Components

This project uses:
- **Tailwind CSS v4** with custom theme configuration
- **Custom CSS Variables** for consistent theming
- **Responsive Design** with mobile-first approach
- **Lucide React** for icons

Component styling can be found in [`frontend/app/globals.css`](frontend/app/globals.css).

## 📁 Key Files

### Frontend
- [`app/page.tsx`](frontend/app/page.tsx) - Main landing page with navigation
- [`app/dashboard/page.tsx`](frontend/app/dashboard/page.tsx) - Staff parcel management dashboard
- [`app/student-dashboard/page.tsx`](frontend/app/student-dashboard/page.tsx) - Student parcel view
- [`components/UpdateProfile.tsx`](frontend/components/UpdateProfile.tsx) - Student profile management
- [`components/SearchBar.tsx`](frontend/components/SearchBar.tsx) - Parcel search functionality
- [`lib/useSyncClerkUser.ts`](frontend/lib/useSyncClerkUser.ts) - Clerk user sync hook
- [`app/globals.css`](frontend/app/globals.css) - Global styles and theme variables

### Backend
- [`students/models.py`](backend/students/models.py) - Student data model
- [`parcels/models.py`](backend/parcels/models.py) - Parcel data model
- [`students/views.py`](backend/students/views.py) - Student API endpoints
- [`parcels/views.py`](backend/parcels/views.py) - Parcel API endpoints
- [`backend/settings.py`](backend/backend/settings.py) - Django configuration
- [`backend/urls.py`](backend/backend/urls.py) - URL routing

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

## 📋 Important Notes

> ⚠️ **Environment Files**: 
> - Never commit `.env` or `.env.local` files to version control
> - Always create these files locally after cloning the repository
> - Use `.env.example` files as templates if available

> ⚠️ **CORS Configuration**: The CORS allowed origins are pre-configured for development. Please do not modify the `CORS_ALLOWED_ORIGINS` setting without proper authorization.

### Common Issues

1. **Port conflicts**: Ensure ports 3000 (frontend) and 8000 (backend) are available
2. **Database connection**: Verify PostgreSQL credentials in `.env`
3. **Missing environment files**: Create `.env.local` (frontend) and `.env` (backend) files
4. **CORS errors**: Check `CORS_ALLOWED_ORIGINS` in Django settings 
5. **Node.js version**: Use Node.js 18+ for frontend compatibility
6. **Environment variables not loading**: Restart development servers after updating environment files

## 📦 Current Application Workflow

### 1. **User Authentication & Profile Setup**
```
User signs up/in via Clerk → Profile sync to backend → Profile completion check
```
- **Authentication**: Handled by Clerk with automatic user sync
- **Profile Management**: Users can complete/update their profile via [`UpdateProfile.tsx`](frontend/components/UpdateProfile.tsx)
- **Required Fields**: Name, Email, Phone, Hostel Block, Room Number
- **Profile Status**: Displays completion status with visual indicators

### 2. **Student Dashboard Experience**
```
Student logs in → Views dashboard → Sees profile status → Can update profile
```
- **Dashboard**: [`app/student-dashboard/page.tsx`](frontend/app/student-dashboard/page.tsx)
- **Features**:
  - Profile completion status indicator
  - Profile editing capabilities
  - Real-time form validation
  - Success/error feedback

### 3. **Staff Dashboard Experience**
```
Staff logs in → Access parcel management → Register/view parcels → Search functionality
```
- **Dashboard**: [`app/dashboard/page.tsx`](frontend/app/dashboard/page.tsx)
- **Features**:
  - Parcel registration system
  - Search and filter parcels
  - Status management (PENDING/PICKED_UP)
  - Student information display

### 4. **Profile Management Flow**
```
Incomplete profile warning → Edit mode → Form validation → Save → Success feedback
```
- **Component**: [`UpdateProfile.tsx`](frontend/components/UpdateProfile.tsx)
- **Validation**: All fields required before saving
- **API Integration**: Automatic sync with backend
- **User Experience**: 
  - Warning indicators for incomplete profiles
  - Edit/view mode toggling
  - Loading states during saves
  - Success confirmations

### 5. **Search and Filter System**
```
Staff enters search query → Real-time filtering → Results display → Clear functionality
```
- **Component**: [`SearchBar.tsx`](frontend/components/SearchBar.tsx)
- **Search Fields**: Name, Tracking ID, Room, Block, Courier service
- **Features**:
  - Real-time search
  - Clear search button
  - Responsive design
  - Search icon and clear icon

### 6. **Data Flow Architecture**
```
Frontend (React/Next.js) ↔ Clerk Auth ↔ Backend (Django) ↔ PostgreSQL Database
```
- **Authentication**: Clerk handles user auth, syncs with Django backend
- **Data Sync**: [`useSyncClerkUser.ts`](frontend/lib/useSyncClerkUser.ts) manages user synchronization
- **API Communication**: RESTful APIs for all data operations
- **Database**: PostgreSQL with proper indexing for performance

## 🔗 Backend API Endpoints

### Student Endpoints (`/students/`)

#### `POST /students/sync-clerk/`
- **Purpose**: Sync Clerk user data with backend student record
- **Method**: POST
- **Body**:
  ```json
  {
    "clerk_id": "user_xxxxx",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "hostel_block": "Block A",
    "room_number": "101"
  }
  ```
- **Response**: Student details with created/updated status
- **Use Case**: Automatic sync when user signs in via Clerk

#### `GET /students/by-clerk/?clerk_id={clerk_id}`
- **Purpose**: Get student details by Clerk ID
- **Method**: GET
- **Query Params**: `clerk_id` (student's clerk ID from authentication)
- **Response**: Student profile data
- **Use Case**: Frontend retrieval of current user's profile

#### `PATCH /students/{student_id}/update/`
- **Purpose**: Update student profile information
- **Method**: PATCH
- **URL Params**: `student_id` (UUID of the student)
- **Body**:
  ```json
  {
    "name": "Updated Name",
    "phone": "9876543210",
    "hostel_block": "Block B",
    "room_number": "205"
  }
  ```
- **Response**: Updated student details
- **Use Case**: Profile updates via UpdateProfile component

#### `GET /students/all/`
- **Purpose**: Retrieve all active students
- **Method**: GET
- **Response**: List of all students (admin view)
- **Use Case**: Staff/admin overview of all registered students

### Parcel Endpoints (`/parcels/`)

#### `POST /parcels/create/`
- **Purpose**: Register a new parcel arrival
- **Method**: POST
- **Body**:
  ```json
  {
    "student_id": "uuid-of-student",
    "description": "Amazon package",
    "service": "Amazon"
  }
  ```
- **Response**: Created parcel details with tracking ID
- **Use Case**: Staff registers incoming parcel

#### `GET /parcels/my/?clerk_id={clerk_id}`
- **Purpose**: Get all parcels for a specific student
- **Method**: GET
- **Query Params**: `clerk_id` (student's clerk ID)
- **Response**: List of parcels belonging to the student
- **Use Case**: Student views their pending/picked up parcels

#### `GET /parcels/all/`
- **Purpose**: Retrieve all parcels in the system
- **Method**: GET
- **Response**: Complete list of all parcels with status
- **Use Case**: Staff/admin overview of all parcel activities

#### `PATCH /parcels/{parcel_id}/picked-up/`
- **Purpose**: Mark parcel as picked up by student
- **Method**: PATCH
- **URL Params**: `parcel_id` (ID of the parcel)
- **Response**: Updated parcel with pickup timestamp
- **Use Case**: Staff marks parcel as collected when handing over to student

### API Response Structure

All endpoints follow a consistent response format:

**Success Response:**
```json
{
  "student": { /* student data */ },
  "parcel": { /* parcel data */ },
  "message": "Operation successful",
  "created": true
}
```

**Error Response:**
```json
{
  "error": "Error description",
  "details": "Additional error details"
}
```

### Common HTTP Status Codes
- `200 OK` - Successful GET/PATCH operations
- `201 Created` - Successful POST operations
- `400 Bad Request` - Invalid request data or validation errors
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side errors

## 🔍 Current Implementation Status

### ✅ Implemented Features
1. **User Authentication** - Clerk integration with automatic sync
2. **Profile Management** - Complete CRUD operations for student profiles
3. **Parcel Management** - Basic parcel registration and status tracking
4. **Search Functionality** - Real-time search across multiple fields
5. **Responsive Design** - Mobile-first approach with Tailwind CSS
6. **Form Validation** - Client-side validation with user feedback
7. **Database Integration** - PostgreSQL with proper indexing

### 🔄 In Progress
1. **Student Parcel Dashboard** - View for students to see their parcels
2. **Enhanced Staff Dashboard** - Better parcel management interface
3. **Status Management** - Pickup confirmation workflow

### 📋 Future Enhancements
1. **Notification System** - Email/SMS alerts for parcel arrivals
2. **Pickup Verification** - QR codes or pickup codes for security
3. **Analytics Dashboard** - Parcel statistics and reporting
4. **Audit Trail** - Detailed logging of all actions
5. **Bulk Operations** - Mass import/export functionality

This workflow ensures efficient parcel management while maintaining a user-friendly experience for both students
