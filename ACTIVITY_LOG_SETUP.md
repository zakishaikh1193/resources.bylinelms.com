# Activity Log Setup Guide - School Resource Downloads

## Overview
The Activity Log feature has been successfully implemented to specifically track **which school downloaded which resources at what time**. This focused approach ensures you get exactly the data you need for monitoring school activities.

## What's Been Implemented

### ✅ Frontend Components
- **Activity Log Tab**: Added to the admin sidebar navigation
- **School Downloads Table**: Displays comprehensive download information
- **Search & Filters**: Search by school name or resource title
- **Pagination**: Handles large datasets efficiently
- **Timezone Support**: Multiple timezone options with IST as default

### ✅ Backend API
- **New Endpoint**: `/api/admin/activity/school-downloads` - Focused on school resource downloads
- **Direct Database Query**: Simple, efficient query from resource_downloads table
- **Real-time Data**: Live data from actual download records

### ✅ Data Fields Displayed
- **School Name**: Shows organization name and email
- **Resource Downloaded**: Resource title, subject, grade, type, and file details
- **IP Address**: User's IP address for each download
- **Download Time**: Exact timestamp with timezone support

## Setup Instructions

### 1. Database Migration
Run the setup script to add missing fields and sample data:

```sql
-- Connect to your MySQL database and run:
source backend/setup_activity_log.sql;
```

This script will:
- Add `last_login`, `last_ip`, `last_user_agent` fields to users table
- Create necessary indexes for performance
- Insert sample data for testing

### 2. Test Database Structure
Run the test script to verify everything is working:

```sql
-- Connect to your MySQL database and run:
source backend/test_activity_log.sql;
```

This will show you:
- All required tables exist
- Sample data is present
- The main query works correctly

### 3. Restart Backend Server
After running the database migration, restart your backend server:

```bash
# Stop current server (Ctrl+C), then restart:
cd backend
node server.js
```

### 4. Test the Frontend
1. Navigate to the admin dashboard
2. Click on the "Activity Log" tab in the sidebar
3. You should now see real school download data displayed in the table

## API Endpoints

### GET `/api/admin/activity/school-downloads`
Fetches school resource download data with pagination support.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `school_id`: Filter by specific school
- `start_date`: Filter from date (YYYY-MM-DD)
- `end_date`: Filter to date (YYYY-MM-DD)
- `sort`: Sort field (default: downloaded_at)
- `order`: Sort order (ASC/DESC, default: DESC)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "download_id": 1,
        "user_id": 2,
        "resource_id": 1,
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2025-01-15T10:00:00",
        "school_name": "School A",
        "school_email": "schoola@example.com",
        "school_organization": "ABC School",
        "user_role": "school",
        "resource_title": "Math Worksheet 1",
        "resource_description": "Basic addition worksheet",
        "file_name": "math1.pdf",
        "file_size": 1024000,
        "file_extension": "pdf",
        "resource_type": "PDF",
        "subject_name": "Mathematics",
        "grade_level": "Grade 1",
        "details": {
          "download_method": "web",
          "file_size_mb": 1.0,
          "school_info": "ABC School",
          "resource_details": "Math Worksheet 1 (PDF)"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

## Data Sources

The Activity Log now focuses specifically on:

1. **Resource Downloads Table**: Primary source of download activity
2. **Users Table**: School information and details
3. **Resources Table**: Resource metadata and file information
4. **Resource Types Table**: File type information
5. **Subjects Table**: Subject categorization
6. **Grades Table**: Grade level information

## Features

### 🔍 **Focused Monitoring**
- **School Downloads Only**: Tracks exactly what you need
- **Resource Details**: Complete information about downloaded resources
- **IP Tracking**: Security monitoring for each download
- **Time Stamps**: Precise download timing

### 📊 **Real-time Data**
- Live download records from your database
- No complex data aggregation
- Direct access to actual download events
- Immediate visibility into school activities

### 📱 **Clean Interface**
- Focused table showing essential information
- School name, resource details, IP address, and time
- Responsive design for all screen sizes
- Professional appearance matching your reference image

### 🚀 **Performance**
- Simple, efficient SQL queries
- Direct table joins for fast results
- Pagination for large datasets
- Indexed fields for optimal performance

## What You'll See

The Activity Log will display:

1. **School Name**: Which school performed the download
2. **Resource Downloaded**: What resource was downloaded (title, subject, grade, type)
3. **File Details**: File size, extension, and name
4. **IP Address**: Where the download came from
5. **Download Time**: When exactly the download occurred

## Troubleshooting

### No Data Displayed
1. **Check Database**: Run `test_activity_log.sql` to verify data exists
2. **Verify Tables**: Ensure all required tables have data
3. **Check API**: Verify the backend endpoint is working
4. **Console Errors**: Check browser console for frontend errors

### Database Issues
1. **Run Setup Script**: Execute `setup_activity_log.sql` first
2. **Check Table Structure**: Verify all required fields exist
3. **Sample Data**: Ensure there are users, resources, and downloads
4. **Permissions**: Verify database user has read access

### API Errors
1. **Backend Server**: Ensure server is running and restarted
2. **Authentication**: Verify admin token is valid
3. **Database Connection**: Check if database is accessible
4. **Server Logs**: Look for SQL errors in backend console

## Testing the System

### 1. Create Test Downloads
To test the system, you can:
- Have school users log in and download resources
- Use the sample data from the setup script
- Create manual download records in the database

### 2. Verify Data Flow
1. **Database**: Check if downloads are recorded
2. **API**: Test the endpoint directly
3. **Frontend**: Verify data displays correctly
4. **Real-time**: Monitor live downloads

## Customization

### Adding More Fields
To display additional information, modify:
- **Backend Query**: Add fields to the SELECT statement in `getSchoolDownloads`
- **Frontend Interface**: Update the table headers and data display
- **Data Processing**: Handle new fields in the component

### Filtering Options
Add more filters by:
- **Subject Filter**: Filter by resource subject
- **Grade Filter**: Filter by resource grade level
- **Date Range**: Enhanced date filtering
- **File Type**: Filter by resource type

## Security Considerations

- All endpoints require admin authentication
- IP addresses are logged for security monitoring
- Download activity is tracked for audit purposes
- Data is paginated to prevent information overload

## Support

If you encounter any issues:

1. **Run Test Script**: Execute `test_activity_log.sql` to diagnose problems
2. **Check Setup**: Verify all setup steps were completed
3. **Database Logs**: Look for SQL errors
4. **Backend Logs**: Check server console for API errors
5. **Frontend Console**: Look for JavaScript errors in browser

## Summary

The Activity Log is now **specifically designed** to show you:
- **Which school** downloaded resources
- **What resources** were downloaded
- **When** the downloads occurred
- **Where** the downloads came from (IP address)

This focused approach ensures you get exactly the monitoring information you need without unnecessary complexity. The system will display real-time data as soon as schools start downloading resources from your platform!
