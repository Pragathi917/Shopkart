# ShopKart API Documentation

## Base URL
```
http://localhost:5000
```

## Health Check
```
GET /health
```

## Authentication
- JWT tokens are required for protected routes
- Include token in Authorization header: `Bearer <token>`
- Admin role required for admin-only endpoints

---

## User Endpoints

### Public Routes

#### User Signup
```
POST /api/users/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### User Login
```
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Routes (Requires Authentication)

#### Get User Profile
```
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update User Profile
```
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "password": "newpassword123"
}
```

### Admin Only Routes

#### Get All Users
```
GET /api/users
Authorization: Bearer <admin_token>
```

#### Get User by ID
```
GET /api/users/:id
Authorization: Bearer <admin_token>
```

#### Update User
```
PUT /api/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin"
}
```

#### Delete User
```
DELETE /api/users/:id
Authorization: Bearer <admin_token>
```

---

## Product Endpoints

### Public Routes

#### Get All Products (with pagination & search)
```
GET /api/products
Query Parameters:
- keyword: search term
- category: filter by category
- minPrice: minimum price
- maxPrice: maximum price
- pageNumber: page number (default: 1)
- pageSize: items per page (default: 10)
- sortBy: sort field (default: createdAt)
- sortOrder: asc/desc (default: desc)

Example: GET /api/products?keyword=laptop&category=electronics&pageNumber=1&pageSize=5
```

#### Get Product by ID
```
GET /api/products/:id
```

#### Get Top Rated Products
```
GET /api/products/top?limit=5
```

#### Get Product Categories
```
GET /api/products/categories
```

### Protected Routes

#### Create Product Review
```
POST /api/products/:id/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great product!"
}
```

### Admin Only Routes

#### Create Product
```
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "image": "/images/product.jpg",
  "category": "Electronics",
  "countInStock": 10,
  "brand": "BrandName"
}
```

#### Update Product
```
PUT /api/products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Product",
  "description": "Updated description",
  "price": 109.99,
  "countInStock": 15
}
```

#### Delete Product
```
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

---

## Order Endpoints

### Protected Routes

#### Create Order
```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderItems": [
    {
      "name": "Product Name",
      "qty": 2,
      "image": "/images/product.jpg",
      "price": 99.99,
      "product": "product_id"
    }
  ],
  "shippingAddress": {
    "address": "123 Main St",
    "city": "New York",
    "postalCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "PayPal",
  "itemsPrice": 199.98,
  "taxPrice": 20.00,
  "shippingPrice": 10.00,
  "totalPrice": 229.98
}
```

#### Get User's Orders
```
GET /api/orders/myorders
Authorization: Bearer <token>
Query Parameters:
- page: page number
- pageSize: items per page
- sortBy: sort field
- sortOrder: asc/desc
```

#### Get Order by ID
```
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Update Order to Paid
```
PUT /api/orders/:id/pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "payment_id",
  "status": "COMPLETED",
  "update_time": "2023-01-01T00:00:00Z",
  "payer": {
    "email_address": "user@example.com"
  }
}
```

### Admin Only Routes

#### Get All Orders
```
GET /api/orders
Authorization: Bearer <admin_token>
Query Parameters:
- page: page number
- pageSize: items per page
- sortBy: sort field
- sortOrder: asc/desc
- status: paid/unpaid/delivered/pending
```

#### Update Order Status
```
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "markPaid" // or "markDelivered"
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "stack": "..." // only in development
}
```

---

## Error Codes

- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Invalid or missing token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **500**: Internal Server Error - Server error

---

## Environment Variables

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=5000
PAYPAL_CLIENT_ID=your_paypal_client_id
FRONTEND_URL=http://localhost:3000
```