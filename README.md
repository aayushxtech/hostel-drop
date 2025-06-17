# HostelDrop

A full-stack web application built with Next.js frontend and Django backend for hostel parcel management system with image upload and email notification capabilities.

## 🏗️ Project Structure

```
HostelDrop/
├── frontend/          # Next.js 15 with TypeScript
│   ├── app/          # App Router pages
│   │   ├── guard-dashboard/    # Guard dashboard for parcel management
│   │   ├── student-dashboard/  # Student parcel viewing dashboard
│   │   └── dashboard/          # General staff dashboard
│   ├── components/   # Reusable UI components
│   │   ├── ParcelRegistrationForm.tsx  # New parcel registration with image upload
│   │   ├── ParcelCard.tsx             # Individual parcel display
│   │   ├── ParcelList.tsx             # Parcel listing component
│   │   └── UpdateProfile.tsx           # Student profile management
│   └── lib/         # Utility functions
│       ├── useSyncClerkUser.ts        # Clerk user sync hook
│       └── sendMail.ts                # Email notification service
└── backend/          # Django REST API
    ├── students/    # Student management app
    ├── parcels/     # Parcel management app with image handling
    └── backend/     # Django project configuration
```

## 🚀 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with custom theme
- **Clerk** - Authentication and user management
- **Lucide React** - Icon library
- **React Hooks** - State management with advanced filtering

### Backend
- **Django 5.2.3** - Python web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database (Neon cloud)
- **Django CORS Headers** - Cross-origin requests
- **Cloudinary** - Image storage and processing
- **Django Email Backend** - Email notification system
- **MultiPartParser** - File upload handling

### Third-Party Services
- **Cloudinary** - Image hosting and transformation
- **Resend** - Email delivery service
- **Neon** - PostgreSQL cloud database

## 📋 Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Python** 3.13.5
- **pip** for Python package management
- **Git** for version control
- **Cloudinary Account** - For image storage
- **Resend Account** - For email notifications

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

# Install dependencies (including new packages)
pip install -r requirements.txt
pip install cloudinary django-cloudinary-storage

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
RESEND_API_KEY=
```

#### Backend (.env)
Create a `.env` file in the backend directory:
```env
DATABASE_URL=
SECRET_KEY=
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

The project is currently configured with:
- **Neon PostgreSQL database** - Update the `DATABASE_URL` in [`backend/.env`](backend/.env)
- **Cloudinary for image storage** - Add your Cloudinary credentials
- **Resend for email notifications** - Add your Resend API key

## 🎨 UI Components

This project uses:
- **Tailwind CSS v4** with custom theme configuration
- **Custom CSS Variables** for consistent theming
- **Responsive Design** with mobile-first approach
- **Lucide React** for icons
- **Advanced Filter System** with real-time search and sorting
- **Image Upload Preview** with drag-and-drop support
- **Loading States** and progress indicators

Component styling can be found in [`frontend/app/globals.css`](frontend/app/globals.css).

## 📁 Key Files

### Frontend
- [`app/page.tsx`](frontend/app/page.tsx) - Main landing page with navigation
- [`app/guard-dashboard/page.tsx`](frontend/app/guard-dashboard/page.tsx) - **NEW** Guard dashboard with advanced filtering
- [`app/student-dashboard/page.tsx`](frontend/app/student-dashboard/page.tsx) - Student parcel view
- [`app/dashboard/page.tsx`](frontend/app/dashboard/page.tsx) - General staff dashboard
- [`components/ParcelRegistrationForm.tsx`](frontend/components/ParcelRegistrationForm.tsx) - **NEW** Parcel registration with image upload
- [`components/UpdateProfile.tsx`](frontend/components/UpdateProfile.tsx) - Student profile management
- [`components/ParcelCard.tsx`](frontend/components/ParcelCard.tsx) - **NEW** Individual parcel display component
- [`components/ParcelList.tsx`](frontend/components/ParcelList.tsx) - **NEW** Parcel listing with filtering
- [`lib/useSyncClerkUser.ts`](frontend/lib/useSyncClerkUser.ts) - Clerk user sync hook
- [`lib/sendMail.ts`](frontend/lib/sendMail.ts) - **NEW** Email notification service
- [`app/globals.css`](frontend/app/globals.css) - Global styles and theme variables

### Backend
- [`students/models.py`](backend/students/models.py) - Student data model
- [`parcels/models.py`](backend/parcels/models.py) - **UPDATED** Parcel model with CloudinaryField
- [`students/views.py`](backend/students/views.py) - Student API endpoints
- [`parcels/views.py`](backend/parcels/views.py) - **UPDATED** Parcel endpoints with image upload
- [`parcels/serializers.py`](backend/parcels/serializers.py) - **NEW** Parcel serialization with image handling
- [`backend/settings.py`](backend/backend/settings.py) - **UPDATED** Django config with Cloudinary
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
python manage.py collectstatic # Collect static files (production)
```

## 🌐 CORS Configuration

The backend is configured to allow requests from `http://localhost:3000` (frontend). Update [`CORS_ALLOWED_ORIGINS`](backend/backend/settings.py) for production deployment.

## 📋 Important Notes

> ⚠️ **Environment Files**: 
> - Never commit `.env` or `.env.local` files to version control
> - Always create these files locally after cloning the repository
> - Use `.env.example` files as templates if available

> ⚠️ **CORS Configuration**: The CORS allowed origins are pre-configured for development. Please do not modify the `CORS_ALLOWED_ORIGINS` setting without proper authorization.

> ⚠️ **Image Storage**: Images are stored on Cloudinary. Ensure proper API limits and usage monitoring.

> ⚠️ **Email Service**: Email notifications use Resend. Monitor sending limits and deliverability.

### Common Issues

1. **Port conflicts**: Ensure ports 3000 (frontend) and 8000 (backend) are available
2. **Database connection**: Verify PostgreSQL credentials in `.env`
3. **Missing environment files**: Create `.env.local` (frontend) and `.env` (backend) files
4. **CORS errors**: Check `CORS_ALLOWED_ORIGINS` in Django settings 
5. **Node.js version**: Use Node.js 18+ for frontend compatibility
6. **Environment variables not loading**: Restart development servers after updating environment files
7. **Image upload failures**: Verify Cloudinary credentials and network connectivity
8. **Email sending failures**: Check Resend API key and domain verification
9. **Hook order errors**: Ensure all React hooks are called at component top level

## 📦 Current Application Workflow

### 1. **User Authentication & Role-Based Access**
```
User signs up/in via Clerk → Role detection → Dashboard routing → Profile sync
```
- **Authentication**: Handled by Clerk with automatic user sync
- **Role-Based Routing**: Guards access guard-dashboard, students access student-dashboard
- **Profile Management**: Users can complete/update their profile via [`UpdateProfile.tsx`](frontend/components/UpdateProfile.tsx)
- **Required Fields**: Name, Email, Phone, Hostel Block, Room Number
- **Profile Status**: Displays completion status with visual indicators

### 2. **Guard Dashboard Experience (Enhanced)**
```
Guard logs in → Access advanced dashboard → Register parcels with images → Send notifications → Manage pickups
```
- **Dashboard**: [`app/guard-dashboard/page.tsx`](frontend/app/guard-dashboard/page.tsx) - **NEW ENHANCED VERSION**
- **Advanced Features**:
  - **Real-time Statistics**: Total parcels, pending pickups, daily completed
  - **Advanced Filtering System**: Status, block, courier, date range, sorting
  - **Parcel Registration**: [`ParcelRegistrationForm.tsx`](frontend/components/ParcelRegistrationForm.tsx) with image upload
  - **Image Upload**: Cloudinary integration with preview and progress tracking
  - **Email Notifications**: Automatic email alerts to students via Resend
  - **Search Functionality**: Multi-field real-time search
  - **Pickup Management**: One-click status updates with confirmation

### 3. **Parcel Registration Workflow (New)**

```registeration
Guard selects student → Fills details → Uploads image → Submits → Email sent → Tracking ID generated
```

- **Component**: [`ParcelRegistrationForm.tsx`](frontend/components/ParcelRegistrationForm.tsx)
- **Features**:
  - **Student Auto-complete**: Dropdown with all registered students
  - **Auto-fill Details**: Room and block auto-populated from student profile
  - **Image Upload**: Drag & drop or click to upload with preview
  - **File Validation**: Size (5MB) and type (JPEG, PNG, WebP) validation
  - **Upload Progress**: Real-time progress bar during upload
  - **Email Integration**: Automatic notification with parcel details
  - **Error Handling**: Comprehensive error messages and recovery

### 4. **Student Dashboard Experience (Updated)**

```dashboard
Student logs in → Views personalized dashboard → Sees parcel history → Profile management
```

- **Dashboard**: [`app/student-dashboard/page.tsx`](frontend/app/student-dashboard/page.tsx)
- **Features**:
  - **Profile Status Indicator**: Completion percentage and missing fields
  - **Parcel History**: Personal parcel tracking with images
  - **Status Tracking**: Real-time parcel status updates
  - **Profile Editing**: In-place profile updates

### 5. **Image Management System (New)**

```image-selection
Image selected → Client validation → Cloudinary upload → URL stored → Display with fallback
```

- **Upload Process**: Multi-part form upload with progress tracking
- **Storage**: Cloudinary with organized folder structure (`hosteldrop/parcels/`)
- **Optimization**: Automatic image resizing and quality optimization
- **Display**: Thumbnail view with click-to-expand functionality
- **Error Handling**: Graceful fallback for failed image loads

### 6. **Email Notification System (New)**

```email
Parcel registered → Email template generated → Resend API → Student notified → Status tracked
```

- **Service**: [`lib/sendMail.ts`](frontend/lib/sendMail.ts) using EmailJs
- **Template**: Rich HTML email with parcel details and pickup instructions
- **Tracking**: Email delivery status monitoring
- **Error Recovery**: Fallback handling for email failures

### 7. **Advanced Search & Filter System (Enhanced)**

```search
User enters criteria → Multi-field filtering → Real-time results → Export functionality
```

- **Implementation**: [`app/guard-dashboard/page.tsx`](frontend/app/guard-dashboard/page.tsx)
- **Filter Options**:
  - **Status Filter**: All, Pending, Picked Up
  - **Block Filter**: Dynamic list from database
  - **Courier Filter**: Dynamic list from parcels
  - **Date Range**: Today, This Week, This Month, All Time
  - **Sorting**: Multiple fields with ascending/descending order
- **Search Fields**: Student name, tracking ID, courier, room number, block
- **Performance**: Debounced search with client-side filtering

### 8. **Data Flow Architecture (Updated)**

```
Frontend (React/Next.js) ↔ Clerk Auth ↔ Backend (Django + Cloudinary + Resend) ↔ PostgreSQL Database
```

- **Authentication**: Clerk handles user auth, syncs with Django backend
- **Data Sync**: [`useSyncClerkUser.ts`](frontend/lib/useSyncClerkUser.ts) manages user synchronization
- **API Communication**: RESTful APIs with multipart support for file uploads
- **Database**: PostgreSQL with proper indexing and relationships
- **Image Storage**: Cloudinary CDN for optimized image delivery
- **Email Service**: Resend for reliable email delivery
- **Error Tracking**: Comprehensive logging and error handling

## 🔗 Backend API Endpoints (Updated)

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
- **Use Case**: Staff/admin overview and parcel registration dropdown

### Parcel Endpoints (`/parcels/`) - **UPDATED**

#### `POST /parcels/create/`

- **Purpose**: Register a new parcel arrival with optional image
- **Method**: POST
- **Parser**: MultiPartParser, FormParser
- **Body** (multipart/form-data):
  ```json
  {
    "student_id": "uuid-of-student",
    "description": "Amazon package - Room 101",
    "service": "Amazon",
    "status": "PENDING",
    "image": "file_upload"
  }
  ```
- **Response**: Created parcel details with tracking ID and image URL
- **Features**: Cloudinary image upload, automatic email notification
- **Use Case**: Guard registers incoming parcel with photo

#### `GET /parcels/my/?clerk_id={clerk_id}`

- **Purpose**: Get all parcels for a specific student
- **Method**: GET
- **Query Params**: `clerk_id` (student's clerk ID)
- **Response**: List of parcels belonging to the student with image URLs
- **Use Case**: Student views their pending/picked up parcels

#### `GET /parcels/all/`

- **Purpose**: Retrieve all parcels in the system
- **Method**: GET
- **Response**: Complete list of all parcels with status and images
- **Features**: Full student details, image URLs, timestamps
- **Use Case**: Guard dashboard with filtering and search

#### `PATCH /parcels/{parcel_id}/picked-up/`

- **Purpose**: Mark parcel as picked up by student
- **Method**: PATCH
- **URL Params**: `parcel_id` (ID of the parcel)
- **Response**: Updated parcel with pickup timestamp
- **Use Case**: Guard marks parcel as collected when handing over to student

### API Response Structure (Updated)

All endpoints follow a consistent response format:

**Success Response (Parcel Creation):**
```json
{
  "parcel": {
    "id": 123,
    "tracking_id": "HD000123",
    "student": {
      "name": "John Doe",
      "room_number": "101",
      "hostel_block": "A Block"
    },
    "service": "Amazon",
    "description": "Package description",
    "status": "PENDING",
    "image": "https://res.cloudinary.com/hosteldrop/image/upload/v1234567890/hosteldrop/parcels/parcel_123.jpg",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "created": true,
  "message": "Parcel created successfully with tracking ID: HD000123"
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
- `201 Created` - Successful POST operations (parcel creation)
- `400 Bad Request` - Invalid request data or validation errors
- `404 Not Found` - Resource not found
- `413 Payload Too Large` - Image file too large
- `415 Unsupported Media Type` - Invalid image format
- `500 Internal Server Error` - Server-side errors

## 🔍 Current Implementation Status

### ✅ Implemented Features

1. **User Authentication** - Clerk integration with automatic sync
2. **Role-Based Dashboards** - Separate guard and student interfaces
3. **Advanced Parcel Management** - Registration, tracking, status updates
4. **Image Upload System** - Cloudinary integration with preview and validation
5. **Email Notification System** - Automatic student notifications via Resend
6. **Advanced Search & Filter** - Multi-criteria filtering with real-time results
7. **Responsive Design** - Mobile-first approach with Tailwind CSS
8. **Database Integration** - PostgreSQL with proper indexing and relationships
9. **Error Handling** - Comprehensive error management and user feedback
10. **Loading States** - Progress indicators and loading spinners
11. **File Management** - Upload progress tracking and error recovery

### 🔄 In Progress

1. **Analytics Dashboard** - Statistics and reporting for management
2. **Bulk Operations** - Mass parcel import/export functionality
3. **Mobile App** - React Native companion app
4. **Push Notifications** - Real-time browser notifications
5. **QR Code System** - QR codes for pickup verification

### 📋 Future Enhancements

1. **SMS Notifications** - Alternative to email notifications
2. **Audit Trail** - Detailed logging of all system actions

### 🛡️ Security Features

1. **Authentication** - Clerk-based secure authentication
2. **File Validation** - Image type and size validation
3. **CORS Configuration** - Controlled cross-origin requests
4. **Environment Variables** - Secure credential management
5. **Input Sanitization** - XSS and injection prevention
6. **Rate Limiting** - API abuse prevention (planned)

This comprehensive workflow ensures efficient parcel management while maintaining a user-friendly experience for both guards and students, with robust image handling and automated notification systems.
