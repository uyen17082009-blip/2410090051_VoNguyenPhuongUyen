import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';
import logoImage from '../../img/logo.png';

const Header = () => {
  const [currentLang, setCurrentLang] = useState('VN');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0); // Giữ state đếm sản phẩm yêu thích
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const trans = {
    VN: {
      freeShip: "Miễn phí giao hàng đơn từ 500k",
      search: "Tìm kiếm mỹ phẩm...",
      login: "Đăng nhập",
      hello: "Chào",
      cart: "Giỏ hàng",
      wishlist: "Yêu thích", // Nhãn đa ngôn ngữ cho Yêu thích
      booking: "Đặt lịch",   // Nhãn đa ngôn ngữ cho Đặt lịch
      menu: ["TRANG CHỦ", "CHĂM SÓC DA", "CHĂM SÓC TÓC", "TRANG ĐIỂM", "SẢN PHẨM MỚI", "KHUYẾN MÃI"],
      skincareSub: ["Sữa Rửa Mặt", "Serum & Đặc Trị", "Kem Dưỡng Ẩm", "Mặt Nạ"],
      profile: "Hồ sơ",
      adminPage: "Trang quản trị",
      logout: "Đăng xuất"
    },
    EN: {
      freeShip: "Free shipping on orders over 500k",
      search: "Search products...",
      login: "Login",
      hello: "Hi",
      cart: "Cart",
      wishlist: "Wishlist", 
      booking: "Booking",  
      menu: ["HOME", "SKINCARE", "HAIRCARE", "MAKEUP", "NEW ARRIVALS", "PROMOTIONS"],
      skincareSub: ["Cleanser", "Serum & Treatment", "Moisturizer", "Mask"],
      profile: "Profile",
      adminPage: "Admin Panel",
      logout: "Logout"
    }
  };

  const syncStore = useCallback(() => {
    const savedCart = localStorage.getItem('cart');
    setCartCount(savedCart ? JSON.parse(savedCart).reduce((sum, item) => sum + (item.quantity || 0), 0) : 0);
    
    // Đồng bộ số lượng yêu thích từ localStorage
    const savedWishlist = localStorage.getItem('wishlist');
    setWishlistCount(savedWishlist ? JSON.parse(savedWishlist).length : 0);

    const savedUser = localStorage.getItem('currentUser');
    setCurrentUser(savedUser ? JSON.parse(savedUser) : null);
  }, []);

  const handleLangChange = (lang) => {
    setCurrentLang(lang);
    const event = new CustomEvent('languageChange', { detail: lang });
    window.dispatchEvent(event);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowUserDropdown((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setShowUserDropdown(false);
    window.dispatchEvent(new Event('userUpdated'));
    navigate('/login');
  };

  useEffect(() => {
    syncStore();
    window.addEventListener('userUpdated', syncStore);
    window.addEventListener('storage', syncStore);
    window.addEventListener('wishlistUpdated', syncStore); // Lắng nghe sự thay đổi của danh sách yêu thích

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('userUpdated', syncStore);
      window.removeEventListener('storage', syncStore);
      window.removeEventListener('wishlistUpdated', syncStore);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [syncStore]);

  const currentData = trans[currentLang];

  return (
    <header className="aline-header">
      <div className="header-top-bar">
        <div className="header-container">
          <div className="top-bar-left">
            <span>{currentData.freeShip}</span>
            <span className="divider">|</span>
            <i className="fa-solid fa-phone"></i> 1800 1708
          </div>
          <div className="top-bar-right">
            <div className="language-picker">
              <span className={`lang-btn ${currentLang === 'VN' ? 'active' : ''}`} onClick={() => handleLangChange('VN')}>VN</span>
              <span className="divider">|</span>
              <span className={`lang-btn ${currentLang === 'EN' ? 'active' : ''}`} onClick={() => handleLangChange('EN')}>EN</span>
            </div>
          </div>
        </div>
      </div>

      <div className="header-main">
        <div className="header-container">
          <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src={logoImage} alt="Aline Beauty" />
          </div>
          <div className="header-search">
            <input type="text" placeholder={currentData.search} />
            <button><i className="fa-solid fa-magnifying-glass"></i></button>
          </div>
          <div className="header-actions">
            {/* GỐC: TÀI KHOẢN NGƯỜI DÙNG */}
            <div 
              ref={dropdownRef}
              className={`action-item user-action-wrapper ${showUserDropdown ? 'active' : ''}`}
              style={{ position: 'relative' }}
            >
              <i className="fa-regular fa-circle-user purple-icon"></i>
              {currentUser ? (
                <>
                  <span className="action-label" onClick={toggleDropdown} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    {currentData.hello}, {currentUser.account || currentUser.username || 'User'} <i className="fa-solid fa-caret-down arrow-dropdown"></i>
                  </span>
                  
                  <div className="user-dropdown-menu">
                    <button onClick={() => { navigate('/profile'); setShowUserDropdown(false); }}>
                      <i className="fa-regular fa-id-card"></i> {currentData.profile}
                    </button>
                    
                    {currentUser.role === 'staff' && (
                      <button onClick={() => { navigate('/admin'); setShowUserDropdown(false); }}>
                        <i className="fa-solid fa-user-gear"></i> {currentData.adminPage}
                      </button>
                    )}
                    
                    <button onClick={handleLogout} className="logout-btn">
                      <i className="fa-solid fa-right-from-bracket"></i> {currentData.logout}
                    </button>
                  </div>
                </>
              ) : (
                <span 
                  className="action-label" 
                  onClick={() => navigate('/login')} 
                  style={{ cursor: 'pointer' }}
                >
                  {currentData.login}
                </span>
              )}
            </div>

            {/* GỐC: GIỎ HÀNG */}
            <Link to="/cart" className="action-item header-cart">
              <div className="cart-icon-wrapper">
                <i className="fa-solid fa-basket-shopping purple-icon"></i>
                <span className="cart-badge">{cartCount}</span>
              </div>
              <span className="action-label">{currentData.cart}</span>
            </Link>

            {/* CHUYỂN XUỐNG CUỐI 1: DANH SÁCH YÊU THÍCH */}
            <Link to="/wishlist" className="action-item header-wishlist">
              <div className="cart-icon-wrapper">
                <i className="fa-regular fa-heart purple-icon"></i>
                {wishlistCount > 0 && <span className="cart-badge pink-badge">{wishlistCount}</span>}
              </div>
              <span className="action-label">{currentData.wishlist}</span>
            </Link>

            {/* CHUYỂN XUỐNG CUỐI 2: DANH SÁCH ĐẶT LỊCH TRƯỚC */}
            <Link to="/booking" className="action-item header-booking">
              <div className="cart-icon-wrapper">
                <i className="fa-regular fa-calendar-check purple-icon"></i>
              </div>
              <span className="action-label">{currentData.booking}</span>
            </Link>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        <div className="header-container">
          <ul className="nav-list">
            {currentData.menu.map((text, index) => (
              <li key={index} className="nav-item">
                <Link to="/" className="nav-link">
                  {text} {index === 1 && <i className="fa-solid fa-chevron-down arrow-icon"></i>}
                </Link>
                {index === 1 && (
                  <ul className="submenu">
                    {currentData.skincareSub.map((sub, i) => (
                      <li key={i}><Link to="/">{sub}</Link></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;