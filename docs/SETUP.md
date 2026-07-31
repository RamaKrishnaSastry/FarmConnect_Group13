# FarmConnect Setup Guide

## Project Structure

```
FarmConnect_Group13/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── config.py           # Configuration settings
│   ├── requirements.txt    # Python dependencies
│   └── modules/
│       ├── __init__.py
│       ├── auth.py         # Authentication service
│       └── db.py           # Database connection manager
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── RoleSelector.jsx
│   │   │   ├── AuthForms.css
│   │   │   └── RoleSelector.css
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   └── AuthPage.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.jsx
│   │   └── config.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── .env.local (you need to create this)
│
└── README.md (main documentation)
```

## Prerequisites

- Python 3.8+ (for backend)
- Node.js 16+ and npm (for frontend)
- MySQL 8.0+ (database)

## Backend Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Update Database Credentials

Edit `backend/config.py` if your database credentials are different:

```python
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "n3u3da!"
DB_NAME = "FarmConnect"
DB_PORT = 3306
```

### 4. Create Database

Run this SQL script in your MySQL client to create the database and tables:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS FarmConnect;
USE FarmConnect;

-- [Insert the full SQL schema provided earlier]
-- (See the CREATE TABLE statements in the main README)
```

### 5. Run the Backend Server

```bash
python app.py
```

The server will start at `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Create Environment File

Create a `.env.local` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Start the Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## Key Features Implemented

### Authentication Module (`backend/modules/auth.py`)

- **Password Hashing**: Uses bcrypt with 12 salt rounds for secure password storage
- **Email Validation**: Validates email format before storing
- **Password Strength Validation**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 digit
- **User Registration**: Stores user with hashed password and optional location info
- **User Login**: Verifies credentials and returns user info on success

### Database Module (`backend/modules/db.py`)

- **Connection Pooling**: Manages MySQL connections
- **Query Execution**: Handles SELECT queries with dictionary results
- **Update Execution**: Handles INSERT/UPDATE/DELETE with transaction support

### Frontend Features

#### Login Screen
- Email and password input fields
- Password visibility toggle
- Error messages for failed login
- Link to registration
- Responsive design

#### Role Selection
- Three role cards: Farmer, Buyer, Transporter
- Each role shows features and benefits
- Smooth animations on hover
- Mobile responsive

#### Registration Form
- Dynamic form that changes based on selected role
- Real-time password validation
- Password confirmation matching
- Optional location fields (phone, address, city, state)
- Success feedback with auto-redirect to login

### API Endpoints

#### POST `/api/auth/register`

Request:
```json
{
  "fullName": "John Farmer",
  "email": "john@farm.com",
  "password": "SecurePass123",
  "role": "FARMER",
  "phone": "+1-555-0000",
  "address": "123 Farm Road",
  "city": "Springfield",
  "state": "IL"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "User registered successfully with ID: 1",
  "role": "FARMER"
}
```

#### POST `/api/auth/login`

Request:
```json
{
  "email": "john@farm.com",
  "password": "SecurePass123"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "user_id": 1,
    "full_name": "John Farmer",
    "email": "john@farm.com",
    "role": "FARMER"
  }
}
```

## Security Features

1. **Password Hashing**: bcrypt with 12 rounds
2. **CORS Enabled**: Configured for frontend-backend communication
3. **Input Validation**: Email, password strength, role validation
4. **SQL Injection Prevention**: Parameterized queries using MySQL connector
5. **No Password Storage**: Password hashes only, never plaintext

## Troubleshooting

### Backend Issues

**"Connection refused" on port 5000**
- Check if backend is running
- Verify firewall settings

**Database connection error**
- Verify MySQL is running
- Check database credentials in `config.py`
- Ensure database and tables are created

**ModuleNotFoundError**
- Activate virtual environment
- Run `pip install -r requirements.txt`

### Frontend Issues

**"Blank page" or "Cannot GET /"**
- Clear browser cache (Ctrl+F5)
- Check console for errors (F12)

**API calls failing**
- Verify `REACT_APP_API_URL` in `.env.local`
- Check backend server is running
- Check CORS configuration

**Module not found errors**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

## Next Steps

1. Create farmer/buyer/transporter dashboards
2. Implement produce listing functionality
3. Add purchase request system
4. Build delivery management
5. Add real-time notifications
6. Implement payment system

## Development Tips

- Use React DevTools browser extension for frontend debugging
- Use Flask debugger: set `debug=True` in `app.py`
- Check browser console (F12) for frontend errors
- Check server logs for backend errors
- Use Postman or similar tool to test API endpoints

## Database Schema Notes

- All timestamps use `CURRENT_TIMESTAMP`
- Foreign keys with `ON DELETE CASCADE` for data integrity
- Unique constraints on email and request ratings
- ENUM types for roles and statuses
- Decimal types for precise monetary values
