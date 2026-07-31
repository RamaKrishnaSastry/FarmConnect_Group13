# FarmConnect Location System

## Overview

The location system uses a **200x200 Euclidean coordinate grid** to simulate a city where all users are placed at specific coordinates. This enables:

- Distance calculations between users
- Finding nearby farmers, buyers, or transporters
- Location-based recommendations
- Delivery route optimization
- City-wide statistics and analytics

## Coordinate System

### Grid Layout

```
(0,200) ─────────────────── (200,200)
  │                              │
  │      CITY GRID               │
  │      200 x 200 units         │
  │                              │
  │                              │
(0,0) ────────────────────── (200,0)

X-axis (Latitude):  0 → 200 (horizontal)
Y-axis (Longitude): 0 → 200 (vertical)
```

### Common Locations

| Location | Coordinates | Description |
|----------|-------------|------------|
| Southwest Corner | (0, 0) | Origin point |
| Southeast Corner | (200, 0) | East edge |
| Northwest Corner | (0, 200) | North edge |
| Northeast Corner | (200, 200) | Far corner |
| City Center | (100, 100) | Central point |
| Downtown | (75-125, 75-125) | Central region |

## Distance Calculation

### Euclidean Distance Formula

```
distance = √((x₂ - x₁)² + (y₂ - y₁)²)
```

### Examples

```python
# Distance from (0,0) to (3,4)
distance = √((3-0)² + (4-0)²) = √(9 + 16) = √25 = 5 units

# Distance from (100,100) to (105,105)
distance = √((105-100)² + (105-100)²) = √(25 + 25) = √50 ≈ 7.07 units
```

## Registration Flow

### Step 1: User Enters Basic Info
```
Full Name, Email, Password, Role
```

### Step 2: Interactive City Map
```
User sees a 200x200 grid visualization
Click anywhere to place their location pin 📍
Coordinates update in real-time
```

### Step 3: Location Confirmed
```
Selected coordinates (latitude, longitude) stored in database
```

## Database Storage

### Users Table
```sql
users
├─ user_id
├─ full_name
├─ email
├─ password_hash
├─ role (FARMER/BUYER/TRANSPORTER)
├─ phone
├─ address
├─ city
├─ state
├─ latitude  ← X-axis coordinate (0-200)
├─ longitude ← Y-axis coordinate (0-200)
└─ created_at
```

## Location Service API

### Backend Module: `modules/location.py`

#### 1. Calculate Distance
```python
LocationService.euclidean_distance(lat1, lon1, lat2, lon2)
# Returns: float (distance in units)
```

#### 2. Find Nearby Users
```python
LocationService.find_nearby_users(user_id, radius, role=None)
# Returns: list of users sorted by distance
```

#### 3. Get User Location
```python
LocationService.get_user_location(user_id)
# Returns: {user_id, full_name, latitude, longitude}
```

#### 4. Get Distance Between Two Users
```python
LocationService.get_distance_between_users(user_id_1, user_id_2)
# Returns: float (distance in units)
```

#### 5. Get All Users on Map
```python
LocationService.get_all_users_with_location()
# Returns: list of all users with coordinates
```

#### 6. Get City Statistics
```python
LocationService.get_city_statistics()
# Returns: {total_users, farmers, buyers, transporters, center, bounds}
```

## REST API Endpoints

### GET `/api/location/nearby`

**Query Parameters:**
- `userId` (required): Reference user ID
- `radius` (optional): Search radius in units (default: 50)
- `role` (optional): Filter by role (FARMER/BUYER/TRANSPORTER)

**Example:**
```bash
# Find all farmers within 30 units of user 1
GET /api/location/nearby?userId=1&radius=30&role=FARMER

# Find all users within 50 units of user 2
GET /api/location/nearby?userId=2&radius=50
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 2,
      "full_name": "John Farmer",
      "email": "john@farm.com",
      "role": "FARMER",
      "latitude": 45.5,
      "longitude": 52.3,
      "distance": 12.45
    },
    {
      "user_id": 3,
      "full_name": "Jane Buyer",
      "email": "jane@buy.com",
      "role": "BUYER",
      "latitude": 48.2,
      "longitude": 55.1,
      "distance": 18.67
    }
  ],
  "count": 2
}
```

### GET `/api/location/user/<userId>`

Get a specific user's location

**Example:**
```bash
GET /api/location/user/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "full_name": "Alice Farmer",
    "latitude": 50.0,
    "longitude": 60.0
  }
}
```

### GET `/api/location/distance`

Calculate distance between two users

**Query Parameters:**
- `user1` (required): First user ID
- `user2` (required): Second user ID

**Example:**
```bash
GET /api/location/distance?user1=1&user2=2
```

**Response:**
```json
{
  "success": true,
  "distance": 12.45,
  "unit": "units"
}
```

### GET `/api/location/map`

Get all users for city map visualization

**Example:**
```bash
GET /api/location/map
```

**Response:**
```json
{
  "success": true,
  "gridSize": 200,
  "users": [
    {
      "user_id": 1,
      "full_name": "Alice",
      "latitude": 50.0,
      "longitude": 60.0,
      "role": "FARMER"
    }
  ],
  "statistics": {
    "total_users": 5,
    "farmers": 2,
    "buyers": 2,
    "transporters": 1,
    "center": {
      "latitude": 87.5,
      "longitude": 92.3
    },
    "bounds": {
      "latitude": { "min": 10, "max": 195 },
      "longitude": { "min": 15, "max": 198 }
    }
  }
}
```

### GET `/api/location/statistics`

Get city-wide location statistics

**Example:**
```bash
GET /api/location/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 5,
    "farmers": 2,
    "buyers": 2,
    "transporters": 1,
    "center": {
      "latitude": 87.5,
      "longitude": 92.3
    },
    "bounds": {
      "latitude": { "min": 10, "max": 195 },
      "longitude": { "min": 15, "max": 198 }
    }
  }
}
```

## Use Cases

### 1. Find Nearby Farmers (for Buyers)
```python
# Buyer at location (100, 100) looking for farmers within 25 units
nearby_farmers = LocationService.find_nearby_users(
    user_id=buyer_id,
    radius=25,
    role='FARMER'
)
```

### 2. Optimize Delivery Route (for Transporters)
```python
# Transporter finds nearby delivery jobs
nearby_orders = LocationService.find_nearby_users(
    user_id=transporter_id,
    radius=40,
    role=None  # All users
)
```

### 3. Location-Based Pricing
```python
# Price adjusts based on distance
distance = LocationService.get_distance_between_users(farmer_id, buyer_id)
delivery_fee = base_fee + (distance * per_unit_fee)
```

### 4. Finding Clusters
```python
# Get all users and visualize geographic clusters
all_users = LocationService.get_all_users_with_location()
```

## Frontend Integration

### City Map Picker Component

Located in `frontend/src/components/CityMapPicker.jsx`

**Features:**
- Interactive 200x200 grid visualization
- Click to place location marker 📍
- Real-time coordinate display
- Grid line indicators
- Responsive design

**Usage:**
```jsx
<CityMapPicker
  latitude={formData.latitude}
  longitude={formData.longitude}
  onCoordinatesChange={handleCoordinatesChange}
/>
```

## Performance Considerations

### Current Implementation
- Direct database queries
- No caching
- Linear distance calculations

### Future Optimizations
1. **Spatial Indexing**
   - Use R-tree indexing for coordinates
   - Faster `nearby` queries

2. **Caching**
   - Cache frequently accessed locations
   - Redis for location data

3. **Batch Operations**
   - Calculate distances for multiple users at once
   - Reduce database calls

4. **Geospatial Queries**
   - Use MySQL spatial extensions
   - Native distance queries

## Testing

### Manual Testing

```bash
# Register user 1 at (50, 50)
# Register user 2 at (55, 55)

# Calculate distance
curl "http://localhost:5000/api/location/distance?user1=1&user2=2"
# Expected: ~7.07 units

# Find nearby
curl "http://localhost:5000/api/location/nearby?userId=1&radius=10"
# Expected: user 2 in results
```

### Python Testing

```python
from modules.location import LocationService

# Test distance calculation
distance = LocationService.euclidean_distance(0, 0, 3, 4)
assert distance == 5.0

# Test nearby users
nearby = LocationService.find_nearby_users(user_id=1, radius=50)
print(f"Found {len(nearby)} nearby users")
```

## Limitations & Future Enhancements

### Current Limitations
- No real-world geographic data
- Simplified 2D coordinate system
- No elevation or obstacles
- All users accessible (no terrain)

### Future Enhancements
1. **Terrain & Obstacles**
   - Add blocked zones
   - Different speed zones (highways, rural roads)

2. **Real Coordinates**
   - Integrate with GPS/mapping APIs
   - Use actual latitude/longitude

3. **Advanced Routing**
   - A* pathfinding algorithm
   - Optimal delivery routes

4. **Traffic & Time**
   - Estimated delivery times
   - Time-based pricing

5. **Heatmaps**
   - Visualize user density
   - Popular transaction areas

## Example: Complete Flow

```python
# 1. User registers at location (100, 100)
# 2. Buyer at (95, 95) searches for nearby farmers
nearby_farmers = LocationService.find_nearby_users(
    user_id=buyer_id,
    radius=15,
    role='FARMER'
)
# Returns: Farmers within 15 units

# 3. Buyer selects a farmer, gets exact distance
distance = LocationService.get_distance_between_users(buyer_id, farmer_id)
# Distance: 7.07 units

# 4. Based on distance, calculate delivery fee
fee = 10 + (distance * 2)  # $10 base + $2 per unit

# 5. Transporter accepts order, finds optimal route
my_location = LocationService.get_user_location(transporter_id)
# Location: (102, 108)
```

## Troubleshooting

### Invalid Coordinates
**Error:** "Coordinates must be between 0 and 200"
**Solution:** Use only values 0-200 for latitude and longitude

### User Has No Location
**Error:** "User not found or has no location"
**Solution:** Ensure user set location during registration

### Distance Returns None
**Error:** Cannot calculate distance
**Solution:** Both users must have valid locations set

## References

- Euclidean Distance: https://en.wikipedia.org/wiki/Euclidean_distance
- 2D Coordinate System: https://en.wikipedia.org/wiki/Cartesian_coordinate_system
- Spatial Indexing: https://en.wikipedia.org/wiki/Spatial_database
