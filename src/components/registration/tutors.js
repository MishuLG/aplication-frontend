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
  CFormSelect,
  CFormInput,
  CAlert,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilPlus, cilSearch, cilPeople } from '@coreui/icons';
import API_URL from '../../../config';

const Tutors = () => {
  const [tutors, setTutors] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState(null);
  const [formData, setFormData] = useState({ uid_users: '' });
  

  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);


  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchTutors();
    fetchUsers();
  }, []);

  // --- OBTENER DATOS DEL BACKEND ---
  const fetchTutors = async () => {
    try {
      const response = await fetch(`${API_URL}/tutors`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTutors(data);
      } else {
        console.error('Error cargando tutores');
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  // --- FILTRO INTELIGENTE PARA EL SELECT ---
  const getAvailableUsers = () => {
    const assignedUserIds = tutors.map(t => t.uid_users);
    return users.filter(user => {

        if (editMode && user.uid_users === formData.uid_users) return true;

        return !assignedUserIds.includes(user.uid_users);
    });
  };

  // --- MANEJO DEL FORMULARIO ---
  const handleSave = async () => {
    setErrorMessage(null);
    

    if (!formData.uid_users) {
      setErrorMessage('Por favor, seleccione un usuario de la lista.');
      return;
    }

    const method = editMode ? 'PUT' : 'POST';
    const url = editMode ? `${API_URL}/tutors/${selectedTutorId}` : `${API_URL}/tutors`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar cambios.');
      }

      fetchTutors(); // Recargar tabla
      handleCloseModal();
      alert(editMode ? 'Tutor actualizado con éxito.' : 'Tutor registrado con éxito.');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // --- ACCIONES DE EDICIÓN Y BORRADO ---
  const handleEdit = (tutor) => {
    setEditMode(true);
    setSelectedTutorId(tutor.id_tutor);
    setFormData({ uid_users: tutor.uid_users });
    setShowModal(true);
    setErrorMessage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Confirma que desea eliminar este tutor?')) return;

    try {
      const response = await fetch(`${API_URL}/tutors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      const data = await response.json();

      if (response.ok) {
        fetchTutors();
      } else {
        alert(data.message || 'No se pudo eliminar el tutor.');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error de conexión al intentar eliminar.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ uid_users: '' });
    setEditMode(false);
    setErrorMessage(null);
  };

  // --- FILTRO DE BÚSQUEDA ---
  const filteredTutors = tutors.filter(tutor => {
    const fullName = `${tutor.first_name} ${tutor.last_name}`.toLowerCase();
    const dni = tutor.dni ? tutor.dni.toString() : '';
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || dni.includes(term);
  });

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5><CIcon icon={cilPeople} className="me-2" />Gestión de Tutores</h5>
        <CButton color="primary" onClick={() => setShowModal(true)}>
          <CIcon icon={cilPlus} /> Nuevo Tutor
        </CButton>
      </CCardHeader>
      <CCardBody>
        
        {/* Barra de Búsqueda */}
        <div className="mb-4 row">
            <div className="col-md-4">
                <div className="input-group">
                    <span className="input-group-text"><CIcon icon={cilSearch} /></span>
                    <CFormInput 
                        placeholder="Buscar por nombre o DNI..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </div>

        <CTable bordered hover responsive striped className="align-middle">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>Nombre Completo</CTableHeaderCell>
              <CTableHeaderCell>DNI</CTableHeaderCell>
              <CTableHeaderCell>Email de Contacto</CTableHeaderCell>
              <CTableHeaderCell>Fecha Registro</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredTutors.length > 0 ? (
                filteredTutors.map((tutor) => (
                <CTableRow key={tutor.id_tutor}>
                    <CTableDataCell>#{tutor.id_tutor}</CTableDataCell>
                    <CTableDataCell><strong>{tutor.first_name} {tutor.last_name}</strong></CTableDataCell>
                    <CTableDataCell>{tutor.dni}</CTableDataCell>
                    <CTableDataCell>{tutor.email}</CTableDataCell>
                    <CTableDataCell>{tutor.created_at}</CTableDataCell>
                    <CTableDataCell>
                    <CButton color="warning" variant="outline" size="sm" onClick={() => handleEdit(tutor)} className="me-2" title="Editar">
                        <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton color="danger" variant="outline" size="sm" onClick={() => handleDelete(tutor.id_tutor)} title="Eliminar">
                        <CIcon icon={cilTrash} />
                    </CButton>
                    </CTableDataCell>
                </CTableRow>
                ))
            ) : (
                <CTableRow>
                    <CTableDataCell colSpan="6" className="text-center py-4 text-muted">
                        {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay tutores registrados aún.'}
                    </CTableDataCell>
                </CTableRow>
            )}
          </CTableBody>
        </CTable>

        {/* Modal Formulario */}
        <CModal visible={showModal} onClose={handleCloseModal} backdrop="static">
          <CModalHeader closeButton>
            <CModalTitle>{editMode ? 'Editar Tutor Existente' : 'Registrar Nuevo Tutor'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {errorMessage && <CAlert color="danger">{errorMessage}</CAlert>}
            
            <CForm>
              <div className="mb-3">
                <label className="form-label fw-bold">Seleccionar Usuario *</label>
                <CFormSelect
                  value={formData.uid_users}
                  onChange={(e) => setFormData({ ...formData, uid_users: e.target.value })}
                  disabled={editMode} 
                >
                  <option value="">-- Busque y seleccione un usuario --</option>
                  {getAvailableUsers().map((user) => (
                    <option key={user.uid_users} value={user.uid_users}>
                      {user.first_name} {user.last_name} - DNI: {user.dni}
                    </option>
                  ))}
                </CFormSelect>
                <div className="form-text mt-2 text-muted">
                    <small>Nota: Solo aparecen los usuarios que NO están registrados como tutores actualmente.</small>
                </div>
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>
              Cancelar
            </CButton>
            <CButton color="primary" onClick={handleSave}>
              {editMode ? 'Guardar Cambios' : 'Registrar Tutor'}
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Tutors;