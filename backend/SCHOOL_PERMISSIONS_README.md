# School Subject-Grade Permissions System

## Overview

This system allows administrators to assign specific subject-grade combinations to schools, controlling which resources each school can access. Schools can only view, download, and interact with resources that match their assigned permissions.

## Database Changes

### New Table: `school_subject_permissions`
- Links schools to specific subject-grade combinations
- Composite primary key: `(school_id, subject_id, grade_id)`
- Includes audit fields: `created_by`, `created_at`, `updated_at`

### New View: `school_allowed_resources`
- Convenience view joining resources with permissions
- Shows only resources that schools are allowed to access

## API Endpoints

### Admin Endpoints (All require admin authentication)

#### Get All Schools with Permission Summary
```
GET /api/admin/schools
```
Returns paginated list of schools with permission counts.

#### Get School Permissions
```
GET /api/admin/schools/:schoolId/permissions
```
Returns detailed permissions for a specific school, grouped by subject.

#### Set School Permissions (Replace All)
```
PUT /api/admin/schools/:schoolId/permissions
```
**Body:**
```json
{
  "permissions": [
    {
      "subject_id": 1,
      "grade_ids": [1, 2, 3, 4, 5]
    },
    {
      "subject_id": 2,
      "grade_ids": [6, 7, 8, 9, 10, 11, 12]
    }
  ]
}
```

#### Add School Permissions (Upsert)
```
POST /api/admin/schools/:schoolId/permissions
```
Same body format as PUT, but adds to existing permissions without replacing.

#### Remove School Permissions
```
DELETE /api/admin/schools/:schoolId/permissions
```
Same body format as PUT, but removes specified permissions.

### Convenience Endpoint

#### Get Subjects with Grades
```
GET /api/meta/subjects-with-grades
```
Returns all subjects and grades for building admin UI.

## Enforcement

### Resource Listing (`GET /api/resources`)
- School users: Only see resources matching their permissions
- Admin/Anonymous users: See all published resources (unchanged behavior)

### Resource Detail (`GET /api/resources/:id`)
- School users: 403 error if no permission for resource's subject-grade
- Admin/Anonymous users: Unchanged behavior

### Resource Download (`GET /api/resources/:id/download`)
- School users: 403 error if no permission for resource's subject-grade
- Admin/Anonymous users: Unchanged behavior

## Usage Examples

### Example 1: Assign Social Science Grades 5-12 to a School
```json
PUT /api/admin/schools/123/permissions
{
  "permissions": [
    {
      "subject_id": 1,  // Social Science
      "grade_ids": [5, 6, 7, 8, 9, 10, 11, 12]
    }
  ]
}
```

### Example 2: Assign Multiple Subjects with Different Grade Ranges
```json
PUT /api/admin/schools/123/permissions
{
  "permissions": [
    {
      "subject_id": 1,  // Social Science
      "grade_ids": [5, 6, 7, 8, 9, 10, 11, 12]
    },
    {
      "subject_id": 2,  // ICT
      "grade_ids": [1, 2, 3, 4]
    }
  ]
}
```

## Migration

Run the migration script:
```bash
node backend/scripts/run-migration.js
```

This creates the `school_subject_permissions` table and `school_allowed_resources` view.

## Default Behavior

- **New schools**: No access until permissions are assigned
- **Existing schools**: No access until permissions are assigned
- **Admins**: Full access to all resources (unchanged)
- **Anonymous users**: Full access to published resources (unchanged)

## Activity Logging

All permission changes are logged in `activity_logs` with actions:
- `ADMIN_SET_SCHOOL_PERMISSIONS`
- `ADMIN_ADD_SCHOOL_PERMISSIONS`
- `ADMIN_REMOVE_SCHOOL_PERMISSIONS`

## Frontend Integration

The admin UI should:
1. Fetch schools via `GET /api/admin/schools`
2. Fetch subjects and grades via `GET /api/meta/subjects-with-grades`
3. Display a matrix interface for assigning permissions
4. Use `PUT /api/admin/schools/:schoolId/permissions` to save changes

School users will automatically see filtered resources based on their permissions - no frontend changes needed for the school interface.


