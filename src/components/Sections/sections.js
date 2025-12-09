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
  cilClock, 
  cilRoom
} from '@coreui/icons';
import API_URL from '../../../config';

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [schedules, setSchedules] = useState([]); // Lista para el Select (Mejora UX)
  
  const [formData, setFormData] = useState({
    id_class_schedules: '',
    num_section: '',
  });

  // Estados de la Interfaz
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [filter, setFilter] = useState({ id_class_schedules: '', num_section: '' });
  
  // Validaciones
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Borrado
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sectionsUrl = `${API_URL}/sections`;
  const schedulesUrl = `${API_URL}/class_schedules`;

  useEffect(() => {
    fetchSections();
    fetchSchedules();
  }, []);

  // --- LÓGICA DE DATOS (Fetch Seguro con Token) ---

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

  const fetchSchedules = async () => {
    try {
        const res = await authenticatedFetch(schedulesUrl);
        const data = await res.json();
        if (Array.isArray(data)) setSchedules(data);
    } catch (err) { console.error("Error cargando horarios", err); }
  };

  // --- VALIDACIONES Y MANEJO DE ERRORES (Lógica Original Preservada) ---

  const parsePostgresUniqueError = (err) => {
    const result = { field: 'registro', value: null, message: 'Valor duplicado' };
    try {
      if (!err) return result;
      if (typeof err.detail === 'string') {
        const m = err.detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
        if (m) {
          result.field = m[1] || result.field;
          result.value = m[2] || null;
          result.message = result.value ? `Ya existe: ${result.value}` : `Valor duplicado en ${result.field}`;
          return result;
        }
      }
      if (err.constraint && typeof err.constraint === 'string') {
        if (/num_section/i.test(err.constraint)) result.field = 'num_section';
        else if (/id_class/i.test(err.constraint)) result.field = 'id_class_schedules';
        result.message = `Dato duplicado: ${result.field}`;
      }
      if (err.message) result.message = err.message;
    } catch (e) {}
    return result;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    
    // Validación estricta de caracteres mientras escribe (Regex original)
    if (name === 'num_section') {
      v = v.replace(/[^a-zA-Z0-9\-_]/g, ''); 
      if (v.length > 20) v = v.slice(0, 20);
    }
    
    setFormData((p) => ({ ...p, [name]: v }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    setAlertBox(null);
  };

  const handleBlur = (e) => {
      const { name, value } = e.target;
      if (!value || value.trim() === '') {
          setErrors(prev => ({ ...prev, [name]: 'Este campo es obligatorio.' }));
      }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.id_class_schedules) {
        newErrors.id_class_schedules = 'Debe asignar un horario.';
        isValid = false;
    }
    
    if (!formData.num_section || formData.num_section.trim() === '') {
        newErrors.num_section = 'El número de sección es obligatorio.';
        isValid = false;
    } else if (!/^[a-zA-Z0-9\-_]+$/.test(formData.num_section)) {
        newErrors.num_section = 'Caracteres inválidos (solo letras, números, - y _).';
        isValid = false;
    }

    // Validación pre-envío de duplicados en el frontend
    const duplicate = sections.find(s => 
        String(s.id_class_schedules) === String(formData.id_class_schedules) &&
        s.num_section === formData.num_section &&
        (!editMode || s.id_section !== selectedSection?.id_section)
    );

    if (duplicate) {
        newErrors.num_section = 'Ya existe esta sección en este horario.';
        setAlertBox('Error: Sección duplicada para el horario seleccionado.');
        isValid = false;
    }

    setErrors(newErrors);
    if (!isValid && !alertBox) setAlertBox('Por favor, corrija los errores.');
    return isValid;
  };

  // --- CRUD ---

  const handleSaveSection = async () => {
    if (isSaving) return;
    if (!validateForm()) return;

    setIsSaving(true);
    setAlertBox(null);

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode && selectedSection ? `${sectionsUrl}/${selectedSection.id_section}` : sectionsUrl;

      const payload = {
        id_class_schedules: Number(formData.id_class_schedules),
        num_section: String(formData.num_section).trim(),
      };

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Lógica de parseo de errores del backend preservada
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

        // Detectar duplicados del backend
        const textLower = (errorText || '').toLowerCase();
        if (response.status === 409 || /ya existe|duplicate/.test(textLower) || (errorData && errorData.code === '23505')) {
            const parsed = parsePostgresUniqueError(errorData || { detail: errorText });
            const msg = parsed.message || 'Ya existe una sección con estos datos.';
            setErrors(prev => ({ ...prev, num_section: msg }));
            setAlertBox(msg);
        } else {
            setAlertBox(errorText || 'Error del servidor.');
        }
        
        setIsSaving(false);
        return;
      }

      await fetchSections();
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
    setFormData({
      id_class_schedules: section.id_class_schedules,
      num_section: section.num_section,
    });
    setEditMode(true);
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setShowModal(false);
    setFormData({ id_class_schedules: '', num_section: '' });
    setEditMode(false);
    setSelectedSection(null);
    setErrors({});
    setAlertBox(null);
  };

  // Helpers de visualización (Resolución de IDs a Texto)
  const getScheduleLabel = (id) => {
      const s = schedules.find(item => item.id_class_schedules === id);
      return s ? `${s.day_of_week} | ${s.start_time.slice(0,5)} - ${s.end_time.slice(0,5)}` : `ID: ${id}`;
  };

  const getClassroomLabel = (id) => {
      const s = schedules.find(item => item.id_class_schedules === id);
      return s ? s.classroom : '-';
  };

  // Filtros
  const filteredSections = sections.filter((section) => {
    const classScheduleId = section.id_class_schedules ? String(section.id_class_schedules) : '';
    const sectionNumber = section.num_section ? String(section.num_section) : '';
    const scheduleLabel = getScheduleLabel(section.id_class_schedules).toLowerCase();
    
    // Búsqueda inteligente: por número de sección o texto del horario
    const matchesSection = sectionNumber.toLowerCase().includes(filter.num_section.toLowerCase());
    const matchesSchedule = filter.id_class_schedules 
        ? scheduleLabel.includes(filter.id_class_schedules.toLowerCase()) || classScheduleId.includes(filter.id_class_schedules)
        : true;

    return matchesSection && matchesSchedule;
  });

  const totalSections = sections.length;
  // KPIs simples
  const uniqueSchedules = new Set(sections.map(s => s.id_class_schedules)).size;

  return (
    <div className="container-fluid mt-4">
      
      {/* --- KPIs (Minimalistas) --- */}
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
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Horarios Ocupados</div>
                          <div className="fs-4 fw-semibold text-body">{uniqueSchedules}</div>
                      </div>
                      <CIcon icon={cilClock} size="xl" className="text-info" />
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
                            placeholder="Filtrar por Número de Sección..." 
                            name="num_section"
                            value={filter.num_section} 
                            onChange={(e) => setFilter({...filter, num_section: e.target.value})} 
                        />
                    </CInputGroup>
                </CCol>
                <CCol md={6}>
                    <CInputGroup>
                        <CInputGroupText className="bg-transparent text-medium-emphasis border-end-0">
                            <CIcon icon={cilClock} />
                        </CInputGroupText>
                        <CFormInput 
                            className="bg-transparent border-start-0"
                            placeholder="Buscar en horario (Día, Hora)..." 
                            name="id_class_schedules"
                            value={filter.id_class_schedules} 
                            onChange={(e) => setFilter({...filter, id_class_schedules: e.target.value})} 
                        />
                    </CInputGroup>
                </CCol>
            </CRow>

            {/* Tabla */}
            <CTable align="middle" className="mb-0 border" hover responsive striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{width: '60px'}}><CIcon icon={cilList} /></CTableHeaderCell>
                  <CTableHeaderCell>Número de Sección</CTableHeaderCell>
                  <CTableHeaderCell>Horario Asignado</CTableHeaderCell>
                  <CTableHeaderCell>Aula</CTableHeaderCell>
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
                        <div className="fw-bold text-body fs-5">{section.num_section}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="d-flex align-items-center text-body">
                            <CIcon icon={cilClock} className="me-2 text-medium-emphasis"/>
                            {getScheduleLabel(section.id_class_schedules)}
                        </div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="d-flex align-items-center text-body">
                            <CIcon icon={cilRoom} className="me-2 text-medium-emphasis"/>
                            {getClassroomLabel(section.id_class_schedules)}
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
                            No hay secciones registradas.
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
            <div className="mb-3">
                <CFormInput
                  label="Número de Sección *"
                  name="num_section"
                  placeholder="Ej: A, B, 101..."
                  value={formData.num_section}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  invalid={!!errors.num_section}
                />
                {errors.num_section && <div className="text-danger small mt-1">{errors.num_section}</div>}
            </div>
            
            <div className="mb-3">
                <div className="text-medium-emphasis small mb-1">
                    Seleccione un horario disponible para esta sección.
                </div>
                <CFormSelect
                  label="Horario *"
                  name="id_class_schedules"
                  value={formData.id_class_schedules}
                  onChange={handleInputChange}
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