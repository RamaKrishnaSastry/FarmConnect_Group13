import os

class Config:
    """Database configuration"""
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "n3u3da!")
    DB_NAME = os.getenv("DB_NAME", "FarmConnect")
    DB_PORT = int(os.getenv("DB_PORT", 3306))

    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")

    FLASK_ENV = os.getenv("FLASK_ENV", "development")
