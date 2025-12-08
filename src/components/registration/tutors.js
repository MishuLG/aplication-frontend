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
  CFormInput,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons';
import API_URL from '../../../config';

const Tutors = () => {
  const [tutors, setTutors] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [formData, setFormData] = useState({ uid_users: '' });
  
  // UI States
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [filter, setFilter] = useState({ uid_users: '' });
  
  // Validaciones
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Borrado
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setTutors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAlertBox('Error al obtener la lista de tutores.');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(usersUrl);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAlertBox('Error al obtener la lista de usuarios.');
    }
  };

  // Helper: Obtener usuarios disponibles (que no son tutores aun)
  // En modo edición, debe incluir al usuario que ya tiene asignado el tutor actual.
  const getAvailableUsers = () => {
    const assignedUserIds = tutors.map(t => t.uid_users);
    
    return users.filter(user => {
        // Si estamos editando y este es el usuario actual del tutor, permitirlo
        if (editMode && selectedTutor && user.uid_users === selectedTutor.uid_users) {
            return true;
        }
        // Si no, filtrar si ya está asignado
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

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
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
        const res = await fetch(`${tutorsUrl}/${idToDelete}`, { method: 'DELETE' });
        if (!res.ok) {
            const data = await res.json();
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

  // Filtrado de la tabla principal
  const filteredTutors = tutors.filter((tutor) => {
      // Buscar nombre del usuario asociado para filtrar por nombre
      const user = users.find(u => u.uid_users === tutor.uid_users);
      const fullName = user ? `${user.first_name} ${user.last_name}` : '';
      
      const search = filter.uid_users.toLowerCase();
      
      return String(tutor.uid_users).includes(search) || fullName.toLowerCase().includes(search);
  });

  const getUserLabel = (uid) => {
      const user = users.find(u => u.uid_users === uid);
      return user ? `${user.first_name} ${user.last_name}` : uid;
  };

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="m-0">Tutores</h5>
        <CButton color="success" onClick={() => { handleCloseModal(); setShowModal(true); }}>
          <CIcon icon={cilPlus} className="me-2" /> Agregar Tutor
        </CButton>
      </CCardHeader>

      <CCardBody>
        {alertBox && !showModal && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}

        <div className="mb-3">
            <CFormInput 
                placeholder="Buscar por nombre de usuario..." 
                value={filter.uid_users} 
                onChange={(e) => setFilter({ uid_users: e.target.value })} 
                style={{maxWidth: '300px'}}
            />
        </div>

        <CTable hover responsive bordered>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Tutor</CTableHeaderCell>
              <CTableHeaderCell>Usuario Asignado</CTableHeaderCell>
              <CTableHeaderCell>ID Usuario</CTableHeaderCell>
              <CTableHeaderCell>Fecha Registro</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {filteredTutors.map((tutor) => (
              <CTableRow key={tutor.id_tutor}>
                <CTableDataCell>{tutor.id_tutor}</CTableDataCell>
                <CTableDataCell>{getUserLabel(tutor.uid_users)}</CTableDataCell>
                <CTableDataCell>
                    <span style={{fontFamily: 'monospace', fontSize: '0.85em'}}>{tutor.uid_users}</span>
                </CTableDataCell>
                <CTableDataCell>{tutor.created_at}</CTableDataCell>
                <CTableDataCell>
                    <CButton color="warning" size="sm" onClick={() => handleEditTutor(tutor)} className="me-2">
                        <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton color="danger" size="sm" onClick={() => handleDeleteClick(tutor.id_tutor)}>
                        <CIcon icon={cilTrash} />
                    </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
             {filteredTutors.length === 0 && <CTableRow><CTableDataCell colSpan="5" className="text-center">No hay tutores registrados.</CTableDataCell></CTableRow>}
          </CTableBody>
        </CTable>

        {/* Modal Delete */}
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static">
          <CModalHeader>
            <CModalTitle>Confirmar Eliminación</CModalTitle>
          </CModalHeader>
          <CModalBody>¿Está seguro de eliminar este tutor? No podrá hacerlo si tiene estudiantes asignados.</CModalBody>
          <CModalFooter>
            <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>Eliminar</CButton>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
          </CModalFooter>
        </CModal>

        {/* Modal Form */}
        <CModal visible={showModal} backdrop="static" onClose={handleCloseModal}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Tutor' : 'Agregar Tutor'}</CModalTitle>
          </CModalHeader>

          <CModalBody>
            {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
            <CForm>
              <div className="mb-3">
                  <div style={{ marginBottom: 6, fontSize: '0.9em', color: '#666' }}>
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
            <CButton color="success" onClick={handleSaveTutor} disabled={isSaving}>
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

export default Tutors;