# Firebase Service Account Setup

To fix the "Invalid JWT" error in the `sync-firebase-auth` edge function, you need to configure Firebase service account credentials.

## Steps:

1. Go to your Firebase Console: https://console.firebase.google.com/project/campusconnect-52ddf/settings/serviceaccounts/adminsdk

2. Click "Generate new private key" to download the service account JSON file

3. Extract the following values from the JSON file and add them as secrets in your Supabase project:

Required secrets:
- `project_id` (from the JSON file)
- `private_key_id` (from the JSON file) 
- `private_key` (from the JSON file - this will be a long string starting with "-----BEGIN PRIVATE KEY-----")
- `client_email` (from the JSON file)
- `client_id` (from the JSON file)
- `client_x509_cert_url` (from the JSON file)

## The service account JSON file looks like this:
```json
{
  "type": "service_account",
  "project_id": "campusconnect-52ddf",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-...@campusconnect-52ddf.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-...%40campusconnect-52ddf.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

Once you add these secrets, the edge function should be able to verify Firebase ID tokens and create user profiles in Supabase.