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
  cilCalendar, 
  cilCheckCircle, 
  cilBan 
} from '@coreui/icons';
import API_URL from '../../../config';

const SchoolYear = () => {
  const [schoolYears, setSchoolYears] = useState([]);
  const [formData, setFormData] = useState({
    school_grade: '',
    start_year: '',
    end_of_year: '',
    number_of_school_days: '',
    scheduled_vacation: '',
    special_events: '',
    school_year_status: '',
  });

  // UI States
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);
  const [filter, setFilter] = useState({ school_grade: '', school_year_status: '' });
  
  // Validaciones
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Borrado
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const schoolYearsUrl = `${API_URL}/school_years`;

  const requiredFields = [
    'school_grade',
    'start_year',
    'end_of_year',
    'number_of_school_days',
    'scheduled_vacation',
    'special_events',
    'school_year_status',
  ];

  useEffect(() => {
    fetchSchoolYears();
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

  const fetchSchoolYears = async () => {
    try {
      const response = await authenticatedFetch(schoolYearsUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSchoolYears(data);
      } else {
        console.error('Datos inválidos:', data);
        setAlertBox('Error: Datos recibidos no válidos.');
      }
    } catch (error) {
      console.error(error);
      if (error.message !== 'Sesión expirada.') setAlertBox('Error al obtener años escolares.');
    }
  };

  // --- VALIDACIONES ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Validación numérica estricta
    if (name === 'number_of_school_days') {
       newValue = value.replace(/[^\d]/g, '');
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setAlertBox(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const strValue = String(value || '').trim();

    if (requiredFields.includes(name) && strValue === '') {
      setErrors((prev) => ({ ...prev, [name]: 'Este campo es obligatorio.' }));
      return;
    }

    if (name === 'number_of_school_days' && strValue) {
        if (parseInt(strValue, 10) <= 0) {
            setErrors((prev) => ({ ...prev, [name]: 'Debe ser mayor a 0.' }));
        }
    }

    if ((name === 'start_year' || name === 'end_of_year')) {
        validateDates(name === 'start_year' ? value : formData.start_year, 
                      name === 'end_of_year' ? value : formData.end_of_year);
    }
  };

  const validateDates = (start, end) => {
      if (start && end) {
          const startDate = new Date(start);
          const endDate = new Date(end);
          if (startDate >= endDate) {
              setErrors(prev => ({...prev, end_of_year: 'La fecha de fin debe ser posterior al inicio.'}));
          } else {
              setErrors(prev => {
                  const newErrs = {...prev};
                  if (newErrs.end_of_year === 'La fecha de fin debe ser posterior al inicio.') {
                      delete newErrs.end_of_year;
                  }
                  return newErrs;
              });
          }
      }
  };

  const validateForm = () => {
    const newErrors = {};
    
    requiredFields.forEach((field) => {
        if (!formData[field] || String(formData[field]).trim() === '') {
            newErrors[field] = 'Este campo es obligatorio.';
        }
    });

    if (formData.start_year && formData.end_of_year) {
        if (new Date(formData.start_year) >= new Date(formData.end_of_year)) {
            newErrors.end_of_year = 'La fecha de fin debe ser posterior al inicio.';
        }
    }

    if (formData.number_of_school_days && parseInt(formData.number_of_school_days, 10) <= 0) {
        newErrors.number_of_school_days = 'Debe ser un número positivo.';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    if (!isValid) {
        setAlertBox('Por favor, corrija los errores antes de guardar.');
    }
    
    return isValid;
  };

  // --- NUEVA FUNCIÓN: VALIDAR DUPLICADOS EN FRONTEND ---
  const checkFrontendDuplicates = () => {
      const { school_grade, start_year, end_of_year } = formData;
      const normalize = (str) => String(str).toLowerCase().trim();

      const exists = schoolYears.some(sy => {
          // Ignorar el registro actual si estamos editando
          if (editMode && selectedSchoolYear && sy.id_school_year === selectedSchoolYear.id_school_year) {
              return false;
          }
          // Comparar Grado y Fechas
          return normalize(sy.school_grade) === normalize(school_grade) &&
                 sy.start_year === start_year &&
                 sy.end_of_year === end_of_year;
      });

      if (exists) {
          setAlertBox('Error: Ya existe un año escolar con el mismo grado y fechas.');
          return false;
      }
      return true;
  };

  // --- CRUD ---

  const handleSaveSchoolYear = async () => {
    if (!validateForm()) return;
    if (!checkFrontendDuplicates()) return; // Validar duplicados antes de enviar
    
    setIsSaving(true);
    setAlertBox(null);

    const formattedData = {
      ...formData,
      start_year: new Date(formData.start_year).toISOString().split('T')[0],
      end_of_year: new Date(formData.end_of_year).toISOString().split('T')[0],
      scheduled_vacation: new Date(formData.scheduled_vacation).toISOString().split('T')[0],
      special_events: new Date(formData.special_events).toISOString().split('T')[0],
      number_of_school_days: parseInt(formData.number_of_school_days, 10)
    };

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${schoolYearsUrl}/${selectedSchoolYear.id_school_year}` : schoolYearsUrl;

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        let errorText = `Error ${response.status}`;
        try {
            const data = await response.json();
            if (data.message) errorText = data.message;
        } catch (_) {}
        
        setAlertBox(errorText);
        setIsSaving(false);
        return;
      }

      await fetchSchoolYears();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      if (error.message !== 'Sesión expirada.') setAlertBox('Error de conexión al guardar.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteClick = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
      const response = await authenticatedFetch(`${schoolYearsUrl}/${idToDelete}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      await fetchSchoolYears();
      setShowDeleteModal(false);
    } catch (error) {
      setAlertBox(error.message);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- UI Helpers ---

  const handleEditSchoolYear = (schoolYear) => {
    setSelectedSchoolYear(schoolYear);
    setFormData({
      school_grade: schoolYear.school_grade,
      start_year: schoolYear.start_year,
      end_of_year: schoolYear.end_of_year,
      number_of_school_days: schoolYear.number_of_school_days,
      scheduled_vacation: schoolYear.scheduled_vacation,
      special_events: schoolYear.special_events,
      school_year_status: schoolYear.school_year_status === true || schoolYear.school_year_status === 'active' ? 'active' : 'inactive',
    });
    setEditMode(true);
    setErrors({});
    setAlertBox(null);
    setShowModal(true);
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      school_grade: '',
      start_year: '',
      end_of_year: '',
      number_of_school_days: '',
      scheduled_vacation: '',
      special_events: '',
      school_year_status: '',
    });
    setEditMode(false);
    setSelectedSchoolYear(null);
    setErrors({});
    setAlertBox(null);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setShowModal(false);
    resetForm();
  };

  const renderErrorText = (field) => {
    if (!errors[field]) return null;
    return (
      <div className="text-danger small mt-1">
        {errors[field]}
      </div>
    );
  };

  // Filtros
  const filteredSchoolYears = schoolYears.filter((schoolYear) => {
    const gradeMatch = (schoolYear.school_grade || '')
        .toLowerCase()
        .includes(filter.school_grade.toLowerCase());

    let statusString = '';
    const statusValue = schoolYear.school_year_status;

    if (typeof statusValue === 'boolean') {
        statusString = statusValue ? 'active' : 'inactive';
    } else if (typeof statusValue === 'string') {
        statusString = statusValue.toLowerCase();
    } 

    const filterStatus = filter.school_year_status.toLowerCase();
    const statusMatch = filterStatus === '' || statusString.includes(filterStatus);

    return gradeMatch && statusMatch;
  });

  // KPIs
  const totalYears = schoolYears.length;
  const activeYears = schoolYears.filter(sy => 
      sy.school_year_status === 'active' || sy.school_year_status === true
  ).length;

  return (
    <div className="container-fluid mt-4">
      
      {/* --- KPIs --- */}
      <CRow className="mb-4">
          <CCol sm={6}>
              <CCard className="border-start-4 border-start-primary shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Años Registrados</div>
                          <div className="fs-4 fw-semibold text-body">{totalYears}</div>
                      </div>
                      <CIcon icon={cilCalendar} size="xl" className="text-primary" />
                  </CCardBody>
              </CCard>
          </CCol>
          <CCol sm={6}>
              <CCard className="border-start-4 border-start-success shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Años Activos</div>
                          <div className="fs-4 fw-semibold text-body">{activeYears}</div>
                      </div>
                      <CIcon icon={cilCheckCircle} size="xl" className="text-success" />
                  </CCardBody>
              </CCard>
          </CCol>
      </CRow>

      {/* --- CARD PRINCIPAL --- */}
      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 text-body">Gestión de Años Escolares</h5>
            <CButton color="success" onClick={() => { resetForm(); setShowModal(true); }} className="d-flex align-items-center text-white">
              <CIcon icon={cilPlus} className="me-2" /> Agregar Año Escolar
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
                            placeholder="Filtrar por grado escolar..." 
                            name="school_grade"
                            value={filter.school_grade} 
                            onChange={handleFilterChange} 
                        />
                    </CInputGroup>
                </CCol>
                <CCol md={6}>
                    <CInputGroup>
                        <CInputGroupText className="bg-transparent text-medium-emphasis border-end-0">
                            <CIcon icon={cilCheckCircle} />
                        </CInputGroupText>
                        <CFormInput 
                            className="bg-transparent border-start-0"
                            placeholder="Filtrar por estado (active/inactive)..." 
                            name="school_year_status"
                            value={filter.school_year_status} 
                            onChange={handleFilterChange} 
                        />
                    </CInputGroup>
                </CCol>
            </CRow>

            {/* Tabla */}
            <CTable align="middle" className="mb-0 border" hover responsive striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{width: '60px'}}>ID</CTableHeaderCell>
                  <CTableHeaderCell>Grado</CTableHeaderCell>
                  <CTableHeaderCell>Período (Inicio - Fin)</CTableHeaderCell>
                  <CTableHeaderCell>Días</CTableHeaderCell>
                  <CTableHeaderCell>Fechas Clave</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Estado</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredSchoolYears.map((schoolYear) => (
                  <CTableRow key={schoolYear.id_school_year}>
                    <CTableDataCell className="text-center">
                        <CBadge color="secondary" shape="rounded-pill">#{schoolYear.id_school_year}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="fw-bold text-body fs-5">{schoolYear.school_grade}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="text-body">{schoolYear.start_year} <span className="text-medium-emphasis">al</span> {schoolYear.end_of_year}</div>
                    </CTableDataCell>
                    <CTableDataCell>{schoolYear.number_of_school_days}</CTableDataCell>
                    <CTableDataCell>
                        <div className="small text-medium-emphasis">Vacaciones: {schoolYear.scheduled_vacation}</div>
                        <div className="small text-medium-emphasis">Eventos: {schoolYear.special_events}</div>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                        <CBadge color={schoolYear.school_year_status === 'active' || schoolYear.school_year_status === true ? 'success' : 'secondary'}>
                            {schoolYear.school_year_status === true || schoolYear.school_year_status === 'active' ? 'Activo' : 'Inactivo'}
                        </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton color="light" size="sm" variant="ghost" className="me-2" onClick={() => handleEditSchoolYear(schoolYear)}>
                          <CIcon icon={cilPencil} className="text-warning"/>
                      </CButton>
                      <CButton color="light" size="sm" variant="ghost" onClick={() => handleDeleteClick(schoolYear.id_school_year)}>
                          <CIcon icon={cilTrash} className="text-danger"/>
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
        </CCardBody>
      </CCard>

      {/* --- MODALES --- */}

      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static" alignment="center">
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>¿Está seguro de que desea eliminar este año escolar? Esta acción no se puede deshacer.</CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
          <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showModal} backdrop="static" onClose={handleCloseModal} size="lg">
        <CModalHeader>
          <CModalTitle>{editMode ? 'Editar Año Escolar' : 'Agregar Año Escolar'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
          <CForm>
            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormInput 
                      type="text" 
                      label="Grado Escolar *" 
                      name="school_grade"
                      value={formData.school_grade} 
                      onChange={handleInputChange} 
                      onBlur={handleBlur}
                      invalid={!!errors.school_grade}
                    />
                    {renderErrorText('school_grade')}
                </CCol>
                <CCol md={6}>
                    <CFormInput 
                      type="number" 
                      label="Días Escolares *" 
                      name="number_of_school_days"
                      value={formData.number_of_school_days} 
                      onChange={handleInputChange} 
                      onBlur={handleBlur}
                      invalid={!!errors.number_of_school_days}
                    />
                    {renderErrorText('number_of_school_days')}
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormInput 
                      type="date" 
                      label="Año de Inicio *" 
                      name="start_year"
                      value={formData.start_year} 
                      onChange={handleInputChange} 
                      onBlur={handleBlur}
                      invalid={!!errors.start_year}
                    />
                    {renderErrorText('start_year')}
                </CCol>
                <CCol md={6}>
                    <CFormInput 
                      type="date" 
                      label="Año de Fin *" 
                      name="end_of_year"
                      value={formData.end_of_year} 
                      onChange={handleInputChange} 
                      onBlur={handleBlur}
                      invalid={!!errors.end_of_year}
                    />
                    {renderErrorText('end_of_year')}
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormInput 
                      type="date" 
                      label="Vacaciones Programadas *" 
                      name="scheduled_vacation"
                      value={formData.scheduled_vacation} 
                      onChange={handleInputChange} 
                      onBlur={handleBlur}
                      invalid={!!errors.scheduled_vacation}
                    />
                    {renderErrorText('scheduled_vacation')}
                </CCol>
                <CCol md={6}>
                    <CFormInput 
                      type="date" 
                      label="Eventos Especiales *" 
                      name="special_events"
                      value={formData.special_events} 
                      onChange={handleInputChange} 
                      onBlur={handleBlur}
                      invalid={!!errors.special_events}
                    />
                    {renderErrorText('special_events')}
                </CCol>
            </CRow>

            <div className="mb-3">
                <CFormSelect 
                  label="Estado *" 
                  name="school_year_status"
                  value={formData.school_year_status} 
                  onChange={handleInputChange} 
                  onBlur={handleBlur}
                  invalid={!!errors.school_year_status}
                >
                  <option value="">Seleccionar Estado</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </CFormSelect>
                {renderErrorText('school_year_status')}
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={handleCloseModal}>Cancelar</CButton>
          <CButton color="success" onClick={handleSaveSchoolYear} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default SchoolYear;