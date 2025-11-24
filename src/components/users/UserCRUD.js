import React, { useState, useEffect } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
} from '@coreui/react';
import API_URL from '../../../config';  

const Users = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    id_rols: '',
    first_name: '',
    last_name: '',
    dni: '',
    number_tlf: '',
    email: '',
    password: '',
    date_of_birth: '',
    gender: '',
    status: 'active',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState({ first_name: '', email: '' });

  const usersUrl = `${API_URL}/users`;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(usersUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Received data is not an array:', data);
        alert('Error: Datos recibidos no son válidos.');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Ocurrió un error al obtener los usuarios. Por favor, inténtelo de nuevo.');
    }
  };

  const handleSaveUser = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${usersUrl}/${selectedUser.uid_users}` : usersUrl;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      fetchUsers();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Ocurrió un error al guardar el usuario. Por favor, inténtelo de nuevo.');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      id_rols: user.id_rols,
      first_name: user.first_name,
      last_name: user.last_name,
      dni: user.dni,
      number_tlf: user.number_tlf,
      email: user.email,
      password: '',
      date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
      gender: user.gender,
      status: user.status || 'active',
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteUser = async (id) => {
    try {
      const response = await fetch(`${usersUrl}/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Ocurrió un error al eliminar el usuario. Por favor, inténtelo de nuevo.');
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      id_rols: '',
      first_name: '',
      last_name: '',
      dni: '',
      number_tlf: '',
      email: '',
      password: '',
      date_of_birth: '',
      gender: '',
      status: 'active',
    });
    setEditMode(false);
    setSelectedUser(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.first_name &&
        user.first_name.toLowerCase().includes(filter.first_name.toLowerCase())) &&
      (user.email &&
        user.email.toLowerCase().includes(filter.email.toLowerCase()))
  );

  return (
    <CCard>
      <CCardHeader>
        <h5>Usuarios</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Agregar Usuario
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filtrar por nombre"
            name="first_name"
            value={filter.first_name}
            onChange={handleFilterChange}
            className="mb-2"
          />
          <CFormInput
            placeholder="Filtrar por email"
            name="email"
            value={filter.email}
            onChange={handleFilterChange}
          />
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Usuario</CTableHeaderCell>
              <CTableHeaderCell>ID Rol</CTableHeaderCell>
              <CTableHeaderCell>Nombre</CTableHeaderCell>
              <CTableHeaderCell>Apellido</CTableHeaderCell>
              <CTableHeaderCell>DNI</CTableHeaderCell>
              <CTableHeaderCell>Número de Teléfono</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Fecha de Nacimiento</CTableHeaderCell>
              <CTableHeaderCell>Género</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Creado En</CTableHeaderCell>
              <CTableHeaderCell>Actualizado En</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredUsers.map((user) => (
              <CTableRow key={user.uid_users}>
                <CTableDataCell>{user.uid_users}</CTableDataCell>
                <CTableDataCell>{user.id_rols}</CTableDataCell>
                <CTableDataCell>{user.first_name}</CTableDataCell>
                <CTableDataCell>{user.last_name}</CTableDataCell>
                <CTableDataCell>{user.dni}</CTableDataCell>
                <CTableDataCell>{user.number_tlf}</CTableDataCell>
                <CTableDataCell>{user.email}</CTableDataCell>
                <CTableDataCell>{user.date_of_birth}</CTableDataCell>
                <CTableDataCell>{user.gender}</CTableDataCell>
                <CTableDataCell>{user.status}</CTableDataCell>
                <CTableDataCell>{user.created_at}</CTableDataCell>
                <CTableDataCell>{user.updated_at}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    Editar
                  </CButton>{' '}
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteUser(user.uid_users)}
                  >
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} onClose={handleCloseModal}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Usuario' : 'Agregar Usuario'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormSelect
                label="ID Rol"
                value={formData.id_rols}
                onChange={(e) => setFormData({ ...formData, id_rols: e.target.value })}
                required
              >
                <option value="">Seleccionar Rol</option>
                <option value="1">Admin</option>
                <option value="2">Usuario</option>
                <option value="3">Invitado</option>
              </CFormSelect>
              <CFormInput
                type="text"
                label="Nombre"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Apellido"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="DNI"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Número de Teléfono"
                value={formData.number_tlf}
                onChange={(e) => setFormData({ ...formData, number_tlf: e.target.value })}
                required
              />
              <CFormInput
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <CFormInput
                type="password"
                label="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <CFormInput
                type="date"
                label="Fecha de Nacimiento"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                required
              />
              <CFormSelect
                label="Género"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
              >
                <option value="">Seleccionar Género</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </CFormSelect>
              <CFormSelect
                label="Estado"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="">Seleccionar Estado</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
              </CFormSelect>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveUser}>
              Guardar
            </CButton>
            <CButton color="secondary" onClick={handleCloseModal}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Users;