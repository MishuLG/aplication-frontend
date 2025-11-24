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

const Tutors = () => {
  const [tutors, setTutors] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    uid_users: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [filter, setFilter] = useState({ uid_users: '' });

  const tutorsUrl = `${API_URL}/tutors`;
  const usersUrl = `${API_URL}/users`;

  useEffect(() => {
    fetchTutors();
    fetchUsers();
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await fetch(tutorsUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setTutors(data);
      } else {
        console.error('Received data is not an array:', data);
        alert('Error: Invalid data received.');
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      alert('An error occurred while fetching tutors. Please try again.');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(usersUrl);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('An error occurred while fetching users. Please try again.');
    }
  };

  const getAvailableUsers = () => {
    const assignedUserIds = tutors.map((tutor) => tutor.uid_users);
    return users.filter((user) => !assignedUserIds.includes(user.uid_users));
  };

  const saveTutor = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${tutorsUrl}/${selectedTutor.id_tutor}` : tutorsUrl;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      fetchTutors();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving tutor:', error);
      alert('An error occurred while saving the tutor. Please try again.');
    }
  };

  const editTutor = (tutor) => {
    setSelectedTutor(tutor);
    setFormData({
      uid_users: tutor.uid_users,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const deleteTutor = async (id) => {
    try {
      const response = await fetch(`${tutorsUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      fetchTutors();
    } catch (error) {
      console.error('Error deleting tutor:', error);
      alert('An error occurred while deleting the tutor. Please try again.');
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      uid_users: '',
    });
    setEditMode(false);
    setSelectedTutor(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredTutors = tutors.filter((tutor) => {
    return tutor.uid_users && tutor.uid_users.toString().includes(filter.uid_users);
  });

  return (
    <CCard>
      <CCardHeader>
        <h5>Tutores</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Agregar Tutor
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filtrar por ID de Usuario"
            name="uid_users"
            value={filter.uid_users}
            onChange={handleFilterChange}
            className="mb-2"
          />
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Tutor</CTableHeaderCell>
              <CTableHeaderCell>ID Usuario</CTableHeaderCell>
              <CTableHeaderCell>Creado En</CTableHeaderCell>
              <CTableHeaderCell>Actualizado En</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredTutors.map((tutor) => (
              <CTableRow key={tutor.id_tutor}>
                <CTableDataCell>{tutor.id_tutor}</CTableDataCell>
                <CTableDataCell>{tutor.uid_users}</CTableDataCell>
                <CTableDataCell>{tutor.created_at}</CTableDataCell>
                <CTableDataCell>{tutor.updated_at}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="warning" size="sm" onClick={() => editTutor(tutor)}>
                    Editar
                  </CButton>{' '}
                  <CButton color="danger" size="sm" onClick={() => deleteTutor(tutor.id_tutor)}>
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} onClose={closeModal}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Tutor' : 'Agregar Tutor'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormSelect
                label="ID de Usuario"
                value={formData.uid_users}
                onChange={(e) => setFormData({ ...formData, uid_users: e.target.value })}
                required
              >
                <option value="">Seleccionar Usuario</option>
                {getAvailableUsers().map((user) => (
                  <option key={user.uid_users} value={user.uid_users}>
                    {user.first_name} {user.last_name} ({user.uid_users})
                  </option>
                ))}
              </CFormSelect>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={saveTutor}>
              Guardar
            </CButton>
            <CButton color="secondary" onClick={closeModal}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Tutors;
