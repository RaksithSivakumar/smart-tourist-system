// Test script to verify signup functionality
const testSignup = async () => {
  const baseUrl = 'http://localhost:3000/api/auth';
  
  // Test data for tourist signup
  const touristData = {
    role: 'tourist',
    email: 'test-tourist@example.com',
    password: 'password123',
    name: 'John Tourist',
    passport_no: 'A1234567',
    emergency_contact: '+1-555-0123'
  };

  console.log('🧪 Testing Tourist Signup...\n');
  console.log('Sending data:', JSON.stringify(touristData, null, 2));

  try {
    const response = await fetch(`${baseUrl}/signup`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(touristData)
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Tourist signup successful!');
      console.log('User data saved:', data.user);
    } else {
      console.log('❌ Tourist signup failed:', data.error);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

// Test guide signup
const testGuideSignup = async () => {
  const baseUrl = 'http://localhost:3000/api/auth';
  
  const guideData = {
    role: 'guide',
    email: 'test-guide@example.com',
    password: 'password123',
    name: 'Jane Guide',
    license_id: 'GUIDE001',
    region_assigned: 'New York'
  };

  console.log('\n🧪 Testing Guide Signup...\n');
  console.log('Sending data:', JSON.stringify(guideData, null, 2));

  try {
    const response = await fetch(`${baseUrl}/signup`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(guideData)
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Guide signup successful!');
      console.log('User data saved:', data.user);
    } else {
      console.log('❌ Guide signup failed:', data.error);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting signup tests...\n');
  
  await testSignup();
  await testGuideSignup();
  
  console.log('\n🎉 Tests completed!');
};

runTests().catch(console.error);
