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
} from '@coreui/react';
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

  // Validaciones
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Borrado
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const classSchedulesUrl = `${API_URL}/class_schedules`;
  const requiredFields = ['start_date', 'end_date', 'classroom', 'day_of_week', 'start_time', 'end_time'];
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    fetchClassSchedules();
  }, []);

  const fetchClassSchedules = async () => {
    try {
      const response = await fetch(classSchedulesUrl);
      if (!response.ok) throw new Error('Error de red');
      const data = await response.json();
      setClassSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAlertBox('Error al cargar horarios.');
    }
  };

  // --- Validaciones ---
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

      // 1. Campos requeridos
      requiredFields.forEach(field => {
          if (!formData[field]) {
              newErrors[field] = 'Campo obligatorio.';
              isValid = false;
          }
      });

      // 2. Lógica de Fechas
      if (formData.start_date && formData.end_date) {
          if (new Date(formData.start_date) > new Date(formData.end_date)) {
              newErrors.end_date = 'La fecha fin debe ser posterior al inicio.';
              isValid = false;
          }
      }

      // 3. Lógica de Horas
      if (formData.start_time && formData.end_time) {
          if (formData.start_time >= formData.end_time) {
              newErrors.end_time = 'La hora fin debe ser posterior al inicio.';
              isValid = false;
          }
      }

      setErrors(newErrors);
      if (!isValid) setAlertBox('Por favor, corrija los errores.');
      return isValid;
  };

  // --- CRUD ---
  const handleSaveSchedule = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    setAlertBox(null);

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${classSchedulesUrl}/${selectedSchedule.id_class_schedules}` : classSchedulesUrl;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
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
        const res = await fetch(`${classSchedulesUrl}/${idToDelete}`, { method: 'DELETE' });
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

  const renderError = (field) => errors[field] ? <div style={{color: '#dc3545', fontSize: '0.8rem'}}>{errors[field]}</div> : null;

  const filteredSchedules = classSchedules.filter(s => {
      const dayMatch = (s.day_of_week || '').toLowerCase().includes(filter.day_of_week.toLowerCase());
      const roomMatch = (s.classroom || '').toLowerCase().includes(filter.classroom.toLowerCase());
      return dayMatch && roomMatch;
  });

  return (
    <CCard>
      <CCardHeader>
        <h5>Horarios de Clase</h5>
        <CButton color="success" onClick={() => { handleCloseModal(); setShowModal(true); }}>Agregar Horario</CButton>
      </CCardHeader>
      <CCardBody>
        {alertBox && !showModal && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}

        <div className="mb-3 d-flex gap-2">
            <CFormSelect 
                value={filter.day_of_week} 
                onChange={(e) => setFilter({...filter, day_of_week: e.target.value})}
                style={{maxWidth: '200px'}}
            >
                <option value="">Filtrar Día...</option>
                {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
            </CFormSelect>
            <CFormInput 
                placeholder="Filtrar por Aula" 
                value={filter.classroom} 
                onChange={(e) => setFilter({...filter, classroom: e.target.value})}
                style={{maxWidth: '200px'}}
            />
        </div>

        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Aula</CTableHeaderCell>
              <CTableHeaderCell>Día</CTableHeaderCell>
              <CTableHeaderCell>Horario</CTableHeaderCell>
              <CTableHeaderCell>Vigencia</CTableHeaderCell>
              <CTableHeaderCell>Eventos</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredSchedules.map((schedule) => (
              <CTableRow key={schedule.id_class_schedules}>
                <CTableDataCell>{schedule.classroom}</CTableDataCell>
                <CTableDataCell>{schedule.day_of_week}</CTableDataCell>
                <CTableDataCell>{schedule.start_time} - {schedule.end_time}</CTableDataCell>
                <CTableDataCell>{schedule.start_date} al {schedule.end_date}</CTableDataCell>
                <CTableDataCell>{schedule.unforeseen_events}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="warning" size="sm" onClick={() => handleEditSchedule(schedule)} className="me-2">Editar</CButton>
                  <CButton color="danger" size="sm" onClick={() => handleDeleteClick(schedule.id_class_schedules)}>Eliminar</CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
             {filteredSchedules.length === 0 && <CTableRow><CTableDataCell colSpan="6" className="text-center">No hay registros.</CTableDataCell></CTableRow>}
          </CTableBody>
        </CTable>

        {/* Modal Delete */}
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static">
            <CModalHeader><CModalTitle>Confirmar</CModalTitle></CModalHeader>
            <CModalBody>¿Eliminar este horario?</CModalBody>
            <CModalFooter>
                <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>Eliminar</CButton>
                <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
            </CModalFooter>
        </CModal>

        {/* Modal Form */}
        <CModal visible={showModal} onClose={handleCloseModal} backdrop="static" size="lg">
          <CModalHeader><CModalTitle>{editMode ? 'Editar' : 'Crear'} Horario</CModalTitle></CModalHeader>
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
            <CButton color="success" onClick={handleSaveSchedule} disabled={isSaving}>Guardar</CButton>
            <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default ClassSchedules;