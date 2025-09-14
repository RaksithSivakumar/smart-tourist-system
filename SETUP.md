# Smart Tourist System - Setup Instructions

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017/smart-tourist-system
# Or for MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/smart-tourist-system

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database Name
MONGO_DB=smart-tourist-system

# Collection Name
MONGO_COLLECTION=users
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your MongoDB database (local or Atlas)

3. Create the `.env.local` file with your configuration

4. Run the development server:
```bash
npm run dev
```

## Features

### Role-Based Authentication System

The system supports 5 different user roles:

1. **Tourist**
   - Required fields: name, passport_no, emergency_contact
   - Access: Personal profile, itinerary, alerts

2. **Guide**
   - Required fields: name, license_id, region_assigned
   - Access: Manage assigned tourists, safety guidance

3. **Police**
   - Required fields: name, badge_id, station_location
   - Access: Safety dashboards, SOS alerts, location markers

4. **Hotel**
   - Required fields: hotel_name, registration_id, location, contact_number
   - Access: Tourist bookings, travel documents

5. **Airport**
   - Required fields: airport_name, iata_code, location, authority_contact
   - Access: Flight details, tourist check-in verification

### API Endpoints

- `POST /api/auth/signup` - Register user with role-specific details
- `POST /api/auth/login` - Authenticate user & return JWT
- `GET /api/auth/profile` - Fetch role-based profile (JWT required)
- `GET /api/tourists` - List assigned tourists (guide/police only)
- `GET /api/alerts` - List SOS/safety alerts (police only)
- `GET /api/bookings` - Manage hotel bookings (hotel only)
- `GET /api/flights` - Manage flight check-in data (airport only)

### Security Features

- Password hashing with bcrypt
- JWT authentication/authorization
- Role-based access control
- Input validation for role-specific fields
- Environment variable configuration

## Testing the System

1. Start the development server
2. Navigate to the application
3. Choose a role and sign up
4. Fill in the required role-specific fields
5. Login with your credentials
6. Access your role-specific dashboard

## Database Schema

The user schema includes:
- Common fields: email, password (hashed), role, created_at
- Role-specific nested objects for each user type
- Proper indexing for performance
- Unique email constraint per role
