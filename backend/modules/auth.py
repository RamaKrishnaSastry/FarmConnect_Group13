import re
from modules.db import Database
from werkzeug.security import generate_password_hash, check_password_hash


class AuthService:
    """Authentication service for user registration and login"""

    @staticmethod
    def hash_password(password):
        """Hash password using werkzeug (consistent with app.py)"""
        return generate_password_hash(password)

    @staticmethod
    def verify_password(password, hashed_password):
        """Verify password against hash"""
        return check_password_hash(hashed_password, password)

    @staticmethod
    def validate_email(email):
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

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

    @staticmethod
    def validate_coordinates(latitude, longitude):
        """Validate location coordinates (0-200 Euclidean grid)"""
        if latitude is not None and longitude is not None:
            try:
                lat = float(latitude)
                lon = float(longitude)
                if lat < 0 or lat > 200 or lon < 0 or lon > 200:
                    return False, "Coordinates must be between 0 and 200"
                return True, "Valid coordinates"
            except (ValueError, TypeError):
                return False, "Coordinates must be valid numbers"
        return True, "Valid coordinates"

    @staticmethod
    def register_user(full_name, email, password, role, phone=None, address=None, city=None, state=None, latitude=None, longitude=None):
        """Register a new user"""

        if not full_name or not email or not password or not role:
            return False, "Missing required fields"

        if not AuthService.validate_email(email):
            return False, "Invalid email format"

        is_valid, msg = AuthService.validate_password(password)
        if not is_valid:
            return False, msg

        if role not in ['FARMER', 'BUYER', 'TRANSPORTER']:
            return False, "Invalid role"

        is_valid, msg = AuthService.validate_coordinates(latitude, longitude)
        if not is_valid:
            return False, msg

        result = Database.execute_query("SELECT user_id FROM users WHERE email = %s", (email,))
        if result:
            return False, "Email already registered"

        hashed_password = AuthService.hash_password(password)
        query = """
            INSERT INTO users (full_name, email, password_hash, role, phone, address, city, state, latitude, longitude)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (full_name, email, hashed_password, role, phone, address, city, state, latitude, longitude)
        user_id = Database.execute_update(query, params)

        if user_id:
            return True, f"User registered successfully with ID: {user_id}"
        return False, "Failed to register user"

    @staticmethod
    def login_user(email, password):
        """Authenticate user login"""

        if not email or not password:
            return False, None, "Email and password are required"

        if not AuthService.validate_email(email):
            return False, None, "Invalid email format"

        query = "SELECT user_id, full_name, email, password_hash, role FROM users WHERE email = %s"
        result = Database.execute_query(query, (email,))

        if not result:
            return False, None, "Invalid email or password"

        user = result[0]
        if not AuthService.verify_password(password, user['password_hash']):
            return False, None, "Invalid email or password"

        user_data = {
            'user_id': user['user_id'],
            'full_name': user['full_name'],
            'email': user['email'],
            'role': user['role']
        }
        return True, user_data, "Login successful"
