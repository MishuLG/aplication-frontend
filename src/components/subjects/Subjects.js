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
  CFormSelect,
  CAlert,
  CRow,
  CCol,
  CInputGroup,
  CInputGroupText,
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilPlus, 
  cilPencil, 
  cilTrash, 
  cilSearch, 
  cilBook, 
  cilCalendar, 
  cilClock,
  cilList // <-- ¡Icono agregado aquí para corregir el error!
} from '@coreui/icons';
import API_URL from '../../../config';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);   
  const [schoolYears, setSchoolYears] = useState([]); 
  
  const [formData, setFormData] = useState({
    id_class_schedules: '',
    id_school_year: '',
    name_subject: '',
    description_subject: '',
  });

  // UI States
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [filter, setFilter] = useState({ name_subject: '', id_school_year: '' });
  
  // Validaciones
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Borrado
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const subjectsUrl = `${API_URL}/subjects`;
  const schedulesUrl = `${API_URL}/class_schedules`;
  const schoolYearsUrl = `${API_URL}/school_years`;

  useEffect(() => {
    fetchSubjects();
    fetchDependencies();
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

  const fetchSubjects = async () => {
    try {
      const res = await authenticatedFetch(subjectsUrl);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubjects(data);
      } else {
        console.error('Datos inválidos:', data);
      }
    } catch (err) {
      console.error(err);
      if (err.message !== 'Sesión expirada.') setAlertBox('Error al obtener asignaturas');
    }
  };

  const fetchDependencies = async () => {
      try {
          const resSch = await authenticatedFetch(schedulesUrl);
          const dataSch = await resSch.json();
          if (Array.isArray(dataSch)) setSchedules(dataSch);

          const resYear = await authenticatedFetch(schoolYearsUrl);
          const dataYear = await resYear.json();
          if (Array.isArray(dataYear)) setSchoolYears(dataYear);
      } catch (err) { console.error("Error cargando dependencias", err); }
  };

  // --- VALIDACIONES ---

  const parsePostgresUniqueError = (err) => {
    const result = { field: 'registro', value: null, message: 'Valor duplicado' };
    try {
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
    } catch (e) {}
    return result;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    
    if (name === 'name_subject') {
      v = v.replace(/^\s+/, '');
    }
    if (name === 'description_subject') {
      if (v.length > 1000) v = v.slice(0, 1000);
    }
    
    setFormData((p) => ({ ...p, [name]: v }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    setAlertBox(null);
  };

  const handleBlur = (e) => {
      const { name, value } = e.target;
      validateField(name, value);
  };

  const validateField = (name, value) => {
    let msg = '';
    const val = value != null ? String(value).trim() : '';
    
    if (name === 'id_class_schedules') {
      if (val === '') msg = 'Horario de Clase es obligatorio.';
    } else if (name === 'id_school_year') {
      if (val === '') msg = 'Año Escolar es obligatorio.';
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
    if (!ok && !alertBox) setAlertBox('Por favor, corrija los errores.');
    return ok;
  };

  // --- CRUD ---

  const handleSaveSubject = async () => {
    if (isSaving) return;
    if (!validateAll()) return;

    setIsSaving(true);
    setAlertBox(null);

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode && selectedSubject ? `${subjectsUrl}/${selectedSubject.id_subject}` : subjectsUrl;

      const payload = {
        id_class_schedules: Number(formData.id_class_schedules),
        id_school_year: Number(formData.id_school_year),
        name_subject: String(formData.name_subject).trim(),
        description_subject: String(formData.description_subject || '').trim(),
      };

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorText = `Error ${response.status}`;
        let errorData = null;
        try {
            const ct = response.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
                errorData = await response.json();
                if (errorData.message) errorText = errorData.message;
            } else {
                errorText = await response.text();
            }
        } catch (_) {}

        const textLower = (errorText || '').toLowerCase();
        if (response.status === 409 || /ya existe|duplicate|already exists/.test(textLower) || (errorData && errorData.code === '23505')) {
            const parsed = parsePostgresUniqueError(errorData || { detail: errorText, constraint: '' });
            const field = parsed.field || 'name_subject';
            const msg = parsed.message || 'Valor duplicado';
            setErrors((prev) => ({ ...prev, [field]: msg }));
            setAlertBox(parsed.message);
        } else {
            setAlertBox(errorText || 'Error del servidor al guardar asignatura');
        }
        
        setIsSaving(false);
        return;
      }

      await fetchSubjects();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      if (err.message !== 'Sesión expirada.') setAlertBox(err.message || 'Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

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
      const res = await authenticatedFetch(`${subjectsUrl}/${idToDelete}`, { method: 'DELETE' });
      
      if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error al eliminar');
      }
      
      await fetchSubjects();
      setShowDeleteModal(false);
    } catch (err) {
      setAlertBox(err.message);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Helpers UI ---

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      id_class_schedules: subject.id_class_schedules,
      id_school_year: subject.id_school_year,
      name_subject: subject.name_subject,
      description_subject: subject.description_subject,
    });
    setEditMode(true);
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setShowModal(false);
    setFormData({ id_class_schedules: '', id_school_year: '', name_subject: '', description_subject: '' });
    setEditMode(false);
    setSelectedSubject(null);
    setErrors({});
    setAlertBox(null);
  };

  const getScheduleLabel = (id) => {
      const s = schedules.find(item => item.id_class_schedules === id);
      return s ? `${s.day_of_week} | ${s.start_time.slice(0,5)} - ${s.end_time.slice(0,5)}` : `ID: ${id}`;
  };

  const getYearLabel = (id) => {
      const y = schoolYears.find(item => item.id_school_year === id);
      return y ? `${y.period_year} (${y.school_grade})` : `ID: ${id}`;
  };

  const filteredSubjects = subjects.filter((subject) => {
    const name = subject.name_subject ? subject.name_subject.toLowerCase() : '';
    const yearLabel = getYearLabel(subject.id_school_year).toLowerCase();
    const searchYear = (filter.id_school_year || '').toLowerCase();
    const matchesName = name.includes((filter.name_subject || '').toLowerCase());
    const matchesYear = yearLabel.includes(searchYear) || String(subject.id_school_year).includes(searchYear);
    return matchesName && matchesYear;
  });

  const totalSubjects = subjects.length;
  const subjectsWithDesc = subjects.filter(s => s.description_subject && s.description_subject.length > 0).length;

  return (
    <div className="container-fluid mt-4">
      
      {/* --- KPIs --- */}
      <CRow className="mb-4">
          <CCol sm={6}>
              <CCard className="border-start-4 border-start-primary shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Total Asignaturas</div>
                          <div className="fs-4 fw-semibold text-body">{totalSubjects}</div>
                      </div>
                      <CIcon icon={cilBook} size="xl" className="text-primary" />
                  </CCardBody>
              </CCard>
          </CCol>
          <CCol sm={6}>
              <CCard className="border-start-4 border-start-info shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Con Detalles</div>
                          <div className="fs-4 fw-semibold text-body">{subjectsWithDesc}</div>
                      </div>
                      <CIcon icon={cilList} size="xl" className="text-info" />
                  </CCardBody>
              </CCard>
          </CCol>
      </CRow>

      {/* --- CARD PRINCIPAL --- */}
      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 text-body">Gestión de Asignaturas</h5>
            <CButton color="success" onClick={() => { handleCloseModal(); setShowModal(true); }} className="d-flex align-items-center text-white">
              <CIcon icon={cilPlus} className="me-2" /> Agregar Asignatura
            </CButton>
        </CCardHeader>

        <CCardBody>
            {alertBox && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}

            {/* Filtros */}
            <CRow className="mb-4 g-2">
                <CCol md={6}>
                    <CInputGroup>
                        <CInputGroupText className="bg-transparent text-medium-emphasis border-end-0">
                            <CIcon icon={cilSearch} />
                        </CInputGroupText>
                        <CFormInput 
                            className="bg-transparent border-start-0"
                            placeholder="Buscar por nombre..." 
                            name="name_subject"
                            value={filter.name_subject} 
                            onChange={(e) => setFilter({...filter, name_subject: e.target.value})} 
                        />
                    </CInputGroup>
                </CCol>
                <CCol md={6}>
                    <CInputGroup>
                        <CInputGroupText className="bg-transparent text-medium-emphasis border-end-0">
                            <CIcon icon={cilCalendar} />
                        </CInputGroupText>
                        <CFormInput 
                            className="bg-transparent border-start-0"
                            placeholder="Buscar por Año Escolar..." 
                            name="id_school_year"
                            value={filter.id_school_year} 
                            onChange={(e) => setFilter({...filter, id_school_year: e.target.value})} 
                        />
                    </CInputGroup>
                </CCol>
            </CRow>

            {/* Tabla */}
            <CTable align="middle" className="mb-0 border" hover responsive striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{width: '60px'}}><CIcon icon={cilBook} /></CTableHeaderCell>
                  <CTableHeaderCell>Asignatura</CTableHeaderCell>
                  <CTableHeaderCell>Horario</CTableHeaderCell>
                  <CTableHeaderCell>Año Escolar</CTableHeaderCell>
                  <CTableHeaderCell>Descripción</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredSubjects.map((subject) => (
                  <CTableRow key={subject.id_subject}>
                    <CTableDataCell className="text-center">
                        <CBadge color="primary" shape="rounded-pill">#{subject.id_subject}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="fw-bold text-body fs-5">{subject.name_subject}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="d-flex align-items-center text-body small">
                            <CIcon icon={cilClock} className="me-2 text-medium-emphasis"/>
                            {getScheduleLabel(subject.id_class_schedules)}
                        </div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="d-flex align-items-center text-body small">
                            <CIcon icon={cilCalendar} className="me-2 text-medium-emphasis"/>
                            {getYearLabel(subject.id_school_year)}
                        </div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="text-medium-emphasis small text-truncate" style={{maxWidth: '200px'}}>
                            {subject.description_subject || '-'}
                        </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton color="light" size="sm" variant="ghost" className="me-2" onClick={() => handleEditSubject(subject)}>
                          <CIcon icon={cilPencil} className="text-warning"/>
                      </CButton>
                      <CButton color="light" size="sm" variant="ghost" onClick={() => handleDeleteClick(subject.id_subject)}>
                          <CIcon icon={cilTrash} className="text-danger"/>
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {filteredSubjects.length === 0 && (
                    <CTableRow>
                        <CTableDataCell colSpan="6" className="text-center py-4 text-medium-emphasis">
                            No hay asignaturas registradas.
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
        <CModalBody>¿Está seguro que desea eliminar esta asignatura? Esta acción es irreversible.</CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
          <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showModal} backdrop="static" onClose={handleCloseModal}>
        <CModalHeader>
          <CModalTitle>{editMode ? 'Editar Asignatura' : 'Nueva Asignatura'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
          <CForm>
            <div className="mb-3">
                <CFormInput
                  label="Nombre de Asignatura *"
                  name="name_subject"
                  placeholder="Ej: Matemáticas, Historia..."
                  value={formData.name_subject}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField('name_subject', e.target.value)}
                  invalid={!!errors.name_subject}
                />
                {errors.name_subject && <div className="text-danger small mt-1">{errors.name_subject}</div>}
            </div>
            
            <div className="mb-3">
                <CFormSelect
                  label="Horario *"
                  name="id_class_schedules"
                  value={formData.id_class_schedules}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField('id_class_schedules', e.target.value)}
                  invalid={!!errors.id_class_schedules}
                >
                  <option value="">Seleccionar Horario...</option>
                  {schedules.map((s) => (
                    <option key={s.id_class_schedules} value={s.id_class_schedules}>
                      {s.day_of_week} | {s.start_time.slice(0,5)} - {s.end_time.slice(0,5)} ({s.classroom})
                    </option>
                  ))}
                </CFormSelect>
                {errors.id_class_schedules && <div className="text-danger small mt-1">{errors.id_class_schedules}</div>}
            </div>

            <div className="mb-3">
                <CFormSelect
                  label="Año Escolar *"
                  name="id_school_year"
                  value={formData.id_school_year}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField('id_school_year', e.target.value)}
                  invalid={!!errors.id_school_year}
                >
                  <option value="">Seleccionar Año...</option>
                  {schoolYears.map((y) => (
                    <option key={y.id_school_year} value={y.id_school_year}>
                      {y.period_year} - {y.school_grade}
                    </option>
                  ))}
                </CFormSelect>
                {errors.id_school_year && <div className="text-danger small mt-1">{errors.id_school_year}</div>}
            </div>

            <div className="mb-3">
                <CFormTextarea
                  label="Descripción (Opcional)"
                  name="description_subject"
                  placeholder="Detalles sobre el curso..."
                  value={formData.description_subject}
                  onChange={handleInputChange}
                  rows={3}
                  invalid={!!errors.description_subject}
                />
                {errors.description_subject && <div className="text-danger small mt-1">{errors.description_subject}</div>}
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={handleCloseModal}>Cancelar</CButton>
          <CButton color="success" onClick={handleSaveSubject} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Subjects;