from modules.db import Database


class DeliveryService:

    @staticmethod
    def get_available_deliveries():
        query = """
            SELECT
                d.delivery_id, d.request_id, d.transporter_id, d.status,
                d.pickup_address, d.delivery_address,
                d.pickup_latitude, d.pickup_longitude,
                d.delivery_latitude, d.delivery_longitude,
                d.distance_km, d.estimated_time_minutes,
                d.created_at,
                pr.produce_id, pr.requested_quantity, pr.offered_price,
                pr.status AS request_status, pr.buyer_note,
                pl.name AS produce_name, pl.unit,
                u_farmer.full_name AS farmer_name,
                u_farmer.city AS farmer_city,
                u_buyer.full_name AS buyer_name,
                u_buyer.city AS buyer_city,
                u_buyer.address AS buyer_address,
                (pr.requested_quantity * pr.offered_price) AS total_amount
            FROM deliveries d
            JOIN purchase_requests pr ON d.request_id = pr.request_id
            JOIN produce_listings pl ON pr.produce_id = pl.produce_id
            JOIN users u_farmer ON pl.farmer_id = u_farmer.user_id
            JOIN users u_buyer ON pr.buyer_id = u_buyer.user_id
            WHERE d.status = 'SHIPPED'
            ORDER BY d.created_at ASC
        """
        results = Database.execute_query(query)
        return results or []

    @staticmethod
    def get_transporter_deliveries(transporter_id):
        query = """
            SELECT
                d.delivery_id, d.request_id, d.transporter_id, d.status,
                d.pickup_address, d.delivery_address,
                d.pickup_latitude, d.pickup_longitude,
                d.delivery_latitude, d.delivery_longitude,
                d.distance_km, d.estimated_time_minutes,
                d.accepted_at, d.completed_at, d.created_at,
                pr.produce_id, pr.requested_quantity, pr.offered_price,
                pr.status AS request_status, pr.buyer_note,
                pl.name AS produce_name, pl.unit,
                u_farmer.full_name AS farmer_name,
                u_farmer.city AS farmer_city,
                u_buyer.full_name AS buyer_name,
                u_buyer.city AS buyer_city,
                u_buyer.address AS buyer_address,
                (pr.requested_quantity * pr.offered_price) AS total_amount
            FROM deliveries d
            JOIN purchase_requests pr ON d.request_id = pr.request_id
            JOIN produce_listings pl ON pr.produce_id = pl.produce_id
            JOIN users u_farmer ON pl.farmer_id = u_farmer.user_id
            JOIN users u_buyer ON pr.buyer_id = u_buyer.user_id
            WHERE d.transporter_id = %s
            ORDER BY d.created_at DESC
        """
        results = Database.execute_query(query, (transporter_id,))
        return results or []

    @staticmethod
    def get_delivery_by_id(delivery_id):
        query = """
            SELECT
                d.delivery_id, d.request_id, d.transporter_id, d.status,
                d.pickup_address, d.delivery_address,
                d.pickup_latitude, d.pickup_longitude,
                d.delivery_latitude, d.delivery_longitude,
                d.distance_km, d.estimated_time_minutes,
                d.accepted_at, d.completed_at, d.created_at,
                pr.produce_id, pr.requested_quantity, pr.offered_price,
                pr.status AS request_status, pr.buyer_note,
                pl.name AS produce_name, pl.unit,
                u_farmer.full_name AS farmer_name,
                u_farmer.city AS farmer_city,
                u_farmer.latitude AS farmer_lat,
                u_farmer.longitude AS farmer_lon,
                u_buyer.full_name AS buyer_name,
                u_buyer.city AS buyer_city,
                u_buyer.address AS buyer_address,
                u_buyer.latitude AS buyer_lat,
                u_buyer.longitude AS buyer_lon,
                (pr.requested_quantity * pr.offered_price) AS total_amount
            FROM deliveries d
            JOIN purchase_requests pr ON d.request_id = pr.request_id
            JOIN produce_listings pl ON pr.produce_id = pl.produce_id
            JOIN users u_farmer ON pl.farmer_id = u_farmer.user_id
            JOIN users u_buyer ON pr.buyer_id = u_buyer.user_id
            WHERE d.delivery_id = %s
        """
        results = Database.execute_query(query, (delivery_id,))
        return results[0] if results else None

    @staticmethod
    def accept_delivery(delivery_id, transporter_id):
        delivery = DeliveryService.get_delivery_by_id(delivery_id)
        if not delivery:
            return False, "Delivery not found"
        if delivery['status'] != 'SHIPPED':
            return False, f"Delivery is already {delivery['status']}"
        if delivery['transporter_id']:
            return False, "Delivery already assigned to a transporter"
        import datetime
        now = datetime.datetime.now()
        result = Database.execute_update(
            """UPDATE deliveries
               SET transporter_id = %s, status = 'OUT_FOR_DELIVERY', accepted_at = %s
               WHERE delivery_id = %s AND status = 'SHIPPED'""",
            (transporter_id, now, delivery_id)
        )
        if result is not None:
            return True, "Delivery accepted successfully"
        return False, "Failed to accept delivery"

    @staticmethod
    def mark_delivered(delivery_id, transporter_id):
        delivery = DeliveryService.get_delivery_by_id(delivery_id)
        if not delivery:
            return False, "Delivery not found"
        if delivery['transporter_id'] != transporter_id:
            return False, "This delivery is not assigned to you"
        if delivery['status'] != 'OUT_FOR_DELIVERY':
            return False, f"Cannot mark as delivered when status is {delivery['status']}"
        import datetime
        now = datetime.datetime.now()
        conn = Database.get_connection()
        if not conn:
            return False, "Database connection failed"
        try:
            cursor = conn.cursor()
            cursor.execute(
                """UPDATE deliveries
                   SET status = 'DELIVERED', completed_at = %s
                   WHERE delivery_id = %s AND transporter_id = %s AND status = 'OUT_FOR_DELIVERY'""",
                (now, delivery_id, transporter_id)
            )
            cursor.execute(
                "UPDATE purchase_requests SET status = 'APPROVED' WHERE request_id = %s",
                (delivery['request_id'],)
            )
            conn.commit()
            cursor.close()
            return True, "Delivery marked as delivered successfully"
        except Exception as e:
            conn.rollback()
            return False, f"Error: {str(e)}"
        finally:
            conn.close()
