// src/pages/Tasks.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Navigate } from 'react-router-dom';

const Tasks = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await axios.get('/whoami/', { withCredentials: true });
      if (!res.data.user) {
        setIsAuthenticated(false);
      } else {
        fetchUsers();
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthenticated(false);
      }
    }
  };
  checkAuth();
}, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users/', { withCredentials: true });

      let usersData;
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else {
        usersData = response.data.results || [];
      }

      setUsers(usersData);
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err);
      setError('Не удалось загрузить список пользователей');
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => file.size <= 20 * 1024 * 1024);

    if (validFiles.length !== selectedFiles.length) {
      setError('Некоторые файлы слишком большие. Максимум 20 МБ.');
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (assignee) formData.append('assignee_id', assignee);

    // Добавляем все файлы
    files.forEach(file => {
      formData.append('attachments', file);
    });

    try {
      const response = await axios.post(
        '/tasks/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      navigate(`/task/${response.data.id}`);
    } catch (err) {
      let errorMessage = 'Не удалось создать задачу. Проверьте данные.';

      // Извлекаем сообщение из assignee
      if (err.response?.data?.assignee) {
        errorMessage = err.response.data.assignee;
      }

      setError(errorMessage);
      console.error(err);
    }
  };
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mt-4">
      <h2>Создать новую задачу</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Заголовок</label>
          <input
            id="title"
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Описание</label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="assignee" className="form-label">Исполнитель</label>
          <select
            id="assignee"
            className="form-select"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="">Не назначен</option>
            {Array.isArray(users) && users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>

        {/* Вложения */}
        <div className="mb-3">
          <label htmlFor="attachments" className="form-label">Вложения</label>

          {/* Список файлов */}
          {files.length > 0 ? (
            <ul className="list-group mb-3">
              {files.map((file, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemoveFile(index)}
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Нет вложений</p>
          )}

          {/* Поле выбора файла */}
          <div className="input-group mb-2">
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
              multiple
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Создать задачу
        </button>
      </form>
    </div>
  );
};

export default Tasks;