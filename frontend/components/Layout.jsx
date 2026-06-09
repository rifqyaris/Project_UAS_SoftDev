import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-success">
        <div className="container">
          <Link href="/" className="navbar-brand text-white fw-bold">
            <i className="bi bi-recycle me-2"></i>DonasiKu
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link href="/" className="nav-link text-white">
                  <i className="bi bi-house-door me-1"></i>Home
                </Link>
              </li>

              {user && (
                <>
                  <li className="nav-item">
                    <Link href="/donasi-saya" className="nav-link text-white">
                      <i className="bi bi-box-seam me-1"></i>Donasi Saya
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/history" className="nav-link text-white">
                      <i className="bi bi-clock-history me-1"></i>History
                    </Link>
                  </li>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle text-white"
                      href="#"
                      id="userDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                    >
                      <i className="bi bi-person-circle me-1"></i>{user.nama}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <span className="dropdown-item-text small text-muted">
                          {user.email}
                        </span>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item" onClick={handleLogout}>
                          <i className="bi bi-box-arrow-right me-1"></i>Logout
                        </button>
                      </li>
                    </ul>
                  </li>
                </>
              )}

              {!user && !loading && (
                <>
                  <li className="nav-item">
                    <Link href="/login" className="nav-link text-white">
                      <i className="bi bi-box-arrow-in-right me-1"></i>Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/register" className="nav-link text-white">
                      <i className="bi bi-person-plus me-1"></i>Daftar
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="bg-dark text-white mt-5 py-4">
        <div className="container text-center">
          <p className="mb-0">
            &copy; 2026 DonasiKu - Platform Donasi Sampah Anorganik
          </p>
          <p className="small text-muted mb-0">Universitas Tarumanagara</p>
        </div>
      </footer>
    </>
  );
}