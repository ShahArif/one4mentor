# Admin User Management

This document describes the admin user management functionality that has been implemented in the application.

## Overview

Super admin users can now perform the following actions:

1. **Add Users** - Create new user accounts with email, password, and display name
2. **Edit Users** - Update user profile information (email and display name)
3. **Delete Users** - Remove users from the system (with confirmation)
4. **Assign Roles** - Assign admin, mentor, or candidate roles to users
5. **Remove Roles** - Remove roles from users

## Database Migration Required

Before using the new functionality, you need to apply the database migration:

### Migration File
`/supabase/migrations/20250115000000_admin_user_management.sql`

This migration adds:
- RLS policies allowing super_admin to manage all profiles
- Helper functions for user creation and deletion
- Proper security checks

### To Apply the Migration

1. If using Supabase CLI:
   ```bash
   supabase db push
   ```

2. If using Supabase Dashboard:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of the migration file
   - Execute the SQL

## Components Added

### 1. AddUserDialog (`/src/components/admin/AddUserDialog.tsx`)
- Form validation using Zod
- Creates auth user and profile entry
- Handles password requirements (min 6 characters)
- Email validation
- Optional display name

### 2. EditUserDialog (`/src/components/admin/EditUserDialog.tsx`)
- Edit user email and display name
- Updates both profile and auth tables
- Shows user creation date and ID
- Form validation

### 3. DeleteUserDialog (`/src/components/admin/DeleteUserDialog.tsx`)
- Confirmation dialog with detailed warnings
- Lists all data that will be deleted
- Prevents self-deletion
- Cleans up user roles, profile, and onboarding requests
- Attempts to delete auth user (may require additional permissions)

## Enhanced AdminDashboard

The user management table now includes:
- **Add User** button in the header
- **Edit** button for each user
- **Delete** button for each user (except current user)
- User creation date column
- Improved layout with better action organization

## Features

### Security Features
- Only super_admin users can access user management
- Self-deletion prevention
- Comprehensive confirmation dialogs
- Input validation on all forms

### User Experience
- Real-time updates using React Query
- Toast notifications for all actions
- Loading states during operations
- Responsive design

### Role Management
- Assign/remove admin, mentor, candidate roles
- Visual role badges with color coding
- Bulk role management in the same interface

## Usage

1. **Access**: Navigate to `/admin/dashboard` as a super_admin user
2. **Add User**: Click "Add User" button, fill form, submit
3. **Edit User**: Click "Edit" button next to any user, modify details, save
4. **Delete User**: Click "Delete" button, confirm in dialog
5. **Manage Roles**: Use role buttons in the Actions column

## Error Handling

- Network errors are displayed with toast notifications
- Validation errors are shown inline in forms
- Supabase Auth API errors are handled gracefully
- Profile/auth synchronization issues are logged but don't block operations

## Limitations

- User creation requires Supabase Auth Admin API access
- Password reset functionality is not included (users can use forgot password)
- Bulk operations are not implemented
- User filtering/search is not implemented (can be added if needed)

## Next Steps

If you need additional functionality, consider:
- User search and filtering
- Bulk role assignment
- User activity logs
- Password reset from admin panel
- User suspension/activation
- Export user data functionality