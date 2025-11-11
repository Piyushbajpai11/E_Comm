import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products?sort=rating');
      console.log('Fetched products:', response.data.length);
      setProducts(response.data.slice(0, 8));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Our Store</h1>
            <p>Discover amazing products at great prices</p>
            <Link to="/products" className="btn btn-primary btn-large">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>No products available. Make sure the database is seeded.</p>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                Run: <code>cd server && npm run seed</code>
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

