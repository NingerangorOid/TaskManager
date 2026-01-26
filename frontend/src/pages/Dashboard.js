// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false); // ← новое имя
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState('/tasks/'); // ← исправлен URL
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const fetchTasksAndUser = async (url = '/tasks/') => {
    try {
      setLoading(true);
      const [tasksRes, userRes] = await Promise.all([
        axios.get(url, { withCredentials: true }),
        axios.get('/whoami/', { withCredentials: true })
      ]);

      if (tasksRes.data.results !== undefined) {
        setTasks(tasksRes.data.results);
        setNextPage(tasksRes.data.next);
        setPrevPage(tasksRes.data.previous);
        setCurrentPageUrl(url);
      } else {
        setTasks(tasksRes.data);
        setNextPage(null);
        setPrevPage(null);
        setCurrentPageUrl('/tasks/');
      }

      const user = userRes.data.user;

      if (!user) {
            setIsAuthenticated(false);
            setLoading(false);
            return;}

      setCanManage(user.is_staff || user.is_superuser); // ← staff + superuser
    }
    catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
  setIsAuthenticated(false);}

      console.error('Ошибка загрузки задач или профиля:', err);
      setTasks([]);
      setNextPage(null);
      setPrevPage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndUser();
  }, []);

  const handleTaskDeleted = () => {
    fetchTasksAndUser(currentPageUrl);
  };

  if (!isAuthenticated && !loading) {
  return <Navigate to="/login" replace />;}

  if (loading) return <div className="container mt-4">Загрузка...</div>;

  return (
    <div className="container mt-4">
      <h2>Панель задач</h2>

      {Array.isArray(tasks) && tasks.length === 0 ? (
        <p>У вас пока нет задач.</p>
      ) : (
        Array.isArray(tasks) && tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            canManage={canManage} // ← передаём единый флаг
            onTaskDeleted={handleTaskDeleted}
          />
        ))
      )}

      {/* Пагинация */}
      {(nextPage || prevPage) && (
        <div className="mt-4 d-flex justify-content-center">
          {prevPage && (
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => fetchTasksAndUser(prevPage)}
            >
              Предыдущая
            </button>
          )}
          {nextPage && (
            <button
              className="btn btn-outline-primary"
              onClick={() => fetchTasksAndUser(nextPage)}
            >
              Следующая
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;