import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageMap } from '../../utils/productImage';
import './Cart.css';

// Component Dropdown Custom để giao diện đẹp tuyệt đối
const CustomSizeDropdown = ({ item, onSizeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const availableSizes = [item.sizeS, item.sizeM, item.sizeL].filter(Boolean);
  const currentSize = item.selectedSize || item.sizeM || "Box vừa";

  // Đóng dropdown khi bấm ra ngoài màn hình
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div
        className={`dropdown-selected ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentSize}
        <span className="dropdown-arrow">▼</span>
      </div>

      {isOpen && (
        <ul className="dropdown-options">
          {availableSizes.map((size) => (
            <li
              key={size}
              className={`dropdown-option-item ${size === currentSize ? 'selected' : ''}`}
              onClick={() => {
                onSizeChange(size);
                setIsOpen(false);
              }}
            >
              {size}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const updateCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleSizeChange = (cartItemId, newSize) => {
    const updatedCart = cartItems.map(item => {
      const currentUniqueId = `${item.id}-${item.selectedSize || item.sizeM || 'Default'}`;

      if (currentUniqueId === cartItemId) {
        let currentPrice = item.currentPrice;
        let originalPrice = item.originalPrice;

        if (newSize === item.sizeS) {
          currentPrice = item.priceS;
          originalPrice = item.originalPriceS;
        } else if (newSize === item.sizeM) {
          currentPrice = item.priceM;
          originalPrice = item.originalPriceM;
        } else if (newSize === item.sizeL) {
          currentPrice = item.priceL;
          originalPrice = item.originalPriceL;
        }

        const numPrice = parseFloat(currentPrice.replace(/\./g, '')) || 0;
        const numOriginal = parseFloat(originalPrice.replace(/\./g, '')) || 0;
        const discount = numOriginal > 0
          ? Math.round(((numOriginal - numPrice) / numOriginal) * 100) + '%'
          : '0%';

        return {
          ...item,
          selectedSize: newSize,
          currentPrice,
          originalPrice,
          discount
        };
      }
      return item;
    });
    updateCart(updatedCart);
  };

  const increaseQuantity = (cartItemId) => {
    const updatedCart = cartItems.map(item => {
      const currentUniqueId = `${item.id}-${item.selectedSize || item.sizeM || 'Default'}`;
      return currentUniqueId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item;
    });
    updateCart(updatedCart);
  };

  const decreaseQuantity = (cartItemId) => {
    const updatedCart = cartItems.map(item => {
      const currentUniqueId = `${item.id}-${item.selectedSize || item.sizeM || 'Default'}`;
      if (currentUniqueId === cartItemId) {
        return item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : null;
      }
      return item;
    }).filter(Boolean);
    updateCart(updatedCart);
  };

  const removeItem = (cartItemId) => {
    const updatedCart = cartItems.filter(item => {
      const currentUniqueId = `${item.id}-${item.selectedSize || item.sizeM || 'Default'}`;
      return currentUniqueId !== cartItemId;
    });
    updateCart(updatedCart);
  };

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[^\d]/g, '')) || 0;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parsePrice(item.currentPrice) * item.quantity);
    }, 0);
  };

  const calculateTotalDiscount = () => {
    return cartItems.reduce((total, item) => {
      const original = parsePrice(item.originalPrice);
      const current = parsePrice(item.currentPrice);
      if (original > current) {
        return total + ((original - current) * item.quantity);
      }
      return total;
    }, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty-wrapper">
          <div className="cart-empty-card">
            <div className="empty-illustration">
              <div className="circle-bg"></div>
              <div className="cart-icon-animated"><i className="fa-solid fa-basket-shopping" style={{ color: '#76637e' }}></i></div>
            </div>
            <h2 className="empty-title">Giỏ hàng của bạn đang trống</h2>
            <p className="empty-description">
              Có vẻ như bạn chưa chọn được sản phẩm ưng ý. <br />
              Hãy khám phá hàng ngàn sản phẩm làm đẹp hấp dẫn tại cửa hàng nhé!
            </p>
            <button className="back-to-shop-btn" onClick={() => navigate('/')}>
              Khám phá ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">Giỏ hàng của bạn</h1>

      <div className="cart-content">
        <div className="cart-main-section">
          <div className="cart-header-labels cart-grid-layout">
            <span className="label-product">Sản phẩm</span>
            <span className="label-size">Phân loại</span>
            <span className="label-quantity">Số lượng</span>
            <span className="label-total">Thành tiền</span>
            <span></span>
          </div>

          <div className="cart-items">
            {cartItems.map((item) => {
              const price = parsePrice(item.currentPrice);
              const itemTotal = price * item.quantity;
              const hasSizes = item.sizeS || item.sizeM || item.sizeL;

              const currentUniqueId = `${item.id}-${item.selectedSize || item.sizeM || 'Default'}`;

              return (
                <div key={currentUniqueId} className="cart-item cart-grid-layout">
                  <div className="product-info-col">
                    <div className="cart-item-image">
                      <img
                        src={item.image || imageMap[item.imageKey] || 'https://via.placeholder.com/150'}
                        alt={item.name}
                      />
                    </div>
                    <div className="cart-item-info">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-price">
                        {item.currentPrice}đ
                        {item.originalPrice && (
                          <span className="original-price-tag">{item.originalPrice}đ</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Cột Phân Loại sử dụng Dropdown Custom siêu đẹp */}
                  <div className="cart-item-size-col">
                    {hasSizes ? (
                      <CustomSizeDropdown
                        item={item}
                        onSizeChange={(newSize) => handleSizeChange(currentUniqueId, newSize)}
                      />
                    ) : (
                      <span className="no-size-dash">—</span>
                    )}
                  </div>

                  <div className="cart-item-quantity">
                    <button className="quantity-btn minus" onClick={() => decreaseQuantity(currentUniqueId)}>−</button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button className="quantity-btn plus" onClick={() => increaseQuantity(currentUniqueId)}>+</button>
                  </div>

                  <div className="cart-item-total">
                    <p className="item-total-price">{formatPrice(itemTotal)}</p>
                  </div>

                  <button className="remove-item-btn" onClick={() => removeItem(currentUniqueId)}>✕</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cart-summary">
          <h2 className="summary-title">Tổng kết đơn hàng</h2>
          <div className="summary-details">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatPrice(calculateSubtotal() + calculateTotalDiscount())}</span>
            </div>

            {calculateTotalDiscount() > 0 && (
              <div className="summary-row dis">
                <span>Giảm giá sản phẩm:</span>
                <span>-{formatPrice(calculateTotalDiscount())}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>Miễn phí</span>
            </div>

            <div className="coupon-section">
              <input
                type="text"
                placeholder="Nhập mã giảm giá..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="coupon-input"
              />
              <button className="coupon-apply-btn">Áp dụng</button>
            </div>

            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span className="total-price">{formatPrice(calculateSubtotal())}</span>
            </div>
          </div>

          <button className="checkout-btn">Thanh toán ngay</button>
          <button className="continue-shopping-btn outline" onClick={() => navigate('/')}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;