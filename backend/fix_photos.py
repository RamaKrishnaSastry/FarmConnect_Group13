import mysql.connector
from config import Config

conn = mysql.connector.connect(
    host=Config.DB_HOST, user=Config.DB_USER,
    password=Config.DB_PASSWORD, database=Config.DB_NAME
)
cursor = conn.cursor()

# Fix tomatoes - remove extra quotes, use relative path
cursor.execute(
    "UPDATE produce_photos SET photo_url = %s WHERE photo_id = %s",
    ("/static/uploads/tomatoes1.jpg", 1)
)

# Update other rows to match available files
updates = [
    (2, "/static/uploads/potatoes1.jpg"),   # Premium Rice
    (3, "/static/uploads/onions1.jpg"),      # Fresh Eggs
]

for pid, url in updates:
    cursor.execute("UPDATE produce_photos SET photo_url = %s WHERE photo_id = %s", (url, pid))

# Delete remaining placeholder rows (spinach, honey)
cursor.execute("DELETE FROM produce_photos WHERE photo_id IN (4, 5)")

conn.commit()

# Verify
cursor.execute("SELECT * FROM produce_photos")
for r in cursor.fetchall():
    print(r)

cursor.close()
conn.close()
print("\nDone!")
