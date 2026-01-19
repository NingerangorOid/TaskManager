// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // убедись, что файл существует
import Profile from './pages/Profile';
import TaskDetail from './pages/TaskDetail';
import Tasks from './pages/Tasks';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<Login />} />

        {/* Защищённые маршруты */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="profile" element={<Profile />} />
          <Route path="task/:id" element={<TaskDetail />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div>Страница не найдена</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;