import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { imageMap } from '../../utils/productImage.js';
import './DetailProduct.css';

const DetailProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSizeKey, setActiveSizeKey] = useState('L');
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch('/product.json');
                if (!response.ok) throw new Error('Không thể tải thông tin sản phẩm');
                const data = await response.json();
                const found = data.find((item) => String(item.id) === String(id));
                if (!found) throw new Error('Sản phẩm không tồn tại');

                setProduct({
                    ...found,
                    image: imageMap[found.imageKey] || found.image
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const parsePriceToNumber = (priceStr) => {
        if (!priceStr) return 0;
        return parseFloat(String(priceStr).replace(/[.\sđ]/g, ''));
    };

    const calculateDiscount = (current, original) => {
        const currNum = parsePriceToNumber(current);
        const origNum = parsePriceToNumber(original);
        if (!currNum || !origNum || currNum >= origNum) return null;
        return Math.round(((origNum - currNum) / origNum) * 100);
    };

    if (isLoading) return <div className="detail-container">Đang tải...</div>;
    if (error) return <div className="detail-container">Lỗi: {error}</div>;
    if (!product) return null;

    const currentPrice = product[`price${activeSizeKey}`] || product.currentPrice;
    const originalPrice = product[`originalPrice${activeSizeKey}`] || product.originalPrice;
    const discountPercent = calculateDiscount(currentPrice, originalPrice) || (product.discount ? product.discount.replace('%', '') : null);

    const displayDynamicName = () => {
        const currentSizeName = product[`size${activeSizeKey}`];
        return product.name.replace(/\d+ml/g, currentSizeName);
    };

    const handleAddToCart = () => {
        const savedCart = localStorage.getItem('cart');
        const cart = savedCart ? JSON.parse(savedCart) : [];

        const cartItem = {
            ...product,
            name: displayDynamicName(),
            selectedSize: product[`size${activeSizeKey}`],
            currentPrice: currentPrice,
            originalPrice: originalPrice
        };

        const existingItemIndex = cart.findIndex(
            item => item.id === product.id && item.selectedSize === product[`size${activeSizeKey}`]
        );

        if (existingItemIndex >= 0) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ ...cartItem, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        navigate('/cart');
    };

    return (
        <div className="detail-container">
            <div className="product-main-section">
                <div className="detail-image-wrapper">
                    <img src={product.image || 'https://via.placeholder.com/500'} alt={product.name} />
                </div>

                <div className="detail-info-wrapper">
                    <h1 className="product-title">{displayDynamicName()}</h1>

                    <div className="product-price-container" style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '15px 0' }}>
                        <span className="product-price-display" style={{ fontSize: '26px', fontWeight: 'bold', color: '#ffb7c5' }}>
                            {currentPrice}đ
                        </span>
                        {originalPrice && (
                            <span className="product-original-price" style={{ textDecoration: 'line-through', color: '#888', fontSize: '16px' }}>
                                {originalPrice}đ
                            </span>
                        )}
                        {discountPercent && (
                            <span className="product-discount-badge" style={{ backgroundColor: '#ffb7c5', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                                -{discountPercent}%
                            </span>
                        )}
                    </div>

                    <div className="product-size-section" style={{ margin: '20px 0' }}>
                        <div className="size-buttons-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {['S', 'M', 'L'].map((key) => {
                                if (!product[`size${key}`]) return null;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setActiveSizeKey(key)}
                                        style={{
                                            padding: '8px 18px',
                                            border: activeSizeKey === key ? '1px solid #bda2da' : '1px solid #e2dbf0',
                                            backgroundColor: activeSizeKey === key ? '#f3ebfc' : '#f7f4fc',
                                            color: '#65558f',
                                            fontSize: '15px',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            fontWeight: activeSizeKey === key ? 'bold' : 'normal'
                                        }}
                                    >
                                        {product[`size${key}`]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="product-description-item">
                        <h4>MÔ TẢ SẢN PHẨM</h4>
                        <p>{product.description || "Đang cập nhật thông tin mô tả."}</p>
                    </div>

                    <div className="product-description-item">
                        <h4>THÀNH PHẦN CHÍNH</h4>
                        <p>{product.ingredients || "Đang cập nhật thành phần."}</p>
                    </div>

                    <button className="add-to-cart-banner" onClick={handleAddToCart}>
                        THÊM VÀO GIỎ
                    </button>

                    <div className="product-meta-sub-button" style={{ display: 'flex', gap: '20px', margin: '15px 0', fontSize: '14px', color: '#555' }}>
                        <span className="meta-rating">
                            <span className="rating">❤ {product.rating}</span>
                        </span>
                        <span className="meta-divider" style={{ color: '#ccc' }}>|</span>
                        <span className="meta-sold">
                            <span className="sales">Đã bán {product.sold}</span>
                        </span>
                    </div>

                    <div className="detail-footer-actions">
                        <span>Chia sẻ</span>
                        <span>Viết đánh giá</span>
                    </div>
                </div>
            </div>

            <div className="reviews-section">
                <div className="reviews-summary">
                    <div className="rating-left">
                        <h3>Đánh giá từ khách hàng</h3>
                        <div className="rating-flex-box">
                            <div className="big-score">5.0</div>
                            <div className="rating-column-stack">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <div key={star} className="rating-row-line">
                                        <div className="hearts-row">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < star ? "heart filled" : "heart"}>❤</span>
                                            ))}
                                        </div>
                                        {star === 5 && <span className="count-label">(5K)</span>}
                                        {star === 4 && <span className="count-label">(0)</span>}
                                        {star === 3 && <span className="count-label">(0)</span>}
                                        {star === 2 && <span className="count-label">(0)</span>}
                                        {star === 1 && <span className="count-label">(0)</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rating-right">
                        <h3>Đánh giá của bạn</h3>
                        <div className="interactive-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star-clickable ${star <= (hoverRating || userRating) ? 'active' : ''}`}
                                    onClick={() => setUserRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    ❤
                                </span>
                            ))}
                        </div>
                        <textarea placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."></textarea>
                        <div className="review-buttons">
                            <button className="btn-upload">Thêm hình ảnh</button>
                            <button className="btn-submit">Gửi đánh giá</button>
                        </div>
                    </div>
                </div>

                <div className="individual-review">
                    <div className="review-flex-container">
                        <div className="reviewer-side">
                            <h4 className="reviewer-name">KHÁCH HÀNG ẨN DANH</h4>
                            <p className="reviewer-detail">Da thường</p>
                            <p className="reviewer-detail">Số lần đánh giá: 1</p>
                        </div>

                        <div className="content-side">
                            <div className="content-top-line">
                                <div className="stars-row-hearts">
                                    <span className="heart-pink">❤</span>
                                    <span className="heart-pink">❤</span>
                                    <span className="heart-pink">❤</span>
                                    <span className="heart-pink">❤</span>
                                    <span className="heart-pink">❤</span>
                                </div>
                                <span className="date-stamp">08/10/2024</span>
                            </div>

                            <div className="content-body-text">
                                <h4 className="review-heading">Tôi đã sử dụng sản phẩm và rất hợp</h4>
                                <p className="review-para">Tuyệt vời.</p>
                            </div>

                            <div className="content-bottom-actions">
                                <span className="useful-label">Đánh giá hữu ích?</span>
                                <div className="interaction-item">
                                    <span className="icon"><i className="fa-regular fa-thumbs-up" style={{ color: '#ffb7c5' }}></i></span>
                                    <span className="value">5K</span>
                                </div>
                                <div className="interaction-item">
                                    <span className="icon"><i className="fa-regular fa-thumbs-down" style={{ color: '#ffb7c5' }}></i></span>
                                    <span className="value">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailProduct;