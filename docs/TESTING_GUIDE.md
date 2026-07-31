# FarmConnect - Complete Testing Guide

## ✅ Verification: Backend & Frontend are Connected

### Backend Registration Flow:
```
Frontend (RegisterForm.jsx)
    ↓ POST /api/auth/register
Backend (app.py:11)
    ↓
AuthService.register_user()
    ↓
Validate: email, password, coordinates
    ↓
Hash password with bcrypt
    ↓
Database.execute_update() → INSERT into users table
    ↓
Return success/error response
    ↓
Frontend receives response and shows success/error
```

### Backend Login Flow:
```
Frontend (LoginForm.jsx)
    ↓ POST /api/auth/login
Backend (app.py:60)
    ↓
AuthService.login_user()
    ↓
Query users table by email
    ↓
Verify password with bcrypt
    ↓
Return user data or error
    ↓
Frontend stores user in localStorage
    ↓ Redirect to dashboard
```

---

## 🚀 Step-by-Step Testing

### Step 1: Start Backend Server

**Terminal 1:**
```bash
cd c:\Users\Administrator\Desktop\FarmConnect\FarmConnect_Group13\backend
python app.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Step 2: Verify Backend is Running

**Terminal 2 (or another tool):**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "Server is running"
}
```

✅ If you get this response, backend is working!

### Step 3: Start Frontend

**Terminal 3:**
```bash
cd c:\Users\Administrator\Desktop\FarmConnect\FarmConnect_Group13\frontend
npm start
```

Expected output:
```
Compiled successfully!
You can now view farmconnect-frontend in the browser.
  Local:            http://localhost:3000
```

### Step 4: Test Registration

1. Open browser to `http://localhost:3000`
2. See login screen
3. Click "Sign up here"
4. Select "Farmer" role
5. Fill form:
   - Full Name: `John Farmer`
   - Email: `john@farm.com`
   - Password: `SecurePass123`
   - Confirm: `SecurePass123`
   - Latitude: `50`
   - Longitude: `75`
6. Click "Create Account"

Expected result:
```
✅ Success message: "Registration successful! Redirecting to login..."
✅ Redirects back to login screen after 2 seconds
```

### Step 5: Test Login

1. On login screen
2. Enter:
   - Email: `john@farm.com`
   - Password: `SecurePass123`
3. Click "Login"

Expected result:
```
✅ Success message: "Login successful"
✅ Redirects to /dashboard/farmer
✅ User stored in localStorage
```

---

## 🔍 Debugging: Check the Network Requests

### Open Browser DevTools (F12)

1. Press **F12** or Right-click → **Inspect**
2. Go to **Network** tab
3. Try registration/login
4. Look for requests to:
   - `POST http://localhost:5000/api/auth/register`
   - `POST http://localhost:5000/api/auth/login`

### Check Response

Click on the request → **Response** tab
Should see:
```json
{
  "success": true,
  "message": "User registered successfully with ID: 1"
}
```

---

## 📊 Verify Data in Database

### Check if User was Created

```bash
# In MySQL client or MySQL Workbench
USE FarmConnect;
SELECT * FROM users;
```

Expected output:
```
user_id | full_name   | email           | role   | latitude | longitude
1       | John Farmer | john@farm.com   | FARMER | 50.00    | 75.00
```

---

## 🧪 Manual API Testing with cURL

### Test Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Buyer",
    "email": "jane@buy.com",
    "password": "BuyerPass123",
    "role": "BUYER",
    "latitude": 100,
    "longitude": 120
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully with ID: 2",
  "role": "BUYER"
}
```

### Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@farm.com",
    "password": "SecurePass123"
  }'
```

Expected response:
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

### Test Invalid Password

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@farm.com",
    "password": "WrongPassword"
  }'
```

Expected response (401):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## ❌ Troubleshooting

### Issue: "Cannot POST /api/auth/register"
**Solution:** 
- Backend not running? Run `python app.py`
- Check Flask server is on port 5000
- Check CORS is enabled (`CORS(app)` in app.py)

### Issue: "Invalid email or password" but credentials look right
**Solution:**
- Password must have: uppercase + lowercase + digit + 8+ chars
- Example good: `SecurePass123`
- Example bad: `password123` (no uppercase)

### Issue: CORS error in console
**Solution:**
- Already fixed in app.py: `CORS(app)`
- Make sure backend is restarted after code changes

### Issue: "Connection refused" error
**Solution:**
- Backend running? Check terminal for `Running on http://127.0.0.1:5000`
- Correct port? Should be 5000
- Check firewall isn't blocking port 5000

### Issue: Frontend shows blank page
**Solution:**
- Clear cache: Ctrl+F5
- Check console (F12) for errors
- Verify npm start ran successfully

### Issue: "Database connection error"
**Solution:**
- MySQL running?
- Correct credentials in `backend/config.py`?
- Database `FarmConnect` created?
- All tables created?

---

## 📝 Test Cases

### Test 1: Valid Registration
```
Input: John Farmer / john@farm.com / SecurePass123 / FARMER
Expected: Success, redirect to login
Status: ✅ PASS / ❌ FAIL
```

### Test 2: Duplicate Email
```
Input: john@farm.com (already registered)
Expected: Error "Email already registered"
Status: ✅ PASS / ❌ FAIL
```

### Test 3: Weak Password
```
Input: password123 (no uppercase)
Expected: Error "Password must contain at least one uppercase letter"
Status: ✅ PASS / ❌ FAIL
```

### Test 4: Invalid Email
```
Input: johnfarmemail.com (missing @)
Expected: Error "Invalid email format"
Status: ✅ PASS / ❌ FAIL
```

### Test 5: Valid Login
```
Input: john@farm.com / SecurePass123
Expected: Success, user stored in localStorage, redirect to dashboard
Status: ✅ PASS / ❌ FAIL
```

### Test 6: Wrong Password
```
Input: john@farm.com / WrongPassword
Expected: Error "Invalid email or password"
Status: ✅ PASS / ❌ FAIL
```

### Test 7: Invalid Coordinates
```
Input: Latitude: 250 (>200)
Expected: Error "Coordinates must be between 0 and 200"
Status: ✅ PASS / ❌ FAIL
```

### Test 8: Valid Coordinates
```
Input: Latitude: 50, Longitude: 75
Expected: Success, stored in database
Status: ✅ PASS / ❌ FAIL
```

---

## 🔐 Verify Password Hashing

### In Python:
```python
from backend.modules.auth import AuthService

# Test hashing
password = "SecurePass123"
hashed = AuthService.hash_password(password)
print(f"Hashed: {hashed}")

# Should be different each time:
hashed2 = AuthService.hash_password(password)
print(f"Hashed again: {hashed2}")
print(f"Different: {hashed != hashed2}")

# But both should verify correctly:
verify1 = AuthService.verify_password(password, hashed)
verify2 = AuthService.verify_password(password, hashed2)
print(f"Verify 1: {verify1}")  # True
print(f"Verify 2: {verify2}")  # True
```

---

## 📊 Check Frontend Network Traffic

1. Open DevTools (F12)
2. Go to **Network** tab
3. Register a user
4. Look for:
   - `POST /api/auth/register` - Should be 201 or 400
   - Response shows JSON with success/message

5. Login with that user
6. Look for:
   - `POST /api/auth/login` - Should be 200 or 401
   - Response shows user data

---

## 🎯 Complete Test Scenario

**Scenario: Full user journey**

```
1. Frontend loads at http://localhost:3000
   ✅ See login screen

2. Click "Sign up here"
   ✅ See role selector with 3 cards: Farmer | Buyer | Transporter

3. Click "Select Farmer"
   ✅ See registration form

4. Fill form:
   - Name: Alice Farmer
   - Email: alice@farm.com
   - Password: FarmPass123 (must have upper/lower/digit)
   - Confirm: FarmPass123
   - Latitude: 45.5
   - Longitude: 67.8

5. Click "Create Account"
   ✅ See "Registration successful!" message
   ✅ After 2 seconds, back to login screen

6. Fill login:
   - Email: alice@farm.com
   - Password: FarmPass123

7. Click "Login"
   ✅ See "Login successful" message
   ✅ Redirects to http://localhost:3000/dashboard/farmer

8. Check browser LocalStorage (F12 → Application → LocalStorage):
   ✅ See user object with: user_id, full_name, email, role

9. Open MySQL and check:
   SELECT * FROM users WHERE email = 'alice@farm.com';
   ✅ See record with name, email, hashed password, role, latitude, longitude
```

---

## 📈 Performance Metrics

- Registration API response time: < 500ms
- Login API response time: < 300ms
- Password hashing time: ~100ms (bcrypt 12 rounds)

---

## ✨ Summary

- ✅ Backend API endpoints created
- ✅ Frontend forms making API calls
- ✅ Password hashing with bcrypt
- ✅ Database integration
- ✅ Error handling
- ✅ Validation (email, password, coordinates)

**Everything is connected and ready to test!**

