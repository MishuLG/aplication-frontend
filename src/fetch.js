// fetch.js
const API_URL = 'http://localhost:3001/users';

// Obtener todos los usuarios
export const fetchUsers = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Error al obtener usuarios');
  }
  return await response.json();
};

// Agregar un nuevo usuario
export const addUser = async (user) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error('Error al agregar usuario');
  }
  return await response.json();
};

// Actualizar un usuario existente
export const updateUser = async (id, user) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar usuario');
  }
  return await response.json();
};

// Eliminar un usuario
export const deleteUser = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar usuario');
  }
};