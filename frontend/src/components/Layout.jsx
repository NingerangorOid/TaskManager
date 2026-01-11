// src/components/Layout.jsx
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div id="wrapper">
      {/* Sidebar */}
      <ul className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${sidebarOpen ? '' : 'toggled'}`} id="accordionSidebar">
        <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
          <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-laugh-wink"></i>
          </div>
          <div className="sidebar-brand-text mx-3">TaskManager</div>
        </Link>

        <hr className="sidebar-divider my-0" />

        <li className="nav-item">
          <Link className="nav-link" to="/dashboard">
            <i className="fas fa-fw fa-tachometer-alt"></i>
            <span>Панель</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/tasks">
            <i className="fas fa-fw fa-tasks"></i>
            <span>Задачи</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/profile">
            <i className="fas fa-fw fa-user"></i>
            <span>Профиль</span>
          </Link>
        </li>

        <hr className="sidebar-divider d-none d-md-block" />

        <div className="text-center d-none d-md-inline">
          <button
            className="rounded-circle border-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none' }}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </ul>

      {/* Content Wrapper */}
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            <button
              className="btn btn-link d-md-none rounded-circle mr-3"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fa fa-bars"></i>
            </button>
            <ul className="navbar-nav ml-auto">
              <li className="nav-item dropdown no-arrow">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <span className="mr-2 d-none d-lg-inline text-gray-600 small">Роман</span>
                  <img className="img-profile rounded-circle" src="https://via.placeholder.com/100" alt="User" />
                </a>
                <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in">
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i> Профиль
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i> Выйти
                  </a>
                </div>
              </li>
            </ul>
          </nav>

          <div className="container-fluid">
            <Outlet /> {/* Здесь рендерятся дочерние страницы */}
          </div>
        </div>

        <footer className="sticky-footer bg-white">
          <div className="container my-auto">
            <div className="copyright text-center my-auto">
              <span>© TaskManager {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;