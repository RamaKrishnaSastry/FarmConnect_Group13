import pymysql
from config import Config

conn = pymysql.connect(
    host=Config.DB_HOST, user=Config.DB_USER,
    password=Config.DB_PASSWORD, database=Config.DB_NAME
)
cursor = conn.cursor()

# Clear old data
cursor.execute("DELETE FROM purchase_requests")
cursor.execute("DELETE FROM produce_photos")
cursor.execute("DELETE FROM produce_listings")
conn.commit()
print("Cleared old data.")

# Insert produce_listings
listings = [
    (1, 'Fresh Tomatoes', 'Bright red organic tomatoes harvested today.', 50, 'kg', 30.00, 'Pune Farm', 'AVAILABLE'),
    (1, 'Potatoes', 'High-quality potatoes grown without chemicals.', 100, 'kg', 25.00, 'Pune Farm', 'AVAILABLE'),
    (2, 'Red Onions', 'Freshly harvested red onions with strong flavor.', 80, 'kg', 28.00, 'Nashik Farm', 'AVAILABLE'),
]

for row in listings:
    cursor.execute(
        """INSERT INTO produce_listings
           (farmer_id, name, description, quantity, unit, price_per_unit, location, status)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""", row
    )
    lid = cursor.lastrowid
    print(f"  Inserted listing ID {lid}: {row[1]}")

conn.commit()

# Get actual produce_ids
cursor.execute("SELECT produce_id, name FROM produce_listings ORDER BY produce_id")
actual = cursor.fetchall()
print(f"\nActual produce IDs: {actual}")

# Map name->photo
photo_map = {
    'Fresh Tomatoes': 'static/uploads/produce/tomatoes1.jpg',
    'Potatoes': 'static/uploads/produce/potatoes1.jpg',
    'Red Onions': 'static/uploads/produce/onions1.jpg',
}

for pid, name in actual:
    url = photo_map.get(name)
    if url:
        cursor.execute(
            "INSERT INTO produce_photos (produce_id, photo_url) VALUES (%s, %s)",
            (pid, url)
        )
        print(f"  Inserted photo for listing ID {pid}: {url}")

conn.commit()

# Verify
cursor.execute("""
    SELECT pl.produce_id, pl.name, pl.farmer_id, pp.photo_url
    FROM produce_listings pl
    LEFT JOIN produce_photos pp ON pl.produce_id = pp.produce_id
    ORDER BY pl.produce_id
""")
for r in cursor.fetchall():
    print(f"\n  ID={r[0]}, Name={r[1]}, Farmer={r[2]}, Photo={r[3]}")

cursor.close()
conn.close()
print("\nDone!")
