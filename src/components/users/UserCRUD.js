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
  CAlert,
  CRow,
  CCol,
} from '@coreui/react';
import API_URL from '../../../config';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    uid_users: '',
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
  
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const usersUrl = `${API_URL}/users`;

  const requiredFields = [
    'id_rols', 'first_name', 'last_name', 'dni', 
    'number_tlf', 'email', 'date_of_birth', 'gender', 'status'
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- HELPER: Fetch con Autenticación (SOLUCIÓN ERROR 401) ---
  const authenticatedFetch = async (url, options = {}) => {
      const token = localStorage.getItem('token'); // Recuperar token
      
      const headers = {
          'Content-Type': 'application/json',
          ...options.headers,
      };

      if (token) {
          headers['Authorization'] = `Bearer ${token}`; // Inyectar token
      }

      const response = await fetch(url, { ...options, headers });

      // Si el token expiró o es inválido
      if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '#/login'; // Redirigir al login
          throw new Error('Sesión expirada. Por favor, inicie sesión de nuevo.');
      }

      return response;
  };

  const fetchUsers = async () => {
    try {
      // Usamos authenticatedFetch por si la ruta GET también está protegida
      const response = await authenticatedFetch(usersUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setAlertBox('Error: Datos recibidos no válidos.');
      }
    } catch (error) {
        // No mostramos alerta si es redirección de sesión
        if (!error.message.includes('Sesión expirada')) {
            console.error(error);
            setAlertBox('Ocurrió un error al obtener los usuarios.');
        }
    }
  };

  // --- Validaciones ---
  const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'first_name' || name === 'last_name') newValue = value.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g, '');
    if (name === 'dni' || name === 'number_tlf') newValue = value.replace(/[^\d]/g, '');
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    setAlertBox(null);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    requiredFields.forEach(field => {
        if (!formData[field] || String(formData[field]).trim() === '') {
            newErrors[field] = 'Campo obligatorio.';
            isValid = false;
        }
    });

    if (formData.date_of_birth) {
        const age = calculateAge(formData.date_of_birth);
        const today = new Date();
        const dob = new Date(formData.date_of_birth);
        
        if (dob > today) {
             newErrors.date_of_birth = 'No puede ser fecha futura.';
             isValid = false;
        } else if (age < 21) {
            newErrors.date_of_birth = 'Debe ser mayor de 21 años.';
            isValid = false;
        }
    }

    if (!editMode && (!formData.password || formData.password.length < 6)) {
        newErrors.password = 'Mínimo 6 caracteres.';
        isValid = false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido.';
        isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) setAlertBox('Por favor, corrija los errores.');
    return isValid;
  };

  // --- CRUD ---
  const handleSaveUser = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    setAlertBox(null);

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${usersUrl}/${selectedUser.uid_users}` : usersUrl;

      const payload = { ...formData };
      if (editMode && !payload.password) delete payload.password;

      // USAMOS LA FUNCIÓN SEGURA AQUÍ
      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar.');
      }

      await fetchUsers();
      handleCloseModal();
    } catch (error) {
      setAlertBox(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id) => { setIdToDelete(id); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
      // USAMOS LA FUNCIÓN SEGURA AQUÍ TAMBIÉN
      const response = await authenticatedFetch(`${usersUrl}/${idToDelete}`, { method: 'DELETE' });
      
      if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Error al eliminar');
      }
      
      await fetchUsers();
      setShowDeleteModal(false);
    } catch (error) {
      setAlertBox(error.message);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- UI Helpers ---
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      uid_users: user.uid_users,
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
    setEditMode(true); setErrors({}); setAlertBox(null); setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      uid_users: '', id_rols: '', first_name: '', last_name: '', dni: '', number_tlf: '', email: '', password: '', date_of_birth: '', gender: '', status: 'active',
    });
    setEditMode(false); setSelectedUser(null); setErrors({}); setAlertBox(null);
  };

  const renderError = (f) => errors[f] ? <div style={{color: '#dc3545', fontSize: '0.8rem'}}>{errors[f]}</div> : null;
  const filteredUsers = users.filter(user => (user.first_name || '').toLowerCase().includes(filter.first_name.toLowerCase()) && (user.email || '').toLowerCase().includes(filter.email.toLowerCase()));

  return (
    <CCard>
      <CCardHeader><h5>Usuarios</h5> <CButton color="success" onClick={() => { handleCloseModal(); setShowModal(true); }}>Agregar</CButton></CCardHeader>
      <CCardBody>
        {alertBox && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}
        
        <div className="mb-3 d-flex gap-2">
          <CFormInput placeholder="Nombre" value={filter.first_name} onChange={e => setFilter({...filter, first_name: e.target.value})} />
          <CFormInput placeholder="Email" value={filter.email} onChange={e => setFilter({...filter, email: e.target.value})} />
        </div>

        <CTable hover responsive bordered>
          <CTableHead><CTableRow><CTableHeaderCell>Rol</CTableHeaderCell><CTableHeaderCell>Nombre</CTableHeaderCell><CTableHeaderCell>Email</CTableHeaderCell><CTableHeaderCell>Estado</CTableHeaderCell><CTableHeaderCell>Acciones</CTableHeaderCell></CTableRow></CTableHead>
          <CTableBody>
            {filteredUsers.map((user) => (
              <CTableRow key={user.uid_users}>
                <CTableDataCell>{user.id_rols === 1 ? 'Admin' : user.id_rols === 2 ? 'Profesor' : 'Representante'}</CTableDataCell>
                <CTableDataCell>{user.first_name} {user.last_name}</CTableDataCell>
                <CTableDataCell>{user.email}</CTableDataCell>
                <CTableDataCell>{user.status}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="warning" size="sm" onClick={() => handleEditUser(user)} className="me-2">Editar</CButton>
                  <CButton color="danger" size="sm" onClick={() => handleDeleteClick(user.uid_users)}>Eliminar</CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static">
            <CModalHeader><CModalTitle>Confirmar</CModalTitle></CModalHeader>
            <CModalBody>¿Eliminar usuario?</CModalBody>
            <CModalFooter>
                <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>Eliminar</CButton>
                <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
            </CModalFooter>
        </CModal>

        <CModal visible={showModal} backdrop="static" onClose={handleCloseModal} size="lg">
            <CModalHeader><CModalTitle>{editMode ? 'Editar' : 'Nuevo'} Usuario</CModalTitle></CModalHeader>
            <CModalBody>
                <CForm>
                    <CRow className="mb-3">
                        <CCol md={6}>
                            <CFormSelect label="Rol *" name="id_rols" value={formData.id_rols} onChange={handleInputChange} invalid={!!errors.id_rols}>
                                <option value="">Seleccione...</option>
                                <option value="1">Admin</option><option value="2">Profesor</option><option value="3">Representante</option>
                            </CFormSelect>
                            {renderError('id_rols')}
                        </CCol>
                        <CCol md={6}><CFormInput label="DNI *" name="dni" value={formData.dni} onChange={handleInputChange} invalid={!!errors.dni} />{renderError('dni')}</CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CCol md={6}><CFormInput label="Nombre *" name="first_name" value={formData.first_name} onChange={handleInputChange} invalid={!!errors.first_name} />{renderError('first_name')}</CCol>
                        <CCol md={6}><CFormInput label="Apellido *" name="last_name" value={formData.last_name} onChange={handleInputChange} invalid={!!errors.last_name} />{renderError('last_name')}</CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CCol md={6}><CFormInput label="Email *" name="email" value={formData.email} onChange={handleInputChange} invalid={!!errors.email} />{renderError('email')}</CCol>
                        <CCol md={6}><CFormInput label="Teléfono *" name="number_tlf" value={formData.number_tlf} onChange={handleInputChange} invalid={!!errors.number_tlf} />{renderError('number_tlf')}</CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CCol md={6}>
                            <CFormInput type="password" label={editMode ? "Nueva Clave (Opcional)" : "Contraseña *"} name="password" value={formData.password} onChange={handleInputChange} invalid={!!errors.password} />
                            {renderError('password')}
                        </CCol>
                        <CCol md={6}>
                            <CFormInput type="date" label="Fecha Nacimiento *" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} invalid={!!errors.date_of_birth} />
                            {renderError('date_of_birth')}
                        </CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CCol md={6}>
                            <CFormSelect label="Género *" name="gender" value={formData.gender} onChange={handleInputChange} invalid={!!errors.gender}><option value="">Select...</option><option value="M">Masculino</option><option value="F">Femenino</option></CFormSelect>
                            {renderError('gender')}
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect label="Estado *" name="status" value={formData.status} onChange={handleInputChange} invalid={!!errors.status}><option value="active">Activo</option><option value="inactive">Inactivo</option></CFormSelect>
                        </CCol>
                    </CRow>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton color="success" onClick={handleSaveUser} disabled={isSaving}>Guardar</CButton>
                <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
            </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};
export default Users;