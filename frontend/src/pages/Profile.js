// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from '../components/TaskList';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('/whoami/', { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(console.error);
  }, []);

  if (!user) return <div>Загрузка профиля...</div>;

  return (
    <div className="container mt-4">
      <h2>Профиль</h2>
      <p><strong>Имя:</strong> {user.username}</p>
      <p><strong>Роль:</strong> {user.is_staff ? 'Администратор' : 'Пользователь'}</p>
      <h3>Мои задачи</h3>
      <TaskList filterAssigneeId={user.id} />
    </div>
  );
};
export default Profile;