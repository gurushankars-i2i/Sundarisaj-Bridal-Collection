-- =====================================================
-- SUNDARISAJ BRIDAL COLLECTION - CONSOLIDATED SCHEMA
-- Aligned with application data schema and public schema only
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (Aligned with src/data/user.json schema)
-- =====================================================

-- Drop existing tables to ensure clean setup
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table aligned with application schema
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL, -- Single name field as per application schema
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'staff')),
    address TEXT, -- Full address as string as per application schema
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_blocked BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CATEGORIES TABLE (Aligned with src/data/categories.json schema)
-- =====================================================

CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY, -- Integer ID as per application schema
    name VARCHAR(100) UNIQUE NOT NULL,
    image VARCHAR(500), -- image field as per application schema
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE (Aligned with src/data/products.json schema)
-- =====================================================

CREATE TABLE public.products (
    id SERIAL PRIMARY KEY, -- Integer ID as per application schema
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    rental_price_per_day DECIMAL(10,2) DEFAULT 0,
    sale_price DECIMAL(10,2), -- salePrice field as per application schema
    stock INTEGER DEFAULT 0, -- stock field as per application schema
    images TEXT[], -- Array of image URLs
    image VARCHAR(500), -- Single image field as per application schema
    is_for_rent BOOLEAN DEFAULT false, -- isForRent field
    is_for_sale BOOLEAN DEFAULT true, -- isForSale field
    is_new BOOLEAN DEFAULT false, -- isNew field
    is_best_seller BOOLEAN DEFAULT false, -- isBestSeller field
    weight VARCHAR(50), -- weight field as per application schema
    dimensions VARCHAR(100), -- dimensions field as per application schema
    material VARCHAR(100), -- material field as per application schema
    craftsmanship VARCHAR(100), -- craftsmanship field as per application schema
    certification VARCHAR(100), -- certification field as per application schema
    warranty VARCHAR(100), -- warranty field as per application schema
    return_policy VARCHAR(100), -- returnPolicy field as per application schema
    shipping_time VARCHAR(100), -- shippingTime field as per application schema
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CART_ITEMS TABLE
-- =====================================================

CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_rental BOOLEAN DEFAULT false,
    rental_days INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded')),
    total_amount DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partial_refund')),
    shipping_address JSONB,
    billing_address JSONB,
    pickup_point VARCHAR(255),
    admin_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER_ITEMS TABLE
-- =====================================================

CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_rental BOOLEAN DEFAULT false,
    rental_days INTEGER DEFAULT 1,
    rental_price_per_day DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON public.products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON public.products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_for_sale ON public.products(is_for_sale);
CREATE INDEX IF NOT EXISTS idx_products_is_for_rent ON public.products(is_for_rent);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Cart items indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view active categories" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- Cart items policies
CREATE POLICY "Users can manage their own cart items" ON public.cart_items
    FOR ALL USING (user_id::text = auth.uid()::text);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create their own orders" ON public.orders
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- Order items policies
CREATE POLICY "Users can view their own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_items.order_id AND user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Admins can view all order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample categories
INSERT INTO public.categories (id, name, image) VALUES
(1, 'Traditional', 'https://images.pexels.com/photos/943144/pexels-photo-943144.jpeg?auto=compress&cs=tinysrgb&w=400'),
(2, 'Kundan', 'https://images.pexels.com/photos/1029337/pexels-photo-1029337.jpeg?auto=compress&cs=tinysrgb&w=400'),
(3, 'Modern', 'https://images.pexels.com/photos/265947/pexels-photo-265947.jpeg?auto=compress&cs=tinysrgb&w=400')
ON CONFLICT (id) DO NOTHING;

-- Insert sample admin user
INSERT INTO public.users (id, email, name, role, address, phone) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@sundarisaj.com', 'Admin User', 'admin', '123 Admin Street, Chennai, Tamil Nadu, 600001', '9876543210')
ON CONFLICT (id) DO NOTHING;

-- Insert sample regular user
INSERT INTO public.users (id, email, name, role, address, phone) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'user@sundarisaj.com', 'Regular User', 'user', '456 User Street, Chennai, Tamil Nadu, 600002', '9876543211')
ON CONFLICT (id) DO NOTHING;

-- Insert sample products (first 5 from products.json)
INSERT INTO public.products (id, name, description, category, type, price, rental_price_per_day, sale_price, stock, images, image, is_for_rent, is_for_sale, is_new, is_best_seller, weight, dimensions, material, craftsmanship, certification, warranty, return_policy, shipping_time) VALUES
(1, 'Traditional Kundan Necklace Set', 'Exquisite antique necklaces perfect for bridal occasions. Handcrafted with traditional techniques and modern design elements.', 'Necklaces', 'Antique', 30139.00, 3013.00, 24111.00, 3, ARRAY['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&h=500&fit=crop'], 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&h=500&fit=crop', false, true, false, true, '45.87', '10.4cm x 3.0cm', 'Antique', 'Handcrafted', 'BIS Hallmarked', '1 Year', '7 Days', '2-3 Business Days'),
(2, 'Royal Polki Necklace', 'Exquisite antique necklaces perfect for bridal occasions. Handcrafted with traditional techniques and modern design elements.', 'Necklaces', 'Antique', 17431.00, 1743.00, 13944.00, 4, ARRAY['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop'], 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&h=500&fit=crop', true, true, false, true, '18.03', '5.3cm x 4.5cm', 'Antique', 'Handcrafted', 'BIS Hallmarked', '1 Year', '7 Days', '2-3 Business Days'),
(3, 'Antique Gold Necklace', 'Exquisite polki necklaces perfect for bridal occasions. Handcrafted with traditional techniques and modern design elements.', 'Necklaces', 'Polki', 22946.00, 2294.00, 18356.00, 2, ARRAY['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&h=500&fit=crop'], 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&h=500&fit=crop', true, false, false, true, '26.94', '5.4cm x 6.4cm', 'Polki', 'Handcrafted', 'BIS Hallmarked', '1 Year', '7 Days', '2-3 Business Days'),
(4, 'Pearl Drop Necklace', 'Exquisite kundan necklaces perfect for bridal occasions. Handcrafted with traditional techniques and modern design elements.', 'Necklaces', 'Kundan', 34937.00, 3493.00, 27949.00, 7, ARRAY['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&h=500&fit=crop'], 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&h=500&fit=crop', false, true, true, false, '32.15', '8.2cm x 4.1cm', 'Kundan', 'Handcrafted', 'BIS Hallmarked', '1 Year', '7 Days', '2-3 Business Days'),
(5, 'Diamond Studded Necklace', 'Exquisite diamond necklaces perfect for bridal occasions. Handcrafted with traditional techniques and modern design elements.', 'Necklaces', 'Diamond', 45678.00, 4567.00, 36542.00, 1, ARRAY['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&h=500&fit=crop'], 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&h=500&fit=crop', true, true, false, true, '28.45', '6.8cm x 5.2cm', 'Diamond', 'Handcrafted', 'BIS Hallmarked', '1 Year', '7 Days', '2-3 Business Days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'SUNDARISAJ BRIDAL COLLECTION - SCHEMA SETUP COMPLETE';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ All tables created in public schema';
    RAISE NOTICE '✅ Schema aligned with application data models';
    RAISE NOTICE '✅ RLS policies configured for security';
    RAISE NOTICE '✅ Indexes created for performance';
    RAISE NOTICE '✅ Sample data inserted';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Tables created:';
    RAISE NOTICE '   - users (aligned with user.json schema)';
    RAISE NOTICE '   - categories (aligned with categories.json schema)';
    RAISE NOTICE '   - products (aligned with products.json schema)';
    RAISE NOTICE '   - cart_items, orders, order_items, notifications';
    RAISE NOTICE '';
    RAISE NOTICE '👥 Sample users created:';
    RAISE NOTICE '   - Admin: admin@sundarisaj.com (role: admin)';
    RAISE NOTICE '   - User: user@sundarisaj.com (role: user)';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next steps:';
    RAISE NOTICE '   1. Disable email confirmation in Supabase Auth settings';
    RAISE NOTICE '   2. Test authentication with the sample users';
    RAISE NOTICE '   3. Verify product and category data';
    RAISE NOTICE '=====================================================';
END $$; 