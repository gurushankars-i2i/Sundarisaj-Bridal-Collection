# 🔐 Hybrid Authentication System

This application now supports both **localStorage** and **Supabase** authentication systems, allowing developers to choose the appropriate system based on their needs.

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env` file in your project root:

```bash
# Authentication System Selection
REACT_APP_AUTH_SYSTEM=localStorage
# Options: localStorage, supabase

# Supabase Configuration (only used when REACT_APP_AUTH_SYSTEM=supabase)
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Feature Flags
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_GUEST_CART=true
REACT_APP_ENABLE_ROLE_BASED_ACCESS=true
```

### 2. Switch Authentication Systems

#### For Development:
```javascript
import { useAuthSystem } from './context/UnifiedAuthContext';

const { switchToLocalStorage, switchToSupabase } = useAuthSystem();

// Switch to localStorage
switchToLocalStorage();

// Switch to Supabase
switchToSupabase();
```

#### For Production:
Change the `REACT_APP_AUTH_SYSTEM` environment variable and rebuild.

## 🔧 How It Works

### UnifiedAuthContext
- **Automatically detects** which auth system to use based on environment
- **Provides consistent API** regardless of the underlying system
- **Easy to extend** for new authentication providers

### Current Implementation
- **localStorage**: Fully implemented and working
- **Supabase**: Framework ready, easy to implement

## 📁 File Structure

```
src/
├── context/
│   ├── UnifiedAuthContext.js      # Main unified context
│   ├── LocalStorageAuthContext.js # localStorage implementation
│   └── SupabaseAuthContext.js     # Supabase implementation (ready)
├── config/
│   └── authConfig.js              # Configuration management
└── components/                     # All components use useAuthSystem()
```

## 🎯 Usage in Components

```javascript
import { useAuthSystem } from '../context/UnifiedAuthContext';

const MyComponent = () => {
    const { 
        user, 
        login, 
        logout, 
        isAuthenticated,
        authSystem,  // 'localStorage' or 'supabase'
        config       // Full configuration object
    } = useAuthSystem();

    // Your component logic here
    // Works the same regardless of auth system!
};
```

## 🔄 Switching Between Systems

### Development Mode
```javascript
// In any component
const { switchToLocalStorage, switchToSupabase } = useAuthSystem();

// Add buttons to your UI
<button onClick={switchToLocalStorage}>Use localStorage</button>
<button onClick={switchToSupabase}>Use Supabase</button>
```

### Production Mode
1. Update `.env` file
2. Rebuild application
3. Deploy with new configuration

## 🚀 Benefits

1. **Flexibility**: Choose the right system for your use case
2. **Development**: Use localStorage for quick development
3. **Production**: Use Supabase for production deployments
4. **Consistency**: Same API regardless of system
5. **Easy Migration**: Switch systems without changing component code

## 🔮 Future Extensions

The system is designed to easily support:
- **Firebase Authentication**
- **Auth0**
- **Custom JWT systems**
- **OAuth providers**

Just implement the provider interface and add it to the UnifiedAuthProvider!

## 📝 Notes

- **localStorage**: Perfect for development, demos, and offline-first apps
- **Supabase**: Great for production apps with real-time features
- **Both systems** maintain the same user experience
- **Demo accounts** work in both systems
- **All features** (cart, notifications, etc.) work seamlessly

---

**Current Status**: ✅ localStorage fully working, Supabase framework ready! 