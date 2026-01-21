// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/whoami/');
        setUser(res.data.user);
      } catch (err) {
        console.error('Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div className="container mt-4">Загрузка...</div>;

  return (
    <div className="container mt-4">
      <h2>Мой профиль</h2>
      <div className="card p-4">
        <h5>{user.username}</h5>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Роль:</strong> {user.is_staff ? 'Администратор' : 'Пользователь'}</p>
      </div>
    </div>
  );
};

export default Profile;