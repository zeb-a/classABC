#!/usr/bin/env node
/**
 * Fix PocketBase behaviors collection to allow user deletes
 * This updates the API rules to permit deletion by authenticated users
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

const PB_URL = 'http://127.0.0.1:4002';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password';

async function makeRequest(method, path, body = null, adminToken = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, PB_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (adminToken) {
      options.headers['Authorization'] = adminToken;
    }

    const proto = url.protocol === 'https:' ? https : http;
    const req = proto.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode}: ${parsed.message || data}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode}: ${data}`));
          } else {
            resolve({ status: res.statusCode, data });
          }
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  try {
    console.log('🔐 Authenticating as admin...');
    
    // First try the newer API path
    let authResp;
    try {
      authResp = await makeRequest('POST', '/api/admins/auth-with-password', {
        identity: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });
    } catch (e) {
      console.log('❌ Admin auth failed:', e.message);
      throw e;
    }

    const adminToken = authResp.token;
    console.log('✓ Admin authenticated');

    console.log('\n📋 Getting behaviors collection...');
    const collResp = await makeRequest('GET', '/api/collections/behaviors', null, adminToken);
    console.log('✓ Got collection:', collResp.name);

    console.log('\n⚙️  Updating API rules to allow user deletes...');
    // Update the collection to allow authenticated users to delete records
    const updated = await makeRequest('PATCH', '/api/collections/behaviors', {
      // Keep existing fields but update rules
      deleteRule: '@request.auth.id != ""', // Any authenticated user can delete
      updateRule: '@request.auth.id != ""', // Any authenticated user can update
      createRule: '@request.auth.id != ""', // Any authenticated user can create
      readRule: '@request.auth.id != ""'   // Any authenticated user can read
    }, adminToken);

    console.log('✓ Collection updated successfully');
    console.log('\n✨ API Rules set to allow authenticated users to delete behavior cards');
    console.log('   - deleteRule:', updated.deleteRule);
    
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

main();
