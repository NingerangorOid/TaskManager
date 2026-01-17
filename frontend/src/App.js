// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import TaskDetail from './pages/TaskDetail';
import ProtectedRoute from './components/ProtectedRoute'; // ← новый компонент

function App() {
  return (
    <Router>
      <Routes>
        {/* Публичный маршрут: логин */}
        <Route path="/login" element={<Login />} />

        {/* Защищённые маршруты: обёрнуты в Layout и ProtectedRoute */}
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
          <Route path="profile" element={<Profile />} />
          <Route path="task/:id" element={<TaskDetail />} />
        </Route>

        {/* Перенаправление всех неизвестных путей на /login или /dashboard */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;