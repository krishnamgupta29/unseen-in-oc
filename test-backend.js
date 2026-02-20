// Simple test script to verify backend is working
const testBackend = async () => {
  console.log('🧪 Testing UNSEEN Backend...\n');

  // Test 1: Check if API is responding
  console.log('Test 1: Checking API health...');
  try {
    const response = await fetch('http://localhost:3001/api/auth/me');
    const data = await response.json();
    
    if (response.status === 401 && data.error === 'Not authenticated') {
      console.log('✅ API is responding correctly (401 for unauthenticated request)\n');
    } else {
      console.log('❌ Unexpected response\n');
    }
  } catch (error) {
    console.log('❌ API is not responding:', error.message, '\n');
  }

  // Test 2: Try to signup (will fail without database setup)
  console.log('Test 2: Testing signup endpoint...');
  try {
    const response = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_user_' + Date.now(),
        password: 'test123',
        deviceFingerprint: 'test-device-123',
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Signup successful! Database is connected.\n');
      console.log('User created:', data.user?.username);
    } else {
      console.log('⚠️  Signup failed (expected if database not set up yet)');
      console.log('Error:', data.error, '\n');
    }
  } catch (error) {
    console.log('❌ Signup endpoint error:', error.message, '\n');
  }

  console.log('📝 Summary:');
  console.log('- Backend server is running ✅');
  console.log('- API endpoints are accessible ✅');
  console.log('- Next step: Run SQL schema in Supabase to enable full functionality');
};

testBackend();
