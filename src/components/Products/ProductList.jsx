import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { imageMap } from '../../utils/productImage.js';
import './ProductList.css';

const PRODUCTS_PER_PAGE = 6;
const jsonBase = import.meta.env.BASE_URL || '/';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch(`${jsonBase}product.json`),
                    fetch(`${jsonBase}category.json`)
                ]);
                if (!productsRes.ok) throw new Error('Failed to load products');
                const data = await productsRes.json();
                const mappedProducts = data.map((item) => ({
                    ...item,
                    image: imageMap[item.imageKey] || item.image
                }));
                setProducts(mappedProducts);
                if (categoriesRes.ok) {
                    const catData = await categoriesRes.json();
                    setCategories(Array.isArray(catData) ? catData : []);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredProducts = selectedCategoryId == null
        ? products
        : products.filter((p) => p.categoryid === selectedCategoryId);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategoryId]);

    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * PRODUCTS_PER_PAGE;
    const visibleProducts = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);

    const handleCategorySelect = (id) => {
        setSelectedCategoryId(id);
        setIsMenuOpen(false);
    };

    if (isLoading) return <div className="product-status">Loading...</div>;
    if (error) return <div className="product-status error">Error: {error}</div>;

    return (
        <div className="product-list-container">
            <div className="product-list-layout">
                <aside className="product-sidebar">
                    <div className="sidebar-inner">
                        <div className="sidebar-header-mobile" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <h2 className="sidebar-heading">Danh mục</h2>
                            <span className={`arrow-icon ${isMenuOpen ? 'open' : ''}`}>▼</span>
                        </div>
                        
                        <ul className={`category-menu ${isMenuOpen ? 'show' : ''}`}>
                            <li>
                                <button 
                                    className={`category-item ${selectedCategoryId == null ? 'active' : ''}`}
                                    onClick={() => handleCategorySelect(null)}
                                >
                                    Tất cả
                                </button>
                            </li>
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <button 
                                        className={`category-item ${selectedCategoryId === cat.id ? 'active' : ''}`}
                                        onClick={() => handleCategorySelect(cat.id)}
                                    >
                                        {cat.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <main className="product-main-content">
                    <div className="product-grid">
                        {visibleProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-wrap">
                            <button 
                                className="paging-btn" 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                disabled={safePage <= 1}
                            >
                                Trước
                            </button>
                            <div className="paging-info">
                                Trang <span className="current-page-tag">{safePage}</span> / {totalPages}
                            </div>
                            <button 
                                className="paging-btn" 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                disabled={safePage >= totalPages}
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProductList;