import React, { useState, useEffect } from 'react';
import {
  CButton, CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableDataCell,
  CTableHead, CTableHeaderCell, CTableRow, CModal, CModalHeader, CModalTitle,
  CModalBody, CModalFooter, CForm, CFormInput, CFormSelect, CFormTextarea,
  CAlert, CRow, CCol, CBadge
} from '@coreui/react';
import { cilPencil, cilTrash } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import API_URL from '../../../config';

const Evaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  
  // --- DATOS MAESTROS ---
  const [allStudents, setAllStudents] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);

  // --- DATOS FILTRADOS ---
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);

  // Estado del Formulario
  const [selectedSectionId, setSelectedSectionId] = useState(''); // Filtro Maestro
  const [requiredDay, setRequiredDay] = useState(''); // Para mostrar el día obligatorio
  
  const [formData, setFormData] = useState({
    id_student: '',
    id_subject: '',
    id_class_schedules: '',
    evaluation_date: '',
    evaluation_type: '',
    score: '',
    max_score: '',
    observations: '',
  });

  // UI
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [alertBox, setAlertBox] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // URLs
  const evaluationsUrl = `${API_URL}/evaluations`;
  const studentsUrl = `${API_URL}/students`;
  const sectionsUrl = `${API_URL}/sections`;
  const schedulesUrl = `${API_URL}/class-schedules`; 

  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- AUTENTICACIÓN ---
  const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '#/login';
    }
    return response;
  };

  const fetchInitialData = async () => {
    try {
        const [resEval, resStu, resSec, resSch] = await Promise.all([
            authenticatedFetch(evaluationsUrl),
            authenticatedFetch(studentsUrl),
            authenticatedFetch(sectionsUrl),
            authenticatedFetch(schedulesUrl)
        ]);

        if (resEval.ok) setEvaluations(await resEval.json());
        if (resStu.ok) setAllStudents(await resStu.json());
        if (resSec.ok) setAllSections(await resSec.json());
        if (resSch.ok) setAllSchedules(await resSch.json());

    } catch (e) { 
        console.error(e);
        setAlertBox("Error de conexión al cargar datos.");
    }
  };

  // --- LÓGICA DE CASCADA ---
  const handleSectionChange = (e) => {
      const sectionId = e.target.value;
      setSelectedSectionId(sectionId);

      // Limpiar campos dependientes
      setFormData(prev => ({ ...prev, id_student: '', id_class_schedules: '', id_subject: '' }));
      setRequiredDay('');
      setErrors({});

      if (sectionId) {
          const students = allStudents.filter(s => String(s.id_section) === String(sectionId));
          setFilteredStudents(students);

          const schedules = allSchedules.filter(s => String(s.id_section) === String(sectionId));
          setFilteredSchedules(schedules);
      } else {
          setFilteredStudents([]);
          setFilteredSchedules([]);
      }
  };

  const handleScheduleChange = (e) => {
      const scheduleId = e.target.value;
      const scheduleObj = allSchedules.find(s => String(s.id_class_schedules) === String(scheduleId));

      if (scheduleObj) {
          setRequiredDay(scheduleObj.day_of_week); // Guardamos el día permitido (Ej: Lunes)
          setFormData(prev => ({
              ...prev,
              id_class_schedules: scheduleId,
              id_subject: scheduleObj.id_subject 
          }));

          // Si ya había fecha, la re-validamos
          if (formData.evaluation_date) {
              validateDayOfWeek(formData.evaluation_date, scheduleObj.day_of_week);
          }
      } else {
          setRequiredDay('');
          setFormData(prev => ({ ...prev, id_class_schedules: '', id_subject: '' }));
      }
  };

  const handleDateChange = (e) => {
      const date = e.target.value;
      setFormData(prev => ({ ...prev, evaluation_date: date }));
      
      // Validar contra el horario seleccionado
      if (formData.id_class_schedules) {
          const scheduleObj = allSchedules.find(s => String(s.id_class_schedules) === String(formData.id_class_schedules));
          if (scheduleObj) {
              validateDayOfWeek(date, scheduleObj.day_of_week);
          }
      }
  };

  const validateDayOfWeek = (dateString, requiredDayName) => {
      const date = new Date(dateString);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
      const dayNumber = adjustedDate.getDay(); 
      
      const daysMap = {
          'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Miercoles': 3,
          'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Sabado': 6
      };

      const requiredDayNumber = daysMap[requiredDayName];

      if (requiredDayNumber !== undefined && dayNumber !== requiredDayNumber) {
          setErrors(prev => ({
              ...prev, 
              evaluation_date: `⛔ Error: Debes seleccionar una fecha que sea ${requiredDayName}.`
          }));
          return false;
      } else {
          setErrors(prev => ({ ...prev, evaluation_date: null }));
          return true;
      }
  };

  const handleSave = async () => {
    if (!formData.id_student) return setAlertBox("Seleccione un estudiante.");
    if (!formData.id_class_schedules) return setAlertBox("Seleccione un horario/materia.");
    if (errors.evaluation_date) return setAlertBox("Corrija la fecha antes de guardar.");
    
    setIsSaving(true);
    try {
        const method = editMode ? 'PUT' : 'POST';
        const url = editMode ? `${evaluationsUrl}/${selectedEvaluation.id_evaluation}` : evaluationsUrl;

        const payload = {
            ...formData,
            id_student: parseInt(formData.id_student),
            id_subject: parseInt(formData.id_subject),
            id_class_schedules: parseInt(formData.id_class_schedules),
            score: parseFloat(formData.score),
            max_score: parseFloat(formData.max_score),
        };

        const response = await authenticatedFetch(url, {
            method,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al guardar');
        }

        await fetchInitialData(); 
        handleCloseModal();
    } catch (error) {
        setAlertBox(error.message);
    } finally {
        setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
      setShowModal(false);
      setEditMode(false);
      setErrors({});
      setAlertBox(null);
      setSelectedSectionId('');
      setRequiredDay('');
      setFormData({
          id_student: '', id_subject: '', id_class_schedules: '',
          evaluation_date: '', evaluation_type: '', score: '', max_score: '', observations: ''
      });
  };

  const handleDeleteClick = (id) => { setIdToDelete(id); setShowDeleteModal(true); };
  
  const confirmDelete = async () => {
      try {
          const res = await authenticatedFetch(`${evaluationsUrl}/${idToDelete}`, { method: 'DELETE' });
          if(res.ok) {
              setEvaluations(prev => prev.filter(e => e.id_evaluation !== idToDelete));
              setShowDeleteModal(false);
          } else { throw new Error(); }
      } catch (e) { setAlertBox("Error al eliminar"); }
  };

  const handleEdit = (ev) => {
    const student = allStudents.find(s => s.id_student === ev.id_student);
    if (student && student.id_section) {
        setSelectedSectionId(student.id_section);
        const sectionId = student.id_section;
        setFilteredStudents(allStudents.filter(s => String(s.id_section) === String(sectionId)));
        setFilteredSchedules(allSchedules.filter(s => String(s.id_section) === String(sectionId)));
        
        // Buscar el horario para setear el día requerido en edición
        const schedule = allSchedules.find(s => s.id_class_schedules === ev.id_class_schedules);
        if(schedule) setRequiredDay(schedule.day_of_week);
    }

    setSelectedEvaluation(ev);
    setFormData({
      id_student: ev.id_student,
      id_subject: ev.id_subject,
      id_class_schedules: ev.id_class_schedules,
      evaluation_date: ev.evaluation_date ? ev.evaluation_date.split('T')[0] : '',
      evaluation_type: ev.evaluation_type,
      score: ev.score,
      max_score: ev.max_score,
      observations: ev.observations || ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 text-body">Gestión de Evaluaciones y Notas</h5>
            <CButton color="primary" onClick={() => setShowModal(true)}>Registrar Nota</CButton>
      </CCardHeader>
      
      <CCardBody>
        {alertBox && !showModal && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}
        
        <CTable hover responsive align="middle">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Estudiante</CTableHeaderCell>
              <CTableHeaderCell>Materia / Horario</CTableHeaderCell>
              <CTableHeaderCell>Tipo</CTableHeaderCell>
              <CTableHeaderCell>Fecha</CTableHeaderCell>
              <CTableHeaderCell>Nota / Máx</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {evaluations.map((ev) => (
              <CTableRow key={ev.id_evaluation}>
                <CTableDataCell className="fw-semibold">{ev.student_name}</CTableDataCell>
                <CTableDataCell>
                    <div className="fw-bold">{ev.subject_name}</div>
                    <small className="text-body-secondary">{ev.schedule_info}</small>
                </CTableDataCell>
                <CTableDataCell>{ev.evaluation_type === 'summative' ? 'Sumativa' : 'Formativa'}</CTableDataCell>
                <CTableDataCell className="text-body-secondary">{ev.evaluation_date}</CTableDataCell>
                <CTableDataCell>
                    <CBadge color={ev.score >= (ev.max_score/2) ? 'success' : 'danger'}>
                        {ev.score} / {ev.max_score}
                    </CBadge>
                </CTableDataCell>
                <CTableDataCell className="text-end">
                    <CButton color="warning" size="sm" variant="ghost" onClick={() => handleEdit(ev)} className="me-2">
                        <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton color="danger" size="sm" variant="ghost" onClick={() => handleDeleteClick(ev.id_evaluation)}>
                        <CIcon icon={cilTrash} />
                    </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
             {evaluations.length === 0 && <CTableRow><CTableDataCell colSpan="6" className="text-center text-body-secondary py-4">No hay notas registradas.</CTableDataCell></CTableRow>}
          </CTableBody>
        </CTable>
      </CCardBody>

      {/* MODAL PRINCIPAL */}
      <CModal visible={showModal} onClose={handleCloseModal} backdrop="static" size="lg">
        <CModalHeader>
            <CModalTitle>{editMode ? 'Editar' : 'Registrar'} Nota</CModalTitle>
        </CModalHeader>
        <CModalBody>
            {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
            
            <CForm>
                {/* 1. SELECCIÓN DE SECCIÓN */}
                <CRow className="mb-3">
                    <CCol md={12}>
                        <CFormSelect 
                            label="1. Seleccione Sección (Filtro)" 
                            value={selectedSectionId} 
                            onChange={handleSectionChange}
                            disabled={editMode}
                        >
                            <option value="">-- Seleccione el Grado/Sección --</option>
                            {allSections.map(sec => (
                                <option key={sec.id_section} value={sec.id_section}>
                                    {sec.Grade?.name_grade} - Sección "{sec.num_section}"
                                </option>
                            ))}
                        </CFormSelect>
                    </CCol>
                </CRow>

                <CRow className="mb-3">
                    {/* 2. ESTUDIANTE */}
                    <CCol md={6}>
                        <CFormSelect 
                            label="2. Estudiante" 
                            name="id_student" 
                            value={formData.id_student}
                            onChange={(e) => setFormData({...formData, id_student: e.target.value})}
                            disabled={!selectedSectionId}
                        >
                            <option value="">-- Seleccione Estudiante --</option>
                            {filteredStudents.map(st => (
                                <option key={st.id_student} value={st.id_student}>
                                    {st.first_name} {st.last_name} ({st.dni})
                                </option>
                            ))}
                        </CFormSelect>
                    </CCol>

                    {/* 3. HORARIO */}
                    <CCol md={6}>
                        <CFormSelect 
                            label="3. Materia y Horario" 
                            name="id_class_schedules" 
                            value={formData.id_class_schedules}
                            onChange={handleScheduleChange}
                            disabled={!selectedSectionId}
                        >
                            <option value="">-- Seleccione Materia --</option>
                            {filteredSchedules.map(sch => (
                                <option key={sch.id_class_schedules} value={sch.id_class_schedules}>
                                    {sch.Subject?.name_subject} ({sch.day_of_week} {sch.start_time})
                                </option>
                            ))}
                        </CFormSelect>
                    </CCol>
                </CRow>

                <CRow className="mb-3">
                    <CCol md={6}>
                        <CFormInput 
                            type="date" 
                            label="4. Fecha de la Evaluación" 
                            name="evaluation_date" 
                            value={formData.evaluation_date}
                            onChange={handleDateChange}
                            invalid={!!errors.evaluation_date}
                        />
                        {/* MENSAJE DE AYUDA INTELIGENTE */}
                        {requiredDay && !errors.evaluation_date && (
                            <div className="text-info small mt-1">
                                ℹ️ Esta materia se ve los <strong>{requiredDay}</strong>. Elige una fecha que coincida.
                            </div>
                        )}
                        {errors.evaluation_date && <div className="text-danger small mt-1">{errors.evaluation_date}</div>}
                    </CCol>
                    
                    <CCol md={6}>
                        <CFormSelect 
                            label="5. Tipo de Evaluación" 
                            name="evaluation_type" 
                            value={formData.evaluation_type}
                            onChange={(e) => setFormData({...formData, evaluation_type: e.target.value})}
                        >
                            <option value="">-- Tipo --</option>
                            <option value="formative">Formativa (Tarea/Taller)</option>
                            <option value="summative">Sumativa (Examen/Proyecto)</option>
                        </CFormSelect>
                    </CCol>
                </CRow>

                <CRow className="mb-3">
                    <CCol md={6}>
                        <CFormInput 
                            type="number" 
                            label="Nota del Estudiante (Obtenida)" 
                            name="score" 
                            value={formData.score} 
                            onChange={(e) => setFormData({...formData, score: e.target.value})} 
                        />
                    </CCol>
                    <CCol md={6}>
                        <CFormInput 
                            type="number" 
                            label="Valor Total de la Evaluación (Máxima)" 
                            name="max_score" 
                            value={formData.max_score} 
                            onChange={(e) => setFormData({...formData, max_score: e.target.value})} 
                        />
                    </CCol>
                </CRow>

                <CFormTextarea label="Observaciones" rows={2} value={formData.observations} onChange={(e) => setFormData({...formData, observations: e.target.value})} />
            </CForm>
        </CModalBody>
        <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
            <CButton color="success" onClick={handleSave} disabled={isSaving || !!errors.evaluation_date}>Guardar Nota</CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL BORRAR */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
            <CModalHeader><CModalTitle>Confirmar</CModalTitle></CModalHeader>
            <CModalBody>¿Seguro que desea eliminar esta nota?</CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>No</CButton>
                <CButton color="danger" onClick={confirmDelete}>Sí, Eliminar</CButton>
            </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default Evaluations;