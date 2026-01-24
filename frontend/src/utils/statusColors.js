// src/utils/statusColors.js
export const getStatusColor = (status) => {
  switch (status) {
    case 'done': return 'bg-success';
    case 'in_progress': return 'bg-warning text-dark';
    case 'canceled': return 'bg-danger';
    case 'urgent': return 'bg-danger';
    case 'new':
    default: return 'bg-secondary';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'new': return 'Новая';
    case 'in_progress': return 'В работе';
    case 'done': return 'Выполнена';
    case 'canceled': return 'Отменена';
    case 'urgent': return 'Срочная';
    default: return status;
  }
};