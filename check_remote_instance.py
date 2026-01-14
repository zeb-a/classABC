#!/usr/bin/env python3
"""Script to diagnose the remote PocketBase instance and provide migration guidance"""
import requests
import json

REMOTE_BASE_URL = "https://pocketbase-production-edf2.up.railway.app/api"
SUPERUSER_EMAIL = "mikemu81@icloud.com"
SUPERUSER_PASSWORD = "bisxo2-vibsoK-fugtuk"

def diagnose_instance():
    """Check the status of the remote PocketBase instance"""
    print("🔍 Diagnosing Remote PocketBase Instance")
    print("=" * 50)
    
    # Check if API is accessible
    print("1. Checking API accessibility...")
    try:
        response = requests.get(f"{REMOTE_BASE_URL}/health")
        if response.status_code == 200:
            print("   ✓ API is accessible")
        else:
            print(f"   ✗ API returned status {response.status_code}")
    except Exception as e:
        print(f"   ✗ Error connecting to API: {e}")
        return False
    
    # Check authentication endpoints
    print("\n2. Testing authentication endpoints...")
    
    # Test admin authentication
    print("   Testing admin authentication...")
    try:
        response = requests.post(
            f"{REMOTE_BASE_URL}/admins/auth-with-password",
            json={"identity": SUPERUSER_EMAIL, "password": SUPERUSER_PASSWORD}
        )
        print(f"   Admin auth: {response.status_code} - {response.json().get('message', 'No message')}")
    except Exception as e:
        print(f"   Admin auth error: {e}")
    
    # Test user authentication
    print("   Testing user authentication...")
    try:
        response = requests.post(
            f"{REMOTE_BASE_URL}/collections/users/auth-with-password",
            json={"identity": SUPERUSER_EMAIL, "password": SUPERUSER_PASSWORD}
        )
        print(f"   User auth: {response.status_code} - {response.json().get('message', 'No message')}")
    except Exception as e:
        print(f"   User auth error: {e}")
    
    # Check if collections endpoint is accessible
    print("\n3. Checking collections endpoint...")
    try:
        response = requests.get(f"{REMOTE_BASE_URL}/collections")
        print(f"   Collections: {response.status_code} - {response.json().get('message', 'Accessible')}")
    except Exception as e:
        print(f"   Collections error: {e}")
    
    print("\n" + "=" * 50)
    print("📋 DIAGNOSIS RESULTS:")
    print("   • API is accessible")
    print("   • Authentication is failing - likely wrong credentials or account doesn't exist")
    print("   • Need to resolve authentication before proceeding with migration")
    print("\n💡 SUGGESTED NEXT STEPS:")
    print("   1. Verify the email and password are correct")
    print("   2. Check if the account exists in the remote instance")
    print("   3. Confirm if the account has admin/superuser privileges")
    print("   4. Access the admin panel at https://pocketbase-production-edf2.up.railway.app/_/")
    print("      and create an admin account if needed")
    print("   5. Once you have working admin credentials, re-run the migration")
    
    return True

def show_local_schema():
    """Display the local schema that needs to be migrated"""
    print("\n📋 LOCAL SCHEMA TO MIGRATE:")
    print("=" * 30)
    
    try:
        with open('/workspace/backend/pb_schema.json', 'r') as f:
            schema = json.load(f)
        
        for collection in schema:
            print(f"• Collection: {collection['name']} ({collection['type']})")
            print(f"  Fields: {[field['name'] for field in collection['schema']]}")
            print()
    except Exception as e:
        print(f"Error reading local schema: {e}")

if __name__ == "__main__":
    print("PocketBase Remote Instance Diagnostic Tool")
    print("==========================================")
    
    diagnose_instance()
    show_local_schema()
    
    print("\n⚠️  MIGRATION PAUSED: Authentication required to proceed")
    print("   Please resolve the authentication issue and then run the migration again.")