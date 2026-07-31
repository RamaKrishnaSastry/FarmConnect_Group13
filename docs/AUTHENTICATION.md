# FarmConnect Authentication System

## Overview

The authentication system is built on **bcrypt password hashing** with comprehensive validation and security measures.

## Password Hashing: How It Works

### Why Bcrypt?

Instead of SHA or RSA alone, we use **bcrypt** because:
- ✅ Automatically salts each password
- ✅ Adaptive hashing (gets slower as computers get faster)
- ✅ Industry standard (used by major companies)
- ✅ Resistant to rainbow table attacks
- ✅ Protects against GPU brute-force attacks

### The Process

#### Registration Flow

```
User Input: "SecurePass123"
         ↓
[Validation Checks]
- Length ≥ 8 chars
- Has uppercase
- Has lowercase
- Has digit
         ↓
[Generate Salt]
bcrypt.gensalt(rounds=12)
         ↓
[Hash Password]
bcrypt.hashpw(password, salt)
         ↓
[Store in Database]
user.password_hash = "$2b$12$..."
```

Example hashed passwords (these are different even though input is same):
```
Input:  SecurePass123
Hash 1: $2b$12$aBcDeFgHiJkLmNoPqRsTuVwXyZ...
Hash 2: $2b$12$ZyXwVuTsRqPoNmLkJiHgFeDcBa...
```

#### Login Flow

```
User Input: "SecurePass123"
         ↓
[Find User by Email]
SELECT password_hash FROM users WHERE email = ?
         ↓
[Retrieved Hash]
$2b$12$aBcDeFgHiJkLmNoPqRsTuVwXyZ...
         ↓
[Compare with bcrypt]
bcrypt.checkpw(input_password, stored_hash)
         ↓
[Result]
✅ Match = Login Success
❌ No Match = Login Failed
```

## Password Validation Rules

All passwords must meet these requirements:

| Requirement | Example | Error Message |
|-------------|---------|---------------|
| Minimum 8 characters | `SecurePass123` ✓ | Password must be at least 8 characters long |
| At least 1 UPPERCASE | `SecurePass123` ✓ | Password must contain at least one uppercase letter |
| At least 1 lowercase | `SecurePass123` ✓ | Password must contain at least one lowercase letter |
| At least 1 digit | `SecurePass123` ✓ | Password must contain at least one digit |

## Implementation Details

### Backend Module: `modules/auth.py`

#### 1. Password Hashing
```python
@staticmethod
def hash_password(password):
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')
```

**Why rounds=12?**
- 12 rounds = ~100ms per hash
- Balances security vs performance
- Takes longer as CPU speeds increase

#### 2. Password Verification
```python
@staticmethod
def verify_password(password, hashed_password):
    """Verify password against hash"""
    return bcrypt.checkpw(
        password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )
```

#### 3. Email Validation
```python
@staticmethod
def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None
```

Valid: `user@example.com`, `john.doe+tag@test.co.uk`  
Invalid: `userexample.com`, `@example.com`, `user@.com`

#### 4. Password Strength Validation
```python
@staticmethod
def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one digit"
    return True, "Password is valid"
```

### Frontend Validation

The React form validates in real-time:

```javascript
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

const validateForm = () => {
  if (formData.password.length < 8) {
    setError('Password must be at least 8 characters long');
    return false;
  }
  if (!/[A-Z]/.test(formData.password)) {
    setError('Password must contain at least one uppercase letter');
    return false;
  }
  // ... more checks
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return false;
  }
  return true;
};
```

## API Endpoints

### POST /api/auth/register

**Request:**
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

**Validation Steps:**
1. ✓ Check all required fields present
2. ✓ Validate email format
3. ✓ Validate password strength
4. ✓ Validate role is valid (FARMER/BUYER/TRANSPORTER)
5. ✓ Check email not already registered
6. ✓ Hash password with bcrypt
7. ✓ Store in database

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully with ID: 1",
  "role": "FARMER"
}
```

**Error Responses (400):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### POST /api/auth/login

**Request:**
```json
{
  "email": "john@farm.com",
  "password": "SecurePass123"
}
```

**Validation Steps:**
1. ✓ Check email and password provided
2. ✓ Validate email format
3. ✓ Look up user by email
4. ✓ Verify password using bcrypt
5. ✓ Return user data if successful

**Success Response (200):**
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

**Error Responses (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## Database Storage

### Users Table
```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,  -- Stores bcrypt hash (~60 chars)
    role ENUM('FARMER', 'BUYER', 'TRANSPORTER') NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Why VARCHAR(255) for password_hash?**
- Bcrypt hashes are ~60 characters
- 255 provides plenty of room for future upgrades
- Standard practice for hash fields

## Security Best Practices Implemented

✅ **No Plain Text Passwords**
- Password hash only, never stored as text
- Even admin cannot recover original password

✅ **Unique Salts**
- Each password gets its own random salt
- Same password produces different hashes

✅ **Constant Time Comparison**
- bcrypt.checkpw() uses constant-time comparison
- Prevents timing attacks

✅ **Input Validation**
- Email format validation
- Password strength requirements
- Role validation
- SQL injection prevention (parameterized queries)

✅ **CORS Security**
- Cross-origin requests properly configured
- Frontend can communicate with backend safely

✅ **HTTP Status Codes**
- 201 for successful registration
- 200 for successful login
- 400 for validation errors
- 401 for authentication failures
- 500 for server errors

## Testing Password Hashing

### Manual Test in Python

```python
from modules.auth import AuthService

# Test hashing
password = "SecurePass123"
hashed = AuthService.hash_password(password)
print(f"Original: {password}")
print(f"Hashed:   {hashed}")

# Test verification
correct = AuthService.verify_password("SecurePass123", hashed)
incorrect = AuthService.verify_password("WrongPass123", hashed)
print(f"Correct password: {correct}")      # True
print(f"Incorrect password: {incorrect}")  # False
```

### Test via API

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "role": "FARMER"
  }'

# Login with correct password
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

## Future Enhancements

1. **Password Reset**
   - Send reset token via email
   - One-time use tokens with expiration

2. **Two-Factor Authentication**
   - SMS or app-based OTP
   - Recovery codes

3. **Session Management**
   - JWT tokens instead of user_id
   - Token expiration and refresh
   - Logout functionality

4. **Account Security**
   - Failed login attempt tracking
   - Account lockout after N attempts
   - Login activity log
   - Change password option

5. **Password Strength Meter**
   - Real-time feedback on frontend
   - Visual indicator of strength
   - Suggestions for better passwords

## References

- **bcrypt**: https://github.com/pyca/bcrypt
- **OWASP Password Guidelines**: https://owasp.org/
- **Python mysql-connector**: https://dev.mysql.com/doc/connector-python/
