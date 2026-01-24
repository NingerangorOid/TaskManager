// src/components/StatusDropdown.jsx
import React from 'react';

const StatusDropdown = ({ currentStatus, onChange, onClose, canManage = false }) => {
  const statuses = [
    { value: 'new', label: 'Новая' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'done', label: 'Выполнена' },
    ...(canManage ? [
      { value: 'canceled', label: 'Отменена' },
      { value: 'urgent', label: 'Срочная' }
    ] : [])
  ];

  return (
    <div
      className="dropdown-menu show"
      style={{
        position: 'absolute',
        zIndex: 1000,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        padding: '0.5rem 0',
      }}
    >
      {statuses.map((s) => (
        <button
          key={s.value}
          className={`dropdown-item ${s.value === currentStatus ? 'active' : ''}`}
          style={{
            padding: '0.5rem 1rem',
            textAlign: 'left',
            backgroundColor: s.value === currentStatus ? '#f8f9fa' : 'transparent',
            fontWeight: s.value === currentStatus ? 'bold' : 'normal',
          }}
          onClick={() => {
            onChange(s.value);
            onClose();
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};

export default StatusDropdown;