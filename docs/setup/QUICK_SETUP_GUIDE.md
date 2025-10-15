# 🚀 Quick Setup Guide for SundariSaj Bridal Collection Schema

## Step 1: Go to Supabase SQL Editor

1. **Open your browser** and go to: https://supabase.com/dashboard
2. **Sign in** to your account
3. **Select your project**: `spbthooccjuddfywlaly`
4. **Click on "SQL Editor"** in the left sidebar

## Step 2: Run the Schema Setup

1. **Click "New Query"** in the SQL Editor
2. **Copy the entire content** from the file: `database/08-simple-schema-setup.sql`
3. **Paste it** into the SQL Editor
4. **Click "Run"** to execute the script

## Step 3: Verify the Setup

After running the script, you should see:
```
✅ Schema setup completed successfully!
📊 Sample data inserted: 5 products
```

## Step 4: Test the Connection

Run this command in your terminal:
```bash
node test-supabase-connection.js
```

**Expected Output:**
```
✅ Schema exists and is accessible!
✅ Products table accessible!
✅ Authentication service is working
🎉 All tests passed! Your Supabase integration is ready.
```

## 🆘 If You Get Errors

### Error: "column reference is ambiguous"
- **Solution**: The schema setup script is designed to handle this automatically
- **Action**: Just run the script as is

### Error: "relation does not exist"
- **Solution**: Make sure you ran the entire script from `database/08-simple-schema-setup.sql`
- **Action**: Check that all tables were created successfully

### Error: "permission denied"
- **Solution**: Make sure you're using the correct API keys
- **Action**: Verify your project is active and not paused

## 📋 What Gets Created

✅ **Schema**: `sundarisaj_bridal_collection`  
✅ **Tables**: users, products, orders, cart_items, notifications  
✅ **Sample Data**: 5 bridal jewelry products  
✅ **ENUM Types**: user_role, product_category, product_type, etc.  
✅ **Indexes**: For better performance  

## 🎯 Next Steps

Once the schema is set up and tests pass:
1. Update your React app to use Supabase contexts
2. Test the application functionality
3. Migrate existing data from localStorage

---

**Need help?** Check the documentation: `documents/16-Supabase-Integration-Complete-Guide.md` 