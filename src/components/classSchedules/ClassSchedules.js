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
  cilRoom, 
  cilCalendar, 
  cilClock,
  cilWarning
} from '@coreui/icons';
import API_URL from '../../../config';

const ClassSchedules = () => {
  const [classSchedules, setClassSchedules] = useState([]);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    classroom: '',
    start_time: '',
    end_time: '',
    unforeseen_events: '',
    day_of_week: '',
  });

  // Estados UI
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [filter, setFilter] = useState({ day_of_week: '', classroom: '' });

  // Estados Validación
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados Borrado
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const classSchedulesUrl = `${API_URL}/class_schedules`;
  
  const requiredFields = ['start_date', 'end_date', 'classroom', 'day_of_week', 'start_time', 'end_time'];
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    fetchClassSchedules();
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

  const fetchClassSchedules = async () => {
    try {
      const response = await authenticatedFetch(classSchedulesUrl);
      const data = await response.json();
      setClassSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      if (error.message !== 'Sesión expirada.') setAlertBox('Error al cargar horarios.');
    }
  };

  // --- VALIDACIONES ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    setAlertBox(null);
  };

  const handleBlur = (e) => {
      const { name, value } = e.target;
      if (requiredFields.includes(name) && !value) {
          setErrors(prev => ({ ...prev, [name]: 'Este campo es obligatorio.' }));
      }
  };

  const validateForm = () => {
      const newErrors = {};
      let isValid = true;

      requiredFields.forEach(field => {
          if (!formData[field]) {
              newErrors[field] = 'Campo obligatorio.';
              isValid = false;
          }
      });

      if (formData.start_date && formData.end_date) {
          if (new Date(formData.start_date) > new Date(formData.end_date)) {
              newErrors.end_date = 'La fecha fin debe ser posterior al inicio.';
              isValid = false;
          }
      }

      if (formData.start_time && formData.end_time) {
          if (formData.start_time >= formData.end_time) {
              newErrors.end_time = 'La hora fin debe ser posterior al inicio.';
              isValid = false;
          }
      }

      setErrors(newErrors);
      if (!isValid) setAlertBox('Por favor, corrija los errores del formulario.');
      return isValid;
  };

  // --- VALIDACIÓN DE DUPLICIDAD ---
  const checkDuplicates = () => {
      const { classroom, day_of_week, start_time } = formData;
      const normalize = (str) => String(str).toLowerCase().trim();

      const duplicate = classSchedules.find(s => {
          if (editMode && selectedSchedule && s.id_class_schedules === selectedSchedule.id_class_schedules) return false;
          
          return normalize(s.classroom) === normalize(classroom) &&
                 normalize(s.day_of_week) === normalize(day_of_week) &&
                 s.start_time === start_time;
      });

      if (duplicate) {
          setAlertBox(`Error: El aula ${classroom} ya está ocupada el ${day_of_week} a las ${start_time}.`);
          return false;
      }
      return true;
  };

  // --- CRUD ---

  const handleSaveSchedule = async () => {
    if (!validateForm()) return;
    if (!checkDuplicates()) return;

    setIsSaving(true);
    setAlertBox(null);

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${classSchedulesUrl}/${selectedSchedule.id_class_schedules}` : classSchedulesUrl;

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar.');
      }

      await fetchClassSchedules();
      handleCloseModal();
    } catch (error) {
      setAlertBox(error.message);
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
        const res = await authenticatedFetch(`${classSchedulesUrl}/${idToDelete}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar.');
        await fetchClassSchedules();
        setShowDeleteModal(false);
    } catch (error) {
        setAlertBox('No se pudo eliminar el registro.');
        setShowDeleteModal(false);
    } finally {
        setIsDeleting(false);
    }
  };

  // --- UI Helpers ---

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      start_date: schedule.start_date || '',
      end_date: schedule.end_date || '',
      classroom: schedule.classroom || '',
      start_time: schedule.start_time || '',
      end_time: schedule.end_time || '',
      unforeseen_events: schedule.unforeseen_events || '',
      day_of_week: schedule.day_of_week || '',
    });
    setEditMode(true);
    setErrors({});
    setAlertBox(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      start_date: '', end_date: '', classroom: '',
      start_time: '', end_time: '', unforeseen_events: '', day_of_week: '',
    });
    setEditMode(false);
    setSelectedSchedule(null);
    setErrors({});
    setAlertBox(null);
  };

  const renderError = (field) => errors[field] ? <div className="text-danger small mt-1">{errors[field]}</div> : null;

  const filteredSchedules = classSchedules.filter(s => {
      const dayMatch = (s.day_of_week || '').toLowerCase().includes(filter.day_of_week.toLowerCase());
      const roomMatch = (s.classroom || '').toLowerCase().includes(filter.classroom.toLowerCase());
      return dayMatch && roomMatch;
  });

  // KPIs
  const totalSchedules = classSchedules.length;
  const uniqueClassrooms = new Set(classSchedules.map(s => s.classroom)).size;

  return (
    <div className="container-fluid mt-4">
      
      {/* --- KPIs --- */}
      <CRow className="mb-4">
          <CCol sm={6}>
              <CCard className="border-start-4 border-start-primary shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Total Horarios</div>
                          <div className="fs-4 fw-semibold text-body">{totalSchedules}</div>
                      </div>
                      <CIcon icon={cilClock} size="xl" className="text-primary" />
                  </CCardBody>
              </CCard>
          </CCol>
          <CCol sm={6}>
              <CCard className="border-start-4 border-start-warning shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Aulas Ocupadas</div>
                          <div className="fs-4 fw-semibold text-body">{uniqueClassrooms}</div>
                      </div>
                      <CIcon icon={cilRoom} size="xl" className="text-warning" />
                  </CCardBody>
              </CCard>
          </CCol>
      </CRow>

      {/* --- SECCIÓN PRINCIPAL --- */}
      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 text-body">Gestión de Horarios</h5>
            <CButton color="success" onClick={() => { handleCloseModal(); setShowModal(true); }} className="d-flex align-items-center text-white">
              <CIcon icon={cilPlus} className="me-2" /> Agregar Horario
            </CButton>
        </CCardHeader>

        <CCardBody>
            {alertBox && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}

            {/* Filtros */}
            <CRow className="mb-4 g-2">
                <CCol md={6}>
                    <CInputGroup>
                        <CInputGroupText className="bg-body border-end-0 text-medium-emphasis">
                            <CIcon icon={cilCalendar} />
                        </CInputGroupText>
                        <CFormSelect 
                            className="bg-body border-start-0" 
                            value={filter.day_of_week} 
                            onChange={(e) => setFilter({...filter, day_of_week: e.target.value})}
                        >
                            <option value="">Todos los Días</option>
                            {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                        </CFormSelect>
                    </CInputGroup>
                </CCol>
                <CCol md={6}>
                    <CInputGroup>
                        <CInputGroupText className="bg-body border-end-0 text-medium-emphasis">
                            <CIcon icon={cilSearch} />
                        </CInputGroupText>
                        <CFormInput 
                            className="bg-body border-start-0" 
                            placeholder="Buscar por Aula..." 
                            value={filter.classroom} 
                            onChange={(e) => setFilter({...filter, classroom: e.target.value})}
                        />
                    </CInputGroup>
                </CCol>
            </CRow>

            {/* Tabla */}
            <CTable align="middle" className="mb-0 border" hover responsive striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{width: '60px'}}><CIcon icon={cilRoom} /></CTableHeaderCell>
                  <CTableHeaderCell>Aula</CTableHeaderCell>
                  <CTableHeaderCell>Día</CTableHeaderCell>
                  <CTableHeaderCell>Horario</CTableHeaderCell>
                  <CTableHeaderCell>Vigencia</CTableHeaderCell>
                  <CTableHeaderCell>Imprevistos</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredSchedules.map((schedule) => (
                  <CTableRow key={schedule.id_class_schedules}>
                    <CTableDataCell className="text-center">
                        <CBadge color="info" shape="rounded-pill">
                            {schedule.id_class_schedules}
                        </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="fw-bold text-body">{schedule.classroom}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <CBadge color="secondary">{schedule.day_of_week}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="d-flex align-items-center text-body small">
                            <CIcon icon={cilClock} className="me-2 text-medium-emphasis"/>
                            {schedule.start_time} - {schedule.end_time}
                        </div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="small text-medium-emphasis">
                            {schedule.start_date} <br/> al {schedule.end_date}
                        </div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="small text-medium-emphasis text-truncate" style={{maxWidth: '150px'}}>
                            {schedule.unforeseen_events || '-'}
                        </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton color="light" size="sm" variant="ghost" className="me-2" onClick={() => handleEditSchedule(schedule)}>
                          <CIcon icon={cilPencil} className="text-warning"/>
                      </CButton>
                      <CButton color="light" size="sm" variant="ghost" onClick={() => handleDeleteClick(schedule.id_class_schedules)}>
                          <CIcon icon={cilTrash} className="text-danger"/>
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {filteredSchedules.length === 0 && (
                    <CTableRow>
                        <CTableDataCell colSpan="7" className="text-center py-4 text-medium-emphasis">
                            No hay horarios registrados.
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
        <CModalBody>¿Eliminar este horario? Esta acción no se puede deshacer.</CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
          <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>Eliminar</CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showModal} onClose={handleCloseModal} backdrop="static" size="lg">
        <CModalHeader>
          <CModalTitle>{editMode ? 'Editar Horario' : 'Crear Horario'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
          <CForm>
              <CRow className="mb-3">
                  <CCol md={6}>
                      <CFormInput type="text" label="Aula *" name="classroom" value={formData.classroom} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.classroom} />
                      {renderError('classroom')}
                  </CCol>
                  <CCol md={6}>
                      <CFormSelect label="Día *" name="day_of_week" value={formData.day_of_week} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.day_of_week}>
                          <option value="">Seleccione...</option>
                          {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                      </CFormSelect>
                      {renderError('day_of_week')}
                  </CCol>
              </CRow>
              <CRow className="mb-3">
                  <CCol md={6}>
                      <CFormInput type="date" label="Inicio Vigencia *" name="start_date" value={formData.start_date} onChange={handleInputChange} invalid={!!errors.start_date} />
                      {renderError('start_date')}
                  </CCol>
                  <CCol md={6}>
                      <CFormInput type="date" label="Fin Vigencia *" name="end_date" value={formData.end_date} onChange={handleInputChange} invalid={!!errors.end_date} />
                      {renderError('end_date')}
                  </CCol>
              </CRow>
              <CRow className="mb-3">
                  <CCol md={6}>
                      <CFormInput type="time" label="Hora Inicio *" name="start_time" value={formData.start_time} onChange={handleInputChange} invalid={!!errors.start_time} />
                      {renderError('start_time')}
                  </CCol>
                  <CCol md={6}>
                      <CFormInput type="time" label="Hora Fin *" name="end_time" value={formData.end_time} onChange={handleInputChange} invalid={!!errors.end_time} />
                      {renderError('end_time')}
                  </CCol>
              </CRow>
              <CFormTextarea label="Eventos Imprevistos" name="unforeseen_events" value={formData.unforeseen_events} onChange={handleInputChange} rows="3" />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={handleCloseModal}>Cancelar</CButton>
          <CButton color="success" onClick={handleSaveSchedule} disabled={isSaving}>Guardar</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default ClassSchedules;