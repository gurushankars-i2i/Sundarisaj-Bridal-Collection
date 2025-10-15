# 🔧 Fix "JSON object requested, multiple (or no) rows returned" Error

## 🎯 **The Problem**
You're getting this error because:
1. **The users table is empty** (0 users found)
2. **The `.single()` query fails** when expecting exactly one row but gets 0 rows
3. **Error code PGRST116** means "The result contains 0 rows"

## 🚀 **The Solution**

### **Step 1: Create Initial Users in Database**

**Option A: Using Supabase Dashboard (Recommended)**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `spbthooccjuddfywlaly`
3. **Click "SQL Editor"** (left sidebar)
4. **Click "New Query"**
5. **Copy and paste** the contents of `scripts/setup-initial-users.sql`
6. **Click "Run"**

**Option B: Using the Node.js Script**

If you want to use the script approach, you'll need to temporarily disable RLS:

1. In Supabase Dashboard > SQL Editor, run:
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

2. Then run the script:
```bash
node scripts/create-first-user.js
```

3. Re-enable RLS:
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### **Step 2: Test the Fix**

After creating the users, test the application:

1. **Start your React app**:
```bash
npm start
```

2. **Try logging in** with one of these test credentials:
   - **Test User**: `testuser.sundarisaj@gmail.com` / `password123`
   - **Admin User**: `admin.sundarisaj@gmail.com` / `admin123`

3. **The error should be resolved** and you should be able to log in successfully.

### **Step 3: Code Changes Made**

I've already updated the code to handle missing user profiles gracefully:

1. **`src/services/supabaseService.js`**:
   - Changed `.single()` to `.maybeSingle()` in `signIn()` and `getCurrentUser()`
   - Updated `updateProfile()` to create user if they don't exist
   - Added error handling for missing profiles

2. **`src/context/SupabaseAuthContext.js`**:
   - Updated `getUserRole()` to handle new user structure
   - Enhanced `isAuthenticated()` for better compatibility

## 🔍 **What Was Fixed**

### **Before (Causing Error)**:
```javascript
// This would fail if user doesn't exist in database
const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single(); // ❌ Fails with PGRST116 if no rows
```

### **After (Fixed)**:
```javascript
// This handles missing users gracefully
const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle(); // ✅ Returns null if no rows, doesn't fail
```

## 📋 **Next Steps**

1. **Run the SQL script** in Supabase Dashboard
2. **Test the login** with the provided credentials
3. **Create real users** through the application
4. **The error should be completely resolved**

## 🎉 **Expected Results**

After applying this fix:
- ✅ No more "JSON object requested" errors
- ✅ Users can log in successfully
- ✅ User profiles are created automatically if missing
- ✅ Admin and user roles work correctly
- ✅ Application functions normally

## 🆘 **If You Still Get Errors**

If you still encounter issues:

1. **Check the database**:
```bash
node scripts/diagnose-json-error.js
```

2. **Verify users exist**:
```sql
SELECT * FROM public.users;
```

3. **Check RLS policies**:
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

4. **Contact support** if the issue persists.

---

**🎯 The root cause was that the application expected user profiles to exist in the database, but the database was empty. This fix ensures the application handles missing profiles gracefully and provides a way to create initial users.** 