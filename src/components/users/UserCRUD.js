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
  CAvatar,
  CBadge,
  CInputGroup,
  CInputGroupText
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilPlus, cilPencil, cilTrash, cilSearch, cilPeople, cilUserFollow, cilShieldAlt, cilEnvelopeClosed, cilPhone
} from '@coreui/icons';
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
    status: 'active', // Por defecto activo
  });

  // UI States
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState({ first_name: '', email: '' });
  
  // Validaciones & Alertas
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Borrado
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const usersUrl = `${API_URL}/users`;
  
  const requiredFields = ['id_rols', 'first_name', 'last_name', 'dni', 'number_tlf', 'email', 'date_of_birth', 'gender', 'status'];

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- LÓGICA DE DATOS ---
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

  const fetchUsers = async () => {
    try {
      const response = await authenticatedFetch(usersUrl);
      const data = await response.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (error) { 
        console.error(error); 
        if (error.message !== 'Sesión expirada.') setAlertBox('Error al cargar usuarios');
    }
  };

  const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
  };

  // --- VALIDACIONES ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (['first_name', 'last_name'].includes(name)) val = value.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g, '');
    if (['dni', 'number_tlf'].includes(name)) val = value.replace(/[^\d]/g, '');

    setFormData(prev => ({ ...prev, [name]: val }));
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    setAlertBox(null);
  };

  const handleBlur = (e) => {
      const { name, value } = e.target;
      if (requiredFields.includes(name) && !value) {
          setErrors(prev => ({ ...prev, [name]: 'Este campo es obligatorio.' }));
      }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    requiredFields.forEach(f => { 
        if (!formData[f] || String(formData[f]).trim() === '') {
            newErrors[f] = 'Campo obligatorio.';
            isValid = false;
        }
    });
    
    if (formData.date_of_birth) {
        const age = calculateAge(formData.date_of_birth);
        const dob = new Date(formData.date_of_birth);
        const today = new Date();
        today.setHours(0,0,0,0);

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
    if (editMode && formData.password && formData.password.length > 0 && formData.password.length < 6) {
        newErrors.password = 'La nueva contraseña es muy corta.';
        isValid = false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Formato de email inválido.';
        isValid = false;
    }
    
    setErrors(newErrors);
    if(!isValid) setAlertBox("Por favor, corrija los errores resaltados en rojo.");
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

      const response = await authenticatedFetch(url, { method, body: JSON.stringify(payload) });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Error al guardar.');
      
      await fetchUsers();
      handleCloseModal();
    } catch (error) { setAlertBox(error.message); } 
    finally { setIsSaving(false); }
  };

  const handleDeleteClick = (id) => { setIdToDelete(id); setShowDeleteModal(true); };
  
  const confirmDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
      const res = await authenticatedFetch(`${usersUrl}/${idToDelete}`, { method: 'DELETE' });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || "Error al eliminar");
      await fetchUsers();
      setShowDeleteModal(false);
    } catch (error) { setAlertBox(error.message); setShowDeleteModal(false); } 
    finally { setIsDeleting(false); }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({ ...user, password: '', date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '' });
    setEditMode(true); setErrors({}); setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ uid_users: '', id_rols: '', first_name: '', last_name: '', dni: '', number_tlf: '', email: '', password: '', date_of_birth: '', gender: '', status: 'active' });
    setEditMode(false); setSelectedUser(null); setErrors({}); setAlertBox(null);
  };

  // --- HELPERS VISUALES ---
  const getInitials = (name, lastname) => `${name?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();

  const getRoleBadge = (roleId) => {
      // CORREGIDO: Coincide con SEED.JS (1=Admin, 2=Tutor, 3=Student)
      switch(parseInt(roleId)) {
          case 1: return <CBadge color="info" shape="rounded-pill">Admin</CBadge>;
          case 2: return <CBadge color="primary" shape="rounded-pill">Representante</CBadge>; // ANTES: Profesor
          case 3: return <CBadge color="secondary" shape="rounded-pill">Estudiante</CBadge>; // ANTES: Representante
          default: return <CBadge color="light">Rol {roleId}</CBadge>;
      }
  };

  const getStatusBadge = (status) => {
      const map = { active: 'success', inactive: 'secondary', suspended: 'danger' };
      return <CBadge color={map[status] || 'light'} shape="rounded-pill">{status}</CBadge>;
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminUsers = users.filter(u => u.id_rols === 1).length;

  const filteredUsers = users.filter(u => 
      (u.first_name || '').toLowerCase().includes(filter.first_name.toLowerCase()) &&
      (u.email || '').toLowerCase().includes(filter.email.toLowerCase())
  );

  return (
    <div className="container-fluid mt-4">
        {/* KPI CARDS */}
        <CRow className="mb-4">
            <CCol sm={4}>
                <CCard className="border-start-4 border-start-primary shadow-sm h-100">
                    <CCardBody className="d-flex justify-content-between align-items-center p-3">
                        <div>
                            <div className="text-medium-emphasis small text-uppercase fw-bold">Total Usuarios</div>
                            <div className="fs-4 fw-semibold text-body">{totalUsers}</div>
                        </div>
                        <CIcon icon={cilPeople} size="xl" className="text-primary" />
                    </CCardBody>
                </CCard>
            </CCol>
            <CCol sm={4}>
                <CCard className="border-start-4 border-start-success shadow-sm h-100">
                    <CCardBody className="d-flex justify-content-between align-items-center p-3">
                        <div>
                            <div className="text-medium-emphasis small text-uppercase fw-bold">Activos</div>
                            <div className="fs-4 fw-semibold text-body">{activeUsers}</div>
                        </div>
                        <CIcon icon={cilUserFollow} size="xl" className="text-success" />
                    </CCardBody>
                </CCard>
            </CCol>
            <CCol sm={4}>
                <CCard className="border-start-4 border-start-info shadow-sm h-100">
                    <CCardBody className="d-flex justify-content-between align-items-center p-3">
                        <div>
                            <div className="text-medium-emphasis small text-uppercase fw-bold">Admins</div>
                            <div className="fs-4 fw-semibold text-body">{adminUsers}</div>
                        </div>
                        <CIcon icon={cilShieldAlt} size="xl" className="text-info" />
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>

        {/* TABLA PRINCIPAL */}
        <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
                <h5 className="mb-0 text-body">Gestión de Usuarios</h5>
                <CButton color="primary" onClick={() => { handleCloseModal(); setShowModal(true); }} className="d-flex align-items-center">
                    <CIcon icon={cilPlus} className="me-2" /> Nuevo Usuario
                </CButton>
            </CCardHeader>
            <CCardBody>
                {alertBox && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}
                <CRow className="mb-4 g-2">
                    <CCol md={4}>
                        <CInputGroup>
                            <CInputGroupText className="bg-body border-end-0 text-medium-emphasis"><CIcon icon={cilSearch} /></CInputGroupText>
                            <CFormInput className="border-start-0 bg-body" placeholder="Buscar por nombre..." value={filter.first_name} onChange={e => setFilter({...filter, first_name: e.target.value})} />
                        </CInputGroup>
                    </CCol>
                    <CCol md={4}>
                        <CInputGroup>
                            <CInputGroupText className="bg-body border-end-0 text-medium-emphasis"><CIcon icon={cilEnvelopeClosed} /></CInputGroupText>
                            <CFormInput className="border-start-0 bg-body" placeholder="Buscar por email..." value={filter.email} onChange={e => setFilter({...filter, email: e.target.value})} />
                        </CInputGroup>
                    </CCol>
                </CRow>

                <CTable align="middle" className="mb-0 border" hover responsive striped>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell className="text-center" style={{width: '60px'}}><CIcon icon={cilPeople} /></CTableHeaderCell>
                            <CTableHeaderCell>Usuario</CTableHeaderCell>
                            <CTableHeaderCell>Contacto</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Rol</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Estado</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {filteredUsers.map((item, index) => (
                            <CTableRow key={index}>
                                <CTableDataCell className="text-center">
                                    <CAvatar size="md" color="primary" textColor="white">{getInitials(item.first_name, item.last_name)}</CAvatar>
                                </CTableDataCell>
                                <CTableDataCell>
                                    <div className="fw-bold text-body">{item.first_name} {item.last_name}</div>
                                    <div className="small text-medium-emphasis">DNI: {item.dni}</div>
                                </CTableDataCell>
                                <CTableDataCell>
                                    <div className="small text-body"><CIcon icon={cilEnvelopeClosed} className="me-1" />{item.email}</div>
                                    <div className="small text-medium-emphasis"><CIcon icon={cilPhone} className="me-1" />{item.number_tlf}</div>
                                </CTableDataCell>
                                <CTableDataCell className="text-center">{getRoleBadge(item.id_rols)}</CTableDataCell>
                                <CTableDataCell className="text-center">{getStatusBadge(item.status)}</CTableDataCell>
                                <CTableDataCell className="text-end">
                                    <CButton color="light" size="sm" variant="ghost" className="me-2" onClick={() => handleEditUser(item)}><CIcon icon={cilPencil} className="text-warning"/></CButton>
                                    <CButton color="light" size="sm" variant="ghost" onClick={() => handleDeleteClick(item.uid_users)}><CIcon icon={cilTrash} className="text-danger"/></CButton>
                                </CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            </CCardBody>
        </CCard>

        <CModal visible={showModal} backdrop="static" onClose={handleCloseModal} size="lg">
            <CModalHeader><CModalTitle>{editMode ? 'Editar Usuario' : 'Nuevo Usuario'}</CModalTitle></CModalHeader>
            <CModalBody>
                <CForm>
                    <h6 className="text-medium-emphasis mb-3">Información Personal</h6>
                    <CRow className="mb-3">
                        <CCol md={6}><CFormInput label="Nombre *" name="first_name" value={formData.first_name} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.first_name} /></CCol>
                        <CCol md={6}><CFormInput label="Apellido *" name="last_name" value={formData.last_name} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.last_name} /></CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CCol md={6}><CFormInput label="DNI *" name="dni" value={formData.dni} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.dni} /></CCol>
                        <CCol md={6}><CFormInput type="date" label="Fecha Nacimiento *" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.date_of_birth} /></CCol>
                    </CRow>
                    <h6 className="text-medium-emphasis mb-3 mt-4">Cuenta y Acceso</h6>
                    <CRow className="mb-3">
                        <CCol md={6}><CFormInput type="email" label="Email *" name="email" value={formData.email} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.email} /></CCol>
                        <CCol md={6}><CFormInput label="Teléfono *" name="number_tlf" value={formData.number_tlf} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.number_tlf}/></CCol>
                    </CRow>
                    <CRow className="mb-3">
                        {/* Se eliminó la selección de estado, se deja el Rol ocupando toda la fila */}
                        <CCol md={12}>
                            <CFormSelect label="Rol *" name="id_rols" value={formData.id_rols} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.id_rols}>
                                <option value="">Seleccione...</option>
                                <option value="1">Administrador</option>
                                <option value="2">Representante (Tutor)</option>
                                <option value="3">Estudiante</option>
                            </CFormSelect>
                        </CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CCol md={6}><CFormSelect label="Género *" name="gender" value={formData.gender} onChange={handleInputChange}><option value="">Seleccione...</option><option value="M">Masculino</option><option value="F">Femenino</option></CFormSelect></CCol>
                        <CCol md={6}><CFormInput type="password" label={editMode ? "Nueva Contraseña (Opcional)" : "Contraseña *"} name="password" value={formData.password} onChange={handleInputChange} placeholder={editMode ? "Dejar vacío para no cambiar" : ""} /></CCol>
                    </CRow>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" variant="ghost" onClick={handleCloseModal}>Cancelar</CButton>
                <CButton color="primary" onClick={handleSaveUser} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar'}</CButton>
            </CModalFooter>
        </CModal>
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static" alignment="center">
            <CModalHeader><CModalTitle>Confirmar Eliminación</CModalTitle></CModalHeader>
            <CModalBody>¿Está seguro que desea eliminar este usuario?</CModalBody>
            <CModalFooter>
                <CButton color="secondary" variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
                <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>Eliminar</CButton>
            </CModalFooter>
        </CModal>
    </div>
  );
};

export default Users;