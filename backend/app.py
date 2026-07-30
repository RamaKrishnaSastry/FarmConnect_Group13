from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from modules.auth import AuthService
from modules.location import LocationService
from modules.produce import ProduceService
from modules.delivery import DeliveryService
from modules.rating import RatingService

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()

        full_name = data.get('fullName')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        phone = data.get('phone')
        address = data.get('address')
        city = data.get('city')
        state = data.get('state')
        latitude = data.get('latitude')
        longitude = data.get('longitude')

        success, message = AuthService.register_user(
            full_name=full_name,
            email=email,
            password=password,
            role=role,
            phone=phone,
            address=address,
            city=city,
            state=state,
            latitude=latitude,
            longitude=longitude
        )

        if success:
            return jsonify({
                'success': True,
                'message': message,
                'role': role
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"An error occurred: {str(e)}"
        }), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        success, user_data, message = AuthService.login_user(email, password)

        if success:
            return jsonify({
                'success': True,
                'message': message,
                'user': user_data
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 401

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"An error occurred: {str(e)}"
        }), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'Server is running'}), 200


# ── Produce Listings ──────────────────────────────────────────

@app.route('/api/produce/listings', methods=['GET'])
def get_produce_listings():
    try:
        search = request.args.get('search')
        listings = ProduceService.get_all_listings(search)
        return jsonify({'success': True, 'data': listings, 'count': len(listings)}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/produce/listings/<int:listing_id>', methods=['GET'])
def get_produce_listing(listing_id):
    try:
        listing = ProduceService.get_listing_by_id(listing_id)
        if listing:
            return jsonify({'success': True, 'data': listing}), 200
        return jsonify({'success': False, 'message': 'Listing not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ── Purchase Requests ─────────────────────────────────────────

@app.route('/api/purchase/request', methods=['POST'])
def create_purchase_request():
    try:
        data = request.get_json()
        buyer_id = data.get('buyerId')
        produce_id = data.get('produceId')
        quantity = data.get('quantity')
        proposed_price = data.get('proposedPrice')
        notes = data.get('notes')

        if not all([buyer_id, produce_id, quantity, proposed_price]):
            return jsonify({'success': False, 'message': 'buyerId, produceId, quantity, and proposedPrice are required'}), 400

        success, message = ProduceService.create_purchase_request(
            buyer_id, produce_id, quantity, proposed_price, notes
        )
        if success:
            return jsonify({'success': True, 'message': message}), 201
        return jsonify({'success': False, 'message': message}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/purchase/requests', methods=['GET'])
def get_purchase_requests():
    try:
        buyer_id = request.args.get('buyerId', type=int)
        status = request.args.get('status')
        delivery_status = request.args.get('deliveryStatus')
        if not buyer_id:
            return jsonify({'success': False, 'message': 'buyerId is required'}), 400
        requests = ProduceService.get_buyer_requests(buyer_id, status, delivery_status)
        return jsonify({'success': True, 'data': requests, 'count': len(requests)}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ── Deliveries ────────────────────────────────────────────────

@app.route('/api/deliveries/available', methods=['GET'])
def get_available_deliveries():
    try:
        deliveries = DeliveryService.get_available_deliveries()
        return jsonify({'success': True, 'data': deliveries, 'count': len(deliveries)}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/deliveries/<int:delivery_id>', methods=['GET'])
def get_delivery(delivery_id):
    try:
        delivery = DeliveryService.get_delivery_by_id(delivery_id)
        if delivery:
            return jsonify({'success': True, 'data': delivery}), 200
        return jsonify({'success': False, 'message': 'Delivery not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/deliveries/transporter/<int:transporter_id>', methods=['GET'])
def get_transporter_deliveries(transporter_id):
    try:
        deliveries = DeliveryService.get_transporter_deliveries(transporter_id)
        return jsonify({'success': True, 'data': deliveries, 'count': len(deliveries)}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/deliveries/<int:delivery_id>/accept', methods=['POST'])
def accept_delivery(delivery_id):
    try:
        data = request.get_json()
        transporter_id = data.get('transporterId')
        if not transporter_id:
            return jsonify({'success': False, 'message': 'transporterId is required'}), 400
        success, message = DeliveryService.accept_delivery(delivery_id, transporter_id)
        if success:
            return jsonify({'success': True, 'message': message}), 200
        return jsonify({'success': False, 'message': message}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/deliveries/<int:delivery_id>/deliver', methods=['POST'])
def deliver_delivery(delivery_id):
    try:
        data = request.get_json()
        transporter_id = data.get('transporterId')
        if not transporter_id:
            return jsonify({'success': False, 'message': 'transporterId is required'}), 400
        success, message = DeliveryService.mark_delivered(delivery_id, transporter_id)
        if success:
            return jsonify({'success': True, 'message': message}), 200
        return jsonify({'success': False, 'message': message}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ── Ratings ───────────────────────────────────────────────────

@app.route('/api/ratings', methods=['POST'])
def submit_rating():
    try:
        data = request.get_json()
        request_id = data.get('requestId')
        buyer_id = data.get('buyerId')
        rated_user_id = data.get('ratedUserId')
        rating_type = data.get('ratingType')
        rating = data.get('rating')
        review = data.get('review')

        if not all([request_id, buyer_id, rated_user_id, rating_type, rating is not None]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        success, message = RatingService.submit_rating(
            request_id, buyer_id, rated_user_id, rating_type, rating, review
        )
        if success:
            return jsonify({'success': True, 'message': message}), 201
        return jsonify({'success': False, 'message': message}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/ratings/<int:request_id>', methods=['GET'])
def get_ratings(request_id):
    try:
        ratings = RatingService.get_ratings_for_request(request_id)
        return jsonify({'success': True, 'data': ratings}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ── Location ──────────────────────────────────────────────────

@app.route('/api/location/nearby', methods=['GET'])
def get_nearby_users():
    """Get nearby users within a radius"""
    try:
        user_id = request.args.get('userId', type=int)
        radius = request.args.get('radius', type=float, default=50)
        role = request.args.get('role', type=str)

        if not user_id:
            return jsonify({
                'success': False,
                'message': 'userId is required'
            }), 400

        nearby = LocationService.find_nearby_users(user_id, radius, role)

        return jsonify({
            'success': True,
            'data': nearby,
            'count': len(nearby)
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"An error occurred: {str(e)}"
        }), 500


@app.route('/api/location/user/<int:user_id>', methods=['GET'])
def get_user_location(user_id):
    """Get a specific user's location"""
    try:
        location = LocationService.get_user_location(user_id)

        if location:
            return jsonify({
                'success': True,
                'data': location
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'User not found or has no location'
            }), 404

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"An error occurred: {str(e)}"
        }), 500


@app.route('/api/location/distance', methods=['GET'])
def get_distance():
    """Get distance between two users"""
    try:
        user_id_1 = request.args.get('user1', type=int)
        user_id_2 = request.args.get('user2', type=int)

        if not user_id_1 or not user_id_2:
            return jsonify({
                'success': False,
                'message': 'user1 and user2 parameters are required'
            }), 400

        distance = LocationService.get_distance_between_users(user_id_1, user_id_2)

        if distance is not None:
            return jsonify({
                'success': True,
                'distance': distance,
                'unit': 'units'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Could not calculate distance'
            }), 400

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"An error occurred: {str(e)}"
        }), 500


@app.route('/api/location/map', methods=['GET'])
def get_city_map():
    """Get all users on the city map"""
    try:
        users = LocationService.get_all_users_with_location()
        stats = LocationService.get_city_statistics()

        return jsonify({
            'success': True,
            'users': users,
            'statistics': stats,
            'gridSize': 200
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"An error occurred: {str(e)}"
        }), 500


@app.route('/api/location/statistics', methods=['GET'])
def get_location_stats():
    """Get city location statistics"""
    try:
        stats = LocationService.get_city_statistics()

        return jsonify({
            'success': True,
            'data': stats
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"An error occurred: {str(e)}"
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
