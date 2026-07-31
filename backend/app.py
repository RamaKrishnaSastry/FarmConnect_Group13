import os
from uuid import uuid4
import pymysql
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from config import DB_CONFIG

app = Flask(__name__)
app.url_map.strict_slashes = False
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads', 'produce')
CORS(app, supports_credentials=True)

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

FARMER_ID = 1


@app.route('/')
def index():
    return jsonify({
        'status': 'ok',
        'message': 'FarmConnect API is running',
        'endpoints': [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/auth/me',
            'GET /api/seed',
            'GET /api/produce/<farmer_id>',
            'POST /api/produce',
            'PUT /api/produce/<produce_id>',
            'DELETE /api/produce/<produce_id>',
            'GET /api/requests/<farmer_id>',
            'PUT /api/requests/<request_id>/approve',
            'PUT /api/requests/<request_id>/reject',
            'GET /api/deliveries/<farmer_id>',
            'GET /api/ratings/<farmer_id>',
            'GET /api/chat/<request_id>',
            'POST /api/chat',
            'GET /api/buyer/dashboard/<buyer_id>',
            'POST /api/buyer/requests',
            'GET /api/buyer/requests/<buyer_id>',
            'PUT /api/buyer/requests/<request_id>',
            'GET /api/transporter/dashboard/<transporter_id>',
            'PUT /api/transporter/deliveries/<delivery_id>/accept',
            'GET /api/transporter/deliveries/<transporter_id>',
            'PUT /api/transporter/deliveries/<delivery_id>/status',
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
                '''INSERT INTO users (full_name, email, password_hash, role, phone, address, city, state, latitude, longitude)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
                ('Road Runner LLC', 'transporter@farmconnect.com', generate_password_hash('password'),
                 'TRANSPORTER', '555-9999', '78 Logistics Blvd', 'Peoria', 'IL', 40.6936, -89.5890),
            )
            transporter_id = cur.lastrowid

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
    return jsonify({
        'message': 'Demo data created successfully',
        'accounts': [
            {'role': 'FARMER', 'email': 'farmer@farmconnect.com', 'password': 'password'},
            {'role': 'BUYER', 'email': 'buyer@farmconnect.com', 'password': 'password'},
            {'role': 'TRANSPORTER', 'email': 'transporter@farmconnect.com', 'password': 'password'},
        ],
    })


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


@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    full_name = data.get('full_name') or data.get('fullName')
    email = data.get('email')
    password = data.get('password')
    role = (data.get('role') or '').upper()
    phone = data.get('phone')
    address = data.get('address')
    city = data.get('city')
    state = data.get('state')
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if not full_name or not email or not password:
        return jsonify({'message': 'Full name, email and password are required'}), 400
    if role not in ('FARMER', 'BUYER', 'TRANSPORTER'):
        return jsonify({'message': 'Role must be FARMER, BUYER or TRANSPORTER'}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT user_id FROM users WHERE email = %s', (email,))
            if cur.fetchone():
                return jsonify({'message': 'Email already registered'}), 409
            cur.execute(
                '''INSERT INTO users (full_name, email, password_hash, role, phone, address, city, state, latitude, longitude)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
                (full_name, email, generate_password_hash(password), role, phone, address, city, state, latitude, longitude),
            )
            conn.commit()
            user_id = cur.lastrowid
    finally:
        conn.close()

    return jsonify({
        'message': 'User registered successfully',
        'user': map_user({
            'user_id': user_id, 'full_name': full_name, 'email': email, 'role': role,
            'phone': phone, 'address': address, 'city': city, 'state': state,
            'latitude': latitude, 'longitude': longitude,
        }),
    }), 201


@app.route('/api/auth/me', methods=['GET'])
def get_me():
    user_id = request.args.get('user_id') or request.headers.get('X-User-Id')
    if not user_id:
        return jsonify({'message': 'User id is required'}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM users WHERE user_id = %s', (user_id,))
            user = cur.fetchone()
    finally:
        conn.close()
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({'user': map_user(user)})


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


@app.route('/api/produce/<int:produce_id>/photos', methods=['POST'])
def upload_produce_photo(produce_id):
    file = request.files.get('photo')
    if not file or not file.filename:
        return jsonify({'message': 'A photo file is required'}), 400

    ext = os.path.splitext(file.filename)[1].lower() or '.jpg'
    filename = f"{produce_id}_{uuid4().hex}{ext}"
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(save_path)

    photo_url = f"/static/uploads/produce/{filename}"
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO produce_photos (produce_id, photo_url) VALUES (%s, %s)',
                (produce_id, photo_url),
            )
            conn.commit()
            photo_id = cur.lastrowid
    finally:
        conn.close()

    return jsonify({'id': photo_id, 'url': photo_url}), 201


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


# ===== BUYER DASHBOARD =====
@app.route('/api/buyer/dashboard/<int:buyer_id>', methods=['GET'])
def get_buyer_dashboard(buyer_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT pl.*, u.full_name AS farmer_name
                   FROM produce_listings pl
                   JOIN users u ON u.user_id = pl.farmer_id
                   WHERE pl.status IS NULL OR pl.status <> 'SOLD'
                   ORDER BY pl.created_at DESC''',
            )
            produce_rows = cur.fetchall()

            cur.execute(
                '''SELECT pr.*, pl.name AS produce_name, u.full_name AS farmer_name
                   FROM purchase_requests pr
                   JOIN produce_listings pl ON pl.produce_id = pr.produce_id
                   JOIN users u ON u.user_id = pl.farmer_id
                   WHERE pr.buyer_id = %s
                   ORDER BY pr.requested_at DESC''',
                (buyer_id,),
            )
            request_rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify({
        'availableProduce': [map_produce(row) for row in produce_rows],
        'myRequests': [map_request(row) for row in request_rows],
    })


@app.route('/api/buyer/requests', methods=['POST'])
def create_buyer_request():
    data = request.get_json()
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO purchase_requests (produce_id, buyer_id, requested_quantity, offered_price, status, buyer_note)
                   VALUES (%s, %s, %s, %s, 'PENDING', %s)''',
                (data.get('produce_id'), data.get('buyer_id'), data.get('requested_quantity'), data.get('offered_price'), data.get('buyer_note', '')),
            )
            conn.commit()
            cur.execute('SELECT * FROM purchase_requests WHERE request_id = %s', (cur.lastrowid,))
            row = cur.fetchone()
    finally:
        conn.close()
    return jsonify(map_request(row) if row else {'message': 'Not found'}), 201


@app.route('/api/buyer/requests/<int:buyer_id>', methods=['GET'])
def get_buyer_requests(buyer_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT pr.*, pl.name AS produce_name, pl.farmer_id AS farmer_id, u.full_name AS farmer_name
                   FROM purchase_requests pr
                   JOIN produce_listings pl ON pl.produce_id = pr.produce_id
                   JOIN users u ON u.user_id = pl.farmer_id
                   WHERE pr.buyer_id = %s
                   ORDER BY pr.requested_at DESC''',
                (buyer_id,),
            )
            rows = cur.fetchall()
    finally:
        conn.close()
    return jsonify([map_request(r) for r in rows])


@app.route('/api/buyer/requests/<int:request_id>', methods=['PUT'])
def update_buyer_request(request_id):
    data = request.get_json() or {}
    status = (data.get('status') or '').upper()
    allowed_statuses = {'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'}
    if status not in allowed_statuses:
        return jsonify({'message': 'Invalid status'}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE purchase_requests SET status = %s WHERE request_id = %s", (status, request_id))
            conn.commit()
            cur.execute(
                '''SELECT pr.*, pl.name AS produce_name, u.full_name AS farmer_name
                   FROM purchase_requests pr
                   JOIN produce_listings pl ON pl.produce_id = pr.produce_id
                   JOIN users u ON u.user_id = pl.farmer_id
                   WHERE pr.request_id = %s''',
                (request_id,),
            )
            row = cur.fetchone()
    finally:
        conn.close()
    return jsonify(map_request(row) if row else {'message': 'Not found'}), (200 if row else 404)


# ===== TRANSPORTER DASHBOARD =====
@app.route('/api/transporter/dashboard/<int:transporter_id>', methods=['GET'])
def get_transporter_dashboard(transporter_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT d.*, pr.buyer_id, b.full_name AS buyer_name, pl.name AS produce_name, f.full_name AS farmer_name
                   FROM deliveries d
                   JOIN purchase_requests pr ON pr.request_id = d.request_id
                   JOIN produce_listings pl ON pl.produce_id = pr.produce_id
                   JOIN users b ON b.user_id = pr.buyer_id
                   JOIN users f ON f.user_id = pl.farmer_id
                   WHERE d.transporter_id IS NULL
                   ORDER BY d.created_at DESC''',
            )
            available_rows = cur.fetchall()

            cur.execute(
                '''SELECT d.*, pr.buyer_id, b.full_name AS buyer_name, pl.name AS produce_name, f.full_name AS farmer_name
                   FROM deliveries d
                   JOIN purchase_requests pr ON pr.request_id = d.request_id
                   JOIN produce_listings pl ON pl.produce_id = pr.produce_id
                   JOIN users b ON b.user_id = pr.buyer_id
                   JOIN users f ON f.user_id = pl.farmer_id
                   WHERE d.transporter_id = %s
                   ORDER BY d.created_at DESC''',
                (transporter_id,),
            )
            my_rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify({
        'availableDeliveries': [map_delivery(row) for row in available_rows],
        'myDeliveries': [map_delivery(row) for row in my_rows],
    })


@app.route('/api/transporter/deliveries/<int:delivery_id>/accept', methods=['PUT'])
def accept_delivery(delivery_id):
    data = request.get_json() or {}
    transporter_id = data.get('transporter_id')
    if not transporter_id:
        return jsonify({'message': 'transporter_id is required'}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE deliveries SET transporter_id = %s, status = 'IN_TRANSIT' WHERE delivery_id = %s",
                (transporter_id, delivery_id),
            )
            conn.commit()
            cur.execute('SELECT * FROM deliveries WHERE delivery_id = %s', (delivery_id,))
            row = cur.fetchone()
    finally:
        conn.close()
    return jsonify(map_delivery(row) if row else {'message': 'Not found'}), (200 if row else 404)


@app.route('/api/transporter/deliveries/<int:transporter_id>', methods=['GET'])
def get_transporter_deliveries(transporter_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT d.*, pr.buyer_id, b.full_name AS buyer_name, pl.name AS produce_name, f.full_name AS farmer_name
                   FROM deliveries d
                   JOIN purchase_requests pr ON pr.request_id = d.request_id
                   JOIN produce_listings pl ON pl.produce_id = pr.produce_id
                   JOIN users b ON b.user_id = pr.buyer_id
                   JOIN users f ON f.user_id = pl.farmer_id
                   WHERE d.transporter_id = %s
                   ORDER BY d.created_at DESC''',
                (transporter_id,),
            )
            rows = cur.fetchall()
    finally:
        conn.close()
    return jsonify([map_delivery(r) for r in rows])


@app.route('/api/transporter/deliveries/<int:delivery_id>/status', methods=['PUT'])
def update_transporter_delivery_status(delivery_id):
    data = request.get_json() or {}
    status = (data.get('status') or '').upper()
    allowed_statuses = {'PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'}
    if status not in allowed_statuses:
        return jsonify({'message': 'Invalid status'}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE deliveries SET status = %s WHERE delivery_id = %s", (status, delivery_id))
            conn.commit()
            cur.execute('SELECT * FROM deliveries WHERE delivery_id = %s', (delivery_id,))
            row = cur.fetchone()
    finally:
        conn.close()
    return jsonify(map_delivery(row) if row else {'message': 'Not found'}), (200 if row else 404)


# ===== RATINGS =====
@app.route('/api/ratings', methods=['POST'])
def submit_rating():
    data = request.get_json() or {}
    request_id = data.get('request_id')
    buyer_id = data.get('buyer_id')
    rated_user_id = data.get('rated_user_id')
    rating_type = (data.get('rating_type') or '').upper()
    rating = data.get('rating')
    review = data.get('review')

    if rating_type not in {'PRODUCT', 'DELIVERY'}:
        return jsonify({'message': 'Invalid rating type'}), 400
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({'message': 'Rating must be between 1 and 5'}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT rating_id FROM ratings WHERE request_id = %s AND rating_type = %s',
                (request_id, rating_type),
            )
            if cur.fetchone():
                return jsonify({'message': 'You have already rated this request'}), 409

            cur.execute(
                '''INSERT INTO ratings (request_id, buyer_id, rated_user_id, rating_type, rating, review)
                   VALUES (%s, %s, %s, %s, %s, %s)''',
                (request_id, buyer_id, rated_user_id, rating_type, rating, review),
            )
            conn.commit()
            cur.execute('SELECT * FROM ratings WHERE rating_id = %s', (cur.lastrowid,))
            row = cur.fetchone()
    finally:
        conn.close()

    return jsonify(map_rating(row) if row else {'message': 'Not found'}), 201


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
        'farmer_name': p.get('farmer_name', ''),
        'created_at': str(p.get('created_at', '')), 'updated_at': str(p.get('updated_at', '')),
    }


def map_request(r):
    return {
        'id': r['request_id'], 'produce_id': r['produce_id'],
        'buyer_id': r['buyer_id'], 'buyer_name': r.get('buyer_name', ''),
        'produce_name': r.get('produce_name', ''), 'farmer_name': r.get('farmer_name', ''),
        'farmer_id': r.get('farmer_id'),
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
        'buyer_name': d.get('buyer_name', ''), 'produce_name': d.get('produce_name', ''), 'farmer_name': d.get('farmer_name', ''),
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
