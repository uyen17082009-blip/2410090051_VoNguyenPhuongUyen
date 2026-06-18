import React, { useState, useEffect } from 'react';
import './Footer.css';
import logoImage from '../../img/logo.png';

const Footer = () => {
  const [lang, setLang] = useState('VN');

  const trans = {
    VN: {
      about: "Về Aline Beauty",
      links: ["Nguồn gốc thương hiệu", "Dịch vụ khách hàng", "Cơ hội nghề nghiệp", "Liên hệ hỗ trợ"],
      stores: "Hệ thống cửa hàng",
      findStore: "Tìm cửa hàng gần bạn",
      policy: "Chính sách đổi trả",
      follow: "KẾT NỐI VỚI CHÚNG TÔI",
      mapBtn: "Xem trên Google Maps",
      copyright: <>©2026 Aline Beauty. <br/> Tận tâm chăm sóc vẻ đẹp Việt. <br/> All rights reserved.</>
    },
    EN: {
      about: "About Aline Beauty",
      links: ["Brand Origin", "Customer Services", "Careers", "Contact Support"],
      stores: "Store System",
      findStore: "Find a store near you",
      policy: "Return Policy",
      follow: "FOLLOW US",
      mapBtn: "View on Google Maps",
      copyright: <>©2026 Aline Beauty. <br/> Dedicated to Vietnamese beauty. <br/> All rights reserved.</>
    }
  };

  useEffect(() => {
    const handleLangChange = (e) => setLang(e.detail);
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const d = trans[lang];

  return (
    <footer className="aline-footer">
      <div className="footer-purple-strip"></div>
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-logo">
              <img src={logoImage} alt="Logo" className='footer-logo-img' />
            </div>
            <p className="footer-copyright">{d.copyright}</p>
          </div>

          <div className="footer-middle">
            <div className="footer-column">
              <h3 className="footer-column-title">{d.about}</h3>
              <ul className="footer-links">
                <li><a href="/origin">{d.links[0]}</a></li>
                <li><a href="/services">{d.links[1]}</a></li>
                <li><a href="/careers">{d.links[2]}</a></li>
                <li><a href="/contact">{d.links[3]}</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="footer-column-title">{d.stores}</h3>
              <ul className="footer-links">
                <li><a href="/find-store">{d.findStore}</a></li>
                <li><a href="/policy">{d.policy}</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-right">
            <h3 className="footer-column-title">{d.follow}</h3>
            <div className="footer-social-icons">
              <a href="https://facebook.com" className='social-icon'><i className='fab fa-facebook-f'></i></a>
              <a href="https://instagram.com" className='social-icon'><i className='fab fa-instagram'></i></a>
              <a href="https://youtube.com" className='social-icon'><i className='fab fa-youtube'></i></a>
              <a href="https://tiktok.com" className='social-icon'><i className='fab fa-tiktok'></i></a>
            </div>
            <div className="footer-map-container">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.460232428311!2d106.6974825!3d10.7760194!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38557e03db%3A0x8d760d7019039050!2sVincom%20Center!5e0!3m2!1svi!2svn!4v1710000000000!5m2!1svi!2svn" 
                width="100%" 
                height="120" 
                style={{ border: 0, borderRadius: "8px" }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Aline Beauty Map"
              ></iframe>
              <a className='footer-map-link' href="#" target="_blank" rel='noopener noreferrer'>
                <i className="fas fa-location-dot"></i> {d.mapBtn}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-chat-button"><i className='fas fa-comment-dots'></i></div>
    </footer>
  );
};

export default Footer;
