import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Booking.css';

const Booking = () => {
  const navigate = useNavigate();
  const [bookingList, setBookingList] = useState([]);
  const [formData, setFormData] = useState({ 
    fullName: '', 
    phone: '', 
    bookingType: 'store', 
    branch: '', 
    area: '', 
    address: '' 
  });

  useEffect(() => {
    const savedList = localStorage.getItem('preOrderList');
    if (savedList) setBookingList(JSON.parse(savedList));
  }, []);

  const handleRemove = (index) => {
    const newList = bookingList.filter((_, i) => i !== index);
    setBookingList(newList);
    localStorage.setItem('preOrderList', JSON.stringify(newList));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Đã gửi yêu cầu đặt lịch thành công!");
    localStorage.removeItem('preOrderList');
    navigate('/');
  };

  return (
<div className="booking-page">
      {bookingList.length === 0 ? (
        <div className="empty-booking">
          <div className="empty-icon">
            <i className="fa-regular fa-calendar-check"></i>
          </div>
          <h2>Đơn đặt lịch của bạn đang trống</h2>
          <p>Hãy khám phá hàng ngàn sản phẩm làm đẹp hấp dẫn tại cửa hàng nhé!</p>
          <button className="explore-btn" onClick={() => navigate('/')}>Khám phá ngay</button>
        </div>
      ) : (
        <>
          <h2 className="section-title">Danh sách đặt lịch</h2>
          <div className="booking-list">
            {bookingList.map((item, index) => (
              <div key={index} className="booking-item-card">
                <img src={item.image} alt={item.name} className="item-img" />
                
                <div className="item-info">
                  <h4 className="item-name">{item.name}</h4>
                  <p className="item-details">
                    Size: {item.selectedSize} | {item.currentPrice}đ
                  </p>
                </div>
                
                <button className="remove-btn" onClick={() => handleRemove(index)}>Xóa</button>
              </div>
            ))}
          </div>

          <form className="booking-form" onSubmit={handleSubmit}>
            <h3>Thông tin liên hệ</h3>
            <input name="fullName" placeholder="Họ và tên" required onChange={handleChange} />
            <input name="phone" placeholder="Số điện thoại" required onChange={handleChange} />

            <div className="radio-group">
              <input type="radio" id="store" name="bookingType" value="store" checked={formData.bookingType === 'store'} onChange={handleChange} />
              <label htmlFor="store" className="radio-button">Đến cửa hàng</label>

              <input type="radio" id="delivery" name="bookingType" value="delivery" checked={formData.bookingType === 'delivery'} onChange={handleChange} />
              <label htmlFor="delivery" className="radio-button">Giao tận nơi</label>
            </div>

            {formData.bookingType === 'store' ? (
              <select name="branch" required onChange={handleChange}>
                <option value="">Chọn chi nhánh</option>
                <option value="CN1">Chi nhánh Quận 1, TP.HCM</option>
                <option value="CN2">Chi nhánh Quận 3, TP.HCM</option>
              </select>
            ) : (
              <>
                <select name="area" required onChange={handleChange}>
                  <option value="">Chọn khu vực</option>
                  <option value="Q1">Quận 1</option>
                  <option value="Q3">Quận 3</option>
                </select>
                <input name="address" placeholder="Địa chỉ chi tiết" required onChange={handleChange} />
              </>
            )}

            <button type="submit" className="submit-btn">Xác nhận đặt lịch</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Booking;