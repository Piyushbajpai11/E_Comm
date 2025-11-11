const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('./config/database');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Wishlist = require('./models/Wishlist');
const Coupon = require('./models/Coupon');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Optional auth - doesn't fail if no token
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
}

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id.toString(), email: newUser.email }, JWT_SECRET);
    res.json({
      token,
      user: { id: newUser._id.toString(), email: newUser.email, name: newUser.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// graceful shutdown
// const server = app.listen(process.env.PORT || 4000, () =>
//   console.log('API up')
// );

// const shutdown = (signal) => {
//   console.log(`Received ${signal}, shutting down...`);
//   server.close(() => {
//     console.log('HTTP server closed');
//     // close DB if needed: await mongoose.connection.close()
//     process.exit(0);
//   });
//   // force exit if not closed in time
//   setTimeout(() => process.exit(1), 10000).unref();
// };

['SIGINT', 'SIGTERM'].forEach(sig => process.on(sig, () => shutdown(sig)));


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET);
    res.json({
      token,
      user: { id: user._id.toString(), email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Products routes
app.get('/api/products', optionalAuth, async (req, res) => {
  try {
    const { category, brand, subcategory, minPrice, maxPrice, search, sort, limit } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }
    if (brand) {
      query.brand = brand;
    }
    if (subcategory) {
      query.subcategory = subcategory;
    }
    if (minPrice) {
      query.price = { ...query.price, $gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      query.price = { ...query.price, ...(query.price ? {} : {}), $lte: parseFloat(maxPrice) };
    }
    if (search) {
      // Use regex search if text index is not available
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let sortOption = {};
    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'popularity') {
      sortOption = { popularity: -1 };
    } else if (sort === 'name') {
      sortOption = { name: 1 };
    }

    let productsQuery = Product.find(query);
    if (Object.keys(sortOption).length > 0) {
      productsQuery = productsQuery.sort(sortOption);
    }
    if (limit) {
      productsQuery = productsQuery.limit(parseInt(limit));
    }

    const products = await productsQuery.lean();

    // Convert MongoDB _id to string id for compatibility
    const formattedProducts = products.map(product => ({
      ...product,
      id: product._id.toString()
    }));

    console.log(`Products API: Returning ${formattedProducts.length} products`);
    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ ...product, id: product._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const brands = await Product.distinct('brand');
    const subcategories = await Product.distinct('subcategory');
    res.json({ categories, brands, subcategories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cart routes
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    let userCart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');

    if (!userCart) {
      userCart = new Cart({ userId: req.user.id, items: [] });
      await userCart.save();
    }

    const cartWithProducts = {
      userId: userCart.userId.toString(),
      items: userCart.items.map(item => {
        const product = item.productId;
        if (!product) return null;
        return {
          productId: product._id.toString(),
          quantity: item.quantity,
          purchaseOption: item.purchaseOption,
          product: {
            ...product.toObject(),
            id: product._id.toString()
          }
        };
      }).filter(Boolean)
    };

    res.json(cartWithProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1, purchaseOption = 'standard' } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.purchaseOptions.includes(purchaseOption)) {
      return res.status(400).json({ error: 'Invalid purchase option for this product' });
    }

    let userCart = await Cart.findOne({ userId: req.user.id });

    if (!userCart) {
      userCart = new Cart({ userId: req.user.id, items: [] });
    }

    const existingItemIndex = userCart.items.findIndex(item =>
      item.productId.toString() === productId && item.purchaseOption === purchaseOption
    );

    if (existingItemIndex !== -1) {
      userCart.items[existingItemIndex].quantity += quantity;
    } else {
      userCart.items.push({ productId, quantity, purchaseOption });
    }

    await userCart.save();
    res.json(userCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    const { quantity, purchaseOption } = req.body;
    const userCart = await Cart.findOne({ userId: req.user.id });

    if (!userCart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = userCart.items.findIndex(item =>
      item.productId.toString() === req.params.productId &&
      (!purchaseOption || item.purchaseOption === purchaseOption)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      userCart.items.splice(itemIndex, 1);
    } else {
      userCart.items[itemIndex].quantity = quantity;
      if (purchaseOption) {
        userCart.items[itemIndex].purchaseOption = purchaseOption;
      }
    }

    await userCart.save();
    res.json(userCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    const { purchaseOption } = req.query;
    const userCart = await Cart.findOne({ userId: req.user.id });

    if (!userCart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    userCart.items = userCart.items.filter(item =>
      !(item.productId.toString() === req.params.productId &&
        (!purchaseOption || item.purchaseOption === purchaseOption))
    );

    await userCart.save();
    res.json(userCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userCart = await Cart.findOne({ userId: req.user.id });

    if (userCart) {
      userCart.items = [];
      await userCart.save();
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Wishlist routes
app.get('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    let userWishlist = await Wishlist.findOne({ userId: req.user.id }).populate('items');

    if (!userWishlist) {
      userWishlist = new Wishlist({ userId: req.user.id, items: [] });
      await userWishlist.save();
    }

    const wishlistWithProducts = {
      userId: userWishlist.userId.toString(),
      items: userWishlist.items.map(product => ({
        ...product.toObject(),
        id: product._id.toString()
      }))
    };

    res.json(wishlistWithProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let userWishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!userWishlist) {
      userWishlist = new Wishlist({ userId: req.user.id, items: [] });
    }

    if (!userWishlist.items.includes(productId)) {
      userWishlist.items.push(productId);
    }

    await userWishlist.save();
    res.json(userWishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/wishlist/:productId', authenticateToken, async (req, res) => {
  try {
    const userWishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!userWishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    userWishlist.items = userWishlist.items.filter(id => id.toString() !== req.params.productId);
    await userWishlist.save();
    res.json(userWishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Coupon routes
app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find({ active: true });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/coupons/validate', authenticateToken, async (req, res) => {
  try {
    const { code, total } = req.body;
    if (!code || !total) {
      return res.status(400).json({ error: 'Coupon code and total amount are required' });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      active: true
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or inactive coupon code' });
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      return res.status(400).json({ error: 'Coupon is not valid for current date' });
    }

    if (total < coupon.minPurchase) {
      return res.status(400).json({
        error: `Minimum purchase of $${coupon.minPurchase} required`
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit exceeded' });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (total * coupon.discount) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discount;
    }

    res.json({
      valid: true,
      discount: Math.round(discount * 100) / 100,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Order routes
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, couponCode, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      orderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        purchaseOption: item.purchaseOption || 'standard',
        total: itemTotal
      });
    }

    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        active: true
      });

      if (coupon && subtotal >= coupon.minPurchase) {
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validTo &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
          if (coupon.type === 'percentage') {
            discount = (subtotal * coupon.discount) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discount;
          }
          discount = Math.round(discount * 100) / 100;

          // Update coupon usage
          coupon.usedCount += 1;
          await coupon.save();

          appliedCoupon = coupon.code;
        }
      }
    }

    const total = Math.round((subtotal - discount) * 100) / 100;

    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      subtotal,
      discount,
      total,
      couponCode: appliedCoupon,
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || 'card',
      status: 'pending'
    });

    await order.save();

    // Clear cart
    const userCart = await Cart.findOne({ userId: req.user.id });
    if (userCart) {
      userCart.items = [];
      await userCart.save();
    }

    res.status(201).json({
      ...order.toObject(),
      id: order._id.toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map(order => ({
      ...order,
      id: order._id.toString()
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// graceful shutdown
const shutdown = (signal) => {
  console.log(`Received ${signal}, shutting down...`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

['SIGINT', 'SIGTERM'].forEach(sig => process.on(sig, () => shutdown(sig)));
