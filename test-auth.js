// Simple test script for authentication endpoints
const testAuth = async () => {
  const baseUrl = 'http://localhost:3000/api/auth';
  
  // Test data for different roles
  const testUsers = [
    {
      role: 'tourist',
      email: 'tourist@test.com',
      password: 'password123',
      name: 'John Tourist',
      passport_no: 'A1234567',
      emergency_contact: '+1-555-0123'
    },
    {
      role: 'guide',
      email: 'guide@test.com',
      password: 'password123',
      name: 'Jane Guide',
      license_id: 'GUIDE001',
      region_assigned: 'New York'
    },
    {
      role: 'police',
      email: 'police@test.com',
      password: 'password123',
      name: 'Officer Smith',
      badge_id: 'POL001',
      station_location: 'NYPD Central'
    },
    {
      role: 'hotel',
      email: 'hotel@test.com',
      password: 'password123',
      hotel_name: 'Grand Hotel',
      registration_id: 'HOTEL001',
      location: 'Manhattan',
      contact_number: '+1-555-HOTEL'
    },
    {
      role: 'airport',
      email: 'airport@test.com',
      password: 'password123',
      airport_name: 'JFK International',
      iata_code: 'JFK',
      location: 'Queens, NY',
      authority_contact: '+1-555-AIRPORT'
    }
  ];

  console.log('🧪 Testing Authentication System...\n');

  for (const user of testUsers) {
    try {
      console.log(`📝 Testing ${user.role} signup...`);
      
      // Test signup
      const signupResponse = await fetch(`${baseUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      
      const signupData = await signupResponse.json();
      
      if (signupResponse.ok) {
        console.log(`✅ ${user.role} signup successful`);
        
        // Test login
        console.log(`🔐 Testing ${user.role} login...`);
        const loginResponse = await fetch(`${baseUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            password: user.password,
            role: user.role
          })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
          console.log(`✅ ${user.role} login successful`);
          console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
        } else {
          console.log(`❌ ${user.role} login failed:`, loginData.error);
        }
      } else {
        console.log(`❌ ${user.role} signup failed:`, signupData.error);
      }
      
      console.log('---');
    } catch (error) {
      console.log(`❌ Error testing ${user.role}:`, error.message);
    }
  }

  console.log('\n🎉 Authentication system test completed!');
};

// Run the test
testAuth().catch(console.error);
