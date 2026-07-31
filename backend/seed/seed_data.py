import pymysql
from config import Config
from modules.produce import ProduceService

conn = pymysql.connect(
    host=Config.DB_HOST,
    user=Config.DB_USER,
    password=Config.DB_PASSWORD,
    database=Config.DB_NAME,
    port=Config.DB_PORT,
    cursorclass=pymysql.cursors.DictCursor
)
cursor = conn.cursor()

cursor.execute("SELECT user_id, full_name, role FROM users")
users = cursor.fetchall()

print("Existing users:")
for u in users:
    print(f"  {u['user_id']}: {u['full_name']} ({u['role']})")

farmers = [u for u in users if u['role'] == 'FARMER']

if not farmers:
    print("\nNo farmers found. Please register a farmer first via the signup form.")
    cursor.close()
    conn.close()
    exit()

farmer = farmers[0]
fid = farmer['user_id']

cursor.execute("SELECT COUNT(*) as cnt FROM produce_listings")
count = cursor.fetchone()['cnt']
print(f"Existing listings: {count}")

if count == 0:
    print("\nSeeding produce listings...")

    items = [
        ('Organic Tomatoes', 100.00, 3.50, 'Fresh organic tomatoes from my farm', 'kg', 'Farm A, Zone 1'),
        ('Premium Rice', 500.00, 2.00, 'High-quality long grain rice', 'kg', 'Farm A, Zone 1'),
        ('Fresh Eggs', 200.00, 0.50, 'Farm-fresh free-range eggs', 'piece', 'Farm A, Zone 2'),
        ('Green Spinach', 50.00, 4.00, 'Freshly harvested spinach leaves', 'kg', 'Farm A, Zone 1'),
        ('Pure Honey', 30.00, 12.00, 'Pure natural honey from local bees', 'kg', 'Farm A, Zone 3'),
    ]

    for name, qty, price, desc, unit, loc in items:
        cursor.execute(
            """INSERT INTO produce_listings
               (farmer_id, name, quantity, price_per_unit, description, unit, location)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (fid, name, qty, price, desc, unit, loc)
        )
        lid = cursor.lastrowid
        cursor.execute(
            "INSERT INTO produce_photos (produce_id, photo_url) VALUES (%s, %s)",
            (lid, f"https://placehold.co/400x300/2d6a4f/white?text={name.replace(' ', '+')}")
        )

    conn.commit()
    print("Seed data inserted successfully!")
else:
    print("Listings already exist, skipping seed.")

cursor.close()
conn.close()

listings = ProduceService.get_all_listings()
print(f"\nTotal listings: {len(listings)}")
for l in listings:
    print(f"  - {l['name']} by {l['farmer_name']} (${l['price']}/{l['unit']})")
