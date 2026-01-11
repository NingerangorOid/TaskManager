// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import TaskDetail from './pages/TaskDetail';

function App() {
  return (
    <Router>
      <Routes>
        {/* Страницы с админ-шаблоном */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="task/:id" element={<TaskDetail />} />
        </Route>

        {/* Страница без шаблона */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;