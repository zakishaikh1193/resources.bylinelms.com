# Production Deployment Guide

## Current Issue
Files are being uploaded to the root directory instead of `backend/uploads/` in production.

## Quick Fix Steps

### 1. Check Current Upload Configuration
Visit this URL in your browser to see the current upload configuration:
```
https://resources.bylinelms.com/api/resources/debug/upload-config
```

### 2. Update Environment Variables
In your production `.env` file, make sure you have:
```env
UPLOAD_PATH=./backend/uploads
NODE_ENV=production
```

### 3. Test Upload Configuration
Run this command in your production server:
```bash
cd backend
node test-upload.js
```

### 4. Check File Permissions
Make sure the `backend/uploads` directory has proper write permissions:
```bash
chmod 755 backend/uploads
```

### 5. Restart the Server
After making changes, restart your Node.js server.

## Enhanced Error Logging

The application now provides detailed error messages. When you try to upload a resource, check:

1. **Browser Console** - For detailed error responses
2. **Server Logs** - For comprehensive error details
3. **Network Tab** - For the exact error response

## Expected Error Response Format
```json
{
  "success": false,
  "message": "Specific error message",
  "error": {
    "code": "ERROR_CODE",
    "sqlMessage": "Database error details",
    "stack": "Error stack trace"
  }
}
```

## Common Issues and Solutions

### Issue: Files uploaded to root instead of backend/uploads
**Solution**: Set `UPLOAD_PATH=./backend/uploads` in your `.env` file

### Issue: Permission denied errors
**Solution**: 
```bash
chmod 755 backend/uploads
chown www-data:www-data backend/uploads  # If using Apache/Nginx
```

### Issue: Database connection errors
**Solution**: Check your database configuration in `.env`

### Issue: Directory doesn't exist
**Solution**: The application will automatically create the directory, but ensure the parent directory is writable.

## Testing the Fix

1. **Test the debug endpoint**: Visit the debug URL above
2. **Try uploading a resource**: Check for detailed error messages
3. **Check server logs**: Look for the enhanced logging output
4. **Verify file location**: Files should now be in `backend/uploads/`

## File Structure After Fix
```
resources.bylinelms.com/
├── index.html
├── assets/
├── backend/
│   ├── server.js
│   ├── uploads/          ← Files should be here
│   │   ├── 1234567890-uuid.zip
│   │   └── 1234567890-uuid.jpg
│   └── other files...
├── package.json
└── .env
```
