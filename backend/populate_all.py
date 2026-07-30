"""
Populate: 4 farmers, produce listings (matching images), purchase requests with ACCEPTED, deliveries.
Buyer = Vishwajeet (ID 1)
"""
import mysql.connector, math
from config import Config


conn = mysql.connector.connect(
    host=Config.DB_HOST, user=Config.DB_USER,
    password=Config.DB_PASSWORD, database=Config.DB_NAME
)
cursor = conn.cursor(dictionary=True)

PWD = "Test@123"
import bcrypt
pwd_hash = bcrypt.hashpw(PWD.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')

# ── 1. CLEAR old data ────────────────────────────────────────
cursor.execute("DELETE FROM deliveries")
cursor.execute("DELETE FROM purchase_requests")
cursor.execute("DELETE FROM produce_photos")
cursor.execute("DELETE FROM produce_listings")
conn.commit()
print("Cleared old listings/PRs/deliveries/photos.")

# ── 2. USERS ─────────────────────────────────────────────────
# Existing: ID 1 = Vishwajeet (BUYER), ID 2 = John Farmer (FARMER)
# Register 3 more farmers + 2 transporters
new_users = [
    # (name, email, role, phone, city, state, address, lat, lon)
    ('Ravi Kumar',   'ravi@farm.com',   'FARMER',      '9876543210', 'Pune',   'Maharashtra', 'Green Valley Farm, Pune',  45, 60),
    ('Sunita Patel', 'sunita@farm.com', 'FARMER',      '9876543211', 'Nashik', 'Maharashtra', 'Organic Farms, Nashik',      30, 80),
    ('Amit Singh',   'amit@farm.com',   'FARMER',      '9876543212', 'Nagpur', 'Maharashtra', 'Singh Agri, Nagpur',         70, 55),
    ('Vikram Joshi', 'vikram@trans.com','TRANSPORTER', '9876543230', 'Pune',   'Maharashtra', 'Truck Depot, Pune',          50, 65),
    ('Priya Sharma', 'priya@trans.com', 'TRANSPORTER', '9876543231', 'Nashik', 'Maharashtra', 'Logistics Hub, Nashik',      35, 85),
]

user_ids = {2: 'John Farmer'}
for fn, em, ro, ph, ci, st, ad, lat, lon in new_users:
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (em,))
    existing = cursor.fetchone()
    if existing:
        uid = existing['user_id']
    else:
        cursor.execute(
            """INSERT INTO users (full_name, email, password_hash, role, phone, city, state, address, latitude, longitude)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (fn, em, pwd_hash, ro, ph, ci, st, ad, lat, lon)
        )
        conn.commit()
        uid = cursor.lastrowid
    user_ids[fn] = uid
    print(f"  {'EXISTS' if existing else 'CREATED'}: {fn} (ID {uid})")

print(f"User IDs: {user_ids}")

# ── 3. PRODUCE LISTINGS & PHOTOS ─────────────────────────────
# Map product -> (farmer_name, filename)
produce_data = [
    ('Fresh Tomatoes',  user_ids['Ravi Kumar'],   'tomatoes1.jpg',  50,  'kg',  30.00, 'Pune Farm'),
    ('Potatoes',        user_ids['Ravi Kumar'],   'potatoes1.jpg',  100, 'kg',  25.00, 'Pune Farm'),
    ('Green Chillies',  user_ids['Ravi Kumar'],   'chillies1.jpg',  20,  'kg',  40.00, 'Pune Farm'),
    ('Corn',            user_ids['Ravi Kumar'],   'corn1.jpg',      80,  'kg',  20.00, 'Pune Farm'),
    ('Red Onions',      user_ids['Sunita Patel'], 'onions1.jpg',    80,  'kg',  28.00, 'Nashik Farm'),
    ('Fresh Eggs',      user_ids['Sunita Patel'], 'eggs1.jpg',      200, 'piece', 6.00, 'Nashik Farm'),
    ('Basmati Rice',    user_ids['Amit Singh'],   'rice1.jpg',      200, 'kg',  55.00, 'Nagpur Farm'),
    ('Wheat',           user_ids['Amit Singh'],   'wheat1.jpg',     300, 'kg',  22.00, 'Nagpur Farm'),
]

listing_ids = {}
for name, fid, img, qty, unit, price, loc in produce_data:
    cursor.execute(
        "INSERT INTO produce_listings (farmer_id, name, description, quantity, unit, price_per_unit, location, status) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, 'AVAILABLE')",
        (fid, name, f'Fresh {name.lower()} from organic farm', qty, unit, price, loc)
    )
    pid = cursor.lastrowid
    listing_ids[name] = pid
    cursor.execute(
        "INSERT INTO produce_photos (produce_id, photo_url) VALUES (%s, %s)",
        (pid, f'static/uploads/produce/{img}')
    )
    print(f"  LISTING {pid}: {name} (farmer {fid}) -> {img}")

conn.commit()

# ── 4. PURCHASE REQUESTS ─────────────────────────────────────
buyer_id = 1  # Vishwajeet

# 1 PENDING + 3 ACCEPTED
prs = [
    ('Fresh Tomatoes', 10, 28.00, 'PENDING',  'Need fresh tomatoes'),
    ('Potatoes',       20, 22.00, 'APPROVED', 'Bulk potato order'),
    ('Red Onions',     15, 25.00, 'APPROVED', 'Onions for kitchen'),
    ('Basmati Rice',   30, 50.00, 'APPROVED', 'Rice for restaurant'),
]

pr_ids = {}
for name, qty, price, sts, note in prs:
    cursor.execute(
        "INSERT INTO purchase_requests (produce_id, buyer_id, requested_quantity, offered_price, status, buyer_note) "
        "VALUES (%s, %s, %s, %s, %s, %s)",
        (listing_ids[name], buyer_id, qty, price, sts, note)
    )
    rid = cursor.lastrowid
    pr_ids[name] = rid
    print(f"  PR {rid}: {name} -> {sts}")

conn.commit()

# ── 5. DELIVERIES (for ACCEPTED PRs) ─────────────────────────
# farmer coords -> buyer coords (buyer is Vishwajeet at lat=?, lon=?)
cursor.execute("SELECT latitude, longitude, city FROM users WHERE user_id = 1")
buyer_loc = cursor.fetchone()
blat, blon = float(buyer_loc['latitude']), float(buyer_loc['longitude'])

delivery_map = {
    'Potatoes':     (user_ids['Ravi Kumar'],   'Green Valley Farm, Pune'),
    'Red Onions':   (user_ids['Sunita Patel'], 'Organic Farms, Nashik'),
    'Basmati Rice': (user_ids['Amit Singh'],   'Singh Agri, Nagpur'),
}

for name, rid in pr_ids.items():
    if name not in delivery_map:
        continue
    fid, pickup_addr = delivery_map[name]
    cursor.execute("SELECT latitude, longitude, city FROM users WHERE user_id = %s", (fid,))
    farmer_loc = cursor.fetchone()
    flat, flon = float(farmer_loc['latitude']), float(farmer_loc['longitude'])

    dist = round(math.sqrt((blat - flat)**2 + (blon - flon)**2), 2)
    est = int(dist * 1.3)

    # Buyer's address from their profile
    del_addr = f"{buyer_loc['city']}"

    cursor.execute(
        """INSERT INTO deliveries
           (request_id, transporter_id, status, pickup_address, delivery_address,
            pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude,
            distance_km, estimated_time_minutes)
           VALUES (%s, NULL, 'SHIPPED', %s, %s, %s, %s, %s, %s, %s, %s)""",
        (rid, pickup_addr, del_addr, flat, flon, blat, blon, dist, est)
    )
    did = cursor.lastrowid
    print(f"  DELIVERY {did}: PR {rid} ({name}) {dist}km ~{est}min")

conn.commit()

# ── VERIFY ────────────────────────────────────────────────────
print("\n===== VERIFICATION =====")
cursor.execute("SELECT user_id, full_name, role FROM users")
print(f"Users ({cursor.rowcount}):")
for r in cursor.fetchall():
    print(f"  {r['user_id']}: {r['full_name']} [{r['role']}]")

cursor.execute("""
    SELECT pl.produce_id, pl.name, u.full_name as farmer, pp.photo_url
    FROM produce_listings pl
    JOIN users u ON pl.farmer_id = u.user_id
    LEFT JOIN produce_photos pp ON pl.produce_id = pp.produce_id
    ORDER BY pl.produce_id
""")
print(f"\nListings ({cursor.rowcount}):")
for r in cursor.fetchall():
    print(f"  {r['produce_id']}: {r['name']} (farmer: {r['farmer']}) photo: {r['photo_url']}")

cursor.execute("""
    SELECT pr.request_id, pl.name, pr.status
    FROM purchase_requests pr
    JOIN produce_listings pl ON pr.produce_id = pl.produce_id
    ORDER BY pr.request_id
""")
print(f"\nPurchase Requests ({cursor.rowcount}):")
for r in cursor.fetchall():
    print(f"  PR {r['request_id']}: {r['name']} [{r['status']}]")

cursor.execute("""
    SELECT d.delivery_id, d.request_id, pl.name, d.status, d.distance_km
    FROM deliveries d
    JOIN purchase_requests pr ON d.request_id = pr.request_id
    JOIN produce_listings pl ON pr.produce_id = pl.produce_id
""")
print(f"\nDeliveries ({cursor.rowcount}):")
for r in cursor.fetchall():
    print(f"  D{r['delivery_id']}: PR {r['request_id']} ({r['name']}) [{r['status']}] {r['distance_km']}km")

cursor.close()
conn.close()

print("\n===== LOGIN CREDENTIALS =====")
print("  Buyer:       Use existing login (bharadwajvishwajeet@gmail.com)")
print("  Farmers:     ravi@farm.com / sunita@farm.com / amit@farm.com (pwd: Test@123)")
print("  Transporter: vikram@trans.com / priya@trans.com (pwd: Test@123)")
