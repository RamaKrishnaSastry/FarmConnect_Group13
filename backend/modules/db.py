import pymysql
from pymysql import Error
from config import DB_CONFIG


class Database:
    """Database connection manager (PyMySQL)."""

    @staticmethod
    def get_connection():
        try:
            return pymysql.connect(
                host=DB_CONFIG['host'],
                port=DB_CONFIG['port'],
                user=DB_CONFIG['user'],
                password=DB_CONFIG['password'],
                database=DB_CONFIG['database'],
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=False,
            )
        except Error as e:
            print(f"Database connection error: {e}")
            return None

    @staticmethod
    def execute_query(query, params=None):
        """Execute a SELECT query and return results."""
        conn = Database.get_connection()
        if not conn:
            return None

        try:
            with conn.cursor() as cursor:
                cursor.execute(query, params or ())
                return cursor.fetchall()
        except Error as e:
            print(f"Query execution error: {e}")
            return None
        finally:
            conn.close()

    @staticmethod
    def execute_update(query, params=None):
        """Execute INSERT/UPDATE/DELETE and return lastrowid."""
        conn = Database.get_connection()
        if not conn:
            return None

        try:
            with conn.cursor() as cursor:
                cursor.execute(query, params or ())
                conn.commit()
                return cursor.lastrowid
        except Error as e:
            print(f"Update execution error: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()
