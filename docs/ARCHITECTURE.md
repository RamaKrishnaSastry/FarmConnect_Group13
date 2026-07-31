# FarmConnect Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Browser (localhost:3000)                                │   │
│  │  ├─ AuthPage (Login/Registration)                        │   │
│  │  │  ├─ LoginForm                                         │   │
│  │  │  ├─ RoleSelector                                      │   │
│  │  │  └─ RegisterForm                                      │   │
│  │  └─ (Future) Dashboards (Farmer/Buyer/Transporter)      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
│                      HTTP Request/Response                        │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Flask)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Server (localhost:5000)                             │   │
│  │  ├─ /api/auth/register                                   │   │
│  │  ├─ /api/auth/login                                      │   │
│  │  └─ /api/health                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Modules (Business Logic)                                │   │
│  │  ├─ AuthService (auth.py)                                │   │
│  │  │  ├─ hash_password()                                   │   │
│  │  │  ├─ verify_password()                                 │   │
│  │  │  ├─ validate_email()                                  │   │
│  │  │  ├─ validate_password()                               │   │
│  │  │  ├─ register_user()                                   │   │
│  │  │  └─ login_user()                                      │   │
│  │  └─ Database (db.py)                                     │   │
│  │     ├─ get_connection()                                  │   │
│  │     ├─ execute_query()                                   │   │
│  │     └─ execute_update()                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
│                    Database Queries                               │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE (MySQL)                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FarmConnect Database                                    │   │
│  │  ├─ users                                                │   │
│  │  ├─ produce_listings                                     │   │
│  │  ├─ produce_photos                                       │   │
│  │  ├─ purchase_requests                                    │   │
│  │  ├─ deliveries                                           │   │
│  │  ├─ ratings                                              │   │
│  │  └─ chat_messages                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── LoginForm.jsx           # Email/password input
│   │   ├── RegisterForm.jsx        # Multi-step registration
│   │   ├── RoleSelector.jsx        # Role selection UI
│   │   ├── AuthForms.css           # Form styling
│   │   └── RoleSelector.css        # Role selector styling
│   │
│   ├── pages/
│   │   ├── AuthPage.jsx            # Main auth container
│   │   └── AuthPage.css            # Page styling
│   │
│   ├── App.jsx                     # Route management
│   ├── App.css                     # Global styles
│   ├── index.jsx                   # React entry point
│   ├── config.js                   # API configuration
│   │
│   └── public/
│       └── index.html              # HTML template
│
├── package.json                    # Dependencies
└── .env.local                      # Environment variables
```

### Backend Structure

```
backend/
├── app.py                          # Flask application
│   ├─ /api/auth/register           # POST endpoint
│   ├─ /api/auth/login              # POST endpoint
│   └─ /api/health                  # GET endpoint
│
├── config.py                       # Configuration
│   ├─ DB_HOST, DB_USER, DB_PASSWORD
│   ├─ DB_NAME, DB_PORT
│   └─ SECRET_KEY, FLASK_ENV
│
├── modules/
│   ├── auth.py                     # Authentication service
│   │   ├─ class AuthService
│   │   ├─ hash_password()
│   │   ├─ verify_password()
│   │   ├─ validate_email()
│   │   ├─ validate_password()
│   │   ├─ register_user()
│   │   └─ login_user()
│   │
│   └── db.py                       # Database access layer
│       ├─ class Database
│       ├─ get_connection()
│       ├─ execute_query()
│       └─ execute_update()
│
├── requirements.txt                # Python dependencies
└── .env.example                    # Environment template
```

## Data Flow

### Registration Flow

```
User Input (RegisterForm)
  ↓
Frontend Validation (client-side)
  - Password matches confirm password
  - Email format valid
  ↓
POST /api/auth/register (JSON)
  ↓
Backend Validation (server-side)
  - Email format valid
  - Password strength valid
  - Email not already registered
  - Role valid
  ↓
AuthService.register_user()
  - Hash password with bcrypt
  - INSERT into users table
  ↓
Response (201 Created or 400 Bad Request)
  ↓
Frontend handles response
  - Success: Redirect to login
  - Error: Display error message
```

### Login Flow

```
User Input (LoginForm)
  ↓
Frontend Validation (client-side)
  - Email format valid
  ↓
POST /api/auth/login (JSON)
  ↓
Backend Validation (server-side)
  - Email and password provided
  - Email format valid
  ↓
AuthService.login_user()
  - Query users table by email
  - Verify password with bcrypt.checkpw()
  - Return user data if match
  ↓
Response (200 OK or 401 Unauthorized)
  ↓
Frontend handles response
  - Success: Store user info, redirect to dashboard
  - Error: Display error message
```

## Database Schema (Users Table)

```sql
users
├─ user_id (INT, PRIMARY KEY, AUTO_INCREMENT)
├─ full_name (VARCHAR 100, NOT NULL)
├─ email (VARCHAR 150, UNIQUE, NOT NULL)
├─ password_hash (VARCHAR 255, NOT NULL) ← bcrypt hash
├─ role (ENUM: FARMER/BUYER/TRANSPORTER, NOT NULL)
├─ phone (VARCHAR 20, NULLABLE)
├─ address (TEXT, NULLABLE)
├─ city (VARCHAR 100, NULLABLE)
├─ state (VARCHAR 100, NULLABLE)
├─ latitude (DECIMAL 10,8, NULLABLE)
├─ longitude (DECIMAL 11,8, NULLABLE)
└─ created_at (DATETIME, DEFAULT CURRENT_TIMESTAMP)
```

## API Response Patterns

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Optional data payload
  }
}
```

HTTP Status: `200 OK` or `201 Created`

### Error Response

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

HTTP Status: `400 Bad Request`, `401 Unauthorized`, or `500 Internal Server Error`

## Security Layers

```
┌─────────────────────────────────────┐
│  Frontend Validation                 │
│  - Real-time password check         │
│  - Email format validation          │
│  - Confirm password match           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Network Security                    │
│  - HTTPS (to be implemented)        │
│  - CORS enabled                     │
│  - Content-Type validation          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Backend Validation                  │
│  - Email format regex               │
│  - Password strength check          │
│  - Role validation                  │
│  - Email uniqueness check           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Cryptographic Security              │
│  - bcrypt password hashing          │
│  - 12-round salt generation         │
│  - Constant-time comparison         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Database Security                   │
│  - Parameterized queries            │
│  - SQL injection prevention         │
│  - Unique email constraint          │
│  - Foreign key relationships        │
└─────────────────────────────────────┘
```

## Error Handling

### Frontend Error Handling

```javascript
try {
  // API call
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.success) {
    // Handle success
  } else {
    // Display user-friendly error
    setError(data.message);
  }
} catch (err) {
  // Network or parsing error
  setError("An error occurred. Please try again.");
}
```

### Backend Error Handling

```python
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        # Validation
        success, user_data, message = AuthService.login_user(...)
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'user': user_data
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 401
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"An error occurred: {str(e)}"
        }), 500
```

## Scalability Considerations

### Current State (MVP)
- Single backend server
- Direct MySQL connection
- No caching layer
- Synchronous requests

### Future Improvements
- Connection pooling
- Redis caching for user sessions
- JWT token-based auth
- Async task queue (Celery)
- Load balancing with multiple servers
- CDN for static assets
- Database replication

## Dependencies

### Backend
```
Flask==2.3.3              # Web framework
Flask-CORS==4.0.0         # Cross-origin requests
mysql-connector-python==8.1.0  # MySQL driver
bcrypt==4.0.1             # Password hashing
python-dotenv==1.0.0      # Environment variables
```

### Frontend
```
react==18.2.0             # UI library
react-dom==18.2.0         # DOM rendering
react-router-dom==6.14.0  # Routing
react-scripts==5.0.1      # Build tools
```

## Performance Optimization

### Frontend
- Component-level code splitting
- CSS-in-JS for critical styles
- Image optimization
- Lazy loading (future)

### Backend
- Database indexing on email (unique constraint)
- Connection pooling (future)
- Query optimization
- Response compression (future)

### Database
- PRIMARY KEY indexing on user_id
- UNIQUE index on email
- Proper data types (ENUM, DECIMAL)
- Foreign key constraints for referential integrity

## Monitoring & Logging

### Future Implementations
- Request/response logging
- Error tracking (Sentry)
- Performance metrics (New Relic)
- User activity audit logs
- Failed login attempts tracking
