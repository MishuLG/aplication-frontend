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
  CAlert,
  CRow,
  CCol,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CAvatar
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilPlus, 
  cilPencil, 
  cilTrash, 
  cilPeople, 
  cilSearch, 
  cilUserFollow, 
  cilUser,
  cilSchool
} from '@coreui/icons';
import API_URL from '../../../config';

const Tutors = () => {
  const [tutors, setTutors] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [formData, setFormData] = useState({ uid_users: '' });
  
  // Estados de Interfaz
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [filter, setFilter] = useState({ uid_users: '' });
  
  // Estados de Validación y Carga
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados Modal Eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const tutorsUrl = `${API_URL}/tutors`;
  const usersUrl = `${API_URL}/users`;

  useEffect(() => {
    fetchTutors();
    fetchUsers();
  }, []);

  // --- LÓGICA DE DATOS (Fetch Seguro) ---

  const authenticatedFetch = async (url, options = {}) => {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', ...options.headers };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '#/login';
          throw new Error('Sesión expirada.');
      }
      return response;
  };

  const fetchTutors = async () => {
    try {
      const response = await authenticatedFetch(tutorsUrl);
      const data = await response.json();
      setTutors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      if (error.message !== 'Sesión expirada.') setAlertBox('Error al obtener la lista de tutores.');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await authenticatedFetch(usersUrl);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      if (error.message !== 'Sesión expirada.') setAlertBox('Error al obtener la lista de usuarios.');
    }
  };

  // Helper Crítico: Filtrar usuarios que ya son tutores
  const getAvailableUsers = () => {
    const assignedUserIds = tutors.map(t => t.uid_users);
    
    return users.filter(user => {
        // Si estamos editando, permitir seleccionar al usuario actual del tutor
        if (editMode && selectedTutor && user.uid_users === selectedTutor.uid_users) {
            return true;
        }
        // Si no, ocultar los que ya son tutores
        return !assignedUserIds.includes(user.uid_users);
    });
  };

  // --- VALIDACIONES ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    setAlertBox(null);
  };

  const handleBlur = (e) => {
      const { name, value } = e.target;
      if (name === 'uid_users' && !value) {
          setErrors(prev => ({ ...prev, uid_users: 'Debe seleccionar un usuario.' }));
      }
  };

  const validateForm = () => {
      const newErrors = {};
      let isValid = true;

      if (!formData.uid_users) {
          newErrors.uid_users = 'Debe seleccionar un usuario para asignarlo como tutor.';
          isValid = false;
      }

      setErrors(newErrors);
      if (!isValid) setAlertBox('Por favor, corrija los errores.');
      return isValid;
  };

  // --- CRUD ---

  const handleSaveTutor = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    setAlertBox(null);

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${tutorsUrl}/${selectedTutor.id_tutor}` : tutorsUrl;

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar.');
      }

      await fetchTutors();
      handleCloseModal();
    } catch (error) {
      setAlertBox(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
        const res = await authenticatedFetch(`${tutorsUrl}/${idToDelete}`, { method: 'DELETE' });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Error al eliminar');
        }
        await fetchTutors();
        setShowDeleteModal(false);
    } catch (error) {
        setAlertBox(error.message);
        setShowDeleteModal(false);
    } finally {
        setIsDeleting(false);
    }
  };

  // --- UI Helpers ---

  const handleEditTutor = (tutor) => {
    setSelectedTutor(tutor);
    setFormData({ uid_users: tutor.uid_users || '' });
    setEditMode(true);
    setErrors({});
    setAlertBox(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ uid_users: '' });
    setEditMode(false);
    setSelectedTutor(null);
    setErrors({});
    setAlertBox(null);
  };

  const renderError = (field) => errors[field] ? <div style={{color: '#dc3545', fontSize: '0.8rem'}}>{errors[field]}</div> : null;

  const getUserData = (uid) => {
      return users.find(u => u.uid_users === uid) || {};
  };

  const getInitials = (name, lastname) => {
      return `${name?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

  // Filtros
  const filteredTutors = tutors.filter((tutor) => {
      const user = getUserData(tutor.uid_users);
      const fullName = user.first_name ? `${user.first_name} ${user.last_name}` : '';
      const search = filter.uid_users.toLowerCase();
      
      // Buscar por ID de usuario o Nombre real
      return String(tutor.uid_users).includes(search) || fullName.toLowerCase().includes(search);
  });

  // Stats
  const totalTutors = tutors.length;
  const availableUsers = getAvailableUsers().length;

  return (
    <div className="container-fluid mt-4">
      
      {/* --- KPI CARDS (Minimalistas & Dark Mode) --- */}
      <CRow className="mb-4">
          <CCol sm={6} lg={4}>
              <CCard className="border-start-4 border-start-warning shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Total Tutores</div>
                          <div className="fs-4 fw-semibold text-body">{totalTutors}</div>
                      </div>
                      <CIcon icon={cilSchool} size="xl" className="text-warning" />
                  </CCardBody>
              </CCard>
          </CCol>
          <CCol sm={6} lg={4}>
              <CCard className="border-start-4 border-start-success shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Usuarios Disponibles</div>
                          <div className="fs-4 fw-semibold text-body">{availableUsers}</div>
                          <div className="small text-medium-emphasis">Candidatos a tutor</div>
                      </div>
                      <CIcon icon={cilUserFollow} size="xl" className="text-success" />
                  </CCardBody>
              </CCard>
          </CCol>
      </CRow>

      {/* --- SECCIÓN PRINCIPAL --- */}
      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 text-body">Gestión de Tutores</h5>
            <CButton color="primary" onClick={() => { handleCloseModal(); setShowModal(true); }} className="d-flex align-items-center">
              <CIcon icon={cilPlus} className="me-2" /> Asignar Tutor
            </CButton>
        </CCardHeader>

        <CCardBody>
            {alertBox && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}

            {/* Filtro Simple */}
            <div className="mb-4" style={{ maxWidth: '300px' }}>
                <CInputGroup>
                    <CInputGroupText className="bg-transparent text-medium-emphasis border-end-0">
                        <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput 
                        className="bg-transparent border-start-0"
                        placeholder="Buscar por nombre o ID..." 
                        value={filter.uid_users} 
                        onChange={(e) => setFilter({ uid_users: e.target.value })} 
                    />
                </CInputGroup>
            </div>

            {/* Tabla Moderna (Sin header blanco forzado) */}
            <CTable align="middle" className="mb-0 border" hover responsive striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{width: '60px'}}><CIcon icon={cilUser} /></CTableHeaderCell>
                  <CTableHeaderCell>Tutor</CTableHeaderCell>
                  <CTableHeaderCell>ID de Sistema</CTableHeaderCell>
                  <CTableHeaderCell>Fecha de Asignación</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredTutors.map((tutor) => {
                    const user = getUserData(tutor.uid_users);
                    return (
                      <CTableRow key={tutor.id_tutor}>
                        <CTableDataCell className="text-center">
                            <CAvatar size="md" color="warning" textColor="white">
                                {getInitials(user.first_name, user.last_name)}
                            </CAvatar>
                        </CTableDataCell>
                        <CTableDataCell>
                            <div className="fw-bold text-body">{user.first_name} {user.last_name}</div>
                            <div className="small text-medium-emphasis">{user.email}</div>
                        </CTableDataCell>
                        
                        {/* Corrección del estilo del ID: Usamos un contenedor simple en lugar de Badge 'light' */}
                        <CTableDataCell>
                            <div className="small text-medium-emphasis font-monospace border rounded px-2 py-1 d-inline-block">
                                {tutor.uid_users?.substring(0, 8)}...
                            </div>
                        </CTableDataCell>
                        
                        <CTableDataCell className="text-body">
                            {tutor.created_at}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                            <CButton color="light" size="sm" variant="ghost" className="me-2" onClick={() => handleEditTutor(tutor)}>
                                <CIcon icon={cilPencil} className="text-warning"/>
                            </CButton>
                            <CButton color="light" size="sm" variant="ghost" onClick={() => handleDeleteClick(tutor.id_tutor)}>
                                <CIcon icon={cilTrash} className="text-danger"/>
                            </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    );
                })}
                {filteredTutors.length === 0 && (
                    <CTableRow>
                        <CTableDataCell colSpan="5" className="text-center py-4 text-medium-emphasis">
                            No hay tutores registrados.
                        </CTableDataCell>
                    </CTableRow>
                )}
              </CTableBody>
            </CTable>
        </CCardBody>
      </CCard>

      {/* --- MODALES --- */}

      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static" alignment="center">
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>¿Está seguro de eliminar este tutor? No podrá hacerlo si tiene estudiantes asignados.</CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
          <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>Eliminar</CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showModal} backdrop="static" onClose={handleCloseModal}>
        <CModalHeader>
          <CModalTitle>{editMode ? 'Editar Asignación' : 'Asignar Tutor'}</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
          <CForm>
            <div className="mb-3">
                <div className="text-medium-emphasis small mb-2">
                  Seleccione un usuario existente para asignarle el rol de Tutor.
                </div>
                <CFormSelect
                  label="Usuario *"
                  name="uid_users"
                  value={formData.uid_users}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  invalid={!!errors.uid_users}
                >
                  <option value="">Seleccionar Usuario...</option>
                  {getAvailableUsers().map((user) => (
                    <option key={user.uid_users} value={user.uid_users}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </CFormSelect>
                {renderError('uid_users')}
                {getAvailableUsers().length === 0 && !editMode && (
                    <div className="text-warning small mt-2">
                        No hay usuarios disponibles. Todos están asignados o no hay usuarios registrados.
                    </div>
                )}
            </div>
          </CForm>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={handleCloseModal}>Cancelar</CButton>
          <CButton color="success" onClick={handleSaveTutor} disabled={isSaving}>Guardar</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Tutors;