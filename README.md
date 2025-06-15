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
- [`lib/useSyncClerkUser.ts`](frontend/lib/useSyncClerkUser.ts) - Clerk user sync hook
- [`.env.local`](frontend/.env.local) - Frontend environment variables

### Backend
- [`backend/settings.py`](backend/backend/settings.py) - Django configuration
- [`backend/urls.py`](backend/backend/urls.py) - URL routing
- [`manage.py`](backend/manage.py) - Django management commands
- [`.env`](backend/.env) - Backend environment variables

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

## 📦 Parcel Arrival User Flow

### 1. **Parcel Registration by Hostel Staff**
```
Staff receives parcel → Logs into system → Creates new parcel entry
```
- **API Call**: `POST /parcels/create/`
- **Data Required**:
  - `student_id` (links to the recipient)
  - `description` (what's in the parcel)
  - `service` (delivery company - Flipkart, Amazon, etc.)
- **System Action**: 
  - Verifies student exists
  - Creates parcel with status `PENDING`
  - Records `created_at` timestamp

### 2. **Student Notification** *(Not implemented yet)*
```
System sends notification → Student receives alert about parcel arrival
```
- **Potential channels**: Email, SMS, in-app notification
- **Information shared**: Parcel description, arrival time

### 3. **Student Checks Their Parcels**
```
Student opens app → Views "My Parcels" → Sees pending parcel
```
- **API Call**: `GET /parcels/my/?clerk_id={student_clerk_id}`
- **Student sees**:
  - Parcel description
  - Service provider
  - Arrival time
  - Status (PENDING)

### 4. **Student Goes to Collect Parcel**
```
Student visits hostel office → Staff marks as picked up
```

### 5. **Simple Parcel Handover**
```
Staff hands over parcel → Marks as picked up → Process complete
```
- **API Call**: `PATCH /parcels/{parcel_id}/picked-up/`
- **System Action**:
  - Changes status to `PICKED_UP`
  - Records `picked_up_time` timestamp

### 6. **Complete Flow Visualization**

```
📋 PARCEL ARRIVES
     ↓
🏢 Staff creates entry (PENDING)
     ↓
📱 Student gets notified
     ↓
👀 Student checks "My Parcels"
     ↓
🚶 Student visits office
     ↓
📦 Staff hands over parcel
     ↓
✅ Staff marks as PICKED_UP
     ↓
🎉 PROCESS COMPLETE
```

### 7. **Status Tracking**
Throughout the process, the parcel has these possible states:
- **`PENDING`** - Just arrived, waiting for pickup
- **`PICKED_UP`** - Student has collected it
- **Timestamps**:
  - `created_at` - When parcel was registered
  - `picked_up_time` - When parcel was handed over

### 8. **Admin/Staff Overview**
```
Staff can view all parcels → Monitor pending/picked up status
```
- **API Call**: `GET /parcels/all/`
- **Staff can see**: All parcels, their status, and timestamps

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
    "profile_image": "https://img.clerk.com/xxxxx",
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

#### `GET /students/{student_id}/`
- **Purpose**: Get student details by student UUID
- **Method**: GET
- **URL Params**: `student_id` (UUID of the student)
- **Response**: Complete student profile
- **Use Case**: Internal API calls, admin operations

#### `PATCH /students/{student_id}/update/`
- **Purpose**: Update student profile information
- **Method**: PATCH
- **URL Params**: `student_id` (UUID of the student)
- **Body**:
  ```json
  {
    "phone": "9876543210",
    "hostel_block": "Block B",
    "room_number": "205"
  }
  ```
- **Response**: Updated student details
- **Use Case**: Profile updates by student or admin

#### `GET /students/{student_id}/parcels/`
- **Purpose**: Get all parcels for a specific student
- **Method**: GET
- **URL Params**: `student_id` (UUID of the student)
- **Response**: List of student's parcels with status
- **Use Case**: View student's parcel history

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
    "service": "Amazon",
    "status": "PENDING"
  }
  ```
- **Response**: Created parcel details
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

### Legacy Endpoint (Deprecated)

#### `POST /sync-clerk/`
- **Status**: ⚠️ **Deprecated** - Use `/students/sync-clerk/` instead
- **Purpose**: Legacy sync endpoint
- **Note**: This endpoint exists for backward compatibility but should not be used in new implementations

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

### URL Structure Summary

```
/students/
├── sync-clerk/                    # POST - Sync Clerk user
├── by-clerk/                      # GET - Get student by clerk_id
├── all/                           # GET - Get all students
├── {student_id}/                  # GET - Get student by UUID
├── {student_id}/update/           # PATCH - Update student
└── {student_id}/parcels/          # GET - Get student's parcels

/parcels/
├── create/                        # POST - Create new parcel
├── my/                           # GET - Get my parcels (by clerk_id)
├── all/                          # GET - Get all parcels
└── {parcel_id}/picked-up/        # PATCH - Mark as picked up

/sync-clerk/                       # POST - Legacy sync endpoint (deprecated)
```

## 🔍 Current Implementation Gaps

1. **Notification System** - No automated notifications to students
2. **Authentication** - Views don't have proper user authentication
3. **Student Self-Service** - Students can't directly interact with their parcels
4. **Audit Trail** - Limited tracking of who performed what actions
5. **Endpoint Consistency** - Some duplicate functionality between student and parcel endpoints

This simplified flow ensures easy parcel management while maintaining a clear record of all parcel movements.
