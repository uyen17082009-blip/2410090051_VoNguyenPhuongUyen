import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const productsUrl = `${import.meta.env.BASE_URL}product.json`;

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState('M');
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích chưa khi component render
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            const wishlistItems = JSON.parse(savedWishlist);
            setIsWishlisted(wishlistItems.some(item => item.id === product.id));
        }
    }, [product.id]);

    const handleBuy = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(productsUrl);
            if (!response.ok) throw new Error('Không thể tải thông tin sản phẩm');

            const data = await response.json();
            const matchedProduct = data.find((item) => item.id === product.id);

            if (!matchedProduct) throw new Error('Sản phẩm không tồn tại');

            navigate(`/product/${product.id}`, {
                state: {
                    product: { ...matchedProduct, image: product.image }
                }
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý Thêm hoặc Xóa sản phẩm khỏi danh sách yêu thích
    const toggleWishlist = (e) => {
        e.stopPropagation();
        const savedWishlist = localStorage.getItem('wishlist');
        let wishlistItems = savedWishlist ? JSON.parse(savedWishlist) : [];

        if (isWishlisted) {
            wishlistItems = wishlistItems.filter(item => item.id !== product.id);
            setIsWishlisted(false);
        } else {
            const { current } = getPriceDisplay();
            wishlistItems.push({
                id: product.id,
                name: product.name,
                image: product.image,
                price: current
            });
            setIsWishlisted(true);
        }
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
        // Kích hoạt sự kiện để Header cập nhật lại số lượng ngay lập tức
        window.dispatchEvent(new Event('wishlistUpdated'));
    };

    // Chuyển sang trang đặt lịch trước và truyền dữ liệu sản phẩm hiện tại đi kèm
    // Thay thế hàm handlePreOrder cũ bằng đoạn này:
const handlePreOrder = (e) => {
    e.stopPropagation();
    const { current, original } = getPriceDisplay();
    
    // Lưu toàn bộ đối tượng product, cộng thêm các thông tin trạng thái
    const bookingItem = {
        ...product, // Giữ nguyên toàn bộ cấu trúc gốc từ JSON
        selectedSize: selectedSize === 'S' ? product.sizeS : (selectedSize === 'L' ? product.sizeL : product.sizeM),
        currentPrice: current,      // Giá hiện tại tại thời điểm chọn
        originalPrice: original,    // Giá gốc tương ứng tại thời điểm chọn
        quantity: 1                 // Mặc định số lượng là 1
    };

    const savedList = localStorage.getItem('preOrderList');
    const preOrderList = savedList ? JSON.parse(savedList) : [];

    // Kiểm tra trùng lặp
    const exists = preOrderList.find(i => i.id === bookingItem.id && i.selectedSize === bookingItem.selectedSize);
    
    if (!exists) {
        preOrderList.push(bookingItem);
        localStorage.setItem('preOrderList', JSON.stringify(preOrderList));
        alert("Đã thêm vào danh sách đặt lịch!");
    } else {
        alert("Sản phẩm với size này đã có trong danh sách.");
    }
};
    const getPriceDisplay = () => {
        if (selectedSize === 'S' && product.priceS) {
            return {
                current: product.priceS,
                original: product.originalPriceS || product.originalPrice
            };
        }
        if (selectedSize === 'L' && product.priceL) {
            return {
                current: product.priceL,
                original: product.originalPriceL || product.originalPrice
            };
        }
        return {
            current: product.priceM || product.currentPrice,
            original: product.originalPriceM || product.originalPrice
        };
    };

    const { current, original } = getPriceDisplay();

    return (
        <div className="product-card">
            {/* Nút Trái Tim Yêu Thích ở góc trên bên phải */}
            <button
                className={`wishlist-heart-btn ${isWishlisted ? 'active' : ''}`}
                onClick={toggleWishlist}
                title="Thêm vào yêu thích"
            >
                <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
            </button>

            <div className="product-image-container">
                <img
                    src={product.image || 'https://via.placeholder.com/300x200'}
                    alt={product.name}
                    className="product-image"
                />
            </div>

            <h3 className="product-name">{product.name}</h3>

            <div className="product-ram-ssd">
                {product.sizeS && (
                    <button
                        className={`ram-ssd-tag ${selectedSize === 'S' ? 'active' : ''}`}
                        onClick={() => setSelectedSize('S')}
                    >
                        {product.sizeS}
                    </button>
                )}
                {product.sizeM && (
                    <button
                        className={`ram-ssd-tag ${selectedSize === 'M' ? 'active' : ''}`}
                        onClick={() => setSelectedSize('M')}
                    >
                        {product.sizeM}
                    </button>
                )}
                {product.sizeL && (
                    <button
                        className={`ram-ssd-tag ${selectedSize === 'L' ? 'active' : ''}`}
                        onClick={() => setSelectedSize('L')}
                    >
                        {product.sizeL}
                    </button>
                )}
            </div>

            <div className="product-pricing">
                <div className="current-price">{current}đ</div>
                <div className="original-price-section">
                    <span className="original-price">{original}đ</span>
                    {product.discount && <span className="discount">{product.discount}</span>}
                </div>
            </div>

            <div className="product-rating-sales">
                <span className="rating">❤ {product.rating}</span>
                <span className="sales">Đã bán {product.sold}</span>
            </div>

            {/* Cụm nút hành động dưới đáy sản phẩm */}
            <div className="product-card-actions">
                <button className="compare-button" onClick={handleBuy} disabled={isLoading}>
                    {isLoading ? 'Đang mở...' : 'Mua ngay'}
                </button>
                <button className="preorder-icon-btn" onClick={handlePreOrder} title="Đặt lịch trước sản phẩm">
                    <i className="fa-regular fa-calendar-check"></i>
                </button>
            </div>
            {error && <div className="error-text">{error}</div>}
        </div>
    );
};

export default ProductCard;