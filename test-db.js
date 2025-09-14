// Test MongoDB connection and user creation
const mongoose = require('mongoose');

// User schema (simplified version)
const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['tourist', 'guide', 'police', 'hotel', 'airport'],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  tourist: {
    name: String,
    passport_no: String,
    emergency_contact: String,
  },
  guide: {
    name: String,
    license_id: String,
    region_assigned: String,
  },
  police: {
    name: String,
    badge_id: String,
    station_location: String,
  },
  hotel: {
    hotel_name: String,
    registration_id: String,
    location: String,
    contact_number: String,
  },
  airport: {
    airport_name: String,
    iata_code: String,
    location: String,
    authority_contact: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

const testMongoDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/smart-tourist-system');
    console.log('✅ Connected to MongoDB');
    
    // Test creating a user
    console.log('📝 Testing user creation...');
    
    const testUser = new User({
      role: 'tourist',
      email: 'test@example.com',
      password: 'hashedpassword123',
      tourist: {
        name: 'Test Tourist',
        passport_no: 'TEST123',
        emergency_contact: '+1-555-TEST'
      },
      created_at: new Date()
    });
    
    const savedUser = await testUser.save();
    console.log('✅ User created successfully:', savedUser);
    
    // Test finding the user
    console.log('🔍 Testing user retrieval...');
    const foundUser = await User.findOne({ email: 'test@example.com' });
    console.log('✅ User found:', foundUser);
    
    // Clean up test user
    await User.deleteOne({ email: 'test@example.com' });
    console.log('🧹 Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

testMongoDB();
