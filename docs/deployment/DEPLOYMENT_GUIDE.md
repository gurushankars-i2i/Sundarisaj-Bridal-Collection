# 🚀 SundariSaj Bridal Collection - Deployment Guide

## 📋 Overview
This guide will help you deploy the SundariSaj Bridal Collection application with full Supabase integration for live usage.

## 🎯 Prerequisites
- Node.js 18+ installed
- Git repository access
- Supabase account
- Domain name (optional)

## 📦 Step 1: Database Setup

### 1.1 Run Schema Setup
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `huefhxldlkbjltzlcbuo`
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire content from `database/12-correct-schema-setup.sql`
6. Click "Run"

### 1.2 Insert Test Data
1. In the same SQL Editor, create a new query
2. Copy and paste the entire content from `database/14-simple-test-data.sql`
3. Click "Run"

### 1.3 Verify Database Setup
```bash
node test-supabase-connection.js
```
Expected output: All tests should pass ✅

## 🔧 Step 2: Environment Configuration

### 2.1 Create Environment File
Create `.env` file in the root directory:
```env
REACT_APP_SUPABASE_URL=https://huefhxldlkbjltzlcbuo.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZWZoeGxkbGtiamx0emxjYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMjg4MjEsImV4cCI6MjA2OTcwNDgyMX0.Xoc5U-43rZzgUsyGJ-5pomsWykka7xgTwRs4IWq2kb0
REACT_APP_ENVIRONMENT=production
```

### 2.2 Update Package.json
Ensure your `package.json` has the correct scripts:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## 🏗️ Step 3: Application Updates

### 3.1 Update App.js
The application now uses Supabase contexts by default. The main App.js should include:

```javascript
import { SupabaseAuthProvider } from './context/SupabaseAuthContext';
import { SupabaseProductProvider } from './context/SupabaseProductContext';
import { SupabaseCartProvider } from './context/SupabaseCartContext';
```

### 3.2 Test Application Locally
```bash
npm install
npm start
```

## 🌐 Step 4: Deployment Options

### Option A: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

### Option B: Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `build`

### Option C: Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

### Option D: AWS Amplify
1. Connect your repository
2. Build settings:
   - Build command: `npm run build`
   - Output directory: `build`

## 🔐 Step 5: Security Configuration

### 5.1 Supabase RLS Policies
The database already has Row Level Security (RLS) enabled with appropriate policies:
- Users can only access their own data
- Products are publicly readable
- Only admins can modify products
- Cart items are user-specific

### 5.2 Environment Variables
Ensure all environment variables are set in your deployment platform:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_ENVIRONMENT`

## 📊 Step 6: Testing Checklist

### 6.1 User Authentication
- [ ] User registration
- [ ] User login/logout
- [ ] Profile updates
- [ ] Password reset

### 6.2 Product Management
- [ ] Product listing
- [ ] Product search
- [ ] Category filtering
- [ ] Product details

### 6.3 Shopping Cart
- [ ] Add to cart
- [ ] Remove from cart
- [ ] Update quantities
- [ ] Cart total calculation

### 6.4 Order Management
- [ ] Place orders
- [ ] Order history
- [ ] Order status updates
- [ ] Admin order management

### 6.5 Admin Features
- [ ] Product management
- [ ] User management
- [ ] Order management
- [ ] Reports and analytics

## 👥 Step 7: User Roles and Access

### 7.1 Test Users Created
The database includes test users for each role:

#### Admin Users
- **Email**: priya.sharma@example.com
- **Email**: rajesh.kumar@example.com
- **Role**: admin

#### Staff Users
- **Email**: anjali.patel@example.com
- **Email**: vikram.singh@example.com
- **Email**: meera.reddy@example.com
- **Role**: staff

#### Regular Users
- **Email**: arun.kumar@example.com
- **Email**: lakshmi.devi@example.com
- **Email**: suresh.menon@example.com
- **Email**: geetha.iyer@example.com
- **Email**: ramesh.pillai@example.com
- **Email**: kavitha.nair@example.com
- **Email**: mohan.das@example.com
- **Email**: radha.krishnan@example.com
- **Email**: venkatesh.rao@example.com
- **Email**: shanti.devi@example.com
- **Role**: user

### 7.2 Sample Products
- **30+ products** across all categories
- **Different images** for each product
- **Various price ranges** for testing
- **Rental and sale options**

## 📈 Step 8: Monitoring and Analytics

### 8.1 Supabase Analytics
- Monitor database performance
- Track user authentication
- Review error logs

### 8.2 Application Monitoring
- Set up error tracking (Sentry recommended)
- Monitor user interactions
- Track conversion rates

## 🔄 Step 9: Maintenance

### 9.1 Regular Backups
- Enable Supabase automatic backups
- Export data periodically
- Test restore procedures

### 9.2 Updates
- Keep dependencies updated
- Monitor security advisories
- Test updates in staging environment

## 🚨 Step 10: Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Test connection
node test-supabase-connection.js
```

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Environment Variables
- Ensure all variables are set in deployment platform
- Check for typos in variable names
- Verify Supabase URL and key

#### RLS Policy Issues
- Check user authentication status
- Verify user roles and permissions
- Review RLS policies in Supabase dashboard

## 📞 Support

### Contact Information
- **Technical Support**: Check Supabase documentation
- **Application Issues**: Review error logs
- **Deployment Issues**: Contact your hosting provider

### Useful Links
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ All tests pass
- ✅ Users can register and login
- ✅ Products display correctly
- ✅ Shopping cart works
- ✅ Orders can be placed
- ✅ Admin features are accessible
- ✅ No console errors
- ✅ Responsive design works
- ✅ Performance is acceptable

## 🚀 Go Live Checklist

- [ ] Database setup complete
- [ ] Test data inserted
- [ ] Environment variables configured
- [ ] Application builds successfully
- [ ] All features tested
- [ ] Security policies reviewed
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team trained on admin features

---

**🎊 Congratulations! Your SundariSaj Bridal Collection application is ready for live usage!** 