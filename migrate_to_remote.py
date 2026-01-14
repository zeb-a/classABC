#!/usr/bin/env python3
"""Script to migrate PocketBase collections and data to remote instance"""
import requests
import json
import sqlite3
import sys

# Remote PocketBase instance details
REMOTE_BASE_URL = "https://pocketbase-production-edf2.up.railway.app/api"
SUPERUSER_EMAIL = "mikemu81@icloud.com"
SUPERUSER_PASSWORD = "bisxo2-vibsoK-fugtuk"

def authenticate():
    """Authenticate with the remote PocketBase instance"""
    print("Authenticating with remote PocketBase...")
    
    # Try different authentication endpoints
    auth_endpoints = [
        "/admins/auth-with-password",  # Admin authentication
        "/collections/users/auth-with-password",  # User authentication
    ]
    
    for endpoint in auth_endpoints:
        print(f"Trying {endpoint}...")
        auth_url = f"{REMOTE_BASE_URL}{endpoint}"
        auth_data = {
            "identity": SUPERUSER_EMAIL,
            "password": SUPERUSER_PASSWORD
        }
        
        response = requests.post(auth_url, json=auth_data)
        
        if response.status_code == 200:
            token = response.json().get('token')
            print(f"Authentication successful using {endpoint}!")
            return token
        else:
            print(f"Failed to authenticate with {endpoint}: {response.status_code} - {response.text}")
    
    print("All authentication attempts failed.")
    return None

def make_authenticated_request(method, path, data=None, token=None):
    """Make an authenticated API request to the remote PocketBase"""
    url = f"{REMOTE_BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    if method.upper() == "GET":
        return requests.get(url, headers=headers)
    elif method.upper() == "POST":
        return requests.post(url, json=data, headers=headers)
    elif method.upper() == "PATCH":
        return requests.patch(url, json=data, headers=headers)
    elif method.upper() == "DELETE":
        return requests.delete(url, headers=headers)
    else:
        raise ValueError(f"Unsupported HTTP method: {method}")

def create_collection(collection_data, token):
    """Create a collection in the remote PocketBase instance"""
    print(f"Creating collection: {collection_data['name']}")
    
    response = make_authenticated_request("POST", "/collections", collection_data, token)
    
    if response.status_code == 200:
        print(f"✓ Collection '{collection_data['name']}' created successfully")
        return True
    elif response.status_code == 400 and "already exists" in response.text.lower():
        print(f"- Collection '{collection_data['name']}' already exists")
        return True
    else:
        print(f"✗ Failed to create collection '{collection_data['name']}': {response.status_code} - {response.text}")
        return False

def migrate_collections(token):
    """Migrate collections to the remote instance"""
    print("\nStarting collection migration...")
    
    # Load schema from pb_schema.json
    try:
        with open('/workspace/backend/pb_schema.json', 'r') as f:
            schema = json.load(f)
    except Exception as e:
        print(f"Error reading schema file: {e}")
        return False
    
    success_count = 0
    for collection in schema:
        # Convert schema format to API format
        collection_data = {
            "name": collection["name"],
            "type": collection["type"],
            "system": collection.get("system", False),
            "listRule": collection.get("listRule"),
            "viewRule": collection.get("viewRule"),
            "createRule": collection.get("createRule"),
            "updateRule": collection.get("updateRule"),
            "deleteRule": collection.get("deleteRule"),
            "options": collection.get("options", {}),
            "fields": []
        }
        
        # Convert fields format
        for field in collection["schema"]:
            field_data = {
                "name": field["name"],
                "type": field["type"],
                "system": field.get("system", False),
                "required": field.get("required", False),
                "unique": field.get("unique", False),
                "presentable": field.get("presentable", False),
                "options": field.get("options", {})
            }
            
            # Add ID if it exists
            if "id" in field:
                field_data["id"] = field["id"]
                
            collection_data["fields"].append(field_data)
        
        if create_collection(collection_data, token):
            success_count += 1
    
    print(f"\nCollection migration completed. {success_count}/{len(schema)} collections processed.")
    return success_count == len(schema)

def main():
    print("PocketBase Migration Tool")
    print("=========================")
    
    # Authenticate with remote instance
    token = authenticate()
    if not token:
        print("Cannot proceed without authentication.")
        sys.exit(1)
    
    # Migrate collections
    collections_success = migrate_collections(token)
    
    if collections_success:
        print("\n✅ Migration completed successfully!")
        print(f"Your collections have been migrated to:")
        print(f"  URL: {REMOTE_BASE_URL.replace('/api', '')}")
        print(f"  Email: {SUPERUSER_EMAIL}")
    else:
        print("\n❌ Some collections failed to migrate. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()