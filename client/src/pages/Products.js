import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { FaFilter, FaDollarSign, FaStar, FaFire, FaSort, FaTags, FaBuilding } from 'react-icons/fa';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sort: ''
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchFilters();
  }, [fetchProducts, fetchFilters]);

  useEffect(() => {
    applyFilters();
  }, [filters, products, applyFilters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      const response = await api.get(`/products?${params}`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await api.get('/products/categories/list');
      setCategories(response.data.categories || []);
      setBrands(response.data.brands || []);
      setSubcategories(response.data.subcategories || []);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.brand) {
      filtered = filtered.filter(p => p.brand === filters.brand);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice));
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    if (filters.sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (filters.sort === 'popularity') {
      filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: ''
    });
  };

  return (
    <div className="products-page">
      <div className="container">
        <h1 className="page-title">All Products</h1>

        <div className="products-layout">
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3><FaFilter /> Filters</h3>
              <button onClick={clearFilters} className="btn-link">Clear All</button>
            </div>

            <div className="filter-group">
              <label><FaTags /> Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label><FaTags /> Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label><FaBuilding /> Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="filter-select"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label><FaDollarSign /> Price Range</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="filter-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label><FaSort /> Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="filter-select"
              >
                <option value="">Default</option>
                <option value="price-asc"><FaDollarSign /> Price: Low to High</option>
                <option value="price-desc"><FaDollarSign /> Price: High to Low</option>
                <option value="rating"><FaStar /> Highest Rated</option>
                <option value="popularity"><FaFire /> Most Popular</option>
              </select>
            </div>
          </aside>

          <main className="products-content">
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : (
              <>
                <div className="products-header">
                  <p>{filteredProducts.length} products found</p>
                  <div className="quick-sort-buttons">
                    <button
                      onClick={() => handleFilterChange('sort', 'popularity')}
                      className={`quick-sort-btn ${filters.sort === 'popularity' ? 'active' : ''}`}
                      title="Sort by Popularity"
                    >
                      <FaFire /> Popular
                    </button>
                    <button
                      onClick={() => handleFilterChange('sort', 'rating')}
                      className={`quick-sort-btn ${filters.sort === 'rating' ? 'active' : ''}`}
                      title="Sort by Rating"
                    >
                      <FaStar /> Top Rated
                    </button>
                    <button
                      onClick={() => handleFilterChange('sort', 'price-asc')}
                      className={`quick-sort-btn ${filters.sort === 'price-asc' ? 'active' : ''}`}
                      title="Sort by Price: Low to High"
                    >
                      <FaDollarSign /> Price: Low
                    </button>
                    <button
                      onClick={() => handleFilterChange('sort', 'price-desc')}
                      className={`quick-sort-btn ${filters.sort === 'price-desc' ? 'active' : ''}`}
                      title="Sort by Price: High to Low"
                    >
                      <FaDollarSign /> Price: High
                    </button>
                  </div>
                </div>
                {filteredProducts.length === 0 ? (
                  <div className="no-products">
                    <p>No products found matching your criteria.</p>
                    <button onClick={clearFilters} className="btn btn-primary">
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="products-grid">
                    {filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;

