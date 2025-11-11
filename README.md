# E-Commerce Full-Stack Application

A complete e-commerce website with backend and frontend, featuring cart, wishlist, filters, purchase options, discounts, and coupon functionality.

## Features

- ✅ User Authentication (Register/Login)
- ✅ Product Catalog with Search and Filters
- ✅ Add to Cart functionality
- ✅ Add to Wishlist functionality
- ✅ Advanced Filtering (Category, Brand, Price Range, Sort)
- ✅ Different Purchase Options for Products
- ✅ Discount System (Original Price vs Current Price)
- ✅ Coupon Code System with Validation
- ✅ Order Management
- ✅ Responsive Modern UI

## Tech Stack

### Backend
- Node.js with Express.js
- **MongoDB** with Mongoose ODM
- JWT Authentication
- bcryptjs for password hashing
- 100+ diverse products across multiple categories

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- React Context API for state management
- Modern CSS with responsive design

## Project Structure

```
eCom/
├── server/              # Backend API
│   ├── index.js        # Main server file
│   ├── models/         # MongoDB models (User, Product, Cart, etc.)
│   ├── config/         # Database configuration
│   ├── seed.js         # Database seeding script
│   └── package.json
├── client/             # Frontend React App
│   ├── public/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── context/    # Context providers
│   │   └── utils/      # Utility functions
│   └── package.json
└── package.json        # Root package.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

   Or install separately:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. **Install MongoDB:**
   
   Make sure MongoDB is installed and running on your system. You can download it from [mongodb.com](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud).

3. **Configure Environment Variables:**

   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   JWT_SECRET=your-secret-key-change-in-production-make-it-long-and-random
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   ```
   
   For MongoDB Atlas, use:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
   ```

4. **Seed the Database:**
   
   Run the seed script to populate the database with 100+ products:
   ```bash
   cd server
   npm run seed
   ```

5. **Start the Application:**

   For development (runs both backend and frontend):
   ```bash
   npm run dev
   ```

   Or start separately:
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

6. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Sample Data

The application comes with **100+ diverse products** across multiple categories:
- **Electronics**: Smartphones, Laptops, Headphones, Smartwatches, Gaming Consoles, Cameras, Monitors, Smart Home devices
- **Fashion**: Clothing, Shoes, Accessories
- **Home & Kitchen**: Appliances, Cookware, Bedding, Cutlery
- **Sports & Outdoors**: Fitness equipment, Camping gear, Outdoor equipment
- **Books & Media**: E-readers, Audio devices
- **Beauty & Personal Care**: Skincare, Hair care, Oral care
- **Toys & Games**: LEGO sets, Board games, Drones
- **Automotive**: Car accessories
- **Pet Supplies**: Pet feeders, Beds
- **Health & Wellness**: Air purifiers, Medical devices
- **Office Supplies**: Furniture, Equipment

### Sample Coupon Codes:

1. **WELCOME10** - 10% off (min purchase $50, max discount $100)
2. **SAVE20** - 20% off (min purchase $100, max discount $200)
3. **FLAT50** - $50 off (min purchase $200)
4. **SUMMER25** - 25% off (min purchase $75, max discount $150)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories/list` - Get categories and brands

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:productId` - Remove item from wishlist

### Coupons
- `GET /api/coupons` - Get all active coupons
- `POST /api/coupons/validate` - Validate and apply coupon

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Place new order

## Features in Detail

### 1. Add to Cart
- Add products with different purchase options
- Update quantity
- Remove items
- View cart total

### 2. Add to Wishlist
- Save favorite products
- Quick access to wishlist
- Remove from wishlist

### 3. Filter & Search
- **Visual Filter Icons** for easy identification
- Search by product name/description
- Filter by category with icon indicators
- Filter by brand with icon indicators
- Filter by price range with dollar icon
- **Quick Sort Buttons** with icons:
  - 🔥 Popular (Most Popular)
  - ⭐ Top Rated (Highest Ratings)
  - 💵 Price: Low to High
  - 💵 Price: High to Low
- Sort by price, rating, popularity, name

### 4. Purchase Options
Products can have different purchase options:
- Standard
- Express
- Premium
- Bundle
- Warranty
- Bulk

### 5. Discounts
- Products can have original and current prices
- Automatic discount percentage calculation
- Visual discount badges

### 6. Coupon System
- Apply coupon codes at checkout
- Percentage-based discounts
- Fixed amount discounts
- Minimum purchase requirements
- Maximum discount limits
- Usage limits
- Date validity

## DevOps Considerations

This application is structured to be easily deployed and managed:

1. **Database**: Uses MongoDB with Mongoose ODM
   - Data is stored in MongoDB collections
   - All user IDs, orders, items, carts, wishlists are captured in the database
   - Easy to scale with MongoDB Atlas or self-hosted MongoDB
   - Can be migrated to other databases if needed

2. **Environment Configuration**: Uses `.env` files for configuration

3. **Separate Frontend/Backend**: Can be deployed separately or together

4. **API-First Design**: Backend and frontend are decoupled

## Development Notes

- **Data is stored in MongoDB** - All collections are managed via Mongoose models
- **100+ products** with diverse categories, brands, and purchase options
- **Visual filter icons** make it easy to identify filter options
- **Quick sort buttons** with icons for popular sorting options
- JWT tokens are stored in localStorage
- All API requests include authentication token automatically
- The application includes error handling and loading states
- Products have popularity scores for trending/recommendations

## Future Enhancements

- Payment gateway integration
- Email notifications
- Product reviews and ratings
- Image upload functionality
- Admin panel
- Inventory management
- Analytics dashboard

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

