import mysql.connector
from config import Config
conn = mysql.connector.connect(host=Config.DB_HOST, user=Config.DB_USER, password=Config.DB_PASSWORD, database=Config.DB_NAME)
cursor = conn.cursor(dictionary=True)

print("=== PURCHASE REQUESTS ===")
cursor.execute("""
    SELECT pr.request_id, pl.name, pr.status, pr.buyer_id, u.full_name as buyer
    FROM purchase_requests pr
    JOIN produce_listings pl ON pr.produce_id = pl.produce_id
    JOIN users u ON pr.buyer_id = u.user_id
""")
for r in cursor.fetchall():
    print(f"  PR {r['request_id']}: {r['name']} [{r['status']}] buyer={r['buyer_id']} ({r['buyer']})")

print("\n=== DELIVERIES ===")
cursor.execute("""
    SELECT d.delivery_id, d.request_id, d.status,
           d.pickup_latitude, d.pickup_longitude,
           d.delivery_latitude, d.delivery_longitude, d.distance_km
    FROM deliveries d
""")
for r in cursor.fetchall():
    print(f"  D{r['delivery_id']}: PR {r['request_id']} [{r['status']}]")
    print(f"    pickup({r['pickup_latitude']},{r['pickup_longitude']}) -> delivery({r['delivery_latitude']},{r['delivery_longitude']}) {r['distance_km']}km")

cursor.close()
conn.close()
