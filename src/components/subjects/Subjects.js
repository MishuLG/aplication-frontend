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
  CFormTextarea,
  CAlert,
  CRow,
  CCol,
} from '@coreui/react';
<<<<<<< HEAD
import API_URL from '../../../config';
=======
import API_URL from '../../../config';  
>>>>>>> ea4f8793337231f4ec4c6057816824d8d48f5e85

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    id_class_schedules: '',
    id_school_year: '',
    name_subject: '',
    description_subject: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [filter, setFilter] = useState({ name_subject: '', id_school_year: '' });
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

<<<<<<< HEAD
  // delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

=======
>>>>>>> ea4f8793337231f4ec4c6057816824d8d48f5e85
  const subjectsUrl = `${API_URL}/subjects`;

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
<<<<<<< HEAD
      const res = await fetch(subjectsUrl);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubjects(data);
      } else {
        console.error('fetchSubjects invalid data', data);
        setAlertBox('Error: datos de asignaturas no válidos');
      }
    } catch (err) {
      console.error('fetchSubjects error', err);
      setAlertBox('Error al obtener asignaturas');
=======
      const response = await fetch(subjectsUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSubjects(data);
      } else {
        console.error('Received data is not an array:', data);
        alert('Error: Invalid data received.');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      alert('An error occurred while fetching subjects. Please try again.');
>>>>>>> ea4f8793337231f4ec4c6057816824d8d48f5e85
    }
  };

  const parsePostgresUniqueError = (err) => {
    const result = { field: 'registro', value: null, message: 'Valor duplicado' };
    try {
<<<<<<< HEAD
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
        const c = err.constraint;
        if (/name_subject|subject/i.test(c)) {
          result.field = 'name_subject';
          result.message = 'Nombre de asignatura duplicado';
        } else if (/id_class_schedules|class_schedule/i.test(c)) {
          result.field = 'id_class_schedules';
          result.message = 'ID Horario duplicado';
        }
      }
      if (err.message) result.message = err.message;
    } catch (e) {
      // ignore
=======
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${subjectsUrl}/${selectedSubject.id_subject}` : subjectsUrl;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      fetchSubjects();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving subject:', error);
      alert('An error occurred while saving the subject. Please try again.');
    }
  };

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      id_class_schedules: subject.id_class_schedules,
      id_school_year: subject.id_school_year,
      name_subject: subject.name_subject,
      description_subject: subject.description_subject,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteSubject = async (id) => {
    try {
      const response = await fetch(`${subjectsUrl}/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('An error occurred while deleting the subject. Please try again.');
>>>>>>> ea4f8793337231f4ec4c6057816824d8d48f5e85
    }
    return result;
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredSubjects = subjects.filter((subject) => {
    const name = subject.name_subject ? subject.name_subject.toLowerCase() : '';
    const schoolYear = subject.id_school_year != null ? String(subject.id_school_year) : '';
    return name.includes((filter.name_subject || '').toLowerCase()) && schoolYear.includes(filter.id_school_year || '');
  });

  const resetForm = () => {
    setFormData({
      id_class_schedules: '',
      id_school_year: '',
      name_subject: '',
      description_subject: '',
    });
    setEditMode(false);
    setSelectedSubject(null);
    setErrors({});
    setAlertBox(null);
    setIsSaving(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      id_class_schedules: subject.id_class_schedules != null ? String(subject.id_class_schedules) : '',
      id_school_year: subject.id_school_year != null ? String(subject.id_school_year) : '',
      name_subject: subject.name_subject || '',
      description_subject: subject.description_subject || '',
    });
    setEditMode(true);
    setErrors({});
    setAlertBox(null);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'id_class_schedules' || name === 'id_school_year') {
      v = v.replace(/[^\d]/g, '');
    }
    if (name === 'name_subject') {
      v = v.replace(/^\s+/, ''); // trim start
    }
    if (name === 'description_subject') {
      // limit length
      if (v.length > 1000) v = v.slice(0, 1000);
    }
    setFormData((p) => ({ ...p, [name]: v }));
    setErrors((p) => ({ ...p, [name]: '' }));
    setAlertBox(null);
  };

  const validateField = (name, value) => {
    let msg = '';
    const val = value != null ? String(value).trim() : '';
    if (name === 'id_class_schedules') {
      if (val === '') msg = 'ID Horario de Clase es obligatorio.';
      else {
        const num = Number(val);
        if (!Number.isInteger(num) || num <= 0) msg = 'ID Horario debe ser un entero positivo.';
      }
    } else if (name === 'id_school_year') {
      if (val === '') msg = 'ID Año Escolar es obligatorio.';
      else {
        const num = Number(val);
        if (!Number.isInteger(num) || num <= 0) msg = 'ID Año Escolar debe ser un entero positivo.';
      }
    } else if (name === 'name_subject') {
      if (val === '') msg = 'Nombre de asignatura es obligatorio.';
      else if (val.length < 2) msg = 'Nombre demasiado corto (mín 2 caracteres).';
      else if (val.length > 255) msg = 'Nombre demasiado largo (máx 255).';
    } else if (name === 'description_subject') {
      if (val.length > 1000) msg = 'Descripción demasiado larga (máx 1000).';
    }
    setErrors((p) => ({ ...p, [name]: msg }));
    return msg === '';
  };

  const validateAll = () => {
    const v1 = validateField('id_class_schedules', formData.id_class_schedules);
    const v2 = validateField('id_school_year', formData.id_school_year);
    const v3 = validateField('name_subject', formData.name_subject);
    const v4 = validateField('description_subject', formData.description_subject);

    // client uniqueness check (best-effort)
    if (v1 && v2 && v3) {
      const idSched = String(formData.id_class_schedules).trim();
      const idYear = String(formData.id_school_year).trim();
      const name = String(formData.name_subject).trim().toLowerCase();
      const duplicate = subjects.find((s) => {
        if (editMode && selectedSubject && String(s.id_subject) === String(selectedSubject.id_subject)) return false;
        const sameSched = String(s.id_class_schedules) === idSched;
        const sameYear = String(s.id_school_year) === idYear;
        const sameName = String(s.name_subject || '').trim().toLowerCase() === name;
        return sameSched && sameYear && sameName;
      });
      if (duplicate) {
        setErrors((p) => ({ ...p, name_subject: 'Ya existe una asignatura igual para ese horario y año.' }));
        setAlertBox('Ya existe una asignatura igual para ese horario y año.');
        return false;
      }
    }

    const ok = v1 && v2 && v3 && v4 && !errors.id_class_schedules && !errors.id_school_year && !errors.name_subject && !errors.description_subject;
    if (!ok) setAlertBox('Corrija los errores antes de guardar.');
    else setAlertBox(null);
    return ok;
  };

  const handleSaveSubject = async () => {
    if (isSaving) return;
    if (!validateAll()) return;

    setIsSaving(true);
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode && selectedSubject ? `${subjectsUrl}/${selectedSubject.id_subject}` : subjectsUrl;

      const payload = {
        id_class_schedules: Number(formData.id_class_schedules),
        id_school_year: Number(formData.id_school_year),
        name_subject: String(formData.name_subject).trim(),
        description_subject: String(formData.description_subject || '').trim(),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorText = `Error ${response.status}`;
        let errorData = null;
        try {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
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
        if (response.status === 409 || /ya existe|duplicate|already exists/.test(textLower) || (errorData && errorData.code === '23505')) {
          const parsed = parsePostgresUniqueError(errorData || { detail: errorText, constraint: '' });
          const field = parsed.field || 'name_subject';
          const msg = parsed.value ? `Ya existe ${parsed.value}` : parsed.message || 'Valor duplicado';
          setErrors((prev) => ({ ...prev, [field]: msg }));
          setAlertBox(parsed.message);
          setIsSaving(false);
          return;
        }

        setAlertBox(errorText || 'Error del servidor al guardar asignatura');
        setIsSaving(false);
        return;
      }

      await fetchSubjects();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('handleSaveSubject error', err);
      setAlertBox(err.message || 'Error al guardar asignatura');
    } finally {
      setIsSaving(false);
    }
  };

  // delete handlers
  const handleDeleteClick = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
    setAlertBox(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setIdToDelete(null);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${subjectsUrl}/${idToDelete}`, { method: 'DELETE' });
      if (!res.ok) {
        let txt = `Error ${res.status}`;
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const jd = await res.json();
            txt = jd.message || JSON.stringify(jd);
          } else {
            txt = await res.text();
          }
        } catch (_) {}
        setAlertBox(txt || 'Error al eliminar asignatura');
        setIsDeleting(false);
        return;
      }
      await fetchSubjects();
      setShowDeleteModal(false);
      setIdToDelete(null);
    } catch (err) {
      console.error('confirmDelete error', err);
      setAlertBox(err.message || 'Error al eliminar asignatura');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CCard>
<<<<<<< HEAD
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 style={{ margin: 0 }}>Asignaturas</h5>
        <CButton color="success" onClick={openAddModal}>
=======
      <CCardHeader>
        <h5>Asignaturas</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
>>>>>>> ea4f8793337231f4ec4c6057816824d8d48f5e85
          Agregar Asignatura
        </CButton>
      </CCardHeader>

      <CCardBody>
        {alertBox && (
          <CAlert color="danger" style={{ marginBottom: 12 }}>
            {alertBox}
          </CAlert>
        )}

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <CFormInput
            placeholder="Filtrar por nombre de asignatura"
            name="name_subject"
            value={filter.name_subject}
            onChange={handleFilterChange}
            style={{ maxWidth: 320 }}
          />
          <CFormInput
            placeholder="Filtrar por ID de año escolar"
            name="id_school_year"
            value={filter.id_school_year}
            onChange={handleFilterChange}
            style={{ maxWidth: 200 }}
          />
          <CButton color="secondary" onClick={() => setFilter({ name_subject: '', id_school_year: '' })}>
            Limpiar
          </CButton>
        </div>

        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Asignatura</CTableHeaderCell>
              <CTableHeaderCell>ID Horario de Clase</CTableHeaderCell>
              <CTableHeaderCell>ID Año Escolar</CTableHeaderCell>
              <CTableHeaderCell>Nombre de Asignatura</CTableHeaderCell>
              <CTableHeaderCell>Descripción</CTableHeaderCell>
              <CTableHeaderCell>Creado En</CTableHeaderCell>
              <CTableHeaderCell>Actualizado En</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredSubjects.map((subject) => (
              <CTableRow key={subject.id_subject}>
                <CTableDataCell>{subject.id_subject}</CTableDataCell>
                <CTableDataCell>{subject.id_class_schedules}</CTableDataCell>
                <CTableDataCell>{subject.id_school_year}</CTableDataCell>
                <CTableDataCell>{subject.name_subject}</CTableDataCell>
                <CTableDataCell>{subject.description_subject}</CTableDataCell>
                <CTableDataCell>{subject.created_at}</CTableDataCell>
                <CTableDataCell>{subject.updated_at}</CTableDataCell>
                <CTableDataCell>
<<<<<<< HEAD
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() => handleEditSubject(subject)}
                    style={{ marginRight: 8 }}
                  >
                    Editar
                  </CButton>
                  <CButton color="danger" size="sm" onClick={() => handleDeleteClick(subject.id_subject)}>
=======
                  <CButton color="warning" size="sm" onClick={() => handleEditSubject(subject)}>
                    Editar
                  </CButton>{' '}
                  <CButton color="danger" size="sm" onClick={() => handleDeleteSubject(subject.id_subject)}>
>>>>>>> ea4f8793337231f4ec4c6057816824d8d48f5e85
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} backdrop="static" onClose={handleCloseModal} size="md">
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Asignatura' : 'Agregar Asignatura'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {alertBox && (
              <CAlert color="danger" style={{ marginBottom: 12 }}>
                {alertBox}
              </CAlert>
            )}
            <CForm>
<<<<<<< HEAD
              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormInput
                    name="id_class_schedules"
                    placeholder="ID Horario de Clase *"
                    value={formData.id_class_schedules}
                    onChange={handleChange}
                    onBlur={(e) => validateField('id_class_schedules', e.target.value)}
                    invalid={!!errors.id_class_schedules}
                  />
                  {errors.id_class_schedules && (
                    <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>
                      <strong style={{ marginRight: 6 }}>✖</strong>
                      {errors.id_class_schedules}
                    </div>
                  )}
                </CCol>

                <CCol md={6}>
                  <CFormInput
                    name="id_school_year"
                    placeholder="ID Año Escolar *"
                    value={formData.id_school_year}
                    onChange={handleChange}
                    onBlur={(e) => validateField('id_school_year', e.target.value)}
                    invalid={!!errors.id_school_year}
                  />
                  {errors.id_school_year && (
                    <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>
                      <strong style={{ marginRight: 6 }}>✖</strong>
                      {errors.id_school_year}
                    </div>
                  )}
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={12}>
                  <CFormInput
                    name="name_subject"
                    placeholder="Nombre de Asignatura *"
                    value={formData.name_subject}
                    onChange={handleChange}
                    onBlur={(e) => validateField('name_subject', e.target.value)}
                    invalid={!!errors.name_subject}
                  />
                  {errors.name_subject && (
                    <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>
                      <strong style={{ marginRight: 6 }}>✖</strong>
                      {errors.name_subject}
                    </div>
                  )}
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={12}>
                  <CFormTextarea
                    name="description_subject"
                    placeholder="Descripción (opcional, máx 1000 caracteres)"
                    value={formData.description_subject}
                    onChange={handleChange}
                    onBlur={(e) => validateField('description_subject', e.target.value)}
                    rows="4"
                    invalid={!!errors.description_subject}
                  />
                  {errors.description_subject && (
                    <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>
                      <strong style={{ marginRight: 6 }}>✖</strong>
                      {errors.description_subject}
                    </div>
                  )}
                </CCol>
              </CRow>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveSubject} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </CButton>
            <CButton color="secondary" onClick={handleCloseModal} disabled={isSaving}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>

        <CModal visible={showDeleteModal} onClose={handleCancelDelete} backdrop="static" alignment="center">
          <CModalHeader>
            <CModalTitle>Confirmar eliminación</CModalTitle>
          </CModalHeader>
          <CModalBody>¿Está seguro que desea eliminar esta asignatura? Esta acción no se puede deshacer.</CModalBody>
          <CModalFooter>
            <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </CButton>
            <CButton color="secondary" onClick={handleCancelDelete} disabled={isDeleting}>
=======
              <CFormInput
                type="text"
                label="ID Horario de Clase"
                value={formData.id_class_schedules}
                onChange={(e) => setFormData({ ...formData, id_class_schedules: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="ID Año Escolar"
                value={formData.id_school_year}
                onChange={(e) => setFormData({ ...formData, id_school_year: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Nombre de Asignatura"
                value={formData.name_subject}
                onChange={(e) => setFormData({ ...formData, name_subject: e.target.value })}
                required
              />
              <CFormTextarea
                label="Descripción"
                value={formData.description_subject}
                onChange={(e) => setFormData({ ...formData, description_subject: e.target.value })}
                rows="3"
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveSubject}>
              Guardar
            </CButton>
            <CButton color="secondary" onClick={handleCloseModal}>
>>>>>>> ea4f8793337231f4ec4c6057816824d8d48f5e85
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Subjects;
