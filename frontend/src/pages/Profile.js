// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/whoami/', { withCredentials: true });
        if (res.data.user) {
            setUser(res.data.user);
        } else {
            setIsAuthenticated(false);
        }
    } catch (err) {
        console.error('Не удалось загрузить профиль');
        if (err.response?.status === 401 || err.response?.status === 403) {
            setIsAuthenticated(false);
        }
    } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" replace />;
  }

  if (loading) return <div className="container mt-4">Загрузка...</div>;

  return (
    <div className="container mt-4">
      <h2>Мой профиль</h2>
      <div className="card p-4">
        <h5>{user.username}</h5>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Роль:</strong> {user.is_superuser ? 'Администратор' :
                                   user.is_staff ? 'Руководитель' :
                                   'Пользователь'}</p>
      </div>
    </div>
  );
};

export default Profile;