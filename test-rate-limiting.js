#!/usr/bin/env node

/**
 * Manual test script for rate limiting verification
 * Run this script after logging in to the application
 * Usage: node test-rate-limiting.js <cookie-header>
 * 
 * To get the cookie header:
 * 1. Log in to the application in your browser
 * 2. Open Developer Tools -> Network tab
 * 3. Find any authenticated request to /api
 * 4. Copy the Cookie header value
 * 5. Run: node test-rate-limiting.js "your-cookie-value"
 */

const BASE_URL = 'http://localhost:5000';

async function testRateLimiting(cookieHeader) {
  console.log('🚀 Starting Rate Limiting Tests\n');
  
  // Test 1: Project Creation Rate Limiting (5 requests per 15 minutes)
  console.log('Test 1: Testing /api/projects/create rate limiting (5 requests per 15 min)');
  console.log('=========================================================');
  
  for (let i = 1; i <= 7; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/projects/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader
        },
        body: JSON.stringify({
          projectDescription: `Test project ${i} - Rate limiting test`
        })
      });
      
      const status = response.status;
      const data = await response.json();
      
      if (status === 200 || status === 201) {
        console.log(`✅ Request ${i}: Success - Project created with ID: ${data.id}`);
      } else if (status === 429) {
        console.log(`🛑 Request ${i}: Rate limited! Status: ${status}`);
        console.log(`   Message: ${data.message || data.error}`);
        console.log(`   Retry after: ${data.retryAfter} seconds`);
      } else {
        console.log(`⚠️  Request ${i}: Unexpected status ${status}:`, data);
      }
    } catch (error) {
      console.log(`❌ Request ${i}: Error -`, error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✨ Rate Limiting Test Complete!');
  console.log('\nExpected Results:');
  console.log('- Requests 1-5: Should succeed (200/201 status)');
  console.log('- Requests 6-7: Should be rate limited (429 status)');
  console.log('\nNote: The rate limiter uses user ID for tracking, so limits apply per user.');
  console.log('The general API rate limit is 100 requests per 15 minutes per IP.\n');
}

// Check if cookie header was provided
if (process.argv.length < 3) {
  console.log('❌ Error: Cookie header required');
  console.log('\nUsage: node test-rate-limiting.js "<cookie-header>"');
  console.log('\nHow to get the cookie header:');
  console.log('1. Log in to the application in your browser');
  console.log('2. Open Developer Tools -> Network tab');
  console.log('3. Find any authenticated request to /api');
  console.log('4. Copy the Cookie header value');
  console.log('5. Run: node test-rate-limiting.js "your-cookie-value"');
  process.exit(1);
}

const cookieHeader = process.argv[2];
testRateLimiting(cookieHeader).catch(console.error);