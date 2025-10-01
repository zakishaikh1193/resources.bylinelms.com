# School Permissions Testing Guide

## 🚀 Quick Start Testing

### 1. Database Setup
```bash
# Run the migration
cd backend
node scripts/run-migration.js

# Or manually run the SQL from:
# backend/migrations/2025_10_01_school_subject_permissions.sql
```

### 2. Start the Application
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
npm run dev
```

### 3. Test Admin Interface

#### Step 1: Login as Admin
- Go to `http://localhost:3000`
- Login with admin credentials
- Navigate to **Admin Dashboard**

#### Step 2: Go to School Management
- Click on **"School Management"** tab
- You should see a list of schools

#### Step 3: Assign Permissions
- Find a school in the table
- Look for the **purple shield icon** (🛡️) in the Actions column
- Click the shield icon

#### Step 4: Use the Permissions Matrix
```
┌─────────────────────────────────────────────────────────┐
│ Manage Permissions for [School Name]                   │
├─────────────────────────────────────────────────────────┤
│ 📚 Mathematics                    [Select All] [▼]     │
│   ┌─────────────────────────────────────────────────┐   │
│   │ [✓] Grade 1  [✓] Grade 2  [✗] Grade 3  [✓] Grade 4│   │
│   │ [✗] Grade 5  [✗] Grade 6  [✗] Grade 7  [✗] Grade 8│   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│ 🔬 Science                        [Select All] [▼]     │
│   ┌─────────────────────────────────────────────────┐   │
│   │ [✗] Grade 1  [✗] Grade 2  [✓] Grade 3  [✓] Grade 4│   │
│   │ [✓] Grade 5  [✓] Grade 6  [✓] Grade 7  [✓] Grade 8│   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│ Selected Permissions:                                   │
│ • Mathematics: Grade 1, Grade 2, Grade 4               │
│ • Science: Grade 3, Grade 4, Grade 5, Grade 6, etc.   │
└─────────────────────────────────────────────────────────┘
```

#### Step 5: Save Changes
- Click **"Save Permissions"**
- Wait for success message
- Modal closes automatically

### 4. Test School User Access

#### Step 1: Login as School User
- Use a school account (role: 'school')
- Login to the application

#### Step 2: Browse Resources
- Go to the resources page
- You should only see resources that match the assigned permissions
- Resources outside the permissions should not be visible

#### Step 3: Test Resource Access
- Try to access a resource directly via URL
- If the resource doesn't match permissions, you should get a 403 error
- If it matches, you should see the resource normally

## 🧪 Test Scenarios

### Scenario 1: Basic Permission Assignment
1. **Admin assigns**: Mathematics (Grades 1-5) to School A
2. **School A should see**: Only Mathematics resources for Grades 1-5
3. **School A should NOT see**: 
   - Mathematics resources for Grades 6-12
   - Any other subject resources

### Scenario 2: Multiple Subject Permissions
1. **Admin assigns**: 
   - Mathematics (Grades 1-8)
   - Science (Grades 6-12)
2. **School should see**: 
   - Mathematics resources for Grades 1-8
   - Science resources for Grades 6-12
3. **School should NOT see**:
   - Mathematics for Grades 9-12
   - Science for Grades 1-5
   - Any other subjects

### Scenario 3: No Permissions
1. **Admin assigns**: No permissions to School B
2. **School B should see**: No resources at all
3. **School B should get**: 403 errors when trying to access any resource

## 🔍 Troubleshooting

### Common Issues

#### 1. Migration Fails
```bash
# Check if MySQL is running
mysql -u root -p

# Check if database exists
SHOW DATABASES;

# Run migration manually
SOURCE backend/migrations/2025_10_01_school_subject_permissions.sql;
```

#### 2. Frontend Not Loading
```bash
# Check if backend is running
curl http://localhost:5000/health

# Check if frontend is running
curl http://localhost:3000
```

#### 3. Permissions Not Working
- Check browser console for errors
- Verify API calls in Network tab
- Check backend logs for errors

#### 4. School User Still Sees All Resources
- Verify the school user has `role: 'school'` in database
- Check if permissions were actually saved
- Verify the API endpoints are working

### Debug Steps

#### 1. Check Database
```sql
-- Check if permissions table exists
SHOW TABLES LIKE 'school_subject_permissions';

-- Check if permissions were saved
SELECT * FROM school_subject_permissions;

-- Check school user role
SELECT user_id, name, role FROM users WHERE role = 'school';
```

#### 2. Check API Endpoints
```bash
# Test permissions endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/schools/1/permissions

# Test subjects endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/meta/subjects-with-grades
```

#### 3. Check Frontend Console
- Open browser DevTools
- Check Console tab for errors
- Check Network tab for failed API calls

## 📋 Expected Behavior

### Admin Dashboard
- ✅ School Management tab shows all schools
- ✅ Purple shield icon appears in Actions column
- ✅ Clicking shield opens permissions modal
- ✅ Matrix shows all subjects and grades
- ✅ Can select/deselect grades
- ✅ Save button works and shows success

### School User Experience
- ✅ Only sees resources matching permissions
- ✅ Gets 403 error for unauthorized resources
- ✅ Can view and download permitted resources
- ✅ Cannot access resources outside permissions

### API Behavior
- ✅ GET /api/admin/schools returns schools with permission counts
- ✅ GET /api/admin/schools/:id/permissions returns current permissions
- ✅ PUT /api/admin/schools/:id/permissions updates permissions
- ✅ School users get filtered resources automatically

## 🎯 Success Criteria

The system is working correctly if:

1. **Admin can assign permissions** through the visual interface
2. **School users only see permitted resources** in their dashboard
3. **Unauthorized access returns 403 errors** for school users
4. **Admin users see all resources** (no restrictions)
5. **Anonymous users see all published resources** (no restrictions)

## 🚨 Important Notes

- **Default behavior**: New schools have NO access until permissions are assigned
- **Admin override**: Admin users always see all resources
- **Anonymous access**: Anonymous users see all published resources
- **Permission enforcement**: Only applies to school users
- **Real-time updates**: Changes take effect immediately


