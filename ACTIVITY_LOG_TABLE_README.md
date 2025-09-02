# School Activity Log Table

## Overview
This table tracks all school activities including logins and resource downloads. It stores the essential information you requested:
- **School name**
- **Resource name** (which was downloaded)
- **Login time** (when the school user logged in)
- **Current timestamp** (when the activity occurred)

## Table Structure

### Main Fields
- `id` - Unique identifier for each log entry
- `school_name` - Name of the school
- `school_email` - Email of the school
- `school_organization` - Organization/Institution name
- `resource_name` - Name of the resource downloaded (NULL for login activities)
- `resource_type` - Type of resource (PDF, DOC, etc.)
- `activity_type` - Type of activity: 'login', 'resource_download', or 'resource_view'
- `login_time` - When the school user logged in
- `activity_timestamp` - When this specific activity occurred
- `ip_address` - IP address of the school
- `user_agent` - Browser/device information
- `file_size` - File size in bytes (for downloads)
- `file_extension` - File extension (for downloads)

## How to Use

### 1. Create the Table
Run the SQL script to create the table:
```sql
source backend/create_simple_activity_log.sql;
```

### 2. Log School Login
When a school user logs in:
```sql
CALL LogSchoolActivity(
    'School A',                    -- school_name
    'schoola@example.com',         -- school_email
    'ABC School',                  -- school_organization
    NULL,                          -- resource_name (NULL for login)
    NULL,                          -- resource_type (NULL for login)
    'login',                       -- activity_type
    NOW(),                         -- login_time
    '192.168.1.100',              -- ip_address
    'Mozilla/5.0...',             -- user_agent
    NULL,                          -- file_size (NULL for login)
    NULL                           -- file_extension (NULL for login)
);
```

### 3. Log Resource Download
When a school downloads a resource:
```sql
CALL LogSchoolActivity(
    'School A',                    -- school_name
    'schoola@example.com',         -- school_email
    'ABC School',                  -- school_organization
    'Mathematics Worksheet',       -- resource_name
    'PDF',                         -- resource_type
    'resource_download',           -- activity_type
    '2024-01-15 10:00:00',       -- login_time (when they logged in)
    '192.168.1.100',              -- ip_address
    'Mozilla/5.0...',             -- user_agent
    1024000,                      -- file_size in bytes
    'pdf'                          -- file_extension
);
```

## Sample Queries

### 1. Get All Activities for a Specific School
```sql
SELECT * FROM school_activity_logs 
WHERE school_name = 'School A' 
ORDER BY activity_timestamp DESC;
```

### 2. Get All Downloads by a School
```sql
SELECT 
    school_name,
    resource_name,
    resource_type,
    login_time,
    activity_timestamp,
    ip_address
FROM school_activity_logs 
WHERE school_name = 'School A' 
AND activity_type = 'resource_download'
ORDER BY activity_timestamp DESC;
```

### 3. Get School Activity Summary
```sql
SELECT * FROM school_activity_summary 
ORDER BY total_activities DESC;
```

### 4. Get Recent Activities (Last 24 Hours)
```sql
SELECT 
    school_name,
    school_organization,
    resource_name,
    activity_type,
    login_time,
    activity_timestamp,
    ip_address
FROM school_activity_logs 
WHERE activity_timestamp >= NOW() - INTERVAL 24 HOUR
ORDER BY activity_timestamp DESC;
```

### 5. Get Download Statistics by School
```sql
SELECT 
    school_name,
    school_organization,
    COUNT(CASE WHEN activity_type = 'resource_download' THEN 1 END) as total_downloads,
    COUNT(CASE WHEN activity_type = 'login' THEN 1 END) as total_logins,
    MAX(activity_timestamp) as last_activity
FROM school_activity_logs 
GROUP BY school_name, school_organization
ORDER BY total_downloads DESC;
```

## Integration with Your Application

### 1. When School Logs In
```javascript
// In your login handler
const logSchoolLogin = async (schoolData, ipAddress, userAgent) => {
  const query = `
    CALL LogSchoolActivity(?, ?, ?, NULL, NULL, 'login', NOW(), ?, ?, NULL, NULL)
  `;
  
  await pool.execute(query, [
    schoolData.name,
    schoolData.email,
    schoolData.organization,
    ipAddress,
    userAgent
  ]);
};
```

### 2. When School Downloads Resource
```javascript
// In your download handler
const logResourceDownload = async (schoolData, resourceData, ipAddress, userAgent) => {
  const query = `
    CALL LogSchoolActivity(?, ?, ?, ?, ?, 'resource_download', ?, ?, ?, ?, ?)
  `;
  
  await pool.execute(query, [
    schoolData.name,
    schoolData.email,
    schoolData.organization,
    resourceData.title,
    resourceData.type,
    schoolData.loginTime, // Store this when they log in
    ipAddress,
    userAgent,
    resourceData.fileSize,
    resourceData.fileExtension
  ]);
};
```

## Benefits

1. **Complete Tracking**: Every school activity is logged with timestamps
2. **Easy Querying**: Simple queries to get school activity reports
3. **Performance**: Indexed fields for fast queries
4. **Flexibility**: Can track different types of activities
5. **Audit Trail**: Complete history of school interactions

## Sample Data Output

After running the script, you'll see data like:
```
+------------+-------------------+------------------+------------------+------------------+---------------------+---------------------+-------------+
| school_name| school_organization| resource_name    | activity_type    | login_time       | activity_timestamp  | ip_address         |
+------------+-------------------+------------------+------------------+---------------------+---------------------+-------------+
| School A   | ABC School       | Mathematics W... | resource_download| 2024-01-15 08:00:00| 2024-01-15 09:00:00| 192.168.1.100      |
| School A   | ABC School       | NULL             | login            | 2024-01-15 08:00:00| 2024-01-15 08:00:00| 192.168.1.100      |
| School B   | XYZ School       | English Gram...  | resource_download| 2024-01-15 09:00:00| 2024-01-15 09:15:00| 192.168.1.101      |
+------------+-------------------+------------------+------------------+---------------------+---------------------+-------------+
```

This gives you exactly what you requested: **which school downloaded which resources at what time**, with complete tracking of login sessions and IP addresses.
