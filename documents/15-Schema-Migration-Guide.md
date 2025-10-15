# Schema Migration Guide: Moving from Public to sundarisaj_bridal_collection

## 🎯 **Cultural Commerce Migration Context**

This guide details the migration of your Supabase tables from the default `public` schema to the enhanced **`sundarisaj_bridal_collection`** schema, purpose-built for the SundariSaj Bridal Collection. This schema supports advanced cultural commerce features, including multi-language support, cultural event scheduling, regional preferences, and sophisticated rental management for Indian bridal jewelry.

## 🚨 **Current Situation**
You have tables in the `public` schema that need to be migrated to the `sundarisaj_bridal_collection` schema to enable full cultural commerce capabilities.

## 📋 **Step-by-Step Cultural Migration Process**

### **Step 1: Verify Current State**
First, run the verification script to see what exists in both schemas:

```sql
-- Run this in Supabase SQL Editor
-- File: database/05-verify-schema-migration.sql
```

This will show you:
- Which tables exist in `public` schema
- Which tables exist in `sundarisaj_bridal_collection` schema
- Data counts in both schemas
- Recommendations for next steps
- Cultural enums and region mapping status

### **Step 2: Run Cultural Migration Script**
If you have data in the `public` schema that needs to be moved:

```sql
-- Run this in Supabase SQL Editor
-- File: database/03-migrate-to-cultural-schema.sql
```

This script will:
1. ✅ Create the `sundarisaj_bridal_collection` schema
2. ✅ Create all ENUM types for cultural categories, events, and regions
3. ✅ Create all tables in the new schema with cultural fields
4. ✅ Copy all data from `public` to `sundarisaj_bridal_collection`, mapping cultural fields
5. ✅ Create indexes and triggers for cultural queries
6. ✅ Set up Row Level Security (RLS) with cultural context
7. ✅ Create utility functions for cultural business logic

### **Step 3: Verify Cultural Migration Success**
After running the migration, verify it worked:

```sql
-- Check data in new schema
SELECT 'users' as table_name, COUNT(*) as record_count 
FROM sundarisaj_bridal_collection.users
UNION ALL
SELECT 'products' as table_name, COUNT(*) as record_count 
FROM sundarisaj_bridal_collection.products
UNION ALL
SELECT 'orders' as table_name, COUNT(*) as record_count 
FROM sundarisaj_bridal_collection.orders;
```

- Confirm that cultural fields (category, region, event) are populated
- Validate multi-language and regional data

### **Step 4: Clean Up Old Tables (Optional)**
Once you've confirmed the migration worked, remove old tables:

```sql
-- Run this in Supabase SQL Editor
-- File: database/04-cleanup-public-schema.sql
```

⚠️ **WARNING**: Only run this after confirming the migration was successful!

## 🔧 **What Each Script Does (Cultural Edition)**

### **`database/03-migrate-to-cultural-schema.sql`**
- **Purpose**: Migrate all data from `public` to `sundarisaj_bridal_collection` with cultural mapping
- **Safety**: Uses `IF NOT EXISTS` and `WHERE NOT EXISTS` to prevent duplicates
- **Comprehensive**: Handles tables, data, indexes, triggers, functions, and cultural enums
- **Cultural Mapping**: Maps existing data to new cultural fields (category, region, event)

### **`database/04-cleanup-public-schema.sql`**
- **Purpose**: Remove old tables from `public` schema
- **Safety**: Verifies data exists in new schema before cleanup
- **Verification**: Confirms cleanup was successful

### **`database/05-verify-schema-migration.sql`**
- **Purpose**: Check current state of both schemas
- **Analysis**: Shows what exists where and provides recommendations
- **Diagnostic**: Helps troubleshoot migration issues, including cultural field mapping

## 🎯 **Expected Results (Cultural Commerce)**

### **Before Migration:**
```
public schema: users, products, orders, etc.
sundarisaj_bridal_collection schema: empty
```

### **After Migration:**
```
public schema: users, products, orders, etc. (old data)
sundarisaj_bridal_collection schema: users, products, orders, etc. (copied data with cultural fields)
```

### **After Cleanup:**
```
public schema: empty (old tables removed)
sundarisaj_bridal_collection schema: users, products, orders, etc. (all data, cultural fields enabled)
```

## 🚀 **Quick Cultural Migration Commands**

### **Option 1: Full Cultural Migration (Recommended)**
```sql
-- 1. Verify current state
-- Run: database/05-verify-schema-migration.sql

-- 2. Migrate data with cultural mapping
-- Run: database/03-migrate-to-cultural-schema.sql

-- 3. Verify migration
-- Check data counts and cultural fields in new schema

-- 4. Clean up (optional)
-- Run: database/04-cleanup-public-schema.sql
```

### **Option 2: Fresh Cultural Start**
If you want to start fresh and don't need the old data:

```sql
-- 1. Drop old tables from public schema
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.user_addresses CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Create new cultural schema with sample data
-- Run: database/01-fixed-consolidated-schema.sql
```

## 🔍 **Cultural Migration Troubleshooting**

### **Issue: "Schema already exists"**
- **Solution**: This is normal, the script uses `CREATE SCHEMA IF NOT EXISTS`

### **Issue: "Table already exists"**
- **Solution**: The migration script uses `IF NOT EXISTS` and won't overwrite existing data

### **Issue: "No data copied"**
- **Solution**: Check if source tables have data, run verification script first

### **Issue: "Permission denied"**
- **Solution**: Make sure you're using the correct Supabase role (anon or service_role)

### **Issue: "Cultural fields missing"**
- **Solution**: Ensure migration script includes mapping for category, region, and event fields

## 📞 **Need Help? (Cultural Commerce Edition)**

If you encounter any issues:

1. **Run the verification script** to see the current state
2. **Check the error messages** in Supabase SQL Editor
3. **Verify your Supabase credentials** are correct
4. **Check cultural field mapping in migration script**
5. **Contact support** with the specific error message

## ✅ **Cultural Migration Success Checklist**

- [ ] Verification script shows tables in `public` schema
- [ ] Migration script runs without errors
- [ ] Data counts match between old and new schemas
- [ ] Cultural fields (category, region, event) are populated
- [ ] Application connects to new cultural schema successfully
- [ ] Cleanup script removes old tables (optional)
- [ ] All functionality works with new schema
- [ ] Multi-language and regional features work
- [ ] Cultural event scheduling and rental system functional

---

**Next Steps**: After successful migration, update your application configuration to use the new `sundarisaj_bridal_collection` schema, test all cultural commerce functionality, and validate with cultural event planners and regional users!

This migration guide ensures your SundariSaj Bridal Collection platform is ready for exemplary cultural commerce, supporting Indian wedding traditions, regional preferences, and multi-language excellence! 🎭💎 