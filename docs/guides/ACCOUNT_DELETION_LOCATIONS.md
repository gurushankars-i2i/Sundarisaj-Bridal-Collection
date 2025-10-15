# Account Deletion - Where to Find It

## 🔍 **User Account Deletion Options**

### **Location: Profile Page → Account Settings Tab**

1. **Navigate to Profile Page**
   - Click on your profile/account icon in the header
   - Or go to `/profile` directly

2. **Click "Account Settings" Tab**
   - You'll see tabs: Profile, Addresses, Orders, **Account Settings**
   - Click on the **"Account Settings"** tab

3. **Find Deletion Options**
   In the Account Settings tab, you'll see three sections:

   #### 📊 **Export Your Data** (Blue Section)
   - **Purpose**: Download all your data before deletion (GDPR compliant)
   - **Button**: "Export My Data"
   - **Action**: Downloads JSON file with all your data

   #### ⚠️ **Deactivate Account** (Yellow Section)
   - **Purpose**: Temporarily deactivate account (recoverable within 30 days)
   - **Button**: "Deactivate Account"
   - **Action**: Account becomes inactive but data is preserved

   #### 🗑️ **Permanently Delete Account** (Red Section)
   - **Purpose**: Permanently delete account and all data
   - **Button**: "Delete Account"
   - **Action**: Complete data deletion (cannot be undone)

---

## 👨‍💼 **Admin Account Deletion Management**

### **Location: Admin Dashboard → Account Deletion Tab**

1. **Navigate to Admin Dashboard**
   - Login as admin user
   - Go to `/admin` or click admin dashboard link

2. **Click "Account Deletion" Tab**
   - You'll see tabs: Overview, Orders, Products, Customers, **Account Deletion**
   - Click on the **"Account Deletion"** tab

3. **Admin Features Available**
   - **📊 Deletion Statistics**: View comprehensive metrics
   - **👥 User Management**: Manage all users and deletion requests
   - **📥 Data Export**: Export any user's data for compliance
   - **🔄 Account Recovery**: Recover any user's deactivated account
   - **🧹 Cleanup Automation**: Remove old deleted accounts
   - **📋 Audit Trail**: Track all deletion activities

---

## 🎯 **User Flow Examples**

### **Example 1: User wants to temporarily leave**
1. Go to Profile → Account Settings
2. Click "Deactivate Account" (yellow section)
3. Confirm the action
4. Account is deactivated but can be recovered within 30 days

### **Example 2: User wants to permanently delete**
1. Go to Profile → Account Settings
2. Click "Export My Data" first (recommended)
3. Click "Delete Account" (red section)
4. Enter reason for deletion (optional)
5. Confirm permanent deletion
6. Account and all data are permanently deleted

### **Example 3: Admin managing deletions**
1. Go to Admin Dashboard → Account Deletion
2. View deletion statistics and user list
3. Export user data if needed
4. Recover deactivated accounts
5. Cleanup old deleted accounts

---

## 🔧 **Technical Implementation**

### **User Interface Components**
- **`AccountDeletionModal.js`**: Multi-step deletion modal
- **`AdminAccountDeletionManager.js`**: Admin management interface
- **Profile Page Integration**: Account Settings tab
- **Admin Dashboard Integration**: Account Deletion tab

### **Database Functions**
- **`permanently_delete_user_account()`**: Hard delete
- **`export_user_data()`**: GDPR data export
- **`get_account_deletion_status()`**: Status tracking
- **`cleanup_old_deleted_accounts()`**: Admin cleanup
- **`get_deletion_statistics()`**: Admin metrics

### **API Services**
- **`authService`**: User deletion functions
- **`adminService`**: Admin management functions

---

## ✅ **Features Summary**

### **User Features**
- ✅ Data export (GDPR compliant)
- ✅ Soft delete with 30-day recovery
- ✅ Hard delete with confirmation
- ✅ Deletion status tracking
- ✅ Reason collection

### **Admin Features**
- ✅ Deletion statistics dashboard
- ✅ User management table
- ✅ Data export tools
- ✅ Account recovery tools
- ✅ Cleanup automation
- ✅ Audit trail

### **GDPR Compliance**
- ✅ Right to be forgotten
- ✅ Data portability
- ✅ Transparency
- ✅ User control
- ✅ Audit trail

---

**Note**: All account deletion options are easily accessible through the Profile page for users and Admin Dashboard for administrators. The system provides both soft and hard delete options with proper GDPR compliance features. 