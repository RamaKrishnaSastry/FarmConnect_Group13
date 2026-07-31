"""FarmConnect seed script.

Creates demo data for all three roles so every dashboard has something
to show. Uses the same PyMySQL driver and config as app.py.

Usage:
    cd backend
    python seed.py

Run schema.sql first (or call GET /api/seed after starting the server).
Rerunning is safe: existing demo rows are replaced by email match.
"""

import pymysql
from werkzeug.security import generate_password_hash
from config import DB_CONFIG

PASSWORD = 'password'
HASH = generate_password_hash(PASSWORD)

DEMO_USERS = [
    ('John Farmer', 'farmer@farmconnect.com', 'FARMER', '555-1234', '123 Farm Lane', 'Springfield', 'IL', 39.7817, -89.6501),
    ('Fresh Market Co.', 'buyer@farmconnect.com', 'BUYER', '555-5678', '456 Market St', 'Chicago', 'IL', 41.8781, -87.6298),
    ('Road Runner LLC', 'transporter@farmconnect.com', 'TRANSPORTER', '555-9999', '78 Logistics Blvd', 'Peoria', 'IL', 40.6936, -89.5890),
]

PRODUCE = [
    (1, 'Organic Tomatoes', 'Fresh, ripe tomatoes from our farm', 100, 'kg', 5.50),
    (1, 'Fresh Carrots', 'Crispy, sweet carrots harvested this week', 50, 'kg', 3.20),
    (1, 'Sweet Corn', 'Golden, sweet corn ears', 75, 'pieces', 1.80),
]


def get_connection():
    return pymysql.connect(
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        database=DB_CONFIG['database'],
        cursorclass=pymysql.cursors.DictCursor,
    )


def seed():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) AS cnt FROM users")
            if cur.fetchone()['cnt'] == 0:
                print('No users found. Run backend/schema.sql first to create the tables.')
                return

            user_ids = {}
            for name, email, role, phone, address, city, state, lat, lon in DEMO_USERS:
                cur.execute("SELECT user_id FROM users WHERE email = %s", (email,))
                row = cur.fetchone()
                if row:
                    user_ids[role] = row['user_id']
                    cur.execute(
                        '''UPDATE users SET full_name=%s, password_hash=%s, role=%s, phone=%s,
                           address=%s, city=%s, state=%s, latitude=%s, longitude=%s WHERE user_id=%s''',
                        (name, HASH, role, phone, address, city, state, lat, lon, row['user_id']),
                    )
                else:
                    cur.execute(
                        '''INSERT INTO users (full_name, email, password_hash, role, phone, address, city, state, latitude, longitude)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
                        (name, email, HASH, role, phone, address, city, state, lat, lon),
                    )
                    user_ids[role] = cur.lastrowid

            farmer_id = user_ids['FARMER']
            buyer_id = user_ids['BUYER']
            transporter_id = user_ids['TRANSPORTER']

            cur.execute('DELETE FROM chat_messages')
            cur.execute('DELETE FROM ratings')
            cur.execute('DELETE FROM deliveries')
            cur.execute('DELETE FROM produce_photos')
            cur.execute('DELETE FROM produce_listings')
            cur.execute('DELETE FROM purchase_requests')

            produce_ids = {}
            for fid, name, desc, qty, unit, price in PRODUCE:
                cur.execute(
                    '''INSERT INTO produce_listings (farmer_id, name, description, quantity, unit, price_per_unit, status, location)
                       VALUES (%s, %s, %s, %s, %s, %s, 'AVAILABLE', %s)''',
                    (fid, name, desc, qty, unit, price, '123 Farm Lane, Springfield, IL'),
                )
                pid = cur.lastrowid
                produce_ids[name] = pid
                cur.execute(
                    "INSERT INTO produce_photos (produce_id, photo_url) VALUES (%s, %s)",
                    (pid, f'https://placehold.co/400x300/2d6a4f/white?text={name.replace(" ", "+")}'),
                )

            cur.execute(
                '''INSERT INTO purchase_requests (produce_id, buyer_id, requested_quantity, offered_price, status, buyer_note)
                   VALUES (%s, %s, %s, %s, 'PENDING', %s)''',
                (produce_ids['Organic Tomatoes'], buyer_id, 50, 250.00, 'Need delivery by end of week'),
            )
            req1_id = cur.lastrowid
            cur.execute(
                '''INSERT INTO purchase_requests (produce_id, buyer_id, requested_quantity, offered_price, status, buyer_note)
                   VALUES (%s, %s, %s, %s, 'APPROVED', %s)''',
                (produce_ids['Fresh Carrots'], buyer_id, 30, 90.00, 'Regular weekly order'),
            )
            req2_id = cur.lastrowid
            cur.execute(
                '''INSERT INTO purchase_requests (produce_id, buyer_id, requested_quantity, offered_price, status, buyer_note)
                   VALUES (%s, %s, %s, %s, 'COMPLETED', %s)''',
                (produce_ids['Sweet Corn'], buyer_id, 20, 30.00, 'For weekend market stall'),
            )
            req3_id = cur.lastrowid

            cur.execute(
                '''INSERT INTO deliveries (request_id, transporter_id, status, pickup_address, delivery_address,
                   pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude,
                   distance_km, estimated_time_minutes)
                   VALUES (%s, NULL, 'SHIPPED', %s, %s, %s, %s, %s, %s, %s, %s)''',
                (req2_id, '123 Farm Lane, Springfield, IL', '456 Market St, Chicago, IL',
                 39.7817, -89.6501, 41.8781, -87.6298, 120, 180),
            )
            cur.execute(
                '''INSERT INTO deliveries (request_id, transporter_id, status, pickup_address, delivery_address,
                   pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude,
                   distance_km, estimated_time_minutes, accepted_at, completed_at)
                   VALUES (%s, %s, 'DELIVERED', %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())''',
                (req3_id, transporter_id, '123 Farm Lane, Springfield, IL', '456 Market St, Chicago, IL',
                 39.7817, -89.6501, 41.8781, -87.6298, 120, 180),
            )

            cur.execute(
                '''INSERT INTO ratings (request_id, buyer_id, rated_user_id, rating_type, rating, review)
                   VALUES (%s, %s, %s, 'PRODUCT', 5, %s)''',
                (req1_id, buyer_id, farmer_id, 'Excellent quality tomatoes! Very fresh and perfect color.'),
            )
            cur.execute(
                '''INSERT INTO ratings (request_id, buyer_id, rated_user_id, rating_type, rating, review)
                   VALUES (%s, %s, %s, 'DELIVERY', 5, %s)''',
                (req3_id, buyer_id, farmer_id, 'Fast and careful delivery. The corn arrived in perfect condition.'),
            )
            cur.execute(
                '''INSERT INTO chat_messages (request_id, sender_id, receiver_id, message)
                   VALUES (%s, %s, %s, %s)''',
                (req1_id, farmer_id, buyer_id, 'Hi! Your tomatoes are ready. Let me know if you need any details.'),
            )
            cur.execute(
                '''INSERT INTO chat_messages (request_id, sender_id, receiver_id, message)
                   VALUES (%s, %s, %s, %s)''',
                (req2_id, buyer_id, farmer_id, 'Hi! Are the carrots in stock this week?'),
            )
            cur.execute(
                '''INSERT INTO chat_messages (request_id, sender_id, receiver_id, message)
                   VALUES (%s, %s, %s, %s)''',
                (req2_id, farmer_id, buyer_id, 'Yes, 50kg ready. I have approved your request.'),
            )
        conn.commit()
    finally:
        conn.close()

    print('Seed complete. Demo logins (password = password):')
    for role, email in [('FARMER', 'farmer@farmconnect.com'), ('BUYER', 'buyer@farmconnect.com'), ('TRANSPORTER', 'transporter@farmconnect.com')]:
        print(f'  {role:12s} {email}')


if __name__ == '__main__':
    seed()
