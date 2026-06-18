import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminProduct from './AdminProduct';
import AdminCategory from './AdminCategory';
import AdminCustomer from './AdminCustomer';
import AdminEmployee from './AdminEmployee';
import AdminBill from './AdminBill';
import AdminInvoiceDetails from './AdminInvoiceDetails';
import './Admin.css';

const jsonBase = import.meta.env.BASE_URL || '/';

const SECTION_LABEL = {
  dashboard: 'Dashboard',
  products: 'Sản phẩm',
  category: 'Danh mục',
  customer: 'Khách hàng',
  employee: 'Nhân viên',
  bill: 'Hóa đơn',
  invoiceDetails: 'Chi tiết hóa đơn',
};

function fmtNumber(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function fmtCurrency(n) {
  return `${fmtNumber(Number(n) || 0)} đ`;
}

/** Trạng thái hóa đơn: giá trị trong `bill.json` field `status` */
const BILL_STATUS_MAP = {
  delivered: { label: 'Đã giao hàng', cls: 'done' },
  shipping: { label: 'Vận chuyển', cls: 'shipping' },
  pending: { label: 'Chưa giải quyết', cls: 'pending' },
  processing: { label: 'Xử lý', cls: 'processing' },
};

function billStatusFromJson(statusRaw) {
  const key = String(statusRaw || '')
    .trim()
    .toLowerCase();
  if (BILL_STATUS_MAP[key]) return { key, ...BILL_STATUS_MAP[key] };
  return {
    key: 'unknown',
    label: key ? String(statusRaw).trim() : 'Chưa xác định',
    cls: 'unknown',
  };
}

const Admin = () => {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [adminSection, setAdminSection] = useState('dashboard');

  const userMenuRef = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem('currentUser');
    if (!raw) {
      navigate('/login');
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (u.role !== 'staff') {
        navigate('/');
        return;
      }
      setAllowed(true);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!allowed) return;

    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [pRes, cRes, bRes, cuRes, eRes, iRes] = await Promise.all([
          fetch(`${jsonBase}product.json`),
          fetch(`${jsonBase}category.json`),
          fetch(`${jsonBase}Bill.json`),
          fetch(`${jsonBase}Customer.json`),
          fetch(`${jsonBase}Employee.json`),
          fetch(`${jsonBase}Invoicedetails.json`),
        ]);
        if (!pRes.ok) throw new Error('Không tải được products.json');
        const pdata = await pRes.json();
        setProducts(Array.isArray(pdata) ? pdata : []);

        if (cRes.ok) {
          const cdata = await cRes.json();
          setCategories(Array.isArray(cdata) ? cdata : []);
        }
        if (bRes.ok) {
          const bdata = await bRes.json();
          setBills(Array.isArray(bdata) ? bdata : []);
        }
        if (cuRes.ok) {
          const cudata = await cuRes.json();
          setCustomers(Array.isArray(cudata) ? cudata : []);
        }
        if (eRes.ok) {
          const edata = await eRes.json();
          setEmployees(Array.isArray(edata) ? edata : []);
        }
        if (iRes.ok) {
          const idata = await iRes.json();
          setInvoiceDetails(Array.isArray(idata) ? idata : []);
        }
      } catch (e) {
        setLoadError(e.message || 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [allowed]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, [userMenuOpen]);

  const staffInitials = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return 'AD';
      const u = JSON.parse(raw);
      const name = String(u.account || u.username || 'Staff').trim();
      const parts = name.split(/\s+/).filter(Boolean);
      if (!parts.length) return 'AD';
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } catch {
      return 'AD';
    }
  }, []);

  const staffDisplayName = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return 'Administrator';
      const u = JSON.parse(raw);
      return String(u.account || u.username || 'Staff').trim() || 'Administrator';
    } catch {
      return 'Administrator';
    }
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    const soldSum = invoiceDetails.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const catCount = categories.length;
    const uncategorized = products.filter((p) => p.categoryid == null || p.categoryid === '').length;
    const revenue = bills.reduce((sum, bill) => sum + Number(bill.total || 0), 0);
    const avgBill = bills.length ? revenue / bills.length : 0;

    return { total, soldSum, catCount, uncategorized, revenue, avgBill };
  }, [products, categories, invoiceDetails, bills]);

  const topSoldProducts = useMemo(() => {
    const byProduct = invoiceDetails.reduce((map, item) => {
      const pid = Number(item.product_id);
      const quantity = Number(item.quantity || 0);
      map.set(pid, (map.get(pid) || 0) + quantity);
      return map;
    }, new Map());

    return [...byProduct.entries()]
      .map(([id, sold]) => {
        const product = products.find((p) => Number(p.id) === id);
        return {
          id,
          sold,
          name: product?.name || `Sản phẩm #${id}`,
        };
      })
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map((p) => {
        const sold = Number(p.sold || 0);
        const percent = Math.max(0, Math.min(100, Math.round((sold / 800) * 100)));
        return { id: p.id, name: p.name, sold, percent };
      });
  }, [products, invoiceDetails]);

  const revenueByDate = useMemo(() => {
    const grouped = bills.reduce((acc, bill) => {
      const key = String(bill.date || '').slice(0, 10) || 'N/A';
      acc.set(key, (acc.get(key) || 0) + Number(bill.total || 0));
      return acc;
    }, new Map());

    const rows = [...grouped.entries()]
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const maxTotal = rows.reduce((m, row) => Math.max(m, row.total), 0);

    return rows.map((row) => ({
      ...row,
      percent: maxTotal > 0 ? Math.max(8, Math.round((row.total / maxTotal) * 100)) : 0,
    }));
  }, [bills]);

  const billTableRows = useMemo(() => {
    const customerMap = new Map(customers.map((c) => [Number(c.id), c.name]));
    const productMap = new Map(products.map((p) => [Number(p.id), p.name]));
    const detailByBill = invoiceDetails.reduce((map, item) => {
      const key = Number(item.bill_id);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
      return map;
    }, new Map());

    return [...bills]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 6)
      .map((bill) => {
        const details = detailByBill.get(Number(bill.id)) || [];
        const firstProduct = details[0];
        const itemName = firstProduct
          ? productMap.get(Number(firstProduct.product_id)) || `Sản phẩm #${firstProduct.product_id}`
          : '-';

        return {
          id: bill.id,
          billCode: String(bill.id),
          customerName: customerMap.get(Number(bill.customer_id)) || `KH #${bill.customer_id}`,
          itemName,
          status: billStatusFromJson(bill.status),
        };
      });
  }, [bills, customers, products, invoiceDetails]);

  const vipCustomers = useMemo(() => {
    if (!bills.length) return [];
    const latestDate = bills
      .map((bill) => String(bill.date || ''))
      .sort()
      .slice(-1)[0];

    const targetMonth = latestDate.slice(0, 7);
    const customerMap = new Map(customers.map((c) => [Number(c.id), c.name]));

    const grouped = bills.reduce((map, bill) => {
      if (!String(bill.date || '').startsWith(targetMonth)) return map;
      const cid = Number(bill.customer_id);
      if (!map.has(cid)) {
        map.set(cid, { customerId: cid, total: 0, count: 0 });
      }

      const row = map.get(cid);
      row.total += Number(bill.total || 0);
      row.count += 1;

      return map;
    }, new Map());

    return [...grouped.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((row) => ({
        ...row,
        name: customerMap.get(row.customerId) || `KH #${row.customerId}`,
      }));
  }, [bills, customers]);

  const goHome = () => navigate('/');
  const logout = () => {
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('userUpdated'));
    navigate('/login');
    setLogoutModalOpen(false);
  };

  const closeMobileNav = () => setMobileSidebarOpen(false);

  if (!allowed) {
    return <div className="ruang-boot" aria-hidden />;
  }

  return (
    <div className="ruang-layout">
      <div
        className={`ruang-overlay${mobileSidebarOpen ? ' is-visible' : ''}`}
        onClick={closeMobileNav}
        aria-hidden={!mobileSidebarOpen}
      />

      <aside className={`ruang-sidebar${mobileSidebarOpen ? ' is-open' : ''}`}>
        <div className="ruang-sidebar__brand">
          <span className="ruang-sidebar__brand-icon">
            <i className="fa-solid fa-layer-group" aria-hidden />
          </span>
          <span>ALINE BEAUTY</span>
        </div>
        <hr className="ruang-sidebar__divider" />
        <div className="ruang-sidebar__heading">Tiện ích</div>
        <ul className="ruang-sidebar__nav">
          <li>
            <button
              type="button"
              className={`ruang-sidebar__link${adminSection === 'dashboard' ? ' is-active' : ''}`}
              onClick={() => {
                setAdminSection('dashboard');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-gauge-high" aria-hidden />
              Trang chủ
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar__link${adminSection === 'products' ? ' is-active' : ''}`}
              onClick={() => {
                setAdminSection('products');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-box" aria-hidden />
              Sản phẩm
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar__link${adminSection === 'category' ? ' is-active' : ''}`}
              onClick={() => {
                setAdminSection('category');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-tags" aria-hidden />
              Danh mục
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar__link${adminSection === 'customer' ? ' is-active' : ''}`}
              onClick={() => {
                setAdminSection('customer');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-address-book" aria-hidden />
              Khách hàng
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar__link${adminSection === 'employee' ? ' is-active' : ''}`}
              onClick={() => {
                setAdminSection('employee');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-id-card" aria-hidden />
              Nhân viên
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar__link${adminSection === 'bill' ? ' is-active' : ''}`}
              onClick={() => {
                setAdminSection('bill');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-file-invoice-dollar" aria-hidden />
              Hóa đơn
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar__link${adminSection === 'invoiceDetails' ? ' is-active' : ''}`}
              onClick={() => {
                setAdminSection('invoiceDetails');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-circle-info" aria-hidden />
              Chi tiết hóa đơn
            </button>
          </li>
        </ul>
        <hr className="ruang-sidebar__divider" />
        <div className="ruang-sidebar__version">Version 1.1.0</div>
      </aside>

      <div className="ruang-main">
        <header className="ruang-header">
          <button
            type="button"
            className="ruang-header__toggle"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <i className="fa-solid fa-bars" />
          </button>

          <div className="ruang-header__right">
            <button
              type="button"
              className="ruang-header__home-btn"
              onClick={goHome}
              title="Về trang chủ bán hàng"
            >
              <i className="fa-solid fa-house" />
            </button>

            <div className="ruang-user-menu" ref={userMenuRef}>
              <button
                type="button"
                className="ruang-user-menu__trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="ruang-user-menu__avatar">{staffInitials}</div>
                <span className="ruang-user-menu__name">{staffDisplayName}</span>
                <i className="fa-solid fa-angle-down ruang-user-menu__caret" />
              </button>

              {userMenuOpen && (
                <div className="ruang-user-menu__dropdown">
                  <div className="ruang-user-menu__header">
                    <p className="ruang-user-menu__dropdown-name">{staffDisplayName}</p>
                    <p className="ruang-user-menu__dropdown-role">Nhân viên quản trị</p>
                  </div>
                  <hr className="ruang-user-menu__divider" />
                  <button
                    type="button"
                    className="ruang-user-menu__item ruang-user-menu__item--logout"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setLogoutModalOpen(true);
                    }}
                  >
                    <i className="fa-solid fa-right-from-bracket" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="ruang-content">
          <div className="ruang-content__head">
            <h1 className="ruang-content__title">{SECTION_LABEL[adminSection]}</h1>
            <ol className="ruang-breadcrumb">
              <li className="ruang-breadcrumb__item">
                <span className="ruang-link-mock" onClick={() => setAdminSection('dashboard')}>
                  Admin
                </span>
              </li>
              <li className="ruang-breadcrumb__item ruang-breadcrumb__item--active">
                {SECTION_LABEL[adminSection]}
              </li>
            </ol>
          </div>

          {loading ? (
            <div className="ruang-loading-box">
              <div className="ruang-spinner" />
              <p>Đang tải dữ liệu, vui lòng đợi...</p>
            </div>
          ) : loadError ? (
            <div className="ruang-error-box">
              <i className="fa-solid fa-triangle-exclamation ruang-error-box__icon" />
              <div className="ruang-error-box__body">
                <h4 className="ruang-error-box__title">Lỗi tải dữ liệu</h4>
                <p className="ruang-error-box__msg">{loadError}</p>
                <button
                  type="button"
                  className="ruang-btn ruang-btn--primary ruang-btn--sm"
                  onClick={() => window.location.reload()}
                >
                  Tải lại trang
                </button>
              </div>
            </div>
          ) : (
            <div className="ruang-section-body">
              {adminSection === 'dashboard' && (
                <div className="ruang-dashboard">
                  <div className="ruang-cards-grid">
                    <div className="ruang-stat-card ruang-stat-card--primary">
                      <div className="ruang-stat-card__body">
                        <div className="ruang-stat-card__info">
                          <div className="ruang-stat-card__label">Tổng doanh thu</div>
                          <div className="ruang-stat-card__value">{fmtCurrency(stats.revenue)}</div>
                        </div>
                        <div className="ruang-stat-card__icon-box">
                          <i className="fa-solid fa-calendar-days" />
                        </div>
                      </div>
                    </div>

                    <div className="ruang-stat-card ruang-stat-card--success">
                      <div className="ruang-stat-card__body">
                        <div className="ruang-stat-card__info">
                          <div className="ruang-stat-card__label">Số lượng đơn hàng</div>
                          <div className="ruang-stat-card__value">{fmtNumber(bills.length)}</div>
                        </div>
                        <div className="ruang-stat-card__icon-box">
                          <i className="fa-solid fa-shopping-cart" />
                        </div>
                      </div>
                    </div>

                    <div className="ruang-stat-card ruang-stat-card--info">
                      <div className="ruang-stat-card__body">
                        <div className="ruang-stat-card__info">
                          <div className="ruang-stat-card__label">Sản phẩm đã bán</div>
                          <div className="ruang-stat-card__value">{fmtNumber(stats.soldSum)}</div>
                        </div>
                        <div className="ruang-stat-card__icon-box">
                          <i className="fa-solid fa-box-open" />
                        </div>
                      </div>
                    </div>

                    <div className="ruang-stat-card ruang-stat-card--warning">
                      <div className="ruang-stat-card__body">
                        <div className="ruang-stat-card__info">
                          <div className="ruang-stat-card__label">Giá trị trung bình đơn</div>
                          <div className="ruang-stat-card__value">{fmtCurrency(stats.avgBill)}</div>
                        </div>
                        <div className="ruang-stat-card__icon-box">
                          <i className="fa-solid fa-calculator" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ruang-dashboard__charts">
                    <div className="ruang-chart-card">
                      <div className="ruang-chart-card__header">
                        <h6 className="ruang-chart-card__title">Doanh thu theo ngày</h6>
                      </div>
                      <div className="ruang-chart-card__body">
                        <div className="ruang-bar-chart">
                          {revenueByDate.map((row) => (
                            <div key={row.date} className="ruang-bar-chart__row">
                              <span className="ruang-bar-chart__date">{row.date}</span>
                              <div className="ruang-bar-chart__progress-wrapper">
                                <div
                                  className="ruang-bar-chart__progress-bar"
                                  style={{ width: `${row.percent}%` }}
                                />
                              </div>
                              <span className="ruang-bar-chart__val">{fmtCurrency(row.total)}</span>
                            </div>
                          ))}
                          {!revenueByDate.length && (
                            <p className="ruang-empty-text">Chưa có dữ liệu doanh thu</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ruang-chart-card">
                      <div className="ruang-chart-card__header">
                        <h6 className="ruang-chart-card__title">Top 5 sản phẩm bán chạy (ước lượng)</h6>
                      </div>
                      <div className="ruang-chart-card__body">
                        <div className="ruang-top-products">
                          {topSoldProducts.map((p) => (
                            <div key={p.id} className="ruang-top-products__item">
                              <div className="ruang-top-products__meta">
                                <span className="ruang-top-products__name">{p.name}</span>
                                <span className="ruang-top-products__qty">{p.sold} đã bán</span>
                              </div>
                              <div className="ruang-top-products__track">
                                <div
                                  className="ruang-top-products__fill"
                                  style={{ width: `${p.percent}%` }}
                                />
                              </div>
                            </div>
                          ))}
                          {!topSoldProducts.length && (
                            <p className="ruang-empty-text">Chưa có dữ liệu sản phẩm</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ruang-dashboard__tables">
                    <div className="ruang-table-card">
                      <div className="ruang-table-card__header">
                        <h6 className="ruang-table-card__title">Hóa đơn gần đây</h6>
                      </div>
                      <div className="ruang-table-card__body">
                        <div className="ruang-table-responsive">
                          <table className="ruang-table">
                            <thead>
                              <tr>
                                <th>Mã HĐ</th>
                                <th>Khách hàng</th>
                                <th>Sản phẩm đầu</th>
                                <th>Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              {billTableRows.map((row) => (
                                <tr key={row.id}>
                                  <td><strong>#{row.billCode}</strong></td>
                                  <td>{row.customerName}</td>
                                  <td>{row.itemName}</td>
                                  <td>
                                    <span className={`ruang-badge ruang-badge--${row.status.cls}`}>
                                      {row.status.label}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {!billTableRows.length && (
                                <tr>
                                  <td colSpan="4" className="ruang-table__empty">
                                    Chưa có hóa đơn nào
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="ruang-table-card">
                      <div className="ruang-table-card__header">
                        <h6 className="ruang-table-card__title">Khách hàng thân thiết (Tháng này)</h6>
                      </div>
                      <div className="ruang-table-card__body">
                        <div className="ruang-vip-list">
                          {vipCustomers.map((c) => (
                            <div key={c.customerId} className="ruang-vip-item">
                              <div className="ruang-vip-item__left">
                                <div className="ruang-vip-item__icon">
                                  <i className="fa-solid fa-crown" />
                                </div>
                                <div className="ruang-vip-item__info">
                                  <span className="ruang-vip-item__name">{c.name}</span>
                                  <span className="ruang-vip-item__count">{c.count} đơn hàng</span>
                                </div>
                              </div>
                              <span className="ruang-vip-item__total">{fmtCurrency(c.total)}</span>
                            </div>
                          ))}
                          {!vipCustomers.length && (
                            <p className="ruang-empty-text">Chưa có dữ liệu thành viên</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminSection === 'products' && (
                <AdminProduct products={products} setProducts={setProducts} categories={categories} />
              )}
              {adminSection === 'category' && (
                <AdminCategory categories={categories} setCategories={setCategories} products={products} />
              )}
              {adminSection === 'customer' && (
                <AdminCustomer customers={customers} setCustomers={setCustomers} bills={bills} />
              )}
              {adminSection === 'employee' && (
                <AdminEmployee employees={employees} setEmployees={setEmployees} />
              )}
              {adminSection === 'bill' && (
                <AdminBill
                  bills={bills}
                  setBills={setBills}
                  customers={customers}
                  invoiceDetails={invoiceDetails}
                  billStatusFromJson={billStatusFromJson}
                  BILL_STATUS_MAP={BILL_STATUS_MAP}
                />
              )}
              {adminSection === 'invoiceDetails' && (
                <AdminInvoiceDetails
                  invoiceDetails={invoiceDetails}
                  setInvoiceDetails={setInvoiceDetails}
                  bills={bills}
                  products={products}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {logoutModalOpen && (
        <div className="ruang-modal-backdrop">
          <div className="ruang-modal">
            <div className="ruang-modal__header">
              <h5 className="ruang-modal__title">Xác nhận đăng xuất</h5>
              <button
                type="button"
                className="ruang-modal__close"
                onClick={() => setLogoutModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="ruang-modal__body">
              <p>Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị không?</p>
            </div>
            <div className="ruang-modal__footer">
              <button
                type="button"
                className="ruang-btn ruang-btn--secondary"
                onClick={() => setLogoutModalOpen(false)}
              >
                Hủy bỏ
              </button>
              <button type="button" className="ruang-btn ruang-btn--danger" onClick={logout}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;