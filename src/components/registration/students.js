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
  CFormTextarea,
  CAlert,
  CInputGroup,
  CInputGroupText,
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilSearch, cilUser } from '@coreui/icons';
// import API_URL from '../../config'; // Descomenta si usas archivo config
const API_URL = 'http://localhost:4000/api';

const Students = () => {
  // --- ESTADOS DE DATOS ---
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [sections, setSections] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  
  // --- ESTADOS DE FILTRO ---
  const [selectedYearFilter, setSelectedYearFilter] = useState('');
  const [filter, setFilter] = useState({ first_name_student: '' });

  // --- ESTADOS DE UI/FORMULARIO ---
  const [formData, setFormData] = useState({
    first_name_student: '',
    last_name_student: '',
    date_of_birth_student: '',
    gender: 'M',
    street: '',
    city: '',
    zip_code: '',
    health_record: '',
    id_tutor: '',
    id_section: '',
    id_school_year: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [alertBox, setAlertBox] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const studentsUrl = `${API_URL}/students`;
  const tutorsUrl = `${API_URL}/tutors`;
  const sectionsUrl = `${API_URL}/sections`;
  const schoolYearsUrl = `${API_URL}/school_years`;

  // --- EFECTOS ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedYearFilter]);

  // --- FETCH DATA ---
  const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
  };

  const fetchInitialData = async () => {
    try {
      const [resTutors, resSections, resYears] = await Promise.all([
        authenticatedFetch(tutorsUrl),
        authenticatedFetch(sectionsUrl),
        authenticatedFetch(schoolYearsUrl)
      ]);

      if (resTutors.ok) setTutors(await resTutors.json());
      if (resSections.ok) setSections(await resSections.json());
      if (resYears.ok) {
        const yearsData = await resYears.json();
        setSchoolYears(yearsData);
        
        const activeYear = yearsData.find(y => y.school_year_status === 'Activo' || y.school_year_status === 'active');
        if (activeYear) {
            setFormData(prev => ({ ...prev, id_school_year: activeYear.id_school_year }));
        }
      }
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const url = selectedYearFilter 
        ? `${studentsUrl}?school_year=${selectedYearFilter}` 
        : studentsUrl;

      const response = await authenticatedFetch(url);
      if (!response.ok) throw new Error('Error al cargar estudiantes');
      
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAlertBox('Error al obtener estudiantes.');
    }
  };

  // --- FORM HANDLING ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.first_name_student || !formData.last_name_student || !formData.id_school_year) {
      setAlertBox('Los campos: Nombre, Apellido y Año Escolar son obligatorios.');
      return;
    }

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${studentsUrl}/${selectedStudentId}` : studentsUrl;

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar.');
      }

      setShowModal(false);
      resetForm();
      fetchStudents();
      setAlertBox(null);
    } catch (error) {
      setAlertBox(error.message);
    }
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    try {
      const response = await authenticatedFetch(`${studentsUrl}/${studentToDelete}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');
      
      setShowDeleteModal(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (error) {
      setAlertBox('No se pudo eliminar el estudiante.');
      setShowDeleteModal(false);
    }
  };

  const openEditModal = (student) => {
    setEditMode(true);
    setSelectedStudentId(student.id_student);
    setFormData({
      first_name_student: student.first_name_student,
      last_name_student: student.last_name_student,
      date_of_birth_student: student.date_of_birth_student,
      gender: student.gender,
      street: student.street || '',
      city: student.city || '',
      zip_code: student.zip_code || '',
      health_record: student.health_record || '',
      id_tutor: student.id_tutor || '',
      id_section: student.id_section || '',
      id_school_year: student.id_school_year || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      first_name_student: '',
      last_name_student: '',
      date_of_birth_student: '',
      gender: 'M',
      street: '',
      city: '',
      zip_code: '',
      health_record: '',
      id_tutor: '',
      id_section: '',
      id_school_year: ''
    });
    setEditMode(false);
    setSelectedStudentId(null);
  };

  const filteredStudents = students.filter(s =>
    (s.first_name_student + ' ' + s.last_name_student).toLowerCase().includes(filter.first_name_student.toLowerCase())
  );

  return (
    <div className="container-fluid mt-4">
      <CCard className="shadow-sm border-0">
        {/* ARREGLADO: Quitamos 'bg-white' para que respete el modo oscuro */}
        <CCardHeader className="py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-primary fw-bold">Directorio Estudiantil</h5>
          <CButton color="primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <CIcon icon={cilPlus} className="me-2" /> Nuevo Estudiante
          </CButton>
        </CCardHeader>
        <CCardBody>
          {alertBox && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}

          {/* ARREGLADO: Quitamos 'bg-light'. Ahora usa bordes sutiles que se ven bien en oscuro. */}
          <div className="d-flex flex-wrap gap-3 mb-4 p-3 rounded align-items-end border">
             {/* 1. SELECTOR DE AÑO */}
            <div style={{ minWidth: '220px' }}>
                <label className="small text-muted mb-1 fw-bold">Filtrar por Periodo:</label>
                <CFormSelect 
                    value={selectedYearFilter}
                    onChange={(e) => setSelectedYearFilter(e.target.value)}
                    className="shadow-sm" // Quitamos border-0 para mejor visibilidad
                    style={{cursor: 'pointer'}}
                >
                    <option value="">-- Ver Todos los Años --</option>
                    {schoolYears.map(year => (
                        <option key={year.id_school_year} value={year.id_school_year}>
                            {year.name_period || year.school_grade} {year.school_year_status === 'Activo' ? '🟢 (Activo)' : '⚪ (Cerrado)'}
                        </option>
                    ))}
                </CFormSelect>
            </div>

            {/* 2. BUSCADOR */}
            <div style={{ flexGrow: 1, minWidth: '250px' }}>
                <label className="small text-muted mb-1 fw-bold">Buscar Alumno:</label>
                <CInputGroup className="shadow-sm">
                    {/* ARREGLADO: Quitamos 'bg-white' del icono */}
                    <CInputGroupText className="border-end-0"><CIcon icon={cilSearch} /></CInputGroupText>
                    <CFormInput
                        className="border-start-0"
                        placeholder="Escribe nombre o apellido..."
                        value={filter.first_name_student}
                        onChange={(e) => setFilter({ ...filter, first_name_student: e.target.value })}
                    />
                </CInputGroup>
            </div>
          </div>

          {/* TABLA */}
          <CTable hover responsive align="middle" className="border-top">
            {/* ARREGLADO: Quitamos color="light" para que la cabecera no sea blanca en modo oscuro */}
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Estudiante</CTableHeaderCell>
                <CTableHeaderCell>Información Académica</CTableHeaderCell>
                <CTableHeaderCell>Ubicación</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                <CTableRow key={s.id_student}>
                  <CTableDataCell>
                    <div className="d-flex align-items-center">
                        <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm" style={{width:'42px', height:'42px'}}>
                            <CIcon icon={cilUser} size="lg"/>
                        </div>
                        <div>
                            {/* ARREGLADO: Quitamos 'text-dark'. Ahora el texto se adapta al tema. */}
                            <div className="fw-bold">{s.first_name_student} {s.last_name_student}</div>
                            <div className="small text-muted">
                                {s.gender === 'M' ? 'Masculino' : 'Femenino'} <span className="mx-1">•</span> {s.date_of_birth_student}
                            </div>
                        </div>
                    </div>
                  </CTableDataCell>
                  
                  <CTableDataCell>
                    <div className="d-flex flex-column">
                        <span className="mb-1">
                            <CBadge color="info" shape="rounded-pill">{s.grade_name || 'Sin Grado'}</CBadge>
                        </span>
                        {/* ARREGLADO: Usamos text-body para que se vea en oscuro */}
                        <span className="small fw-bold text-body">{s.section_name || 'Sin Sección'}</span>
                        <span className="small text-muted fst-italic">{s.period_name}</span>
                    </div>
                  </CTableDataCell>

                  <CTableDataCell>
                    <div className="small fw-semibold">{s.city || 'No especificada'}</div>
                    <div className="small text-muted text-truncate" style={{maxWidth: '180px'}} title={s.street}>{s.street}</div>
                  </CTableDataCell>

                  <CTableDataCell className="text-end">
                    <CButton color="light" size="sm" variant="ghost" className="me-2" onClick={() => openEditModal(s)} title="Editar">
                        <CIcon icon={cilPencil} className="text-warning"/>
                    </CButton>
                    <CButton color="light" size="sm" variant="ghost" onClick={() => { setStudentToDelete(s.id_student); setShowDeleteModal(true); }} title="Eliminar">
                        <CIcon icon={cilTrash} className="text-danger"/>
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              )) : (
                  <CTableRow>
                      <CTableDataCell colSpan="4" className="text-center py-5">
                          <div className="text-muted mb-2">No se encontraron estudiantes.</div>
                          {selectedYearFilter && <small className="text-warning">Intenta cambiando el filtro de año escolar.</small>}
                      </CTableDataCell>
                  </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* MODALES (Se mantienen igual) */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg" backdrop="static">
        <CModalHeader>
          <CModalTitle>{editMode ? 'Editar Estudiante' : 'Nuevo Estudiante'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="row g-3">
                <div className="col-12"><h6 className="text-muted border-bottom pb-2">Datos Personales</h6></div>
                <div className="col-md-6">
                    <CFormInput label="Nombres *" name="first_name_student" value={formData.first_name_student} onChange={handleInputChange} placeholder="Ej: Juan Andrés"/>
                </div>
                <div className="col-md-6">
                    <CFormInput label="Apellidos *" name="last_name_student" value={formData.last_name_student} onChange={handleInputChange} placeholder="Ej: Pérez López"/>
                </div>
                <div className="col-md-6">
                    <CFormInput type="date" label="Fecha Nacimiento" name="date_of_birth_student" value={formData.date_of_birth_student} onChange={handleInputChange} />
                </div>
                <div className="col-md-6">
                    <CFormSelect label="Género" name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </CFormSelect>
                </div>

                <div className="col-12 mt-4"><h6 className="text-muted border-bottom pb-2">Asignación Académica</h6></div>
                <div className="col-md-6">
                    <CFormSelect label="Año Escolar *" name="id_school_year" value={formData.id_school_year} onChange={handleInputChange} className="border-primary">
                        <option value="">Seleccione Periodo...</option>
                        {schoolYears.map(sy => (
                             <option key={sy.id_school_year} value={sy.id_school_year}>
                                {sy.name_period || sy.school_grade} {sy.school_year_status === 'Activo' ? '(Activo)' : ''}
                             </option>
                        ))}
                    </CFormSelect>
                </div>
                <div className="col-md-6">
                    <CFormSelect label="Sección (Grado)" name="id_section" value={formData.id_section} onChange={handleInputChange}>
                        <option value="">Seleccione Sección...</option>
                        {sections.map(sec => (
                             <option key={sec.id_section} value={sec.id_section}>
                                {sec.Grade?.name_grade} - Sección "{sec.num_section}"
                             </option>
                        ))}
                    </CFormSelect>
                </div>
                <div className="col-md-12">
                    <CFormSelect label="Tutor Responsable" name="id_tutor" value={formData.id_tutor} onChange={handleInputChange}>
                        <option value="">Seleccione Tutor...</option>
                        {tutors.map(t => (
                             <option key={t.id_tutor} value={t.id_tutor}>
                                {t.dni ? `C.I: ${t.dni}` : `ID: ${t.id_tutor}`} - {t.profession || 'Sin profesión'}
                             </option>
                        ))}
                    </CFormSelect>
                </div>

                <div className="col-12 mt-4"><h6 className="text-muted border-bottom pb-2">Dirección y Salud</h6></div>
                <div className="col-md-4">
                     <CFormInput label="Ciudad" name="city" value={formData.city} onChange={handleInputChange} placeholder="Ej: San Cristóbal"/>
                </div>
                <div className="col-md-4">
                     <CFormInput label="Código Postal" name="zip_code" value={formData.zip_code} onChange={handleInputChange} placeholder="Ej: 5001"/>
                </div>
                <div className="col-md-4">
                     <CFormInput label="Calle / Dirección" name="street" value={formData.street} onChange={handleInputChange} placeholder="Av. Principal..."/>
                </div>
                <div className="col-md-12">
                     <CFormTextarea 
                        label="Ficha Médica / Observaciones" 
                        name="health_record" 
                        value={formData.health_record} 
                        onChange={handleInputChange} 
                        placeholder="Alergias, condiciones especiales..."
                        rows={2}
                     />
                </div>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>Cancelar</CButton>
          <CButton color="primary" onClick={handleSubmit}>Guardar Estudiante</CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} alignment="center">
        <CModalHeader><CModalTitle>Confirmar Eliminación</CModalTitle></CModalHeader>
        <CModalBody>
            <p>¿Estás seguro de eliminar este estudiante?</p>
            <div className="alert alert-warning small">
                <strong>Advertencia:</strong> Esta acción borrará también el historial de inscripciones y notas asociadas.
            </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
          <CButton color="danger" onClick={handleDelete}>Eliminar Definitivamente</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Students;