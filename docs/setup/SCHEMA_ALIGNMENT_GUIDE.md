# 🔧 Schema Alignment Guide - Fix Database Conflicts

## 🎯 **The Problem**
There are conflicts between your database schema and the application's data structure:

### **Database Schema Issues:**
- ❌ **Users table**: Uses `first_name`, `last_name` but app uses `name`
- ❌ **Users table**: Uses `UUID` for ID but app uses `VARCHAR` like "u1"
- ❌ **Products table**: Uses `stock_quantity` but app uses `stock`
- ❌ **Products table**: Missing fields like `sale_price`, `weight`, `dimensions`, etc.
- ❌ **Products table**: Uses `UUID` for ID but app uses `INTEGER`
- ❌ **Categories/Types**: Don't match the application's exact values

### **Application Structure (Correct):**
```json
// Users
{
  "id": "u1",                    // VARCHAR, not UUID
  "name": "Arun Kumar",          // Single name field, not first_name/last_name
  "email": "arun.kumar@example.com",
  "phone": "9876543210",
  "address": "123, Bazaar Street..."
}

// Products
{
  "id": 1,                       // INTEGER, not UUID
  "name": "Traditional Kundan Necklace Set",
  "category": "Necklaces",       // Exact category names
  "type": "Antique",             // Exact type names
  "price": 30139,
  "rentalPricePerDay": 3013,     // Matches rental_price_per_day
  "salePrice": 24111,            // Missing in DB
  "stock": 3,                    // Matches stock_quantity
  "isForRent": false,            // Matches is_for_rent
  "isForSale": true,             // Matches is_for_sale
  "isNew": false,                // Matches is_new
  "isBestSeller": true,          // Matches is_best_seller
  "weight": "45.87",             // Missing in DB
  "dimensions": "10.4cm x 3.0cm", // Missing in DB
  "material": "Antique",         // Missing in DB
  // ... more fields
}
```

## 🚀 **The Solution**

### **Step 1: Run the Aligned Schema Setup**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `spbthooccjuddfywlaly`
3. **Click "SQL Editor"** (left sidebar)
4. **Click "New Query"**
5. **Copy the entire content** from: `database/10-aligned-schema-setup.sql`
6. **Paste and click "Run"**

### **Step 2: If You Already Have Data (Migration)**

If you already have data in your database:

1. **Backup your data** first (if needed)
2. **Run the migration script**: `database/11-migrate-to-aligned-schema.sql`
3. **This will recreate the schema** with the correct structure

### **Step 3: Verify the Alignment**

Run the test script:
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

## 📋 **What Gets Fixed**

### **Users Table:**
- ✅ `id`: VARCHAR(50) instead of UUID
- ✅ `name`: Single field instead of first_name/last_name
- ✅ `address`: Added to match app structure
- ✅ `password_hash`: Made optional for existing data

### **Products Table:**
- ✅ `id`: INTEGER instead of UUID
- ✅ `stock`: Renamed from stock_quantity
- ✅ `sale_price`: Added to match app
- ✅ `image`: Added for main image URL
- ✅ `is_for_rent`: Matches app's isForRent
- ✅ `is_for_sale`: Matches app's isForSale
- ✅ `is_new`: Matches app's isNew
- ✅ `is_best_seller`: Matches app's isBestSeller
- ✅ `weight`, `dimensions`, `material`, `craftsmanship`, `certification`, `warranty`, `return_policy`, `shipping_time`: All added

### **Categories & Types:**
- ✅ **Categories**: "Necklaces", "Earrings", "Bangles", etc. (exact match)
- ✅ **Types**: "Antique", "Polki", "Kundan", etc. (exact match)

### **Relationships:**
- ✅ **Orders**: `user_id` now VARCHAR(50) to match users.id
- ✅ **Cart Items**: `user_id` and `product_id` updated to match
- ✅ **Notifications**: `user_id` updated to match

## 🔄 **Next Steps After Alignment**

1. **Update your React app** to use the new Supabase contexts
2. **Test all functionality** with the aligned schema
3. **Migrate existing localStorage data** to Supabase
4. **Verify all features work** correctly

## 🎯 **Benefits of Alignment**

- ✅ **No more data mapping issues**
- ✅ **Direct field access** without transformations
- ✅ **Consistent data types** across app and database
- ✅ **Better performance** with proper indexes
- ✅ **Easier maintenance** and debugging

## 🆘 **Need Help?**

- **Check the test output** for specific error messages
- **Verify your Supabase project** is active
- **Ensure you're using the correct API keys**
- **Check the documentation**: `documents/16-Supabase-Integration-Complete-Guide.md`

---

**Ready to fix the conflicts? Run the aligned schema setup script!** 🚀 