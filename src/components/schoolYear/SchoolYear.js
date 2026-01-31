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
  cilMediaPlay,
  cilWarning
} from '@coreui/icons';
import API_URL from '../../../config';

const SchoolYear = () => {
  // --- ESTADOS DE DATOS ---
  const [schoolYears, setSchoolYears] = useState([]);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    school_grade: '', 
    start_year: '',
    end_of_year: '',
    school_year_status: 'active',
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

  // Modal Promoción
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [nextPeriodData, setNextPeriodData] = useState({
    name_period: '', 
    start_year: '',
    end_of_year: ''
  });

  const schoolYearsUrl = `${API_URL}/school_years`;
  const promotionUrl = `${API_URL}/execute-promotion`;

  const requiredFields = ['school_grade', 'start_year', 'end_of_year', 'school_year_status'];

  useEffect(() => {
    fetchSchoolYears();
  }, []);

  // --- HELPERS DE RED ---
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
      setSchoolYears(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAlertBox('Error al obtener años escolares.');
    }
  };

  // --- PROMOCIÓN AUTOMÁTICA ---
  const handlePromotionClick = () => {
    setNextPeriodData({ name_period: '', start_year: '', end_of_year: '' });
    setShowPromotionModal(true);
  };

  const executePromotion = async () => {
    if (!nextPeriodData.name_period || !nextPeriodData.start_year || !nextPeriodData.end_of_year) {
        alert("Por favor complete todos los datos del nuevo periodo escolar.");
        return;
    }
    setIsPromoting(true);
    try {
        const response = await authenticatedFetch(promotionUrl, {
            method: 'POST',
            body: JSON.stringify(nextPeriodData)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Error en el proceso.");

        alert(`¡Año cerrado exitosamente!\n\nDías calculados: ${result.details.calculatedDays}\nPromovidos: ${result.details.stats.promoted}`);
        setShowPromotionModal(false);
        fetchSchoolYears(); 
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        setIsPromoting(false);
    }
  };

  // --- GESTIÓN MANUAL ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSchoolYear = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    setAlertBox(null);

    const payload = {
      name_period: formData.school_grade,
      school_grade: formData.school_grade,
      start_year: formData.start_year,
      end_of_year: formData.end_of_year,
      school_year_status: formData.school_year_status
    };

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${schoolYearsUrl}/${selectedSchoolYear.id_school_year}` : schoolYearsUrl;

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al guardar.');
      }

      await fetchSchoolYears();
      handleCloseModal();
    } catch (error) {
      setAlertBox(error.message);
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteClick = (id) => { setIdToDelete(id); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
      const res = await authenticatedFetch(`${schoolYearsUrl}/${idToDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      await fetchSchoolYears();
      setShowDeleteModal(false);
    } catch (error) {
      setAlertBox(error.message);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- HELPERS UI ---
  const handleEditSchoolYear = (sy) => {
    setSelectedSchoolYear(sy);
    let statusValue = 'active';
    if (sy.school_year_status === 'Cerrado' || sy.school_year_status === 'inactive') statusValue = 'inactive';

    setFormData({
      school_grade: sy.name_period || sy.school_grade,
      start_year: sy.start_year,
      end_of_year: sy.end_of_year,
      school_year_status: statusValue,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ school_grade: '', start_year: '', end_of_year: '', school_year_status: 'active' });
    setEditMode(false);
    setSelectedSchoolYear(null);
    setErrors({});
  };

  const renderErrorText = (field) => errors[field] ? <div className="text-danger small mt-1">{errors[field]}</div> : null;

  // Filtros
  const filteredSchoolYears = schoolYears.filter((sy) => {
    const nameMatch = (sy.name_period || sy.school_grade || '').toLowerCase().includes(filter.school_grade.toLowerCase());
    return nameMatch;
  });

  const activeYear = schoolYears.find(sy => sy.school_year_status === 'Activo' || sy.school_year_status === 'active' || sy.school_year_status === true);

  return (
    <div className="container-fluid mt-4">
      
      {/* PANEL DE CIERRE DE AÑO (CON CLASE PARA EL TUTORIAL: tour-schoolyear-active) */}
      {activeYear && (
          <CAlert color="info" className="d-flex align-items-center justify-content-between shadow-sm tour-schoolyear-active">
              <div>
                  <CIcon icon={cilCheckCircle} className="me-2" size="xl"/>
                  <span className="fs-5 align-middle text-body">
                      Año Escolar Actual: <strong>{activeYear.name_period || activeYear.school_grade}</strong> 
                      <span className="small ms-2 opacity-75">({activeYear.start_year} - {activeYear.end_of_year})</span>
                  </span>
              </div>
              <CButton color="warning" className="text-dark fw-bold tour-schoolyear-close" onClick={handlePromotionClick}>
                  <CIcon icon={cilMediaPlay} className="me-2" />
                  Cerrar Año e Iniciar Siguiente
              </CButton>
          </CAlert>
      )}

      {/* TABLA PRINCIPAL (CON CLASE PARA EL TUTORIAL: tour-schoolyear-table) */}
      <CCard className="shadow-sm tour-schoolyear-table">
        <CCardHeader className="d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0">Historial de Periodos Escolares</h5>
            <CButton color="success" onClick={() => { handleCloseModal(); setShowModal(true); }} className="text-white tour-schoolyear-create">
              <CIcon icon={cilPlus} className="me-2" /> Nuevo Periodo
            </CButton>
        </CCardHeader>

        <CCardBody>
            {alertBox && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}

            <div className="mb-4 tour-schoolyear-search" style={{ maxWidth: '400px' }}>
                <CInputGroup>
                    <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
                    <CFormInput 
                        placeholder="Buscar por nombre (ej: 2024-2025)..." 
                        value={filter.school_grade} 
                        onChange={(e) => setFilter({ ...filter, school_grade: e.target.value })} 
                    />
                </CInputGroup>
            </div>

            <CTable align="middle" hover responsive bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Periodo</CTableHeaderCell>
                  <CTableHeaderCell>Duración</CTableHeaderCell>
                  <CTableHeaderCell>Resumen Calendario</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Estado</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredSchoolYears.map((sy) => {
                   const isActive = sy.school_year_status === 'Activo' || sy.school_year_status === 'active' || sy.school_year_status === true;
                   return (
                      <CTableRow key={sy.id_school_year}>
                        <CTableDataCell>
                            <div className="fw-bold">{sy.name_period || sy.school_grade}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                            <div className="small text-body-secondary">Inicio: {sy.start_year}</div>
                            <div className="small text-body-secondary">Fin: {sy.end_of_year}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                            <div className="d-flex align-items-center mb-1">
                                <CBadge color="info" className="me-2">{sy.number_of_school_days || 0} días hábiles</CBadge>
                            </div>
                            <div className="small text-body-secondary text-truncate" style={{maxWidth: '250px'}} title={sy.special_events}>
                                {sy.special_events || 'Sin eventos calculados'}
                            </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                            <CBadge color={isActive ? 'success' : 'secondary'}>
                                {isActive ? 'Activo' : 'Cerrado'}
                            </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          <CButton color="warning" size="sm" variant="ghost" className="me-2" onClick={() => handleEditSchoolYear(sy)}>
                              <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton color="danger" size="sm" variant="ghost" onClick={() => handleDeleteClick(sy.id_school_year)}>
                              <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                   );
                })}
              </CTableBody>
            </CTable>
        </CCardBody>
      </CCard>

      {/* MODAL ELIMINAR */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static" alignment="center">
        <CModalHeader><CModalTitle>Confirmar Eliminación</CModalTitle></CModalHeader>
        <CModalBody>¿Eliminar este periodo? Esto podría afectar historiales académicos.</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
          <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>Eliminar</CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL CREAR/EDITAR */}
      <CModal visible={showModal} onClose={handleCloseModal} backdrop="static" size="lg">
        <CModalHeader>
          <CModalTitle>{editMode ? 'Editar Periodo Escolar' : 'Nuevo Periodo Escolar'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CAlert color="info">
            <CIcon icon={cilCalendar} className="me-2"/>
            El sistema calculará automáticamente los <strong>días hábiles</strong> y <strong>feriados</strong> basándose en las fechas.
          </CAlert>
          
          <CForm>
            <div className="mb-3">
                <CFormInput 
                  type="text" 
                  label="Nombre del Periodo *" 
                  name="school_grade"
                  placeholder="Ej: Año Escolar 2024-2025"
                  value={formData.school_grade} 
                  onChange={handleInputChange} 
                  invalid={!!errors.school_grade}
                />
                {renderErrorText('school_grade')}
            </div>

            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormInput 
                      type="date" 
                      label="Fecha de Inicio *" 
                      name="start_year"
                      value={formData.start_year} 
                      onChange={handleInputChange} 
                      invalid={!!errors.start_year}
                    />
                    {renderErrorText('start_year')}
                </CCol>
                <CCol md={6}>
                    <CFormInput 
                      type="date" 
                      label="Fecha de Fin *" 
                      name="end_of_year"
                      value={formData.end_of_year} 
                      onChange={handleInputChange} 
                      invalid={!!errors.end_of_year}
                    />
                    {renderErrorText('end_of_year')}
                </CCol>
            </CRow>

            <div className="mb-3">
                <CFormSelect 
                  label="Estado *" 
                  name="school_year_status"
                  value={formData.school_year_status} 
                  onChange={handleInputChange} 
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Cerrado / Planificación</option>
                </CFormSelect>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
          <CButton color="success" onClick={handleSaveSchoolYear} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Periodo'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL PROMOCIÓN AUTOMÁTICA */}
      <CModal visible={showPromotionModal} onClose={() => setShowPromotionModal(false)} backdrop="static" size="lg">
          <CModalHeader className="bg-warning text-dark">
              <CModalTitle><CIcon icon={cilWarning} className="me-2"/>Cierre de Año Escolar</CModalTitle>
          </CModalHeader>
          <CModalBody>
              <CAlert color="warning">
                  El sistema cerrará el año actual y promoverá a los alumnos aprobados automáticamente.
              </CAlert>
              <CForm>
                  <div className="mb-3">
                      <label className="form-label">Nombre del Nuevo Periodo *</label>
                      <CFormInput 
                          placeholder="Ej: 2025-2026"
                          value={nextPeriodData.name_period}
                          onChange={(e) => setNextPeriodData({...nextPeriodData, name_period: e.target.value})}
                      />
                  </div>
                  <CRow>
                      <CCol md={6}>
                          <label className="form-label">Fecha Inicio *</label>
                          <CFormInput type="date" value={nextPeriodData.start_year} onChange={(e) => setNextPeriodData({...nextPeriodData, start_year: e.target.value})} />
                      </CCol>
                      <CCol md={6}>
                          <label className="form-label">Fecha Fin *</label>
                          <CFormInput type="date" value={nextPeriodData.end_of_year} onChange={(e) => setNextPeriodData({...nextPeriodData, end_of_year: e.target.value})} />
                      </CCol>
                  </CRow>
              </CForm>
          </CModalBody>
          <CModalFooter>
              <CButton color="secondary" onClick={() => setShowPromotionModal(false)}>Cancelar</CButton>
              <CButton color="primary" onClick={executePromotion} disabled={isPromoting}>
                  {isPromoting ? 'Procesando...' : 'Ejecutar Cierre'}
              </CButton>
          </CModalFooter>
      </CModal>
    </div>
  );
};

export default SchoolYear;