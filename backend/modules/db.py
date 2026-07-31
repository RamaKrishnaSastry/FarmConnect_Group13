import mysql.connector
from mysql.connector import Error
from config import Config

class Database:
    """Database connection manager"""

    @staticmethod
    def get_connection():
        try:
            conn = mysql.connector.connect(
                host=Config.DB_HOST,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                database=Config.DB_NAME,
                port=Config.DB_PORT
            )
            return conn
        except Error as e:
            print(f"Database connection error: {e}")
            return None

    @staticmethod
    def execute_query(query, params=None):
        """Execute a database query and return results"""
        conn = Database.get_connection()
        if not conn:
            return None

        try:
            cursor = conn.cursor(dictionary=True)
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            result = cursor.fetchall()
            conn.commit()
            cursor.close()
            return result
        except Error as e:
            print(f"Query execution error: {e}")
            return None
        finally:
            conn.close()

    @staticmethod
    def execute_update(query, params=None):
        """Execute insert/update/delete queries"""
        conn = Database.get_connection()
        if not conn:
            return None

        try:
            cursor = conn.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            conn.commit()
            last_id = cursor.lastrowid
            cursor.close()
            return last_id
        except Error as e:
            print(f"Update execution error: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()
