import math
from modules.db import Database

class LocationService:
    """Location and distance calculation service"""

    @staticmethod
    def euclidean_distance(lat1, lon1, lat2, lon2):
        """
        Calculate Euclidean distance between two points in the city grid

        Args:
            lat1, lon1: First point coordinates
            lat2, lon2: Second point coordinates

        Returns:
            float: Distance between the two points
        """
        if any(x is None for x in [lat1, lon1, lat2, lon2]):
            return None

        return math.sqrt((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2)

    @staticmethod
    def find_nearby_users(user_id, radius, role=None):
        """
        Find users within a certain radius of a given user

        Args:
            user_id: ID of the reference user
            radius: Distance radius to search within
            role: Optional role filter (FARMER/BUYER/TRANSPORTER)

        Returns:
            list: Users within radius, sorted by distance
        """
        # Get the reference user's coordinates
        query = "SELECT latitude, longitude FROM users WHERE user_id = %s"
        result = Database.execute_query(query, (user_id,))

        if not result or not result[0]['latitude'] or not result[0]['longitude']:
            return []

        ref_lat = result[0]['latitude']
        ref_lon = result[0]['longitude']

        # Get all users (optionally filtered by role)
        if role:
            query = "SELECT user_id, full_name, email, role, latitude, longitude FROM users WHERE role = %s AND user_id != %s"
            params = (role, user_id)
        else:
            query = "SELECT user_id, full_name, email, role, latitude, longitude FROM users WHERE user_id != %s"
            params = (user_id,)

        users = Database.execute_query(query, params)

        if not users:
            return []

        # Calculate distances and filter by radius
        nearby = []
        for user in users:
            if user['latitude'] and user['longitude']:
                distance = LocationService.euclidean_distance(
                    ref_lat, ref_lon,
                    user['latitude'], user['longitude']
                )

                if distance <= radius:
                    nearby.append({
                        **user,
                        'distance': round(distance, 2)
                    })

        # Sort by distance
        nearby.sort(key=lambda x: x['distance'])
        return nearby

    @staticmethod
    def get_user_location(user_id):
        """Get a user's location coordinates"""
        query = "SELECT user_id, full_name, latitude, longitude FROM users WHERE user_id = %s"
        result = Database.execute_query(query, (user_id,))

        if result and result[0]['latitude'] and result[0]['longitude']:
            return {
                'user_id': result[0]['user_id'],
                'full_name': result[0]['full_name'],
                'latitude': result[0]['latitude'],
                'longitude': result[0]['longitude']
            }
        return None

    @staticmethod
    def get_all_users_with_location():
        """Get all users with their locations for mapping"""
        query = "SELECT user_id, full_name, email, role, latitude, longitude FROM users WHERE latitude IS NOT NULL AND longitude IS NOT NULL"
        return Database.execute_query(query)

    @staticmethod
    def update_user_location(user_id, latitude, longitude):
        """Update a user's location coordinates"""
        # Validate coordinates
        if latitude < 0 or latitude > 200 or longitude < 0 or longitude > 200:
            return False, "Coordinates must be between 0 and 200"

        query = "UPDATE users SET latitude = %s, longitude = %s WHERE user_id = %s"
        result = Database.execute_update(query, (latitude, longitude, user_id))

        if result is not None:
            return True, "Location updated successfully"
        return False, "Failed to update location"

    @staticmethod
    def get_distance_between_users(user_id_1, user_id_2):
        """Get the distance between two specific users"""
        query1 = "SELECT latitude, longitude FROM users WHERE user_id = %s"
        result1 = Database.execute_query(query1, (user_id_1,))

        query2 = "SELECT latitude, longitude FROM users WHERE user_id = %s"
        result2 = Database.execute_query(query2, (user_id_2,))

        if not result1 or not result2:
            return None

        user1 = result1[0]
        user2 = result2[0]

        if not (user1['latitude'] and user1['longitude'] and user2['latitude'] and user2['longitude']):
            return None

        distance = LocationService.euclidean_distance(
            user1['latitude'], user1['longitude'],
            user2['latitude'], user2['longitude']
        )

        return round(distance, 2)

    @staticmethod
    def get_city_statistics():
        """Get statistics about user distribution in the city"""
        query = """
            SELECT
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'FARMER' THEN 1 END) as farmers,
                COUNT(CASE WHEN role = 'BUYER' THEN 1 END) as buyers,
                COUNT(CASE WHEN role = 'TRANSPORTER' THEN 1 END) as transporters,
                AVG(latitude) as avg_latitude,
                AVG(longitude) as avg_longitude,
                MIN(latitude) as min_latitude,
                MAX(latitude) as max_latitude,
                MIN(longitude) as min_longitude,
                MAX(longitude) as max_longitude
            FROM users WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        """
        result = Database.execute_query(query)

        if result:
            stats = result[0]
            return {
                'total_users': stats['total_users'] or 0,
                'farmers': stats['farmers'] or 0,
                'buyers': stats['buyers'] or 0,
                'transporters': stats['transporters'] or 0,
                'center': {
                    'latitude': float(stats['avg_latitude'] or 100),
                    'longitude': float(stats['avg_longitude'] or 100)
                },
                'bounds': {
                    'latitude': {
                        'min': float(stats['min_latitude'] or 0),
                        'max': float(stats['max_latitude'] or 200)
                    },
                    'longitude': {
                        'min': float(stats['min_longitude'] or 0),
                        'max': float(stats['max_longitude'] or 200)
                    }
                }
            }
        return None
