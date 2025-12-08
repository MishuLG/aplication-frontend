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
} from '@coreui/react';
import API_URL from '../../../config';

const Tutors = () => {
  const [tutors, setTutors] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ uid_users: '' });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [filter, setFilter] = useState({ uid_users: '' });
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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
      if (Array.isArray(data)) {
        setTutors(data);
      } else {
        setAlertBox('Error: datos de tutores no válidos');
      }
    } catch (error) {
      console.error('fetchTutors error', error);
      setAlertBox('Error al obtener tutores');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(usersUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setAlertBox('Error: datos de usuarios no válidos');
      }
    } catch (error) {
      console.error('fetchUsers error', error);
      setAlertBox('Error al obtener usuarios');
    }
  };

  const getAssignedUserIds = () => tutors.map((t) => t.uid_users).filter(Boolean);

  const getAvailableUsers = () => {
    const assigned = getAssignedUserIds();
    return users.filter((user) => {
      if (!user || !user.uid_users) return false;
      // allow the currently selected tutor's user when editing
      if (editMode && selectedTutor && selectedTutor.uid_users === user.uid_users) return true;
      return !assigned.includes(user.uid_users);
    });
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredTutors = tutors.filter((tutor) =>
    String(tutor.uid_users || '').includes(String(filter.uid_users || ''))
  );

  const resetForm = () => {
    setFormData({ uid_users: '' });
    setEditMode(false);
    setSelectedTutor(null);
    setErrors({});
    setAlertBox(null);
    setIsSaving(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (tutor) => {
    setSelectedTutor(tutor);
    setFormData({ uid_users: tutor.uid_users || '' });
    setEditMode(true);
    setErrors({});
    setAlertBox(null);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
    setAlertBox(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value || String(value).trim() === '') {
      setErrors((p) => ({ ...p, [name]: 'Este campo es obligatorio.' }));
      return;
    }
    const available = getAvailableUsers().map((u) => String(u.uid_users));
    if (!available.includes(String(value))) {
      setErrors((p) => ({ ...p, [name]: 'Usuario no disponible o inválido.' }));
      return;
    }
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validateAll = () => {
    const newErrors = {};
    if (!formData.uid_users || String(formData.uid_users).trim() === '') {
      newErrors.uid_users = 'Seleccione un usuario.';
    } else {
      const available = getAvailableUsers().map((u) => String(u.uid_users));
      if (!available.includes(String(formData.uid_users))) {
        newErrors.uid_users = 'Usuario no disponible o inválido.';
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setAlertBox('Corrija los errores antes de guardar.');
      return false;
    }
    setAlertBox(null);
    return true;
  };

  const parsePostgresUniqueError = (err) => {
    const result = { field: 'registro', value: null, message: 'Valor duplicado' };
    if (!err) return result;
    if (typeof err.detail === 'string') {
      const m = err.detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
      if (m) {
        result.field = m[1] || result.field;
        result.value = m[2] || null;
        result.message = result.value ? `Ya existe ${result.field}: ${result.value}` : `Valor duplicado en ${result.field}`;
        return result;
      }
    }
    if (err.constraint && typeof err.constraint === 'string') {
      if (/identif|dni|identification/i.test(err.constraint)) {
        result.field = 'dni';
        result.message = 'DNI duplicado';
        return result;
      }
    }
    if (err.message) result.message = err.message;
    return result;
  };

  const saveTutor = async () => {
    if (isSaving) return;
    if (!validateAll()) return;

    setIsSaving(true);
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode && selectedTutor ? `${tutorsUrl}/${selectedTutor.id_tutor}` : tutorsUrl;

      const payload = { uid_users: formData.uid_users };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorText = `Error ${response.status}`;
        let errorData = null;
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            errorData = await response.json();
            if (errorData.errors && typeof errorData.errors === 'object') {
              setErrors((prev) => ({ ...prev, ...errorData.errors }));
            }
            if (errorData.message) errorText = errorData.message;
          } else {
            errorText = await response.text();
          }
        } catch (parseErr) {
          console.error('parse error', parseErr);
        }

        const textLower = (errorText || '').toLowerCase();
        if (
          response.status === 409 ||
          /ya existe|duplicate|already exists/.test(textLower) ||
          (errorData && errorData.code === '23505')
        ) {
          const parsed = parsePostgresUniqueError(errorData || { detail: errorText, constraint: '' });
          const e = {};
          e[parsed.field] = parsed.value ? `Ya existe ${parsed.value}` : parsed.message;
          setErrors((prev) => ({ ...prev, ...e }));
          setAlertBox(parsed.message);
          setIsSaving(false);
          return;
        }

        setAlertBox(errorText || 'Error del servidor al guardar tutor');
        setIsSaving(false);
        return;
      }

      await fetchTutors();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('saveTutor exception', err);
      setAlertBox(err.message || 'Error al guardar tutor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClickLocal = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
    setAlertBox(null);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${tutorsUrl}/${idToDelete}`, { method: 'DELETE' });
      if (!response.ok) {
        let text = `Error ${response.status}`;
        try {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const jd = await response.json();
            text = jd.message || JSON.stringify(jd);
          } else {
            text = await response.text();
          }
        } catch (_) {}
        setAlertBox(text || 'Error al eliminar tutor');
        setIsDeleting(false);
        return;
      }
      await fetchTutors();
      setShowDeleteModal(false);
      setIdToDelete(null);
    } catch (err) {
      console.error('confirmDelete error', err);
      setAlertBox(err.message || 'Error al eliminar tutor');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 style={{ margin: 0 }}>Tutores</h5>
        <CButton color="success" onClick={openAddModal}>
          Agregar Tutor
        </CButton>
      </CCardHeader>

      <CCardBody>
        {alertBox && <CAlert color="danger">{alertBox}</CAlert>}

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <CFormSelect
            aria-label="Filtrar por usuario"
            value={filter.uid_users}
            name="uid_users"
            onChange={(e) => handleFilterChange(e)}
            style={{ maxWidth: 320 }}
          >
            <option value="">Filtrar por Usuario (Todos)</option>
            {users.map((u) => (
              <option key={u.uid_users} value={u.uid_users}>
                {u.first_name} {u.last_name} ({u.uid_users})
              </option>
            ))}
          </CFormSelect>
          <CButton color="secondary" onClick={() => setFilter({ uid_users: '' })}>
            Limpiar filtro
          </CButton>
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
                  <CButton color="warning" size="sm" onClick={() => handleEdit(tutor)} style={{ marginRight: 8 }}>
                    Editar
                  </CButton>
                  <CButton color="danger" size="sm" onClick={() => handleDeleteClickLocal(tutor.id_tutor)}>
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} backdrop="static" onClose={closeModal} size="sm">
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Tutor' : 'Agregar Tutor'}</CModalTitle>
          </CModalHeader>

          <CModalBody>
            {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
            <CForm>
              <div style={{ marginBottom: 6, fontSize: 13, color: '#6c757d' }}>
                Seleccione el usuario que será tutor. Los usuarios ya asignados no aparecen.
              </div>

              <CFormSelect
                name="uid_users"
                value={formData.uid_users}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={!!errors.uid_users}
                aria-label="Seleccionar usuario tutor"
              >
                <option value="">{editMode ? 'Mantener usuario actual o seleccionar uno nuevo' : 'Seleccionar Usuario *'}</option>
                {getAvailableUsers().map((user) => (
                  <option key={user.uid_users} value={user.uid_users}>
                    {user.first_name} {user.last_name} ({user.uid_users})
                  </option>
                ))}
              </CFormSelect>
              {errors.uid_users && (
                <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>
                  <strong style={{ marginRight: 6 }}>✖</strong>
                  {errors.uid_users}
                </div>
              )}
            </CForm>
          </CModalBody>

          <CModalFooter>
            <CButton color="success" onClick={saveTutor} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </CButton>
            <CButton color="secondary" onClick={closeModal} disabled={isSaving}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>

        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static" alignment="center">
          <CModalHeader>
            <CModalTitle>Confirmar eliminación</CModalTitle>
          </CModalHeader>
          <CModalBody>¿Está seguro que desea eliminar este tutor? Esta acción no se puede deshacer.</CModalBody>
          <CModalFooter>
            <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </CButton>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Tutors;
