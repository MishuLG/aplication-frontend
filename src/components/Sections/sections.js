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
  cilList, 
  cilSchool, 
  cilCalendar
} from '@coreui/icons';

// --- CORRECCIÓN: USAR CONFIG GLOBAL ---
import API_URL from '../../config';
// ---------------------------------------------------------------

const Sections = () => {
  const [sections, setSections] = useState([]);
  
  // CAMBIO NECESARIO: Cargamos Grados y Años en lugar de Horarios
  const [grades, setGrades] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  
  // El formulario ahora pide lo que el backend necesita
  const [formData, setFormData] = useState({
    num_section: '',
    id_grade: '',
    id_school_year: ''
  });

  // Estados de la Interfaz (TU CÓDIGO ORIGINAL)
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  
  // Filtro adaptado para buscar por nombre o grado
  const [filter, setFilter] = useState({ num_section: '', grade_name: '' });
  
  // Validaciones (TU CÓDIGO ORIGINAL)
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Borrado (TU CÓDIGO ORIGINAL)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // URLs
  const sectionsUrl = `${API_URL}/sections`;
  const gradesUrl = `${API_URL}/grades`;
  const yearsUrl = `${API_URL}/school_years`;

  useEffect(() => {
    fetchSections();
    fetchCatalogs(); // Cargar listas de grados y años
  }, []);

  // --- LÓGICA DE DATOS (TU FETCH SEGURO) ---

  const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        // window.location.href = '#/login'; 
        throw new Error('Sesión expirada.');
    }
    return response;
  };

  const fetchSections = async () => {
    try {
      const res = await authenticatedFetch(sectionsUrl);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSections(data);
      } else {
        console.error('Datos inválidos:', data);
      }
    } catch (err) {
      console.error(err);
      if (err.message !== 'Sesión expirada.') setAlertBox('Error al obtener secciones');
    }
  };

  const fetchCatalogs = async () => {
    try {
        const [resGrades, resYears] = await Promise.all([
            authenticatedFetch(gradesUrl),
            authenticatedFetch(yearsUrl)
        ]);
        
        if (resGrades.ok) setGrades(await resGrades.json());
        if (resYears.ok) {
            const years = await resYears.json();
            setSchoolYears(years);
            // Auto-seleccionar año activo para facilitar
            const active = years.find(y => y.school_year_status === 'Activo');
            if (active) {
                setFormData(prev => ({ ...prev, id_school_year: active.id_school_year }));
            }
        }
    } catch (err) { console.error("Error cargando catálogos", err); }
  };

  // --- MANEJADORES ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    
    // Tu validación de caracteres original
    if (name === 'num_section') {
      v = v.replace(/[^a-zA-Z0-9\-_ ]/g, ''); 
      if (v.length > 20) v = v.slice(0, 20);
    }
    
    setFormData((p) => ({ ...p, [name]: v }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    setAlertBox(null);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validamos los campos que ahora son obligatorios
    if (!formData.id_grade) {
        newErrors.id_grade = 'Debe seleccionar un Grado.';
        isValid = false;
    }
    if (!formData.id_school_year) {
        newErrors.id_school_year = 'Debe seleccionar un Año Escolar.';
        isValid = false;
    }
    
    if (!formData.num_section || formData.num_section.trim() === '') {
        newErrors.num_section = 'El identificador de sección es obligatorio.';
        isValid = false;
    }

    setErrors(newErrors);
    if (!isValid && !alertBox) setAlertBox('Por favor, complete los campos obligatorios.');
    return isValid;
  };

  // --- CRUD (CON LA LÓGICA DEL NUEVO BACKEND) ---

  const handleSaveSection = async () => {
    if (isSaving) return;
    if (!validateForm()) return;

    setIsSaving(true);
    setAlertBox(null);

    try {
      const method = editMode ? 'PUT' : 'POST';
      // Para editar, el backend necesita el ID en la URL
      const url = editMode && selectedSection ? `${sectionsUrl}/${selectedSection.id_section}` : sectionsUrl;

      // Enviamos solo lo que la base de datos espera
      const payload = {
        num_section: String(formData.num_section).trim(),
        id_grade: Number(formData.id_grade),
        id_school_year: Number(formData.id_school_year)
      };

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        setAlertBox(data.message || 'Error al guardar.');
        setIsSaving(false);
        return;
      }

      await fetchSections();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      setAlertBox(err.message || 'Error de conexión');
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
      const res = await authenticatedFetch(`${sectionsUrl}/${idToDelete}`, { method: 'DELETE' });
      
      if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error al eliminar');
      }
      
      await fetchSections();
      setShowDeleteModal(false);
    } catch (err) {
      setAlertBox(err.message);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Helpers de UI ---

  const handleEditSection = (section) => {
    setSelectedSection(section);
    // Cargamos los datos en el formulario para editar
    setFormData({
      num_section: section.num_section,
      id_grade: section.id_grade,
      id_school_year: section.id_school_year
    });
    setEditMode(true);
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setShowModal(false);
    // Reiniciamos formulario (manteniendo año activo)
    const activeYear = schoolYears.find(y => y.school_year_status === 'Activo');
    setFormData({ 
        num_section: '', 
        id_grade: '', 
        id_school_year: activeYear ? activeYear.id_school_year : '' 
    });
    setEditMode(false);
    setSelectedSection(null);
    setErrors({});
    setAlertBox(null);
  };

  // Filtros
  const filteredSections = sections.filter((section) => {
    const sectionNumber = section.num_section ? String(section.num_section) : '';
    const gradeName = section.Grade ? section.Grade.name_grade.toLowerCase() : '';
    
    const matchesSection = sectionNumber.toLowerCase().includes(filter.num_section.toLowerCase());
    const matchesGrade = gradeName.includes(filter.grade_name.toLowerCase());

    return matchesSection && matchesGrade;
  });

  const totalSections = sections.length;
  // KPI: Cantidad de Grados distintos atendidos
  const uniqueGrades = new Set(sections.map(s => s.id_grade)).size;

  return (
    <div className="container-fluid mt-4">
      
      {/* --- KPIs (TU DISEÑO ORIGINAL) --- */}
      <CRow className="mb-4">
          <CCol sm={6}>
              <CCard className="border-start-4 border-start-primary shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Total Secciones</div>
                          <div className="fs-4 fw-semibold text-body">{totalSections}</div>
                      </div>
                      <CIcon icon={cilList} size="xl" className="text-primary" />
                  </CCardBody>
              </CCard>
          </CCol>
          <CCol sm={6}>
              <CCard className="border-start-4 border-start-info shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Grados Atendidos</div>
                          <div className="fs-4 fw-semibold text-body">{uniqueGrades}</div>
                      </div>
                      <CIcon icon={cilSchool} size="xl" className="text-info" />
                  </CCardBody>
              </CCard>
          </CCol>
      </CRow>

      {/* --- CARD PRINCIPAL --- */}
      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 text-body">Gestión de Secciones</h5>
            <CButton color="success" onClick={() => { handleCloseModal(); setShowModal(true); }} className="d-flex align-items-center text-white">
              <CIcon icon={cilPlus} className="me-2" /> Agregar Sección
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
                            placeholder="Filtrar por Identificador (A, B...)" 
                            name="num_section"
                            value={filter.num_section} 
                            onChange={(e) => setFilter({...filter, num_section: e.target.value})} 
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
                            placeholder="Buscar por Grado (1er, 2do...)" 
                            name="grade_name"
                            value={filter.grade_name} 
                            onChange={(e) => setFilter({...filter, grade_name: e.target.value})} 
                        />
                    </CInputGroup>
                </CCol>
            </CRow>

            {/* Tabla */}
            <CTable align="middle" className="mb-0 border" hover responsive striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{width: '60px'}}><CIcon icon={cilList} /></CTableHeaderCell>
                  <CTableHeaderCell>Sección (Identificador)</CTableHeaderCell>
                  <CTableHeaderCell>Grado Académico</CTableHeaderCell>
                  <CTableHeaderCell>Año Escolar</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredSections.map((section) => (
                  <CTableRow key={section.id_section}>
                    <CTableDataCell className="text-center">
                        <CBadge color="primary" shape="rounded-pill">#{section.id_section}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="fw-bold text-body fs-5">Sección "{section.num_section}"</div>
                        <div className="small text-muted">Capacidad: {section.capacity || 30}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="d-flex align-items-center text-body">
                            <CIcon icon={cilSchool} className="me-2 text-medium-emphasis"/>
                            {section.Grade ? section.Grade.name_grade : 'Sin Grado'}
                        </div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="d-flex align-items-center text-body">
                            <CIcon icon={cilCalendar} className="me-2 text-medium-emphasis"/>
                            {section.SchoolYear ? section.SchoolYear.name_period : 'N/A'}
                            {section.SchoolYear?.school_year_status === 'Activo' && 
                                <CBadge color="success" className="ms-2" size="sm">Activo</CBadge>
                            }
                        </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton color="light" size="sm" variant="ghost" className="me-2" onClick={() => handleEditSection(section)}>
                          <CIcon icon={cilPencil} className="text-warning"/>
                      </CButton>
                      <CButton color="light" size="sm" variant="ghost" onClick={() => handleDeleteClick(section.id_section)}>
                          <CIcon icon={cilTrash} className="text-danger"/>
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {filteredSections.length === 0 && (
                    <CTableRow>
                        <CTableDataCell colSpan="5" className="text-center py-4 text-medium-emphasis">
                            No hay secciones registradas para el filtro actual.
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
        <CModalBody>
            ¿Está seguro que desea eliminar esta sección? <br/>
            <small className="text-medium-emphasis">Esta acción no se puede deshacer y podría afectar a estudiantes inscritos.</small>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
          <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showModal} backdrop="static" onClose={handleCloseModal}>
        <CModalHeader>
          <CModalTitle>{editMode ? 'Editar Sección' : 'Nueva Sección'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
          <CForm>
            {/* SELECT DE AÑO */}
            <div className="mb-3">
               <CFormSelect
                 label="Año Escolar *"
                 name="id_school_year"
                 value={formData.id_school_year}
                 onChange={handleInputChange}
                 invalid={!!errors.id_school_year}
               >
                 <option value="">Seleccione Año...</option>
                 {schoolYears.map((y) => (
                   <option key={y.id_school_year} value={y.id_school_year}>
                     {y.name_period} ({y.school_year_status})
                   </option>
                 ))}
               </CFormSelect>
               {errors.id_school_year && <div className="text-danger small mt-1">{errors.id_school_year}</div>}
            </div>

            {/* SELECT DE GRADO */}
            <div className="mb-3">
               <CFormSelect
                 label="Grado Académico *"
                 name="id_grade"
                 value={formData.id_grade}
                 onChange={handleInputChange}
                 invalid={!!errors.id_grade}
               >
                 <option value="">Seleccione Grado...</option>
                 {grades.map((g) => (
                   <option key={g.id_grade} value={g.id_grade}>
                     {g.name_grade}
                   </option>
                 ))}
               </CFormSelect>
               {errors.id_grade && <div className="text-danger small mt-1">{errors.id_grade}</div>}
            </div>

            {/* INPUT DE NOMBRE/IDENTIFICADOR */}
            <div className="mb-3">
                <CFormInput
                  label="Identificador de Sección *"
                  name="num_section"
                  placeholder="Ej: A, B, 101..."
                  value={formData.num_section}
                  onChange={handleInputChange}
                  invalid={!!errors.num_section}
                  text="Solo el identificador (la letra o número)."
                />
                {errors.num_section && <div className="text-danger small mt-1">{errors.num_section}</div>}
            </div>
            
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={handleCloseModal}>Cancelar</CButton>
          <CButton color="success" onClick={handleSaveSection} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Sections;