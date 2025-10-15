# User Lifecycle Testing Guide

## 🧪 **How to Test User Lifecycle Features**

### **Quick Start Method**

1. **Open the application**: `http://localhost:3001`
2. **Clear localStorage** (if credentials don't work):
   - Press `F12` to open Developer Tools
   - Go to Console tab
   - Type: `localStorage.clear(); location.reload();`
   - Press Enter
3. **Access Test Page**: Go to `http://localhost:3001/test-lifecycle`
4. **Click "Run All User Lifecycle Tests"** to automatically test all features

### **Manual Testing Method**

#### **Step 1: Reset Credentials**
```javascript
// In browser console (F12 → Console)
localStorage.clear();
location.reload();
```

#### **Step 2: Test User Registration**
1. Go to `http://localhost:3001/signup`
2. Fill in the registration form:
   - Name: Test User
   - Email: testuser@example.com
   - Password: TestPass123
   - Phone: +91 9876543200
   - Date of Birth: 1995-01-01
   - Address: Test Address, Mumbai, Maharashtra, 400000
3. Click "Create Account"
4. **Expected**: Redirected to catalog page, automatically logged in

#### **Step 3: Test User Login**
1. Go to `http://localhost:3001/login`
2. Use credentials:
   - **User**: user@example.com / password123
   - **Admin**: admin@example.com / admin123
   - **Staff**: staff@example.com / staff123
3. Click "Login"
4. **Expected**: Redirected based on role (user→catalog, admin→admin dashboard)

#### **Step 4: Test Profile Management**
1. Login as any user
2. Go to Profile page (from user menu)
3. Test features:
   - **Edit Profile**: Change name, phone, etc.
   - **Address Management**: Add/edit/delete addresses
   - **Order History**: View past orders
   - **Repeat Orders**: Re-order previous items

#### **Step 5: Test Admin User Management**
1. Login as admin (admin@example.com / admin123)
2. Go to Admin Dashboard
3. Test features:
   - **View All Users**: See user list and statistics
   - **Block User**: Block a test user
   - **Unblock User**: Unblock the same user
   - **User Statistics**: View user analytics

#### **Step 6: Test Account Deletion & Recovery**
1. Login as a test user
2. Go to Profile page
3. **Soft Delete**: Delete account (30-day recovery window)
4. **Recovery**: Login as admin and recover the deleted account
5. **Permanent Delete**: After 30 days, account is permanently deleted

## 🔐 **Available Test Credentials**

### **Pre-configured Users**
| Role | Email | Password | Access |
|------|-------|----------|---------|
| User | user@example.com | password123 | Catalog, Cart, Profile |
| Admin | admin@example.com | admin123 | Admin Dashboard, User Management |
| Staff | staff@example.com | staff123 | Limited Admin Access |

### **New User Registration**
- **Email**: Any unique email
- **Password**: Must be 8+ chars with uppercase, lowercase, number
- **Phone**: Valid Indian format (+91 XXXXXXXXXX)
- **Age**: Must be 18+ years

## 📋 **Test Scenarios**

### **1. User Registration Flow**
```
Visit Signup → Fill Form → Validation → Account Creation → Auto Login → Catalog
```

### **2. User Authentication Flow**
```
Login Attempt → Credential Check → Role Assignment → Session Creation → Dashboard Redirect
```

### **3. Profile Management Flow**
```
Profile Access → Edit Mode → Validation → Save → UI Update
```

### **4. Account Management Flow**
```
Delete Request → Soft Delete → 30-day Window → Recovery/Permanent Delete
```

### **5. Admin User Management Flow**
```
Admin Login → User List → Block/Unblock → Statistics → Recovery
```

## 🎯 **Expected Test Results**

### **✅ Successful Tests**
- User registration creates account and auto-logs in
- Login redirects to appropriate dashboard based on role
- Profile updates are saved and reflected immediately
- Address management works (add/edit/delete/set default)
- Order history shows past orders with repeat functionality
- Admin can view all users and manage them
- Account deletion is soft (recoverable for 30 days)
- Account recovery works within the 30-day window

### **❌ Failed Tests (What to Check)**
- **Registration fails**: Check email uniqueness, password strength
- **Login fails**: Clear localStorage and reset credentials
- **Profile update fails**: Check form validation
- **Admin features not working**: Ensure logged in as admin role
- **Account recovery fails**: Check if within 30-day window

## 🔧 **Troubleshooting**

### **Credentials Not Working**
```javascript
// Clear all data and reset
localStorage.clear();
location.reload();
```

### **Test Page Not Loading**
- Ensure application is running: `npm start`
- Check URL: `http://localhost:3001/test-lifecycle`
- Clear browser cache if needed

### **Features Not Working**
- Check browser console for errors (F12 → Console)
- Ensure you're logged in with correct role
- Try different browser or incognito mode

## 📊 **Test Coverage**

### **User Lifecycle Features Tested**
- ✅ User Registration
- ✅ User Authentication
- ✅ Profile Management
- ✅ Address Management
- ✅ Order History
- ✅ Account Deletion (Soft)
- ✅ Account Recovery
- ✅ Admin User Management
- ✅ User Blocking/Unblocking
- ✅ User Statistics
- ✅ Role-based Access Control
- ✅ Session Management

### **Data Persistence**
- ✅ localStorage for user data
- ✅ User-specific cart and orders
- ✅ Profile information persistence
- ✅ Address book management
- ✅ Order history tracking

This comprehensive testing guide ensures all user lifecycle features are properly tested and working as expected! 🎉 