// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import TaskDetail from './pages/TaskDetail';
import Tasks from './pages/Tasks';

// 🔥 Новый компонент для защиты маршрутов
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/whoami/', { credentials: 'include' });
        const data = await res.json();
        setIsAuthenticated(!!data.user);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="container mt-4 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Загрузка...</span>
      </div>
      <p className="mt-2">Проверка авторизации...</p>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 🔥 Новый компонент для страницы 404
const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container mt-5 text-center">
      <div className="mb-4">
        <h1 className="display-1 text-danger fw-bold">404</h1>
        <h2 className="mb-4">Страница не найдена</h2>
      </div>

      <div className="alert alert-warning p-4 shadow-sm">
        <div className="mb-3">
          <i className="fas fa-exclamation-triangle fa-2x text-warning"></i>
        </div>
        <p className="lead mb-3">
          Вы пытаетесь перейти по некорректному адресу.
        </p>
        <p className="mb-0">
          Через <strong>3 секунды</strong> вы будете перенаправлены на главную страницу.
        </p>
      </div>

      <div className="mt-4">
        <button
          className="btn btn-primary me-2"
          onClick={() => navigate('/dashboard')}
        >
          <i className="fas fa-home me-1"></i> Вернуться на главную сейчас
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-left me-1"></i> Вернуться назад
        </button>
      </div>

      <div className="mt-5 text-muted small">
        <p className="mb-1">
          <i className="fas fa-info-circle me-1"></i>
          Если вы считаете, что это ошибка — обратитесь к администратору системы.
        </p>
        <p className="mb-0">
          TaskManager © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<Login />} />

        {/* Защищённые маршруты */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="profile" element={<Profile />} />
          <Route path="task/:id" element={<TaskDetail />} />
        </Route>

        {/* Обработка несуществующих маршрутов */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;