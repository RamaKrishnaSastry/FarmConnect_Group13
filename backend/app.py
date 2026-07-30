import pymysql
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from config import DB_CONFIG

app = Flask(__name__)
app.url_map.strict_slashes = False
CORS(app, supports_credentials=True)

FARMER_ID = 1


@app.route('/')
def index():
    return jsonify({
        'status': 'ok',
        'message': 'FarmConnect API is running',
        'endpoints': [
            'POST /api/auth/login',
            'GET /api/auth/me',
            'GET /api/produce/<farmer_id>',
            'POST /api/produce',
            'PUT /api/produce/<id>',
            'DELETE /api/produce/<id>',
            'GET /api/requests/<farmer_id>',
            'PUT /api/requests/<id>/approve',
            'PUT /api/requests/<id>/reject',
            'GET /api/deliveries/<farmer_id>',
            'GET /api/ratings/<farmer_id>',
            'GET /api/chat/<request_id>',
            'POST /api/chat',
            'GET /api/seed',
        ],
    })


def get_db():
    return pymysql.connect(
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        database=DB_CONFIG['database'],
        cursorclass=pymysql.cursors.DictCursor,
    )


# ===== SEED =====
@app.route('/api/seed')
def seed():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) AS cnt FROM users WHERE email = 'farmer@farmconnect.com'")
            if cur.fetchone()['cnt'] > 0:
                return jsonify({'message': 'Demo data already exists'})

            cur.execute(
                '''INSERT INTO users (full_name, email, password_hash, role, phone, address, city, state, latitude, longitude)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
                ('John Farmer', 'farmer@farmconnect.com', generate_password_hash('password'),
                 'FARMER', '555-1234', '123 Farm Lane', 'Springfield', 'IL', 39.7817, -89.6501),
            )
            farmer_id = cur.lastrowid

            cur.execute(
                '''INSERT INTO users (full_name, email, password_hash, role, phone, address, city, state, latitude, longitude)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
                ('Fresh Market Co.', 'buyer@farmconnect.com', generate_password_hash('password'),
                 'BUYER', '555-5678', '456 Market St', 'Chicago', 'IL', 41.8781, -87.6298),
            )
            buyer_id = cur.lastrowid

            cur.execute(
                '''INSERT INTO produce_listings (farmer_id, name, description, quantity, unit, price_per_unit)
                   VALUES (%s, %s, %s, %s, %s, %s)''',
                (farmer_id, 'Organic Tomatoes', 'Fresh, ripe tomatoes from our farm', 100, 'kg', 5.50),
            )
            tomato_id = cur.lastrowid
            cur.execute(
                '''INSERT INTO produce_listings (farmer_id, name, description, quantity, unit, price_per_unit)
                   VALUES (%s, %s, %s, %s, %s, %s)''',
                (farmer_id, 'Fresh Carrots', 'Crispy, sweet carrots harvested this week', 50, 'kg', 3.20),
            )
            carrot_id = cur.lastrowid
            cur.execute(
                '''INSERT INTO produce_listings (farmer_id, name, description, quantity, unit, price_per_unit)
                   VALUES (%s, %s, %s, %s, %s, %s)''',
                (farmer_id, 'Sweet Corn', 'Golden, sweet corn ears', 75, 'pieces', 1.80),
            )
            corn_id = cur.lastrowid

            cur.execute(
                '''INSERT INTO purchase_requests (produce_id, buyer_id, requested_quantity, offered_price, status, buyer_note)
                   VALUES (%s, %s, %s, %s, %s, %s)''',
                (tomato_id, buyer_id, 50, 250, 'PENDING', 'Need delivery by end of week'),
            )
            req1_id = cur.lastrowid
            cur.execute(
                '''INSERT INTO purchase_requests (produce_id, buyer_id, requested_quantity, offered_price, status, buyer_note)
                   VALUES (%s, %s, %s, %s, %s, %s)''',
                (carrot_id, buyer_id, 30, 90, 'APPROVED', 'Regular weekly order'),
            )
            req2_id = cur.lastrowid

            cur.execute(
                '''INSERT INTO deliveries (request_id, status, pickup_address, delivery_address, distance_km, estimated_time_minutes, accepted_at)
                   VALUES (%s, %s, %s, %s, %s, %s, NOW())''',
                (req2_id, 'SHIPPED', '123 Farm Lane, Springfield, IL', '456 Market St, Chicago, IL', 120, 180),
            )
            cur.execute(
                '''INSERT INTO ratings (request_id, buyer_id, rated_user_id, rating_type, rating, review)
                   VALUES (%s, %s, %s, %s, %s, %s)''',
                (req1_id, buyer_id, farmer_id, 'PRODUCT', 5, 'Excellent quality tomatoes! Very fresh and perfect color.'),
            )
        conn.commit()
    finally:
        conn.close()
    return jsonify({'message': 'Demo data created successfully'})


# ===== AUTH =====
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM users WHERE email = %s', (email,))
            user = cur.fetchone()
    finally:
        conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'message': 'Invalid credentials'}), 401

    return jsonify({'user': map_user(user)})


@app.route('/api/auth/me', methods=['GET'])
def get_me():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM users WHERE user_id = %s', (FARMER_ID,))
            user = cur.fetchone()
    finally:
        conn.close()
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(map_user(user))


# ===== PRODUCE =====
@app.route('/api/produce/<int:farmer_id>', methods=['GET'])
def get_produce(farmer_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT p.*, u.full_name as farmer_name
                   FROM produce_listings p JOIN users u ON u.user_id = p.farmer_id
                   WHERE p.farmer_id = %s ORDER BY p.created_at DESC''',
                (farmer_id,),
            )
            result = []
            for row in cur.fetchall():
                item = map_produce(row)
                cur.execute('SELECT * FROM produce_photos WHERE produce_id = %s', (row['produce_id'],))
                item['photos'] = [{'id': ph['photo_id'], 'url': ph['photo_url']} for ph in cur.fetchall()]
                result.append(item)
    finally:
        conn.close()
    return jsonify(result)


@app.route('/api/produce', methods=['POST'])
def add_produce():
    data = request.get_json()
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO produce_listings (farmer_id, name, description, quantity, unit, price_per_unit)
                   VALUES (%s, %s, %s, %s, %s, %s)''',
                (data.get('farmer_id', FARMER_ID), data['name'], data.get('description', ''),
                 data['quantity'], data['unit'], data['price_per_unit']),
            )
            conn.commit()
            cur.execute('SELECT * FROM produce_listings WHERE produce_id = %s', (cur.lastrowid,))
            row = cur.fetchone()
    finally:
        conn.close()
    return jsonify(map_produce(row)), 201


@app.route('/api/produce/<int:produce_id>', methods=['PUT'])
def update_produce(produce_id):
    data = request.get_json()
    fields = []
    values = []
    for col in ('name', 'description', 'quantity', 'unit', 'price_per_unit', 'status'):
        if col in data:
            fields.append(f'{col} = %s')
            values.append(data[col])
    if not fields:
        return jsonify({'message': 'No fields to update'}), 400
    values.append(produce_id)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE produce_listings SET {', '.join(fields)} WHERE produce_id = %s", values,
            )
            conn.commit()
            cur.execute('SELECT * FROM produce_listings WHERE produce_id = %s', (produce_id,))
            row = cur.fetchone()
    finally:
        conn.close()
    if not row:
        return jsonify({'message': 'Produce not found'}), 404
    return jsonify(map_produce(row))


@app.route('/api/produce/<int:produce_id>', methods=['DELETE'])
def delete_produce(produce_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM produce_listings WHERE produce_id = %s', (produce_id,))
            conn.commit()
    finally:
        conn.close()
    return jsonify({'success': True})


# ===== PURCHASE REQUESTS =====
@app.route('/api/requests/<int:farmer_id>', methods=['GET'])
def get_requests(farmer_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT pr.*, u.full_name AS buyer_name
                   FROM purchase_requests pr
                   JOIN produce_listings pl ON pl.produce_id = pr.produce_id
                   JOIN users u ON u.user_id = pr.buyer_id
                   WHERE pl.farmer_id = %s ORDER BY pr.requested_at DESC''',
                (farmer_id,),
            )
            rows = cur.fetchall()
    finally:
        conn.close()
    return jsonify([map_request(r) for r in rows])


@app.route('/api/requests/<int:request_id>/approve', methods=['PUT'])
def approve_request(request_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE purchase_requests SET status = 'APPROVED' WHERE request_id = %s", (request_id,))
            conn.commit()
            cur.execute('SELECT * FROM purchase_requests WHERE request_id = %s', (request_id,))
            row = cur.fetchone()
    finally:
        conn.close()
    return jsonify(map_request(row) if row else {'message': 'Not found'}), (200 if row else 404)


@app.route('/api/requests/<int:request_id>/reject', methods=['PUT'])
def reject_request(request_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE purchase_requests SET status = 'REJECTED' WHERE request_id = %s", (request_id,))
            conn.commit()
            cur.execute('SELECT * FROM purchase_requests WHERE request_id = %s', (request_id,))
            row = cur.fetchone()
    finally:
        conn.close()
    return jsonify(map_request(row) if row else {'message': 'Not found'}), (200 if row else 404)


# ===== DELIVERIES =====
@app.route('/api/deliveries/<int:farmer_id>', methods=['GET'])
def get_deliveries(farmer_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT d.*, u.full_name AS transporter_name
                   FROM deliveries d
                   JOIN purchase_requests pr ON pr.request_id = d.request_id
                   JOIN produce_listings pl ON pl.produce_id = pr.produce_id
                   LEFT JOIN users u ON u.user_id = d.transporter_id
                   WHERE pl.farmer_id = %s ORDER BY d.created_at DESC''',
                (farmer_id,),
            )
            rows = cur.fetchall()
    finally:
        conn.close()
    return jsonify([map_delivery(r) for r in rows])


# ===== RATINGS =====
@app.route('/api/ratings/<int:farmer_id>', methods=['GET'])
def get_ratings(farmer_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT r.*, u.full_name AS buyer_name
                   FROM ratings r JOIN users u ON u.user_id = r.buyer_id
                   WHERE r.rated_user_id = %s ORDER BY r.created_at DESC''',
                (farmer_id,),
            )
            rows = cur.fetchall()
    finally:
        conn.close()
    return jsonify([map_rating(r) for r in rows])


# ===== CHAT =====
@app.route('/api/chat/<int:request_id>', methods=['GET'])
def get_chat(request_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT cm.*, s.full_name AS sender_name, r.full_name AS receiver_name
                   FROM chat_messages cm
                   JOIN users s ON s.user_id = cm.sender_id
                   JOIN users r ON r.user_id = cm.receiver_id
                   WHERE cm.request_id = %s ORDER BY cm.sent_at ASC''',
                (request_id,),
            )
            rows = cur.fetchall()
    finally:
        conn.close()
    return jsonify([map_chat_message(m) for m in rows])


@app.route('/api/chat', methods=['POST'])
def send_chat():
    data = request.get_json()
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO chat_messages (request_id, sender_id, receiver_id, message)
                   VALUES (%s, %s, %s, %s)''',
                (data['request_id'], data.get('sender_id', FARMER_ID), data['receiver_id'], data['message']),
            )
            conn.commit()
            cur.execute(
                '''SELECT cm.*, s.full_name AS sender_name, r.full_name AS receiver_name
                   FROM chat_messages cm
                   JOIN users s ON s.user_id = cm.sender_id
                   JOIN users r ON r.user_id = cm.receiver_id
                   WHERE cm.message_id = %s''',
                (cur.lastrowid,),
            )
            row = cur.fetchone()
    finally:
        conn.close()
    return jsonify(map_chat_message(row)), 201


# ===== MAPPER HELPERS =====
def map_user(u):
    return {
        'id': u['user_id'], 'email': u['email'], 'full_name': u['full_name'],
        'role': u['role'], 'phone': u.get('phone'), 'address': u.get('address'),
        'city': u.get('city'), 'state': u.get('state'),
        'latitude': u.get('latitude'), 'longitude': u.get('longitude'),
    }


def map_produce(p):
    return {
        'id': p['produce_id'], 'farmer_id': p['farmer_id'],
        'name': p['name'], 'description': p.get('description'),
        'quantity': float(p['quantity']), 'unit': p['unit'],
        'price_per_unit': float(p['price_per_unit']),
        'status': p['status'].lower() if p.get('status') else 'available',
        'created_at': str(p.get('created_at', '')), 'updated_at': str(p.get('updated_at', '')),
    }


def map_request(r):
    return {
        'id': r['request_id'], 'produce_id': r['produce_id'],
        'buyer_id': r['buyer_id'], 'buyer_name': r.get('buyer_name', ''),
        'requested_quantity': float(r['requested_quantity']),
        'offered_price': float(r['offered_price']) if r.get('offered_price') else None,
        'status': r['status'].lower(), 'buyer_note': r.get('buyer_note'),
        'requested_at': str(r.get('requested_at', '')), 'updated_at': str(r.get('updated_at', '')),
    }


def map_delivery(d):
    return {
        'id': d['delivery_id'], 'request_id': d['request_id'],
        'transporter_id': d.get('transporter_id'),
        'transporter_name': d.get('transporter_name', ''),
        'status': d['status'].lower(),
        'pickup_address': d.get('pickup_address'),
        'delivery_address': d.get('delivery_address'),
        'distance_km': float(d['distance_km']) if d.get('distance_km') else None,
        'estimated_time_minutes': d.get('estimated_time_minutes'),
        'accepted_at': str(d['accepted_at']) if d.get('accepted_at') else None,
        'completed_at': str(d['completed_at']) if d.get('completed_at') else None,
    }


def map_rating(r):
    return {
        'id': r['rating_id'], 'request_id': r['request_id'],
        'buyer_id': r['buyer_id'], 'buyer_name': r.get('buyer_name', ''),
        'rated_user_id': r['rated_user_id'],
        'rating_type': r['rating_type'].lower(), 'rating': r['rating'],
        'review': r.get('review'), 'created_at': str(r.get('created_at', '')),
    }


def map_chat_message(m):
    return {
        'id': m['message_id'], 'request_id': m['request_id'],
        'sender_id': m['sender_id'], 'sender_name': m.get('sender_name', ''),
        'receiver_id': m['receiver_id'], 'receiver_name': m.get('receiver_name', ''),
        'message': m['message'], 'sent_at': str(m.get('sent_at', '')),
        'is_read': bool(m['is_read']),
    }


if __name__ == '__main__':
    app.run(debug=True, port=5000)
