const PocketBase = require('pocketbase/cjs');

// Configuration
const LOCAL_URL = 'http://127.0.0.1:8090'; // Replace with your local PocketBase URL if different
const REMOTE_URL = 'https://pocketbase-production-edf2.up.railway.app';

async function migrateCollections() {
    console.log('Starting collection migration...');
    
    // Connect to local instance
    const localPb = new PocketBase(LOCAL_URL);
    
    // Connect to remote instance (requires admin authentication)
    const remotePb = new PocketBase(REMOTE_URL);
    
    try {
        // Authenticate with remote instance (replace with your actual admin credentials)
        // await remotePb.admins.authWithPassword('your-admin-email', 'your-admin-password');
        
        console.log('Connected to both instances');
        
        // Get collections from local instance
        const localCollections = await localPb.collections.getList();
        
        // Define the collections we want to migrate
        const collectionsToMigrate = ['users', 'behaviors', 'classes'];
        
        for (const collectionName of collectionsToMigrate) {
            const localCollection = localCollections.items.find(c => c.name === collectionName);
            
            if (!localCollection) {
                console.log(`Collection '${collectionName}' not found locally`);
                continue;
            }
            
            try {
                // Check if collection exists remotely
                let remoteCollection;
                try {
                    remoteCollection = await remotePb.collections.getByNameOrId(collectionName);
                    console.log(`Collection '${collectionName}' already exists remotely`);
                } catch (error) {
                    // Collection doesn't exist, create it
                    console.log(`Creating collection '${collectionName}' remotely...`);
                    
                    // Prepare collection data for creation
                    const collectionData = {
                        name: localCollection.name,
                        type: localCollection.type,
                        system: localCollection.system,
                        listRule: localCollection.listRule,
                        viewRule: localCollection.viewRule,
                        createRule: localCollection.createRule,
                        updateRule: localCollection.updateRule,
                        deleteRule: localCollection.deleteRule,
                        schema: localCollection.schema,
                    };
                    
                    if (localCollection.type === 'auth') {
                        collectionData.authRule = localCollection.authRule;
                        collectionData.name = localCollection.name;
                        collectionData.authVerification = localCollection.authVerification;
                        collectionData.authVerificationRenewDisabled = localCollection.authVerificationRenewDisabled;
                        collectionData.authVerificationTemplate = localCollection.authVerificationTemplate;
                        collectionData.passwordMinLength = localCollection.passwordMinLength;
                        collectionData.emailAuth = localCollection.emailAuth;
                        collectionData.oauth2Auth = localCollection.oauth2Auth;
                        collectionData.mfa = localCollection.mfa;
                        collectionData.allowUsernameAuth = localCollection.allowUsernameAuth;
                        collectionData.allowEmailAuth = localCollection.allowEmailAuth;
                        collectionData.allowRegister = localCollection.allowRegister;
                        collectionData.confirmEmail = localCollection.confirmEmail;
                    }
                    
                    remoteCollection = await remotePb.collections.create(collectionData);
                    console.log(`Created collection '${collectionName}' successfully`);
                }
                
                // Migrate records if it's not a system/auth collection
                if (localCollection.type !== 'auth') {
                    console.log(`Migrating records for collection '${collectionName}'...`);
                    
                    // Get all records from local collection
                    const localRecords = await localPb.records.getList(localCollection.id, 1, 10000);
                    
                    for (const record of localRecords.items) {
                        try {
                            // Check if record already exists remotely by ID
                            let remoteRecord;
                            try {
                                remoteRecord = await remotePb.records.getOne(remoteCollection.id, record.id);
                                console.log(`  Record ${record.id} already exists remotely`);
                            } catch (error) {
                                // Record doesn't exist, create it
                                console.log(`  Creating record ${record.id}...`);
                                
                                // Prepare record data (excluding system fields that should be auto-generated)
                                const recordData = {};
                                for (const field of Object.keys(record)) {
                                    if (!['id', 'collectionId', 'collectionName'].includes(field)) {
                                        recordData[field] = record[field];
                                    }
                                }
                                
                                await remotePb.records.create(remoteCollection.id, recordData);
                                console.log(`  Created record ${record.id}`);
                            }
                        } catch (recordError) {
                            console.error(`  Error migrating record ${record.id}:`, recordError.message);
                        }
                    }
                } else {
                    console.log(`Skipping record migration for auth collection '${collectionName}'`);
                }
                
            } catch (collectionError) {
                console.error(`Error processing collection '${collectionName}':`, collectionError.message);
            }
        }
        
        console.log('Migration completed!');
        
    } catch (error) {
        console.error('Migration failed:', error.message);
        throw error;
    }
}

// Run migration
migrateCollections().catch(console.error);