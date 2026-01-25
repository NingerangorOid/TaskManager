// src/pages/TaskDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import StatusDropdown from '../components/StatusDropdown';

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Для вложений
  const [files, setFiles] = useState([]); // ← новые файлы
  const [uploading, setUploading] = useState(false);

  const loadTaskAndComments = async () => {
    try {
      setLoading(true);
      const [taskRes, commentsRes, userRes] = await Promise.all([
        axios.get(`/tasks/${id}/`, { withCredentials: true }),
        axios.get(`/tasks/${id}/comments/`, { withCredentials: true }),
        axios.get('/whoami/', { withCredentials: true })
      ]);

      let commentsData = Array.isArray(commentsRes.data)
        ? commentsRes.data
        : commentsRes.data.results || [];

      setTask(taskRes.data);
      setComments(commentsData);
      setCurrentUser(userRes.data.user);
    } catch (err) {
      console.error('Ошибка загрузки задачи, комментариев или профиля:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaskAndComments();
  }, [id]);

  const canManage = currentUser?.is_staff || currentUser?.is_superuser;
  const isCurrentUserAssignee = task?.assignee?.id === currentUser?.id;
  const canChangeStatus = canManage || isCurrentUserAssignee;

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(
        `/tasks/${id}/`,
        { status: newStatus },
        { withCredentials: true }
      );
      setTask(prev => ({ ...prev, status: newStatus }));
      setShowStatusMenu(false);
    } catch (err) {
      console.error('Ошибка изменения статуса:', err);
    }
  };

  const toggleStatusMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canChangeStatus) {
      setShowStatusMenu(!showStatusMenu);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(
        `/tasks/${id}/comments/`,
        { text: newComment },
        { withCredentials: true }
      );
      setNewComment('');
      loadTaskAndComments();
    } catch (err) {
      console.error('Ошибка добавления комментария:', err);
    }
  };

  // Функция для загрузки файлов
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => file.size <= 20 * 1024 * 1024);

    if (validFiles.length !== selectedFiles.length) {
      alert('Некоторые файлы слишком большие. Максимум 20 МБ.');
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  // Удаление файла из списка
  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Загрузка файлов
  const handleUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });

    try {
      setUploading(true);
      await axios.post(
        `/tasks/${id}/attachments/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );
      setFiles([]);
      loadTaskAndComments(); // Перезагружаем задачу, чтобы обновить список вложений
    } catch (err) {
      console.error('Ошибка загрузки вложений:', err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="container mt-4">Загрузка...</div>;
  if (!task) return <div className="container mt-4">Задача не найдена</div>;

  return (
    <div className="container mt-4">
      {/* Карточка задачи */}
      <div className="card mb-4">
        <div className="card-body">
          <h2>{task.title}</h2>
          <p>{task.description || 'Без описания'}</p>
          <div className="d-flex justify-content-between text-muted small">
            <span>Автор: {task.author?.username || '—'}</span>
            <span>Исполнитель: {task.assignee?.username || 'Не назначен'}</span>
          </div>

          {/* Кликабельная плашка статуса */}
          <div className="mt-3">
            <span
              className={`badge ${
                task.status === 'done' ? 'bg-success' :
                task.status === 'in_progress' ? 'bg-warning text-dark' :
                task.status === 'canceled' || task.status === 'urgent' ? 'bg-danger' :
                'bg-secondary'
              }`}
              style={{
                cursor: canChangeStatus ? 'pointer' : 'default',
                padding: '0.5em 0.75em',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                opacity: canChangeStatus ? 1 : 0.6,
              }}
              onClick={toggleStatusMenu}
            >
              {task.status === 'new' ? 'Новая' :
               task.status === 'in_progress' ? 'В работе' :
               task.status === 'done' ? 'Выполнена' :
               task.status === 'canceled' ? 'Отменена' :
               task.status === 'urgent' ? 'Срочная' :
               task.status}
            </span>

            {/* Выпадающее меню */}
            {showStatusMenu && (
              <div
                style={{
                  position: 'absolute',
                  zIndex: 1000,
                  marginTop: '0.5rem',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <StatusDropdown
                  currentStatus={task.status}
                  onChange={handleStatusChange}
                  onClose={() => setShowStatusMenu(false)}
                  canManage={canManage} // ← ключевой пропс
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Вложения */}
      <div className="mb-4">
        <h5>Вложения</h5>

        {/* Список существующих вложений */}
        {task.attachments?.length > 0 ? (
          <ul className="list-group mb-3">
            {task.attachments.map(att => (
              <li key={att.id} className="list-group-item d-flex justify-content-between align-items-center">
                <a href={att.file_path} target="_blank" rel="noopener noreferrer">
                  {att.file_name}
                </a>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={async () => {
                    try {
                      await axios.delete(`/tasks/${id}/attachments/${att.id}/`, {
                        withCredentials: true,
                      });
                      loadTaskAndComments();
                    } catch (err) {
                      console.error('Ошибка удаления вложения:', err);
                    }
                  }}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Нет вложений</p>
        )}

        {/* Поле выбора файлов */}
        <div className="input-group mb-2">
          <input
            type="file"
            className="form-control"
            onChange={handleFileChange}
            multiple
          />
          <button
            className="btn btn-outline-primary"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading ? 'Загрузка...' : 'Загрузить файл'}
          </button>
        </div>

        {/* Список выбранных файлов */}
        {files.length > 0 && (
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
        )}
      </div>

      {/* Комментарии */}
      <h4 className="mt-4">Комментарии</h4>
      <div className="mb-3">
        <textarea
          className="form-control"
          rows="3"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Напишите комментарий..."
        />
        <button className="btn btn-primary mt-2" onClick={handleAddComment}>
          Добавить
        </button>
      </div>

      {Array.isArray(comments) && comments.length === 0 ? (
        <p>Комментариев пока нет.</p>
      ) : (
        Array.isArray(comments) && comments.map(comment => (
          <div key={comment.id} className="list-group-item mb-2">
            <div><strong>{comment.author.username}</strong></div>
            <div>{comment.text}</div>
            <small className="text-muted">{new Date(comment.created_at).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default TaskDetail;