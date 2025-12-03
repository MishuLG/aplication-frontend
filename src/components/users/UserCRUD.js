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
  const [validated, setValidated] = useState(false);
  const [alertBox, setAlertBox] = useState(null);

  // delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

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
        setAlertBox('Error: datos recibidos no válidos');
      }
    } catch (error) {
      console.error('fetchUsers error', error);
      setAlertBox('Error al obtener usuarios');
    }
  };

  const requiredFields = [
    'id_rols',
    'first_name',
    'last_name',
    'dni',
    'number_tlf',
    'email',
    'date_of_birth',
    'gender',
    'status',
  ];

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
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
    setEditMode(false);
    setSelectedUser(null);
    setErrors({});
    setValidated(false);
    setAlertBox(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'first_name' || name === 'last_name') {
      newValue = value.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g, '');
    }
    if (name === 'dni' || name === 'number_tlf') {
      newValue = value.replace(/[^\d]/g, '');
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setAlertBox(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (requiredFields.includes(name) && String(value || '').trim() === '') {
      setErrors((prev) => ({ ...prev, [name]: 'Este campo es obligatorio.' }));
      return;
    }
    if (name === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setErrors((prev) => ({ ...prev, email: 'Email no válido.' }));
        return;
      }
    }
    if (name === 'password' && !editMode && value && value.length < 6) {
      setErrors((prev) => ({ ...prev, password: 'Al menos 6 caracteres.' }));
      return;
    }
    if (name === 'date_of_birth' && value) {
      const dob = new Date(value);
      if (isNaN(dob.getTime())) {
        setErrors((prev) => ({ ...prev, date_of_birth: 'Fecha no válida.' }));
        return;
      }
      const today = new Date();
      dob.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (dob > today) {
        setErrors((prev) => ({ ...prev, date_of_birth: 'No puede ser futura.' }));
        return;
      }
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    for (const f of requiredFields) {
      const v = formData[f];
      if (!v || String(v).trim() === '') {
        newErrors[f] = 'Este campo es obligatorio.';
      }
    }
    if (formData.first_name && formData.first_name.trim().length < 2) {
      newErrors.first_name = 'Mínimo 2 caracteres.';
    }
    if (formData.last_name && formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Mínimo 2 caracteres.';
    }
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) newErrors.email = 'Email no válido.';
    }
    if (!editMode && formData.password && formData.password.length < 6) {
      newErrors.password = 'Al menos 6 caracteres.';
    }
    if (formData.dni && formData.dni.length < 6) {
      newErrors.dni = 'DNI demasiado corto.';
    }
    setErrors(newErrors);
    const ok = Object.keys(newErrors).length === 0;
    setValidated(ok);
    if (!ok) setAlertBox('Corrija los errores antes de guardar');
    else setAlertBox(null);
    return ok;
  };

  const markAllRequiredAsDuplicate = (message = 'Ya existente') => {
    const dup = {};
    requiredFields.forEach((f) => (dup[f] = message));
    setErrors(dup);
    setAlertBox(message);
    setValidated(false);
  };

  const handleSaveUser = async () => {
    if (!validateForm()) return;

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode && selectedUser ? `${usersUrl}/${selectedUser.uid_users}` : usersUrl;

      const payload = { ...formData };
      if (editMode && !payload.password) delete payload.password;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to parse server response (json or text) and display informative inline errors
        let errorText = `Error ${response.status}`;
        let errorData = null;
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            errorData = await response.json();
            if (errorData.errors && typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
              setErrors((prev) => ({ ...prev, ...errorData.errors }));
            } else if (Array.isArray(errorData.errors)) {
              const mapped = {};
              errorData.errors.forEach((err) => {
                if (err.field) mapped[err.field] = err.message || err.msg || JSON.stringify(err);
              });
              setErrors((prev) => ({ ...prev, ...mapped }));
            }
            if (errorData.message) errorText = errorData.message;
          } else {
            errorText = await response.text();
          }
        } catch (parseErr) {
          console.error('Error parsing server error response', parseErr);
        }

        const ml = (errorText || '').toLowerCase();
        const isDuplicate =
          response.status === 409 ||
          /ya existe/.test(ml) ||
          /already exists/.test(ml) ||
          /duplicate/.test(ml);

        if (isDuplicate) {
          markAllRequiredAsDuplicate(typeof errorData?.message === 'string' ? errorData.message : 'Ya existente');
          return;
        }

        setAlertBox(errorText || 'Error del servidor al crear/actualizar usuario');
        console.error('Server error response:', response.status, errorData || errorText);
        return;
      }

      // success
      await fetchUsers();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('handleSaveUser exception', error);
      setAlertBox(error.message || 'Error al guardar usuario');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      uid_users: user.uid_users || '',
      id_rols: user.id_rols || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      dni: user.dni || '',
      number_tlf: user.number_tlf || '',
      email: user.email || '',
      password: '',
      date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
      gender: user.gender || '',
      status: user.status || 'active',
    });
    setEditMode(true);
    setErrors({});
    setValidated(false);
    setAlertBox(null);
    setShowModal(true);
  };

  // original delete function (kept for reuse)
  const handleDeleteUser = async (id) => {
    try {
      const response = await fetch(`${usersUrl}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Server response error');
      await fetchUsers();
    } catch (error) {
      console.error('handleDeleteUser error', error);
      setAlertBox('Error al eliminar usuario');
    }
  };

  // functions for confirmation modal
  const handleDeleteClick = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setIdToDelete(null);
  };

  const confirmDelete = async () => {
    if (idToDelete) {
      await handleDeleteUser(idToDelete);
    }
    setShowDeleteModal(false);
    setIdToDelete(null);
  };

  const handleCopyUid = async (uid) => {
    try {
      if (!uid) return;
      await navigator.clipboard.writeText(uid);
      setAlertBox('UID copiado al portapapeles');
      setTimeout(() => setAlertBox(null), 2000);
    } catch (error) {
      console.error('handleCopyUid error', error);
      setAlertBox('No se pudo copiar UID');
      setTimeout(() => setAlertBox(null), 2000);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.first_name || '').toLowerCase().includes(filter.first_name.toLowerCase()) &&
      (user.email || '').toLowerCase().includes(filter.email.toLowerCase())
  );

  const renderErrorText = (field) => {
    if (!errors[field]) return null;
    return (
      <div style={{ color: 'red', fontSize: 12, marginTop: 6 }}>
        <strong style={{ marginRight: 6 }}>✖</strong>
        {errors[field]}
      </div>
    );
  };

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 style={{ margin: 0 }}>Usuarios</h5>
        <CButton
          color="success"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Agregar
        </CButton>
      </CCardHeader>

      <CCardBody>
        {alertBox && <CAlert color="danger">{alertBox}</CAlert>}

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <CFormInput
            placeholder="Filtrar por nombre"
            name="first_name"
            value={filter.first_name}
            onChange={handleFilterChange}
            style={{ maxWidth: 260 }}
          />
          <CFormInput
            placeholder="Filtrar por email"
            name="email"
            value={filter.email}
            onChange={handleFilterChange}
            style={{ maxWidth: 260 }}
          />
        </div>

        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>UID</CTableHeaderCell>
              <CTableHeaderCell>Rol</CTableHeaderCell>
              <CTableHeaderCell>Nombre</CTableHeaderCell>
              <CTableHeaderCell>Apellido</CTableHeaderCell>
              <CTableHeaderCell>DNI</CTableHeaderCell>
              <CTableHeaderCell>Teléfono</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {filteredUsers.map((user) => (
              <CTableRow key={user.uid_users}>
                <CTableDataCell style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace' }}>{user.uid_users ? '••••••••' : ''}</span>
                  <CButton
                    size="sm"
                    color="secondary"
                    onClick={() => handleCopyUid(user.uid_users)}
                    title="Copiar UID"
                  >
                    Copiar
                  </CButton>
                </CTableDataCell>

                <CTableDataCell style={{ width: 80 }}>{user.id_rols}</CTableDataCell>
                <CTableDataCell>{user.first_name}</CTableDataCell>
                <CTableDataCell>{user.last_name}</CTableDataCell>
                <CTableDataCell>{user.dni}</CTableDataCell>
                <CTableDataCell>{user.number_tlf}</CTableDataCell>
                <CTableDataCell>{user.email}</CTableDataCell>
                <CTableDataCell>{user.status}</CTableDataCell>
                <CTableDataCell style={{ whiteSpace: 'nowrap' }}>
                  <CButton color="warning" size="sm" onClick={() => handleEditUser(user)} style={{ marginRight: 8 }}>
                    Editar
                  </CButton>
                  <CButton color="danger" size="sm" onClick={() => handleDeleteClick(user.uid_users)}>
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        {/* Delete confirmation modal */}
        <CModal visible={showDeleteModal} onClose={handleCancelDelete} backdrop="static">
          <CModalHeader>
            <CModalTitle>Confirmar Eliminación</CModalTitle>
          </CModalHeader>
          <CModalBody>¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.</CModalBody>
          <CModalFooter>
            <CButton color="danger" onClick={confirmDelete}>
              Aceptar (Eliminar)
            </CButton>
            <CButton color="secondary" onClick={handleCancelDelete}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>

        <CModal visible={showModal} backdrop="static" onClose={handleCloseModal}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Usuario' : 'Agregar Usuario'}</CModalTitle>
          </CModalHeader>

          <CModalBody>
            {alertBox && <CAlert color="danger">{alertBox}</CAlert>}

            <CForm>
              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormSelect
                    name="id_rols"
                    value={formData.id_rols}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    invalid={!!errors.id_rols}
                  >
                    <option value="">Rol *</option>
                    <option value="1">Admin</option>
                    <option value="2">Usuario</option>
                    <option value="3">Invitado</option>
                  </CFormSelect>
                  {renderErrorText('id_rols')}
                </CCol>

                <CCol md={6}>
                  <CFormInput
                    name="first_name"
                    type="text"
                    placeholder="Nombre *"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    invalid={!!errors.first_name}
                  />
                  {renderErrorText('first_name')}
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormInput
                    name="last_name"
                    type="text"
                    placeholder="Apellido *"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    invalid={!!errors.last_name}
                  />
                  {renderErrorText('last_name')}
                </CCol>

                <CCol md={6}>
                  <CFormInput
                    name="dni"
                    type="text"
                    placeholder="DNI *"
                    value={formData.dni}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    invalid={!!errors.dni}
                  />
                  {renderErrorText('dni')}
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormInput
                    name="number_tlf"
                    type="text"
                    placeholder="Teléfono *"
                    value={formData.number_tlf}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    invalid={!!errors.number_tlf}
                  />
                  {renderErrorText('number_tlf')}
                </CCol>

                <CCol md={6}>
                  <CFormInput
                    name="email"
                    type="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    invalid={!!errors.email}
                  />
                  {renderErrorText('email')}
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormInput
                    name="password"
                    type="password"
                    placeholder={editMode ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña *'}
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    invalid={!!errors.password}
                  />
                  {renderErrorText('password')}
                </CCol>

                <CCol md={6}>
                  <CFormInput
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    invalid={!!errors.date_of_birth}
                  />
                  {renderErrorText('date_of_birth')}
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormSelect
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    invalid={!!errors.gender}
                  >
                    <option value="">Género *</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </CFormSelect>
                  {renderErrorText('gender')}
                </CCol>

                <CCol md={6}>
                  <CFormSelect
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    invalid={!!errors.status}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    {editMode && <option value="suspended">Suspendido</option>}
                  </CFormSelect>
                  {renderErrorText('status')}
                </CCol>
              </CRow>
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
