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
  cilUser, 
  cilBook, 
  cilSchool, 
  cilChartPie 
} from '@coreui/icons';
import API_URL from '../../../config';

const SubjectsTaken = () => {
  const [subjectsTaken, setSubjectsTaken] = useState([]);
  const [formData, setFormData] = useState({
    id_student: '',
    id_subject: '',
    id_school_year: '',
    final_grade: '',
  });
  
  // Listas de dependencias
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);

  // Estados UI
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubjectTaken, setSelectedSubjectTaken] = useState(null);
  const [filter, setFilter] = useState({ id_student: '', id_school_year: '' });

  // Estados Validación
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados Borrado
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const subjectsTakenUrl = `${API_URL}/subjects_taken`;
  const studentsUrl = `${API_URL}/students`;
  const subjectsUrl = `${API_URL}/subjects`;
  const schoolYearsUrl = `${API_URL}/school_years`;

  useEffect(() => {
    fetchSubjectsTaken();
    fetchDependencies();
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

  const fetchSubjectsTaken = async () => {
    try {
      const response = await authenticatedFetch(subjectsTakenUrl);
      const data = await response.json();
      setSubjectsTaken(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      if (error.message !== 'Sesión expirada.') setAlertBox('Error al obtener asignaturas tomadas');
    }
  };

  const fetchDependencies = async () => {
    try {
      const [studentsRes, subjectsRes, yearsRes] = await Promise.all([
        authenticatedFetch(studentsUrl),
        authenticatedFetch(subjectsUrl),
        authenticatedFetch(schoolYearsUrl),
      ]);

      const studentsData = await studentsRes.json();
      const subjectsData = await subjectsRes.json();
      const yearsData = await yearsRes.json();

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setSchoolYears(Array.isArray(yearsData) ? yearsData : []);
    } catch (error) {
      console.error(error);
      setAlertBox('Error al cargar listas desplegables');
    }
  };

  // --- VALIDACIONES (Lógica Preservada) ---

  const validateField = (name, value) => {
    let msg = '';
    const v = value != null ? String(value).trim() : '';

    if (name === 'id_student') {
      if (v === '') msg = 'Seleccione un estudiante.';
    }

    if (name === 'id_subject') {
      if (v === '') msg = 'Seleccione una asignatura.';
    }

    if (name === 'id_school_year') {
      if (v === '') msg = 'Seleccione un año escolar.';
    }

    if (name === 'final_grade') {
      if (v === '') msg = 'Ingrese la calificación final.';
      else {
        const num = Number(v);
        if (Number.isNaN(num)) msg = 'Calificación debe ser numérica.';
        else if (num < 0 || num > 100) msg = 'Calificación debe estar entre 0 y 100.';
        else {
          const match = /^-?\d+(\.\d{1,2})?$/.test(v);
          if (!match) msg = 'Máximo 2 decimales.';
        }
      }
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  const validateAll = () => {
    const e1 = validateField('id_student', formData.id_student);
    const e2 = validateField('id_subject', formData.id_subject);
    const e3 = validateField('id_school_year', formData.id_school_year);
    const e4 = validateField('final_grade', formData.final_grade);

    // REGLA DE NEGOCIO: Estudiante + Materia (En cualquier año)
    if (e1 && e2) {
      const sid = String(formData.id_student).trim();
      const subid = String(formData.id_subject).trim();

      const duplicateAnyYear = subjectsTaken.find((s) => {
        if (editMode && selectedSubjectTaken && String(s.id_subject_taken) === String(selectedSubjectTaken.id_subject_taken)) return false;
        return String(s.id_student) === sid && String(s.id_subject) === subid;
      });

      if (duplicateAnyYear) {
        setAlertBox('El estudiante ya cursó esta materia (duplicado).');
        setErrors((prev) => ({ ...prev, id_subject: 'Materia ya registrada previamente.' }));
        return false;
      }
    }

    // Validación Triple Exacta (Defensiva)
    if (e1 && e2 && e3) {
      const sid = String(formData.id_student).trim();
      const subid = String(formData.id_subject).trim();
      const yearid = String(formData.id_school_year).trim();

      const duplicateExact = subjectsTaken.find((s) => {
        if (editMode && selectedSubjectTaken && String(s.id_subject_taken) === String(selectedSubjectTaken.id_subject_taken)) return false;
        return String(s.id_student) === sid && String(s.id_subject) === subid && String(s.id_school_year) === yearid;
      });

      if (duplicateExact) {
        setAlertBox('Ya existe este registro exacto.');
        return false;
      }
    }

    const ok = e1 && e2 && e3 && e4 && !errors.id_student && !errors.id_subject && !errors.id_school_year && !errors.final_grade;
    if (!ok && !alertBox) setAlertBox('Por favor, corrija los errores.');
    return ok;
  };

  const parsePostgresUniqueError = (err) => {
    const result = { field: 'registro', value: null, message: 'Valor duplicado' };
    try {
      if (!err) return result;
      if (typeof err.detail === 'string') {
        const m = err.detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
        if (m) {
          result.field = m[1];
          result.value = m[2];
          result.message = `Ya existe: ${result.value}`;
          return result;
        }
      }
      if (err.constraint && typeof err.constraint === 'string') {
        if (/student.*subject|subjects_taken_unique/i.test(err.constraint)) {
          result.field = 'id_subject';
          result.message = 'Materia ya registrada para este estudiante';
          return result;
        }
      }
      if (err.message) result.message = err.message;
    } catch (e) {}
    return result;
  };

  // --- CRUD ---

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSaving) return;
    if (!validateAll()) return;

    setIsSaving(true);
    setAlertBox(null);

    try {
      const payload = {
        id_student: Number(formData.id_student),
        id_subject: Number(formData.id_subject),
        id_school_year: Number(formData.id_school_year),
        final_grade: Number(formData.final_grade),
      };

      const method = editMode && selectedSubjectTaken ? 'PUT' : 'POST';
      const url = editMode && selectedSubjectTaken ? `${subjectsTakenUrl}/${selectedSubjectTaken.id_subject_taken}` : subjectsTakenUrl;

      const res = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorText = `Error ${res.status}`;
        let errorData = null;
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            errorData = await res.json();
            if (errorData.message) errorText = errorData.message;
          } else {
            errorText = await res.text();
          }
        } catch (_) {}

        const textLower = (errorText || '').toLowerCase();
        if (res.status === 409 || /ya existe|duplicate/.test(textLower) || (errorData && errorData.code === '23505')) {
          const parsed = parsePostgresUniqueError(errorData || { detail: errorText, constraint: '' });
          setErrors((prev) => ({ ...prev, id_subject: parsed.message }));
          setAlertBox(parsed.message);
        } else {
          setAlertBox(errorText || 'Error del servidor.');
        }
        
        setIsSaving(false);
        return;
      }

      await fetchSubjectsTaken();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      if (err.message !== 'Sesión expirada.') setAlertBox('Error de conexión al guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
    setAlertBox(null);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
      const res = await authenticatedFetch(`${subjectsTakenUrl}/${idToDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      
      await fetchSubjectsTaken();
      setShowDeleteModal(false);
    } catch (err) {
      setAlertBox(err.message);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- UI Helpers ---

  const handleEdit = (item) => {
    setSelectedSubjectTaken(item);
    setFormData({
      id_student: item.id_student,
      id_subject: item.id_subject,
      id_school_year: item.id_school_year,
      final_grade: item.final_grade,
    });
    setEditMode(true);
    setErrors({});
    setAlertBox(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ id_student: '', id_subject: '', id_school_year: '', final_grade: '' });
    setSelectedSubjectTaken(null);
    setEditMode(false);
    setErrors({});
    setAlertBox(null);
    setIsSaving(false);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setShowModal(false);
    resetForm();
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // Filtros
  const filteredSubjectsTaken = subjectsTaken.filter((item) => {
    const studentFilter = (filter.id_student || '').toLowerCase();
    const yearFilter = (filter.id_school_year || '').toLowerCase();

    const studentName = (item.student_name || '').toLowerCase();
    const subjectName = (item.name_subject || '').toLowerCase();
    const studentId = item.id_student ? String(item.id_student) : '';

    const studentMatch = studentName.includes(studentFilter) || subjectName.includes(studentFilter) || studentId.includes(studentFilter);
    const schoolYearDesc = (item.school_year || '').toLowerCase();
    const schoolYearId = item.id_school_year ? String(item.id_school_year) : '';
    const yearMatch = schoolYearDesc.includes(yearFilter) || schoolYearId.includes(yearFilter);

    return studentMatch && yearMatch;
  });

  // KPIs
  const totalRecords = subjectsTaken.length;
  const avgGrade = totalRecords > 0 
    ? (subjectsTaken.reduce((acc, curr) => acc + Number(curr.final_grade || 0), 0) / totalRecords).toFixed(2)
    : 0;

  return (
    <div className="container-fluid mt-4">
      
      {/* --- KPIs --- */}
      <CRow className="mb-4">
          <CCol sm={6}>
              <CCard className="border-start-4 border-start-primary shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Registros Académicos</div>
                          <div className="fs-4 fw-semibold text-body">{totalRecords}</div>
                      </div>
                      <CIcon icon={cilBook} size="xl" className="text-primary" />
                  </CCardBody>
              </CCard>
          </CCol>
          <CCol sm={6}>
              <CCard className="border-start-4 border-start-info shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Promedio General</div>
                          <div className="fs-4 fw-semibold text-body">{avgGrade}</div>
                      </div>
                      <CIcon icon={cilChartPie} size="xl" className="text-info" />
                  </CCardBody>
              </CCard>
          </CCol>
      </CRow>

      {/* --- CARD PRINCIPAL --- */}
      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 text-body">Historial Académico</h5>
            <CButton color="success" onClick={() => { resetForm(); setShowModal(true); }} className="d-flex align-items-center text-white">
              <CIcon icon={cilPlus} className="me-2" /> Agregar Registro
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
                            placeholder="Buscar Estudiante o Asignatura..." 
                            name="id_student"
                            value={filter.id_student} 
                            onChange={handleFilterChange} 
                        />
                    </CInputGroup>
                </CCol>
                <CCol md={6}>
                    <CInputGroup>
                        <CInputGroupText className="bg-transparent text-medium-emphasis border-end-0">
                            <CIcon icon={cilSchool} />
                        </CInputGroupText>
                        <CFormInput 
                            className="bg-transparent border-start-0"
                            placeholder="Buscar Año Escolar..." 
                            name="id_school_year"
                            value={filter.id_school_year} 
                            onChange={handleFilterChange} 
                        />
                    </CInputGroup>
                </CCol>
            </CRow>

            {/* Tabla */}
            <CTable align="middle" className="mb-0 border" hover responsive striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell className="text-center">ID</CTableHeaderCell>
                  <CTableHeaderCell>Estudiante</CTableHeaderCell>
                  <CTableHeaderCell>Asignatura</CTableHeaderCell>
                  <CTableHeaderCell>Año Escolar</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Nota Final</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredSubjectsTaken.map((item) => (
                  <CTableRow key={item.id_subject_taken}>
                    <CTableDataCell className="text-center">
                        <CBadge color="secondary" shape="rounded-pill">#{item.id_subject_taken}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="fw-bold text-body">{item.student_name || 'Desconocido'}</div>
                        <div className="small text-medium-emphasis">ID: {item.id_student}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="text-body fw-semibold">{item.name_subject || 'Desconocida'}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="text-body">{item.school_year || 'N/A'}</div>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                        <span className={`fw-bold ${Number(item.final_grade) >= 60 ? 'text-success' : 'text-danger'}`}>
                            {item.final_grade}
                        </span>
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton color="light" size="sm" variant="ghost" className="me-2" onClick={() => handleEdit(item)}>
                          <CIcon icon={cilPencil} className="text-warning"/>
                      </CButton>
                      <CButton color="light" size="sm" variant="ghost" onClick={() => handleDeleteClick(item.id_subject_taken)}>
                          <CIcon icon={cilTrash} className="text-danger"/>
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {filteredSubjectsTaken.length === 0 && (
                    <CTableRow>
                        <CTableDataCell colSpan="6" className="text-center py-4 text-medium-emphasis">
                            No hay registros académicos.
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
        <CModalBody>¿Está seguro que desea eliminar este registro académico? Esta acción es irreversible.</CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
          <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showModal} backdrop="static" onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{editMode ? 'Editar Calificación' : 'Registrar Materia'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSave}>
          <CModalBody>
            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormSelect
                      label="Estudiante *"
                      value={formData.id_student}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, id_student: e.target.value }));
                        setErrors((p) => ({ ...p, id_student: '' }));
                      }}
                      onBlur={(e) => validateField('id_student', e.target.value)}
                      invalid={!!errors.id_student}
                    >
                      <option value="">Seleccionar Estudiante</option>
                      {students.map((s) => (
                        <option key={s.id_student} value={s.id_student}>
                          {s.first_name_student} {s.last_name_student}
                        </option>
                      ))}
                    </CFormSelect>
                    {errors.id_student && <div className="text-danger small mt-1">{errors.id_student}</div>}
                </CCol>
                <CCol md={6}>
                    <CFormSelect
                      label="Año Escolar *"
                      value={formData.id_school_year}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, id_school_year: e.target.value }));
                        setErrors((p) => ({ ...p, id_school_year: '' }));
                      }}
                      onBlur={(e) => validateField('id_school_year', e.target.value)}
                      invalid={!!errors.id_school_year}
                    >
                      <option value="">Seleccionar Año</option>
                      {schoolYears.map((y) => (
                        <option key={y.id_school_year} value={y.id_school_year}>
                          {y.school_year || `Año ${y.id_school_year}`}
                        </option>
                      ))}
                    </CFormSelect>
                    {errors.id_school_year && <div className="text-danger small mt-1">{errors.id_school_year}</div>}
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormSelect
                      label="Asignatura *"
                      value={formData.id_subject}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, id_subject: e.target.value }));
                        setErrors((p) => ({ ...p, id_subject: '' }));
                      }}
                      onBlur={(e) => validateField('id_subject', e.target.value)}
                      invalid={!!errors.id_subject}
                    >
                      <option value="">Seleccionar Asignatura</option>
                      {subjects.map((s) => (
                        <option key={s.id_subject} value={s.id_subject}>
                          {s.name_subject}
                        </option>
                      ))}
                    </CFormSelect>
                    {errors.id_subject && <div className="text-danger small mt-1">{errors.id_subject}</div>}
                </CCol>
                <CCol md={6}>
                    <CFormInput
                      type="number"
                      label="Calificación Final *"
                      placeholder="0 - 100"
                      value={formData.final_grade}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, final_grade: e.target.value }));
                        setErrors((p) => ({ ...p, final_grade: '' }));
                      }}
                      onBlur={(e) => validateField('final_grade', e.target.value)}
                      invalid={!!errors.final_grade}
                      min="0" max="100" step="0.01"
                    />
                    {errors.final_grade && <div className="text-danger small mt-1">{errors.final_grade}</div>}
                </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="ghost" onClick={() => setShowModal(false)} disabled={isSaving}>Cerrar</CButton>
            <CButton color="success" type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  );
};

export default SubjectsTaken;