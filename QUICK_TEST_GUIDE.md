# 🚀 Quick Test Guide

## 1️⃣ Test School Permissions System

### Run Migration
```bash
cd backend
node scripts/run-migration.js
```

### Start Servers
```bash
# Terminal 1
cd backend && npm start

# Terminal 2  
npm run dev
```

### Test Admin Interface
1. **Login**: Go to `http://localhost:3000` → Login as admin
2. **Navigate**: Click **"School Management"** tab
3. **Assign Permissions**: 
   - Find a school in the table
   - Click the **purple shield icon** (🛡️)
   - Permissions modal opens
4. **Select Subjects & Grades**:
   - Click on a subject name to expand it
   - Click individual grade buttons to select/deselect
   - OR click "Select All" to select all grades
   - Example: Select "Social Science" → Select Grades 5-12
5. **Save**: Click "Save Permissions" button
6. **Success**: Modal closes, changes are saved

### Test School User View
1. **Login**: Login as a school user
2. **Browse**: Go to resources page
3. **Verify**: You should only see resources matching your assigned permissions
4. **Test Access**: Try to access a resource outside permissions → Should get 403 error

---

## 2️⃣ Test New Card Design

### Where to Look
**School Dashboard** → Resources Tab

### What You Should See

```
┌───────────────────────────────┐
│ 👤 [Circular Image]           │
│                               │
│ U1 L1: Family and Home        │
│                               │
│ This presentation on Family   │
│ and Home introduces young...  │
│                               │
│ [Social Science] [Grade 1]    │
│                               │
│ Social Science        [👁️]    │
└───────────────────────────────┘
```

### Key Elements to Verify
- ✅ **Circular image** at top-left (not full-width banner)
- ✅ **Title** shows full resource name
- ✅ **Description** shows 2 lines of plain text
- ✅ **Tags** show up to 3 tags
- ✅ **Subject badge** shows at bottom-left
- ✅ **View button** (eye icon) at bottom-right
- ✅ **NO** "System Admin" or date info
- ✅ **NO** "Published/Draft" status badge

### Cards Should Look Like Reference Image
Compare with the first reference image you provided - cards should have:
- Colored background for grade headers
- Circular avatar/image in top-left
- Clean minimal design
- Title and description prominent
- Tags at bottom

---

## 🎯 Quick Verification Checklist

### School Permissions
- [ ] Migration ran successfully
- [ ] Admin can open permissions modal
- [ ] Matrix shows subjects and grades
- [ ] Can select/deselect grades
- [ ] Can select all grades for a subject
- [ ] Save button works
- [ ] School user sees only permitted resources
- [ ] School user gets 403 for unpermitted resources

### Card Design
- [ ] Circular preview image visible
- [ ] Image is in top-left position
- [ ] Title shows correctly
- [ ] Description shows 2 lines max
- [ ] Tags display properly
- [ ] Subject badge in footer
- [ ] View button in footer
- [ ] No admin/date/status info
- [ ] Hover effects work
- [ ] Click to view works

---

## 📸 Screenshots to Take

For documentation:
1. **Permissions Modal**: Full modal with matrix expanded
2. **Card Design**: Single card showing circular image
3. **School View**: Full grade column with new cards
4. **Before/After**: Old vs new card design

---

## ⚠️ Common Issues

### Issue: Cards Still Show Old Design
- **Solution**: Clear browser cache, hard refresh (Ctrl+F5)

### Issue: Images Not Circular
- **Solution**: Check browser console for errors, verify Tailwind classes

### Issue: Permissions Modal Not Opening
- **Solution**: Check browser console, verify migration ran

### Issue: School User Sees All Resources
- **Solution**: Verify permissions were saved, check user role is 'school'

---

## 📞 Quick Support Commands

### Check Database
```sql
-- Check if permissions table exists
SHOW TABLES LIKE 'school_subject_permissions';

-- Check saved permissions
SELECT * FROM school_subject_permissions;
```

### Check API
```bash
# Test permissions endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/schools/1/permissions
```

### Check Console
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls

---

## ✨ Success State

You'll know everything is working when:
1. ✅ Admin can assign permissions via visual matrix
2. ✅ School users only see permitted resources
3. ✅ Cards show circular preview images
4. ✅ No admin info or status badges on cards
5. ✅ Hover effects and interactions work smoothly


