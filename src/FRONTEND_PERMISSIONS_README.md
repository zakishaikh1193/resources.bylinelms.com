# Frontend School Permissions Implementation

## Overview

This implementation adds school-subject-grade permissions management to the admin dashboard, allowing administrators to control which resources each school can access.

## New Components

### 1. SubjectGradeMatrix.tsx
A matrix interface for selecting subject-grade combinations:
- **Expandable subjects**: Click to show/hide grade options
- **Bulk selection**: "Select All" / "Remove All" for each subject
- **Visual feedback**: Color-coded subjects and selected grades
- **Permission summary**: Shows selected permissions at the bottom

### 2. SchoolPermissionsModal.tsx
Modal for managing school permissions:
- **Data loading**: Fetches subjects, grades, and current permissions
- **Matrix integration**: Uses SubjectGradeMatrix for permission selection
- **Save functionality**: Updates permissions via API
- **Error handling**: Shows loading states and error messages
- **Success feedback**: Confirms successful updates

## Updated Components

### 1. AdminDashboard.tsx
Enhanced school management section:
- **New permissions button**: Purple shield icon in school actions
- **Modal integration**: Opens SchoolPermissionsModal
- **Permission management**: Full CRUD operations for school permissions

### 2. API Configuration (api.ts)
Added new endpoints:
- `SCHOOLS`: Get all schools with permission summary
- `SCHOOL_PERMISSIONS(schoolId)`: Manage specific school permissions
- `SUBJECTS_WITH_GRADES`: Get subjects and grades for UI

## User Interface Features

### School Management Table
- **Permissions button**: Purple shield icon for each school
- **Tooltip**: "Manage Permissions" on hover
- **Integration**: Seamlessly integrated with existing actions

### Permissions Modal
- **School info header**: Shows school name, organization, and email
- **Matrix interface**: Interactive subject-grade selection
- **Bulk operations**: Select/deselect all grades for a subject
- **Visual indicators**: Color-coded subjects and selection states
- **Save/Cancel**: Clear action buttons with loading states

### Subject-Grade Matrix
- **Expandable rows**: Click subject to show/hide grades
- **Grade grid**: 2-6 columns responsive layout
- **Selection indicators**: Check/X icons for selected/unselected
- **Bulk controls**: Select All/Remove All buttons
- **Permission summary**: Shows current selections

## API Integration

### Endpoints Used
- `GET /api/meta/subjects-with-grades`: Load subjects and grades
- `GET /api/admin/schools/:schoolId/permissions`: Get current permissions
- `PUT /api/admin/schools/:schoolId/permissions`: Update permissions

### Data Flow
1. **Load**: Fetch subjects, grades, and current permissions
2. **Edit**: User modifies selections in matrix
3. **Save**: Send updated permissions to API
4. **Refresh**: Update school list with new permission counts

## Usage

### For Administrators
1. Navigate to "School Management" tab
2. Find the school you want to manage
3. Click the purple shield icon (permissions button)
4. Use the matrix to select subject-grade combinations
5. Click "Save Permissions" to apply changes

### Permission Assignment
- **Single selection**: Click individual grade buttons
- **Bulk selection**: Use "Select All" for a subject
- **Visual feedback**: Selected grades are highlighted in blue
- **Summary**: See all selected permissions at the bottom

## Technical Details

### State Management
- **Local state**: Matrix selections stored in component state
- **API state**: Current permissions loaded from server
- **Validation**: Client-side validation before API calls

### Error Handling
- **Loading states**: Spinners during data loading
- **Error messages**: Clear error display for failed operations
- **Success feedback**: Confirmation messages for successful updates

### Responsive Design
- **Mobile-friendly**: Responsive grid layout for grades
- **Touch-friendly**: Large buttons for mobile interaction
- **Accessible**: Proper ARIA labels and keyboard navigation

## Integration Points

### With Existing System
- **No breaking changes**: Existing functionality unchanged
- **Seamless integration**: Permissions button added to existing actions
- **Consistent styling**: Matches existing design patterns

### Backend Integration
- **API compatibility**: Uses new school permissions endpoints
- **Data consistency**: Real-time updates after permission changes
- **Error handling**: Proper error display for API failures

## Future Enhancements

### Potential Improvements
- **Bulk operations**: Manage permissions for multiple schools
- **Permission templates**: Save and reuse permission sets
- **Audit trail**: Show permission change history
- **Advanced filtering**: Filter schools by permission status

### UI Enhancements
- **Drag and drop**: Drag grades between subjects
- **Keyboard shortcuts**: Quick selection with keyboard
- **Search/filter**: Find specific subjects or grades quickly
- **Export/import**: Bulk permission management via CSV

## Testing

### Manual Testing
1. **Load permissions**: Verify subjects and grades load correctly
2. **Select permissions**: Test individual and bulk selections
3. **Save changes**: Confirm API calls work correctly
4. **Error handling**: Test with network errors and invalid data
5. **Responsive design**: Test on different screen sizes

### Integration Testing
1. **API integration**: Verify all endpoints work correctly
2. **State management**: Ensure UI updates reflect API changes
3. **Error scenarios**: Test error handling and recovery
4. **Performance**: Test with large numbers of subjects/grades


