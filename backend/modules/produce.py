from modules.db import Database


class ProduceService:

    @staticmethod
    def get_all_listings(search=None):
        query = """
            SELECT
                pl.produce_id AS id, pl.farmer_id, pl.name, pl.quantity,
                pl.price_per_unit AS price, pl.description, pl.unit, pl.status,
                pl.location, pl.created_at,
                u.full_name AS farmer_name,
                u.city AS farmer_city,
                u.state AS farmer_state
            FROM produce_listings pl
            JOIN users u ON pl.farmer_id = u.user_id
            WHERE pl.status = 'AVAILABLE'
        """
        params = []
        if search:
            query += """ AND (pl.name LIKE %s OR u.full_name LIKE %s OR pl.description LIKE %s)"""
            like = f"%{search}%"
            params = [like, like, like]
        query += " ORDER BY pl.created_at DESC"
        results = Database.execute_query(query, params)
        if results is None:
            return []
        for r in results:
            photos = Database.execute_query(
                "SELECT photo_url FROM produce_photos WHERE produce_id = %s",
                (r['id'],)
            )
            r['photos'] = [p['photo_url'] for p in (photos or [])]
        return results

    @staticmethod
    def get_listing_by_id(listing_id):
        query = """
            SELECT
                pl.produce_id AS id, pl.farmer_id, pl.name, pl.quantity,
                pl.price_per_unit AS price, pl.description, pl.unit, pl.status,
                pl.location, pl.created_at,
                u.full_name AS farmer_name,
                u.city AS farmer_city,
                u.state AS farmer_state
            FROM produce_listings pl
            JOIN users u ON pl.farmer_id = u.user_id
            WHERE pl.produce_id = %s
        """
        results = Database.execute_query(query, (listing_id,))
        if not results:
            return None
        r = results[0]
        photos = Database.execute_query(
            "SELECT photo_url FROM produce_photos WHERE produce_id = %s",
            (r['id'],)
        )
        r['photos'] = [p['photo_url'] for p in (photos or [])]
        return r

    @staticmethod
    def create_purchase_request(buyer_id, produce_id, quantity, proposed_price, notes=None):
        listing = ProduceService.get_listing_by_id(produce_id)
        if not listing:
            return False, "Produce listing not found"
        if listing['status'] != 'AVAILABLE':
            return False, "Produce is not available"
        if quantity > listing['quantity']:
            return False, f"Only {listing['quantity']} {listing['unit']} available"
        result = Database.execute_update(
            """INSERT INTO purchase_requests
               (buyer_id, produce_id, requested_quantity, offered_price, buyer_note, status)
               VALUES (%s, %s, %s, %s, %s, 'PENDING')""",
            (buyer_id, produce_id, quantity, proposed_price, notes)
        )
        if result:
            return True, "Purchase request submitted successfully"
        return False, "Failed to create purchase request"

    @staticmethod
    def get_buyer_requests(buyer_id, status=None, delivery_status=None):
        query = """
            SELECT
                pr.request_id AS id, pr.buyer_id, pr.produce_id,
                pr.requested_quantity AS quantity, pr.offered_price AS proposed_price,
                pr.status, pr.buyer_note AS notes, pr.requested_at AS created_at,
                pr.updated_at,
                pl.name AS produce_name, pl.price_per_unit AS listing_price,
                pl.unit, pl.quantity AS available_quantity,
                u.full_name AS farmer_name,
                u.user_id AS farmer_id,
                (pr.requested_quantity * pr.offered_price) AS total_amount,
                d.status AS delivery_status, d.delivery_id, d.transporter_id,
                ut.full_name AS transporter_name,
                (SELECT rating FROM ratings WHERE request_id = pr.request_id AND rating_type = 'PRODUCT') AS product_rating,
                (SELECT rating FROM ratings WHERE request_id = pr.request_id AND rating_type = 'DELIVERY') AS delivery_rating
            FROM purchase_requests pr
            JOIN produce_listings pl ON pr.produce_id = pl.produce_id
            JOIN users u ON pl.farmer_id = u.user_id
            LEFT JOIN deliveries d ON pr.request_id = d.request_id
            LEFT JOIN users ut ON d.transporter_id = ut.user_id
            WHERE pr.buyer_id = %s
        """
        params = [buyer_id]
        if status:
            if isinstance(status, list):
                placeholders = ','.join(['%s'] * len(status))
                query += f" AND pr.status IN ({placeholders})"
                params.extend(status)
            else:
                query += " AND pr.status = %s"
                params.append(status)
        if delivery_status:
            if delivery_status == 'HISTORY':
                query += " AND (d.status = 'DELIVERED' OR pr.status IN ('REJECTED', 'CANCELLED'))"
            elif delivery_status == 'ACTIVE':
                query += " AND (d.status IS NULL OR d.status != 'DELIVERED') AND pr.status NOT IN ('REJECTED', 'CANCELLED')"
        query += " ORDER BY pr.requested_at DESC"
        results = Database.execute_query(query, params)
        return results or []
