# BeFluent School Management System

A comprehensive school management system built with React and Django, designed to streamline educational institution operations.

## Project Overview

BeFluent is a modern school management system that facilitates communication and management between school administrators, teachers, students, and parents. The system features a responsive web interface built with React and a robust Django backend.

## Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- React Hot Toast for notifications
- QR Code generation capabilities

### Backend
- Django
- SQLite database
- Django REST Framework (assumed based on structure)

## Project Structure

```
befluent/
├── frontend/               # React frontend application
│   ├── src/               # Source code
│   ├── public/            # Static files
│   └── components.json    # Component configurations
│
└── school_management/     # Django backend
    ├── accounts/          # User authentication and management
    ├── notifications/     # Notification system
    ├── parents/          # Parent-related functionality
    ├── schedule/         # Class scheduling
    ├── students/         # Student management
    └── manage.py         # Django management script
```

## Features

- User Authentication and Authorization
- Student Management
- Parent Portal
- Class Scheduling
- Notification System
- QR Code Integration

## Setup and Installation

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Create and activate a virtual environment:
   ```bash
   python -m venv befluent_venv
   source befluent_venv/bin/activate  # On Windows: befluent_venv\Scripts\activate
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Navigate to the school_management directory:
   ```bash
   cd school_management
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

## Contributing

Please read our contributing guidelines before submitting pull requests to the project.

## License

[Add your license information here]

## Support

For support, please [add contact information or support channels]
