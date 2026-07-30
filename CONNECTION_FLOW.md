# FarmConnect - Connection Flow Diagram

## 🔄 Complete Data Flow: Registration

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND - React                                                 │
│ RegisterForm.jsx                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        User fills form and clicks "Create Account"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND - handleSubmit()                                       │
│ ────────────────────────────────────────────────────────────────│
│ const response = await fetch(                                   │
│   `${API_BASE_URL}/api/auth/register`,                          │
│   {                                                              │
│     method: 'POST',                                              │
│     headers: { 'Content-Type': 'application/json' },            │
│     body: JSON.stringify({                                       │
│       fullName: "John Farmer",                                  │
│       email: "john@farm.com",                                   │
│       password: "SecurePass123",                                │
│       role: "FARMER",                                            │
│       latitude: 50,                                              │
│       longitude: 75                                              │
│     })                                                           │
│   }                                                              │
│ );                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                   HTTP POST Request
              http://localhost:5000/api/auth/register
                   Content-Type: application/json
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND - Flask                                                 │
│ app.py:11 (@app.route('/api/auth/register'))                   │
│ ────────────────────────────────────────────────────────────────│
│ def register():                                                  │
│   data = request.get_json()                                      │
│   full_name = data.get('fullName')    # "John Farmer"          │
│   email = data.get('email')           # "john@farm.com"        │
│   password = data.get('password')     # "SecurePass123"        │
│   role = data.get('role')             # "FARMER"               │
│   latitude = data.get('latitude')     # 50                     │
│   longitude = data.get('longitude')   # 75                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                  Call AuthService
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND - modules/auth.py                                       │
│ AuthService.register_user()                                     │
│ ────────────────────────────────────────────────────────────────│
│ 1. Validate inputs (non-empty)                                  │
│ 2. Validate email format                                        │
│    ✓ Regex: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$  │
│ 3. Validate password strength                                   │
│    ✓ Length >= 8                                                │
│    ✓ Has uppercase                                              │
│    ✓ Has lowercase                                              │
│    ✓ Has digit                                                  │
│ 4. Validate role in ['FARMER', 'BUYER', 'TRANSPORTER']         │
│ 5. Validate coordinates (0-200 range)                           │
│ 6. Check email not already registered                           │
│    Query: SELECT user_id FROM users WHERE email = ?            │
│    If exists → Return error "Email already registered"          │
│ 7. Hash password with bcrypt                                    │
│    salt = bcrypt.gensalt(rounds=12)                             │
│    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)      │
│    Result: $2b$12$aBcDeFgHiJkLmNoPqRsTuVwXyZ...               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                  Call Database
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND - modules/db.py                                         │
│ Database.execute_update()                                       │
│ ────────────────────────────────────────────────────────────────│
│ conn = mysql.connector.connect(                                 │
│   host="localhost",                                              │
│   user="root",                                                   │
│   password="n3u3da!",                                            │
│   database="FarmConnect"                                        │
│ )                                                                │
│ cursor = conn.cursor()                                          │
│ cursor.execute(                                                  │
│   INSERT INTO users (full_name, email, password_hash, role,    │
│                      phone, address, city, state,               │
│                      latitude, longitude)                        │
│   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)                        │
│   params: (                                                      │
│     "John Farmer",                                              │
│     "john@farm.com",                                            │
│     "$2b$12$aBcDeFgHiJkLmNoPqRsTuVwXyZ...",  ← Hashed!         │
│     "FARMER",                                                    │
│     None, None, None, None,                                     │
│     50, 75                                                       │
│   )                                                              │
│ )                                                                │
│ conn.commit()                                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE - MySQL                                                │
│ FarmConnect.users                                               │
│ ────────────────────────────────────────────────────────────────│
│ INSERT INTO users:                                              │
│ user_id:       1 (AUTO_INCREMENT)                               │
│ full_name:     "John Farmer"                                    │
│ email:         "john@farm.com"                                  │
│ password_hash: "$2b$12$aBcDeFgHiJkLmNoPqRsTuVwXyZ..." (hashed) │
│ role:          "FARMER"                                         │
│ phone:         NULL                                              │
│ address:       NULL                                              │
│ city:          NULL                                              │
│ state:         NULL                                              │
│ latitude:      50.00                                             │
│ longitude:     75.00                                             │
│ created_at:    2024-01-15 10:30:45                             │
│                                                                  │
│ ✅ Insert successful, lastrowid = 1                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        Return to backend with user_id
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND - Return Response                                       │
│ ────────────────────────────────────────────────────────────────│
│ return jsonify({                                                │
│   'success': True,                                              │
│   'message': "User registered successfully with ID: 1",        │
│   'role': "FARMER"                                              │
│ }), 201                                                          │
│                                                                  │
│ HTTP 201 Created                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
              HTTP Response back to Frontend
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND - Handle Response                                      │
│ ────────────────────────────────────────────────────────────────│
│ const data = await response.json()                              │
│ if (data.success) {                                             │
│   setSuccess("Registration successful! Redirecting...")        │
│   setTimeout(() => {                                            │
│     onBackToLogin()  ← Redirect to login screen                │
│   }, 2000)                                                       │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                   ✅ User registered!
         Now user can login with john@farm.com / SecurePass123
```

---

## 🔄 Complete Data Flow: Login

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND - React                                                 │
│ LoginForm.jsx                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        User enters email and password, clicks "Login"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND - handleSubmit()                                       │
│ ────────────────────────────────────────────────────────────────│
│ const response = await fetch(                                   │
│   `${API_BASE_URL}/api/auth/login`,                             │
│   {                                                              │
│     method: 'POST',                                              │
│     headers: { 'Content-Type': 'application/json' },            │
│     body: JSON.stringify({                                       │
│       email: "john@farm.com",                                   │
│       password: "SecurePass123"                                 │
│     })                                                           │
│   }                                                              │
│ );                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                   HTTP POST Request
              http://localhost:5000/api/auth/login
                   Content-Type: application/json
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND - Flask                                                 │
│ app.py:60 (@app.route('/api/auth/login'))                      │
│ ────────────────────────────────────────────────────────────────│
│ def login():                                                     │
│   data = request.get_json()                                      │
│   email = data.get('email')       # "john@farm.com"            │
│   password = data.get('password') # "SecurePass123"            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                  Call AuthService
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND - modules/auth.py                                       │
│ AuthService.login_user()                                        │
│ ────────────────────────────────────────────────────────────────│
│ 1. Validate inputs (email and password provided)                │
│ 2. Validate email format                                        │
│ 3. Query database:                                              │
│    SELECT password_hash FROM users WHERE email = ?             │
│                                                                  │
│    Result: {                                                    │
│      user_id: 1,                                                │
│      full_name: "John Farmer",                                  │
│      email: "john@farm.com",                                    │
│      password_hash: "$2b$12$aBcDeFgHiJkLmNoPqRsTuVwXyZ...",    │
│      role: "FARMER"                                             │
│    }                                                             │
│                                                                  │
│ 4. Verify password with bcrypt:                                 │
│    bcrypt.checkpw(                                              │
│      "SecurePass123".encode('utf-8'),                           │
│      "$2b$12$aBcDeFgHiJkLmNoPqRsTuVwXyZ...".encode('utf-8')     │
│    )                                                             │
│    ✅ Returns True (password matches!)                           │
│                                                                  │
│ 5. Return user data (WITHOUT password hash!)                    │
│    {                                                             │
│      user_id: 1,                                                │
│      full_name: "John Farmer",                                  │
│      email: "john@farm.com",                                    │
│      role: "FARMER"                                             │
│    }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND - Return Response                                       │
│ ────────────────────────────────────────────────────────────────│
│ return jsonify({                                                │
│   'success': True,                                              │
│   'message': "Login successful",                                │
│   'user': {                                                      │
│     'user_id': 1,                                               │
│     'full_name': "John Farmer",                                 │
│     'email': "john@farm.com",                                   │
│     'role': "FARMER"                                            │
│   }                                                              │
│ }), 200                                                          │
│                                                                  │
│ HTTP 200 OK                                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
              HTTP Response back to Frontend
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND - Handle Response                                      │
│ ────────────────────────────────────────────────────────────────│
│ const data = await response.json()                              │
│ if (data.success) {                                             │
│   // Store user data in localStorage                            │
│   localStorage.setItem('user', JSON.stringify(data.user))      │
│   localStorage.setItem('authToken', data.user.user_id)        │
│                                                                  │
│   // Redirect to dashboard                                      │
│   window.location.href = '/dashboard/farmer'                   │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ✅ Login successful!
           User redirected to /dashboard/farmer
```

---

## 📂 File Structure & Connections

```
FRONTEND (React)
│
├── src/
│   ├── App.jsx
│   │   └── Imports AuthPage
│   │
│   ├── pages/
│   │   └── AuthPage.jsx
│   │       ├── Imports LoginForm
│   │       ├── Imports RegisterForm
│   │       └── Imports RoleSelector
│   │
│   ├── components/
│   │   ├── LoginForm.jsx
│   │   │   ├── Imports API_BASE_URL from config.js
│   │   │   └── Makes POST to /api/auth/login ✓
│   │   │
│   │   ├── RegisterForm.jsx
│   │   │   ├── Imports API_BASE_URL from config.js
│   │   │   └── Makes POST to /api/auth/register ✓
│   │   │
│   │   └── RoleSelector.jsx
│   │       └── Shows role selection UI
│   │
│   └── config.js
│       ├── API_BASE_URL = 'http://localhost:5000'
│       └── Exported to LoginForm & RegisterForm
│
└── package.json
    └── Dependencies: react, react-router-dom, react-scripts


BACKEND (Flask)
│
├── app.py
│   ├── Imports modules/auth.py
│   ├── Imports modules/location.py
│   │
│   ├── Route: POST /api/auth/register
│   │   └── Calls AuthService.register_user() ✓
│   │
│   ├── Route: POST /api/auth/login
│   │   └── Calls AuthService.login_user() ✓
│   │
│   └── Route: GET /api/health
│       └── Returns server status
│
├── config.py
│   └── Database configuration
│
├── modules/
│   ├── auth.py
│   │   ├── class AuthService
│   │   ├── hash_password()
│   │   ├── verify_password()
│   │   ├── validate_email()
│   │   ├── validate_password()
│   │   ├── register_user()
│   │   │   └── Calls Database.execute_update() ✓
│   │   │
│   │   └── login_user()
│   │       └── Calls Database.execute_query() ✓
│   │
│   ├── db.py
│   │   ├── class Database
│   │   ├── get_connection()
│   │   │   └── Connects to MySQL
│   │   │
│   │   ├── execute_query() - SELECT
│   │   │   └── Returns results with dictionary=True
│   │   │
│   │   └── execute_update() - INSERT/UPDATE/DELETE
│   │       └── Commits and returns lastrowid
│   │
│   └── location.py
│       └── Location service functions
│
└── requirements.txt
    ├── Flask==2.3.3
    ├── Flask-CORS==4.0.0
    ├── mysql-connector-python==8.1.0
    └── bcrypt==4.0.1


DATABASE (MySQL)
│
└── FarmConnect
    ├── users table
    │   ├── user_id (PK, AUTO_INCREMENT)
    │   ├── full_name
    │   ├── email (UNIQUE)
    │   ├── password_hash ← Bcrypt hashed ✓
    │   ├── role (ENUM)
    │   ├── phone
    │   ├── address
    │   ├── city
    │   ├── state
    │   ├── latitude
    │   ├── longitude
    │   └── created_at
    │
    └── [Other tables: produce_listings, purchase_requests, etc.]
```

---

## 🔗 Request/Response Chain

### Registration Example

```
Client Request:
POST /api/auth/register
{
  "fullName": "John Farmer",
  "email": "john@farm.com",
  "password": "SecurePass123",
  "role": "FARMER",
  "latitude": 50,
  "longitude": 75
}

↓ Backend Processing ↓

Server Response:
201 Created
{
  "success": true,
  "message": "User registered successfully with ID: 1",
  "role": "FARMER"
}

OR (on error):

400 Bad Request
{
  "success": false,
  "message": "Email already registered"
}
```

### Login Example

```
Client Request:
POST /api/auth/login
{
  "email": "john@farm.com",
  "password": "SecurePass123"
}

↓ Backend Processing ↓

Server Response:
200 OK
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

OR (on error):

401 Unauthorized
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## ✅ Verification Checklist

- ✅ Frontend has API calls (fetch to backend)
- ✅ Backend has endpoints (/api/auth/register, /api/auth/login)
- ✅ Backend calls AuthService (validation, hashing)
- ✅ AuthService calls Database (execute_update, execute_query)
- ✅ Database connects to MySQL (mysql-connector-python)
- ✅ Data stored in FarmConnect.users table
- ✅ Password hashed with bcrypt
- ✅ CORS enabled (Cross-Origin Requests)
- ✅ Error handling on frontend
- ✅ Error handling on backend
- ✅ Error handling in database
- ✅ Response status codes correct (201, 200, 400, 401, 500)

**All connections verified! System is fully integrated.** ✅

