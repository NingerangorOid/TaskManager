// src/components/TaskForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [files, setFiles] = useState([]); // ← массив файлов
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/users/');
        setUsers(res.data.results || res.data);
      } catch (err) {
        console.error('Ошибка загрузки пользователей:', err);
      }
    };
    fetchUsers();
  }, []);

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
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (assigneeId) formData.append('assignee_id', assigneeId);

    // Добавляем все файлы
    files.forEach(file => {
      formData.append('attachments', file);
    });

    try {
      await axios.post('/tasks/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      setTitle('');
      setDescription('');
      setAssigneeId('');
      setFiles([]);
      window.location.reload();
    } catch (err) {
      let errorMessage = 'Не удалось создать задачу';
      if (err.response?.data?.assignee) {
        errorMessage = err.response.data.assignee;
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🚨 Отладка: выведем файлы в консоль
  console.log('Файлы:', files);

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Заголовок</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Описание</label>
        <textarea
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Исполнитель</label>
        <select
          className="form-select"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">Не назначен</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      {/* Вложения */}
      <div className="mb-3">
        <label className="form-label">Вложения</label>

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
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => document.querySelector('input[type="file"]').click()}
          >
            Загрузить файл
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Создание...' : 'Создать задачу'}
      </button>
    </form>
  );
};

export default TaskForm;