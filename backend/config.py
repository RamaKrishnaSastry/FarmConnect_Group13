import os


class Config:
    """Application configuration, overridable via environment variables."""

    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = int(os.environ.get('DB_PORT', 3306))
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'n3u3da!')
    DB_NAME = os.environ.get('DB_NAME', 'farmconnect')

    SECRET_KEY = os.environ.get('SECRET_KEY', 'change-me-in-production')
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')


# Dict form used by app.py / modules (PyMySQL style)
DB_CONFIG = {
    'host': Config.DB_HOST,
    'port': Config.DB_PORT,
    'user': Config.DB_USER,
    'password': Config.DB_PASSWORD,
    'database': Config.DB_NAME,
}
