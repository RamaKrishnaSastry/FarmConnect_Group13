import mysql.connector
from config import Config
conn = mysql.connector.connect(
    host=Config.DB_HOST, user=Config.DB_USER,
    password=Config.DB_PASSWORD, database=Config.DB_NAME
)
cursor = conn.cursor(dictionary=True)

cursor.execute("SELECT user_id, full_name, email, role FROM users")
print("Users:")
for r in cursor.fetchall():
    print(f"  {r['user_id']}: {r['full_name']} ({r['email']}) [{r['role']}]")

cursor.execute("SELECT produce_id, name, farmer_id FROM produce_listings")
print("\nListings:")
for r in cursor.fetchall():
    print(f"  {r['produce_id']}: {r['name']} (farmer {r['farmer_id']})")

cursor.execute("SELECT request_id, produce_id, buyer_id, status FROM purchase_requests")
print("\nPurchase Requests:")
for r in cursor.fetchall():
    print(f"  PR {r['request_id']}: produce={r['produce_id']} buyer={r['buyer_id']} [{r['status']}]")

cursor.execute("SELECT delivery_id, request_id, status FROM deliveries")
print("\nDeliveries:")
for r in cursor.fetchall():
    print(f"  D{ r['delivery_id']}: PR {r['request_id']} [{r['status']}]")

cursor.close()
conn.close()
