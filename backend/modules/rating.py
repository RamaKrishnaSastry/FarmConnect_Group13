from modules.db import Database


class RatingService:

    @staticmethod
    def submit_rating(request_id, buyer_id, rated_user_id, rating_type, rating, review=None):
        if rating_type not in ('PRODUCT', 'DELIVERY'):
            return False, "Invalid rating type"
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return False, "Rating must be an integer between 1 and 5"

        exists = Database.execute_query(
            "SELECT rating_id FROM ratings WHERE request_id = %s AND rating_type = %s",
            (request_id, rating_type)
        )
        if exists:
            return False, f"You have already submitted a {rating_type.lower()} rating for this request"

        result = Database.execute_update(
            """INSERT INTO ratings (request_id, buyer_id, rated_user_id, rating_type, rating, review)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (request_id, buyer_id, rated_user_id, rating_type, rating, review)
        )
        if result:
            return True, "Rating submitted successfully"
        return False, "Failed to submit rating"

    @staticmethod
    def get_ratings_for_request(request_id):
        query = """
            SELECT rating_id, request_id, buyer_id, rated_user_id, rating_type, rating, review, created_at
            FROM ratings
            WHERE request_id = %s
        """
        return Database.execute_query(query, (request_id,)) or []
