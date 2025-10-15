import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UnifiedAuthProvider, useAuthSystem } from './context/UnifiedAuthContext';
import { PaymentProvider } from './context/PaymentContext';
import { GuestCartProvider } from './context/GuestCartContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';

// Components
import TopBanner from './components/TopBanner';
import Header from './components/Header';
import EnhancedMegaMenu from './components/EnhancedMegaMenu';
import GlobalSearch from './components/GlobalSearch';
import Footer from './components/Footer';
import FloatingContactButton from './components/FloatingContactButton';

// Pages
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUserCreationPage from './pages/AdminUserCreationPage';
import AdminPaymentManager from './components/AdminPaymentManager';

function App() {
  return (
    <Router>
            <UnifiedAuthProvider>
        <PaymentProvider>
          <NotificationProvider>
            <LanguageProvider>
              <AccessibilityProvider>
                <CategoryProvider>
                  <ProductProvider>
                    <GuestCartProvider>
                      <CartProvider>
                        <AppRoutes />
                      </CartProvider>
                    </GuestCartProvider>
                  </ProductProvider>
                </CategoryProvider>
              </AccessibilityProvider>
            </LanguageProvider>
          </NotificationProvider>
        </PaymentProvider>
        </UnifiedAuthProvider>
    </Router>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, getUserRole } = useAuthSystem();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(getUserRole())) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Public Route Component (redirects if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, getUserRole } = useAuthSystem();
  
  if (isAuthenticated()) {
    if (getUserRole() === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/catalog" replace />;
    }
  }
  
  return children;
};

// App Routes Component (inside the provider hierarchy)
const AppRoutes = () => {
  const { user, isAuthenticated, getUserRole } = useAuthSystem();
  const location = useLocation();
  
  // Determine if we should show MegaMenu and GlobalSearch
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isAdminUser = isAuthenticated() && getUserRole() === 'admin';
  const isHomePage = location.pathname === '/';
  
  // Show mega menu only on catalog and product pages for regular users
  const showMegaMenu = !isAuthPage && !isAdminUser && !isHomePage;
  
  // Show search on home and catalog pages, but not for admin or auth pages
  const showGlobalSearch = !isAuthPage && !isAdminUser;
  
  return (
    <div className="App">
      <TopBanner />
      <Header />
      {showMegaMenu && <EnhancedMegaMenu />}
      {showGlobalSearch && <GlobalSearch />}
      <FloatingContactButton />
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          
          {/* Authentication Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } 
          />

          {/* Protected User Routes */}
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute allowedRoles={['user', 'staff']}>
                <CartPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['user', 'staff']}>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['user', 'staff']}>
                <UserDashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/create-user" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUserCreationPage />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
