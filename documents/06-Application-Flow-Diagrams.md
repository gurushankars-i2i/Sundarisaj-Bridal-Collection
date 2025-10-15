# SundariSaj Bridal Collection - Application Flow Diagrams

## 1. User Authentication Flow

```mermaid
flowchart TD
    A[User visits application] --> B{User authenticated?}
    B -->|No| C[Show public pages]
    B -->|Yes| D[Show authenticated pages]
    
    C --> E[User clicks Login]
    E --> F[Login Page]
    F --> G[User enters credentials]
    G --> H{Valid credentials?}
    H -->|No| I[Show error message]
    I --> G
    H -->|Yes| J[Store user in localStorage]
    J --> K[Redirect based on role]
    
    K --> L{User role?}
    L -->|Admin| M[Redirect to /admin]
    L -->|User| N[Redirect to /dashboard]
    L -->|Staff| O[Redirect to /dashboard]
    
    M --> P[Admin Dashboard]
    N --> Q[User Dashboard]
    O --> Q
    
    D --> R[User clicks Logout]
    R --> S[Clear localStorage]
    S --> T[Redirect to home]
    T --> C
```

## 2. Product Browsing Flow

```mermaid
flowchart TD
    A[User visits Homepage] --> B[View featured products]
    B --> C[Click on product]
    C --> D[Product Detail Page]
    
    D --> E[View product images]
    D --> F[Read product description]
    D --> G[Check pricing options]
    
    G --> H{Product available for?}
    H -->|Sale only| I[Show sale price]
    H -->|Rent only| J[Show rental options]
    H -->|Both| K[Show both options]
    
    I --> L[Select quantity]
    J --> M[Choose rental duration]
    K --> N[Choose purchase type]
    
    L --> O[Add to Cart]
    M --> O
    N --> O
    
    O --> P[Item added to cart]
    P --> Q[Continue shopping or checkout]
    
    Q --> R{Continue shopping?}
    R -->|Yes| A
    R -->|No| S[Go to Cart]
```

## 3. Shopping Cart Flow

```mermaid
flowchart TD
    A[User views Cart] --> B[Review cart items]
    B --> C{Cart empty?}
    C -->|Yes| D[Show empty cart message]
    C -->|No| E[Display cart items]
    
    E --> F[Show item details]
    F --> G[Display purchase type]
    G --> H[Show quantity]
    H --> I[Calculate total price]
    
    I --> J[User actions]
    J --> K{Action type?}
    
    K -->|Update quantity| L[Update item quantity]
    K -->|Remove item| M[Remove from cart]
    K -->|Continue shopping| N[Return to catalog]
    K -->|Proceed to checkout| O[Checkout process]
    
    L --> I
    M --> I
    N --> P[Product browsing]
    P --> A
    
    O --> Q[Review order details]
    Q --> R[Enter shipping info]
    R --> S[Enter billing info]
    S --> T[Review total]
    T --> U[Place order]
    U --> V[Order confirmation]
```

## 4. Admin Dashboard Flow

```mermaid
flowchart TD
    A[Admin logs in] --> B[Admin Dashboard]
    B --> C{Select action}
    
    C -->|Manage Products| D[Product Management]
    C -->|Manage Orders| E[Order Management]
    C -->|Manage Categories| F[Category Management]
    C -->|View Reports| G[Analytics Dashboard]
    
    D --> H{Product action?}
    H -->|Add Product| I[Product Form]
    H -->|Edit Product| J[Edit existing product]
    H -->|Delete Product| K[Delete confirmation]
    
    I --> L[Fill product details]
    L --> M[Upload images]
    M --> N[Set pricing]
    N --> O[Save product]
    
    J --> P[Load product data]
    P --> L
    
    K --> Q[Confirm deletion]
    Q --> R[Remove from database]
    
    E --> S{Order action?}
    S -->|View Orders| T[Order list]
    S -->|Update Status| U[Status update form]
    S -->|Process Refund| V[Refund process]
    
    T --> W[Filter orders]
    W --> X[View order details]
    
    U --> Y[Select new status]
    Y --> Z[Update order]
    
    V --> AA[Select order]
    AA --> BB[Enter refund amount]
    BB --> CC[Process refund]
```

## 5. User Dashboard Flow

```mermaid
flowchart TD
    A[User logs in] --> B[User Dashboard]
    B --> C{Select action}
    
    C -->|View Profile| D[Profile Management]
    C -->|View Orders| E[Order History]
    C -->|View Wishlist| F[Wishlist]
    C -->|Settings| G[Account Settings]
    
    D --> H[Display user info]
    H --> I{Edit profile?}
    I -->|Yes| J[Edit form]
    I -->|No| K[Return to dashboard]
    
    J --> L[Update information]
    L --> M[Save changes]
    M --> N[Profile updated]
    
    E --> O[Load order history]
    O --> P[Filter orders]
    P --> Q[View order details]
    Q --> R[Track order status]
    
    F --> S[Display wishlist]
    S --> T{Add to cart?}
    T -->|Yes| U[Move to cart]
    T -->|No| V[Continue browsing]
    
    G --> W[Account settings]
    W --> X[Change password]
    X --> Y[Update preferences]
    Y --> Z[Save settings]
```

## 6. Product Search and Filtering Flow

```mermaid
flowchart TD
    A[User visits Catalog] --> B[View all products]
    B --> C{Apply filters?}
    
    C -->|No| D[Display all products]
    C -->|Yes| E[Filter options]
    
    E --> F{Filter type?}
    F -->|Category| G[Select category]
    F -->|Price Range| H[Set price range]
    F -->|Product Type| I[Select type]
    F -->|Availability| J[Choose availability]
    
    G --> K[Filter by category]
    H --> L[Filter by price]
    I --> M[Filter by type]
    J --> N[Filter by availability]
    
    K --> O[Apply filters]
    L --> O
    M --> O
    N --> O
    
    O --> P[Display filtered results]
    P --> Q[Sort results]
    Q --> R[View product details]
    
    D --> S[Sort options]
    S --> T[Choose sort order]
    T --> U[Display sorted results]
    U --> R
```

## 7. Order Processing Flow

```mermaid
flowchart TD
    A[User places order] --> B[Validate order]
    B --> C{Order valid?}
    C -->|No| D[Show error message]
    C -->|Yes| E[Create order record]
    
    E --> F[Generate order number]
    F --> G[Calculate totals]
    G --> H[Check inventory]
    
    H --> I{Inventory available?}
    I -->|No| J[Show out of stock]
    I -->|Yes| K[Reserve inventory]
    
    K --> L[Process payment]
    L --> M{Payment successful?}
    M -->|No| N[Show payment error]
    M -->|Yes| O[Update order status]
    
    O --> P[Send confirmation email]
    P --> Q[Update inventory]
    Q --> R[Order confirmed]
    
    R --> S[Admin notification]
    S --> T[Order fulfillment]
    T --> U[Shipping process]
    U --> V[Delivery tracking]
```

## 8. Payment Processing Flow

```mermaid
flowchart TD
    A[User proceeds to checkout] --> B[Review order details]
    B --> C[Enter shipping address]
    C --> D[Enter billing address]
    D --> E[Select payment method]
    
    E --> F{Payment method?}
    F -->|Credit Card| G[Card details form]
    F -->|Debit Card| G
    F -->|UPI| H[UPI payment]
    F -->|Net Banking| I[Bank selection]
    
    G --> J[Validate card details]
    H --> K[Generate UPI QR]
    I --> L[Redirect to bank]
    
    J --> M{Card valid?}
    M -->|No| N[Show card error]
    M -->|Yes| O[Process payment]
    
    K --> P[User scans QR]
    P --> Q[Payment confirmation]
    
    L --> R[Bank authentication]
    R --> S[Payment processing]
    
    O --> T{Payment successful?}
    Q --> T
    S --> T
    
    T -->|No| U[Show payment failed]
    T -->|Yes| V[Payment confirmed]
    
    U --> W[Retry payment]
    W --> E
    
    V --> X[Update order status]
    X --> Y[Send confirmation]
```

## 9. Inventory Management Flow

```mermaid
flowchart TD
    A[Product added to cart] --> B[Check current inventory]
    B --> C{Sufficient stock?}
    C -->|No| D[Show low stock warning]
    C -->|Yes| E[Reserve inventory]
    
    E --> F[Update available quantity]
    F --> G[User completes purchase]
    G --> H[Finalize inventory reduction]
    
    H --> I[Update stock levels]
    I --> J[Check reorder threshold]
    
    J --> K{Below threshold?}
    K -->|Yes| L[Generate reorder alert]
    K -->|No| M[Continue normal operations]
    
    L --> N[Admin notification]
    N --> O[Reorder process]
    O --> P[Supplier order]
    P --> Q[Receive inventory]
    Q --> R[Update stock levels]
    
    D --> S{Continue anyway?}
    S -->|Yes| E
    S -->|No| T[Remove from cart]
```

## 10. User Registration Flow

```mermaid
flowchart TD
    A[User clicks Register] --> B[Registration form]
    B --> C[Enter personal details]
    C --> D[Enter email]
    D --> E[Create password]
    E --> F[Confirm password]
    
    F --> G{Passwords match?}
    G -->|No| H[Show password error]
    G -->|Yes| I[Validate email format]
    
    H --> E
    I --> J{Email valid?}
    J -->|No| K[Show email error]
    J -->|Yes| L[Check email availability]
    
    K --> D
    L --> M{Email available?}
    M -->|No| N[Show email taken error]
    M -->|Yes| O[Create user account]
    
    N --> D
    O --> P[Hash password]
    P --> Q[Save user data]
    Q --> R[Send welcome email]
    R --> S[Account created]
    S --> T[Redirect to login]
```

## 11. Error Handling Flow

```mermaid
flowchart TD
    A[Application error occurs] --> B{Error type?}
    
    B -->|Network Error| C[Show network error]
    B -->|Authentication Error| D[Redirect to login]
    B -->|Validation Error| E[Show validation message]
    B -->|Server Error| F[Show server error]
    B -->|Unknown Error| G[Show generic error]
    
    C --> H[Retry connection]
    D --> I[User re-authenticates]
    E --> J[User corrects input]
    F --> K[Contact support]
    G --> L[Refresh page]
    
    H --> M{Connection restored?}
    M -->|Yes| N[Continue operation]
    M -->|No| O[Show offline mode]
    
    I --> P{Authentication successful?}
    P -->|Yes| Q[Continue to protected page]
    P -->|No| R[Show login error]
    
    J --> S{Input valid?}
    S -->|Yes| T[Submit form]
    S -->|No| E
    
    K --> U[Log error details]
    U --> V[Show support contact]
    
    L --> W{Page loads?}
    W -->|Yes| X[Continue normally]
    W -->|No| Y[Show critical error]
```

## 12. Data Persistence Flow

```mermaid
flowchart TD
    A[User action triggers data change] --> B{Data type?}
    
    B -->|User preferences| C[Update localStorage]
    B -->|Cart items| D[Update cart storage]
    B -->|User session| E[Update session storage]
    B -->|Product data| F[Update product cache]
    
    C --> G[Save to localStorage]
    D --> H[Save cart to localStorage]
    E --> I[Update session data]
    F --> J[Update product cache]
    
    G --> K[Data persisted]
    H --> L[Cart persisted]
    I --> M[Session updated]
    J --> N[Cache updated]
    
    K --> O[Load on next visit]
    L --> P[Restore cart on reload]
    M --> Q[Maintain session]
    N --> R[Fast product loading]
    
    O --> S[User preferences restored]
    P --> T[Cart items restored]
    Q --> U[User stays logged in]
    R --> V[Quick product access]
```

These flow diagrams provide a comprehensive overview of all major application flows, helping developers understand the user journey and system interactions throughout the SundariSaj Bridal Collection e-commerce platform. 