import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Страницы
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskDetail from './pages/TaskDetail';
import Profile from './pages/Profile';

// Конфигурация axios для всех запросов
axios.defaults.baseURL = 'http://localhost:8000'; // ← бэкенд на 8000
axios.defaults.withCredentials = true;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Проверяем, авторизован ли пользователь при загрузке
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Проверяем токен через API
      axios.get('/api/users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => setIsAuthenticated(true))
      .catch(() => localStorage.removeItem('access_token'))
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="d-flex vh-100 justify-content-center align-items-center">Загрузка...</div>;
  }

  return (
    <Router>
      <div id="wrapper" className="d-flex">
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={
            !isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />
          } />

          {/* Защищённые маршруты */}
          <Route path="/" element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
          } />
          <Route path="/tasks/:id" element={
            isAuthenticated ? <TaskDetail /> : <Navigate to="/login" />
          } />
          <Route path="/profile" element={
            isAuthenticated ? <Profile /> : <Navigate to="/login" />
          } />

          {/* Перенаправление на логин по умолчанию */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;