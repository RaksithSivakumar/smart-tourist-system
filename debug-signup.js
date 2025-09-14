// Debug script for signup functionality
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema (same as in the app)
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

const debugSignup = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/smart-tourist-system');
    console.log('✅ Connected to MongoDB');

    // Test data (same structure as sent from frontend)
    const role = 'tourist';
    const email = 'debug-tourist@example.com';
    const password = 'password123';
    const roleSpecificData = {
      name: 'Debug Tourist',
      passport_no: 'DEBUG123',
      emergency_contact: '+1-555-DEBUG'
    };

    console.log('\n📝 Testing signup process...');
    console.log('Role:', role);
    console.log('Email:', email);
    console.log('Role-specific data:', roleSpecificData);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ User already exists, deleting...');
      await User.deleteOne({ email });
    }

    // Hash password
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');

    // Create user object (same as in API)
    const userData = {
      role,
      email: email.toLowerCase(),
      password: hashedPassword,
      created_at: new Date(),
    };

    // Add role-specific data as nested object
    userData[role] = roleSpecificData;

    console.log('\n📦 User data to save:');
    console.log(JSON.stringify(userData, null, 2));

    // Create and save user
    console.log('\n💾 Saving user to database...');
    const user = new User(userData);
    const savedUser = await user.save();
    
    console.log('✅ User saved successfully!');
    console.log('Saved user data:');
    console.log(JSON.stringify(savedUser, null, 2));

    // Verify the data was saved correctly
    console.log('\n🔍 Verifying saved data...');
    const retrievedUser = await User.findById(savedUser._id);
    console.log('Retrieved user:');
    console.log('Role:', retrievedUser.role);
    console.log('Email:', retrievedUser.email);
    console.log('Tourist data:', retrievedUser.tourist);
    console.log('Created at:', retrievedUser.created_at);

    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ email });
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

debugSignup();
