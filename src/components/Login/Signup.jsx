import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim() || !formData.password.trim() || !formData.email.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    try {
      await axios.post('/api/register', {
        user: formData.username.trim(),
        pass: formData.password.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      });
      navigate('/login');
    } catch (err) {
      setError('Đăng ký thất bại, vui lòng thử lại sau');
    }
  };

  // Định nghĩa nhãn hiển thị cho các trường dữ liệu
  const fieldLabels = {
    username: 'Tên đăng nhập',
    phone: 'Số điện thoại',
    email: 'Địa chỉ Email',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu'
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Tạo tài khoản</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          {['username', 'phone', 'email', 'password', 'confirmPassword'].map((field) => (
            <div className="form-group" key={field}>
              <input
                type={field.includes('password') ? 'password' : 'text'}
                name={field}
                className="form-input"
                placeholder={fieldLabels[field]}
                value={formData[field]}
                onChange={handleChange}
              />
            </div>
          ))}

          {error && <div className="login-error">{error}</div>}
          
          <button type="submit" className="login-button">
            ĐĂNG KÝ
          </button>
        </form>

        <div className="login-divider">Hoặc đăng ký với</div>
        <div className="social-login">
          <button type="button" className="social-btn facebook">
            <i className="fab fa-facebook-f"></i> <span>Facebook</span>
          </button>
          <button type="button" className="social-btn google">
            <i className="fab fa-google"></i> <span>Google</span>
          </button>
        </div>
        
        <div className="login-footer">
          <span>Bạn đã có tài khoản?</span>
          <Link to="/login" className="signup-link">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;