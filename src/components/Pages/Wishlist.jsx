import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Wishlist.css';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            setWishlistItems(JSON.parse(savedWishlist));
        }
    }, []);

    const handleRemoveItem = (id) => {
        const updated = wishlistItems.filter(item => item.id !== id);
        setWishlistItems(updated);
        localStorage.setItem('wishlist', JSON.stringify(updated));
        window.dispatchEvent(new Event('wishlistUpdated'));
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="wishlist-empty-container">
                <div className="wishlist-empty-card">
                    <i className="fa-regular fa-heart empty-heart"></i>
                    <h2>Danh sách yêu thích trống</h2>
                    <p>Chưa có sản phẩm nào được lưu. Bấm icon trái tim trên sản phẩm bạn yêu để xem lại tại đây nhé.</p>
                    <button onClick={() => navigate('/')} className="shop-now-btn">Khám Phá Cửa Hàng</button>
                </div>
            </div>
        );
    }
    return (
        <div className="wishlist-container">

            <h1 className="wishlist-title">Sản Phẩm Yêu Thích</h1>
            <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {wishlistItems.map((item) => (
                    <div key={item.id} className="product-card">
                        {/* Nút Xóa (thay vì icon trái tim) */}
                        <button className="wishlist-heart-btn" onClick={() => handleRemoveItem(item.id)} title="Xóa">
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <div className="product-image-container">
                            <img src={item.image} alt={item.name} className="product-image" />
                        </div>

                        <h4 className="product-name">{item.name}</h4>

                        {/* Size/Dung tích */}
                        {item.selectedSize && (
                            <div className="product-ram-ssd">
                                <span className="ram-ssd-tag">{item.selectedSize}</span>
                            </div>
                        )}

                        <div className="product-pricing">
                            <div className="current-price">{item.price}đ</div>
                            {item.oldPrice && (
                                <div className="original-price-section">
                                    <span className="original-price">{item.oldPrice}đ</span>
                                    <span className="discount">{item.discount}%</span>
                                </div>
                            )}
                        </div>

                        <div className="product-rating-sales">
                            <span className="rating">★ {item.rating || 4.8}</span>
                            <span>Đã bán {item.soldCount || 1250}</span>
                        </div>

                        <button className="compare-button" onClick={() => navigate(`/product/${item.id}`)}>
                            Xem Chi Tiết
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;