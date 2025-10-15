# 🔧 Schema Conflict Fix Guide

## 🎯 **Problem Identified**

There are conflicts between the database schema and application field names:

### **Database Schema vs Application Usage:**

| **Database Field** | **Application Field** | **Status** |
|-------------------|---------------------|------------|
| `rental_price_per_day` | `rentalPricePerDay` | ✅ Correct |
| `price` | `price` | ✅ Correct |
| `sale_price` | `salePrice` | ❌ Missing in DB |
| `stock_quantity` | `stock` | ❌ Wrong name |
| `is_best_seller` | `isBestSeller` | ✅ Correct |
| `is_new_arrival` | `isNew` | ❌ Wrong name |
| `is_for_rent` | `isForRent` | ❌ Missing in DB |
| `is_for_sale` | `isForSale` | ❌ Missing in DB |

## 🚀 **Solution: Complete Fix**

### **Step 1: Run the Fixed Schema Setup**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `spbthooccjuddfywlaly`
3. **Click "SQL Editor"** (left sidebar)
4. **Click "New Query"**
5. **Copy and paste the content from**: `database/10-fixed-schema-setup.sql`
6. **Click "Run"**

### **Step 2: If You Already Have Data, Run Migration**

If you already have the old schema with data:

1. **Create another query** in SQL Editor
2. **Copy and paste the content from**: `database/11-migrate-to-correct-schema.sql`
3. **Click "Run"**

### **Step 3: Verify the Fix**

Run the test script:
```bash
node test-supabase-connection.js
```

**Expected Output:**
```
✅ Schema exists and is accessible!
✅ Products table accessible!
✅ All tables working correctly
🎉 All tests passed! Your Supabase integration is ready.
```

## 📋 **What Gets Fixed**

### **Database Schema Updates:**

✅ **Added Missing Fields:**
- `sale_price` (DECIMAL) - for sale price
- `image` (VARCHAR) - main product image
- `is_for_rent` (BOOLEAN) - available for rent
- `is_for_sale` (BOOLEAN) - available for sale
- `weight` (VARCHAR) - product weight
- `dimensions` (VARCHAR) - product dimensions
- `material` (VARCHAR) - product material
- `craftsmanship` (VARCHAR) - craftsmanship type
- `certification` (VARCHAR) - certification info
- `warranty` (VARCHAR) - warranty period
- `return_policy` (VARCHAR) - return policy
- `shipping_time` (VARCHAR) - shipping time

✅ **Renamed Fields:**
- `stock_quantity` → `stock`
- `is_new_arrival` → `is_new`

✅ **Updated Sample Data:**
- 5 products with complete information
- Proper pricing (price, rental_price_per_day, sale_price)
- Correct boolean flags (is_for_rent, is_for_sale, is_new, is_best_seller)
- Complete product details (weight, dimensions, material, etc.)

### **Application Updates:**

✅ **Field Mapping System:**
- Automatic conversion between DB and app field names
- Handles all field name differences
- Maintains backward compatibility

✅ **Updated Context Providers:**
- `SupabaseProductContext` uses correct field mapping
- All CRUD operations work with proper field names
- Search and filtering work correctly

## 🔄 **Field Mapping System**

The application now includes a field mapping system that automatically converts between database and application field names:

### **Database → Application:**
```javascript
rental_price_per_day → rentalPricePerDay
sale_price → salePrice
stock_quantity → stock
is_for_rent → isForRent
is_for_sale → isForSale
is_new → isNew
is_best_seller → isBestSeller
```

### **Application → Database:**
```javascript
rentalPricePerDay → rental_price_per_day
salePrice → sale_price
stock → stock_quantity
isForRent → is_for_rent
isForSale → is_for_sale
isNew → is_new
isBestSeller → is_best_seller
```

## 🧪 **Testing the Fix**

### **Test 1: Schema Connection**
```bash
node test-supabase-connection.js
```

### **Test 2: Application Integration**
1. Start the React app: `npm start`
2. Navigate to catalog page
3. Check if products load correctly
4. Verify rent/sale options work
5. Test product details page

### **Test 3: Data Consistency**
1. Check if all product fields display correctly
2. Verify pricing calculations work
3. Test search and filtering
4. Confirm best sellers and new arrivals show correctly

## 🎯 **Expected Results**

After the fix:

✅ **Database Schema:**
- All required fields exist
- Field names match application expectations
- Sample data is complete and accurate

✅ **Application:**
- Products load without errors
- All field mappings work correctly
- Rent/sale functionality works
- Search and filtering work
- Best sellers and new arrivals display correctly

✅ **Integration:**
- No more field name conflicts
- Seamless data flow between DB and app
- All features work as expected

## 🆘 **Troubleshooting**

### **If Migration Fails:**
1. Check if the schema exists
2. Verify you have the correct permissions
3. Run the setup scripts in order

### **If Application Still Shows Errors:**
1. Clear browser cache
2. Restart the React development server
3. Check browser console for specific errors

### **If Data Doesn't Load:**
1. Verify the schema was created correctly
2. Check if sample data was inserted
3. Test the connection with the test script

## 📚 **Next Steps**

After fixing the schema conflicts:

1. **Update App.js** to use Supabase contexts
2. **Test all application features**
3. **Migrate existing localStorage data**
4. **Deploy the application**

---

**Need help?** Check the documentation: `documents/16-Supabase-Integration-Complete-Guide.md` 