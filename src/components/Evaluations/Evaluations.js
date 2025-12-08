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
  CRow,
  CCol,
} from '@coreui/react';
import API_URL from '../../../config';

const Evaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  
  // Listas para los Selects (Cargadas desde la BD)
  const [studentsList, setStudentsList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [schedulesList, setSchedulesList] = useState([]);

  const [formData, setFormData] = useState({
    id_student: '',
    id_subject: '',
    id_class_schedules: '', // IMPORTANTE: Este campo es obligatorio para evitar el error 23502
    evaluation_date: '',
    evaluation_type: '',
    score: '',
    max_score: '',
    total_grade: '',
    observations: '',
  });

  // Estados de la Interfaz
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [filter, setFilter] = useState({ id_student: '', evaluation_type: '' });

  // Estados de Validación y Alertas
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para el Modal de Borrado
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const evaluationsUrl = `${API_URL}/evaluations`;

  // Campos que NO pueden estar vacíos
  const requiredFields = [
    'id_student', 
    'id_subject', 
    'id_class_schedules', // Validamos que el horario esté presente
    'evaluation_date', 
    'evaluation_type', 
    'score', 
    'max_score'
  ];

  useEffect(() => {
    fetchEvaluations();
    fetchDropdownData();
  }, []);

  // --- 1. CARGA DE DATOS ---

  const fetchEvaluations = async () => {
    try {
      const response = await fetch(evaluationsUrl);
      if (!response.ok) throw new Error('Error de red al cargar evaluaciones');
      const data = await response.json();
      setEvaluations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAlertBox('No se pudieron cargar las evaluaciones.');
    }
  };

  const fetchDropdownData = async () => {
      // Cargar listas auxiliares para llenar los selects
      try {
          const resSt = await fetch(`${API_URL}/students`);
          if (resSt.ok) setStudentsList(await resSt.json());
          
          const resSub = await fetch(`${API_URL}/subjects`);
          if (resSub.ok) setSubjectsList(await resSub.json());

          const resSch = await fetch(`${API_URL}/class_schedules`);
          if (resSch.ok) setSchedulesList(await resSch.json());
      } catch (e) { console.error("Error cargando listas auxiliares"); }
  };

  // --- 2. VALIDACIONES ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Validación numérica para notas
    if (['score', 'max_score', 'total_grade'].includes(name)) {
         newValue = value.replace(/[^0-9.]/g, ''); // Solo permitir números y punto decimal
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Limpiar el error visual si el usuario ya corrigió el campo
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
    }
    setAlertBox(null);
  };

  // Validar al salir del campo
  const handleBlur = (e) => {
      const { name, value } = e.target;
      if (requiredFields.includes(name) && !value) {
          setErrors(prev => ({ ...prev, [name]: 'Este campo es obligatorio.' }));
      }
  };

  const validateForm = () => {
      const newErrors = {};
      let isValid = true;

      // a) Verificar campos obligatorios vacíos
      requiredFields.forEach(field => {
          if (!formData[field] || String(formData[field]).trim() === '') {
              newErrors[field] = 'Este campo es obligatorio.';
              isValid = false;
          }
      });

      // b) Validar que Nota <= Nota Máxima
      if (formData.score && formData.max_score) {
          if (parseFloat(formData.score) > parseFloat(formData.max_score)) {
              newErrors.score = 'La nota no puede ser mayor a la nota máxima.';
              isValid = false;
          }
      }
      
      // c) Validar Fecha Futura
      if (formData.evaluation_date) {
          const d = new Date(formData.evaluation_date);
          const today = new Date();
          today.setHours(0,0,0,0);
          if (d > today) {
              newErrors.evaluation_date = 'No se puede registrar una fecha futura.';
              isValid = false;
          }
      }

      setErrors(newErrors);
      if (!isValid) setAlertBox('Por favor, corrija los errores marcados en rojo.');
      return isValid;
  };

  // --- 3. OPERACIONES CRUD ---

  const handleSave = async () => {
    // Si hay errores de validación, detenemos aquí.
    if (!validateForm()) return;

    setIsSaving(true);
    setAlertBox(null);

    // Formatear datos para el backend
    const payload = {
        ...formData,
        id_student: parseInt(formData.id_student),
        id_subject: parseInt(formData.id_subject),
        id_class_schedules: parseInt(formData.id_class_schedules), // Obligatorio para evitar error 23502
        score: parseFloat(formData.score),
        max_score: parseFloat(formData.max_score),
        total_grade: formData.total_grade ? parseFloat(formData.total_grade) : 0
    };

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${evaluationsUrl}/${selectedEvaluation.id_evaluation}` : evaluationsUrl;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Mostrar mensaje de error específico del backend (ej. Duplicado)
        throw new Error(data.message || 'Error al guardar.');
      }

      await fetchEvaluations();
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
        const res = await fetch(`${evaluationsUrl}/${idToDelete}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar.');
        await fetchEvaluations();
        setShowDeleteModal(false);
    } catch (error) {
        setAlertBox('No se pudo eliminar el registro.');
        setShowDeleteModal(false);
    } finally {
        setIsDeleting(false);
    }
  };

  // --- 4. HELPERS DE INTERFAZ ---

  const handleEdit = (ev) => {
    setSelectedEvaluation(ev);
    setFormData({
      id_student: ev.id_student,
      id_subject: ev.id_subject,
      id_class_schedules: ev.id_class_schedules || '',
      evaluation_date: ev.evaluation_date || '',
      evaluation_type: ev.evaluation_type || '',
      score: ev.score,
      max_score: ev.max_score,
      total_grade: ev.total_grade || '',
      observations: ev.observations || '',
    });
    setEditMode(true);
    setErrors({});
    setAlertBox(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Resetear formulario
    setFormData({
      id_student: '', id_subject: '', id_class_schedules: '',
      evaluation_date: '', evaluation_type: '', score: '', max_score: '',
      total_grade: '', observations: ''
    });
    setEditMode(false);
    setSelectedEvaluation(null);
    setErrors({});
    setAlertBox(null);
  };

  // Función para mostrar el texto de error debajo del input
  const renderError = (field) => {
      if (!errors[field]) return null;
      return <div style={{color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem'}}>{errors[field]}</div>;
  };

  // Filtros de búsqueda en la tabla
  const filteredList = evaluations.filter(e => {
      const typeMatch = (e.evaluation_type || '').toLowerCase().includes(filter.evaluation_type.toLowerCase());
      // Buscar por ID de estudiante
      const studentMatch = String(e.id_student).includes(filter.id_student);
      return typeMatch && studentMatch;
  });

  // Funciones para obtener nombres legibles en la tabla usando las listas cargadas
  const getStudentName = (id) => {
      const s = studentsList.find(i => i.id_student === id);
      return s ? `${s.first_name_student} ${s.last_name_student}` : id;
  };
  const getSubjectName = (id) => {
      const s = subjectsList.find(i => i.id_subject === id);
      return s ? s.name_subject || s.subject_name : id;
  };

  return (
    <CCard>
      <CCardHeader>
        <h5>Evaluaciones</h5>
        <CButton color="success" onClick={() => { handleCloseModal(); setShowModal(true); }}>Agregar Evaluación</CButton>
      </CCardHeader>
      <CCardBody>
        {alertBox && !showModal && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}
        
        <div className="mb-3 d-flex gap-2">
            <CFormInput 
                placeholder="Filtrar por ID Estudiante" 
                value={filter.id_student} 
                onChange={e=>setFilter({...filter, id_student: e.target.value})} 
                style={{maxWidth: '200px'}}
            />
            <CFormInput 
                placeholder="Filtrar por Tipo" 
                value={filter.evaluation_type} 
                onChange={e=>setFilter({...filter, evaluation_type: e.target.value})} 
                style={{maxWidth: '200px'}}
            />
        </div>

        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>Estudiante</CTableHeaderCell>
              <CTableHeaderCell>Materia</CTableHeaderCell>
              <CTableHeaderCell>Tipo</CTableHeaderCell>
              <CTableHeaderCell>Fecha</CTableHeaderCell>
              <CTableHeaderCell>Nota / Max</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredList.map((ev) => (
              <CTableRow key={ev.id_evaluation}>
                <CTableDataCell>{ev.id_evaluation}</CTableDataCell>
                <CTableDataCell>{getStudentName(ev.id_student)}</CTableDataCell>
                <CTableDataCell>{getSubjectName(ev.id_subject)}</CTableDataCell>
                <CTableDataCell>{ev.evaluation_type}</CTableDataCell>
                <CTableDataCell>{ev.evaluation_date}</CTableDataCell>
                <CTableDataCell>{ev.score} / {ev.max_score}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="warning" size="sm" onClick={() => handleEdit(ev)} className="me-2">Editar</CButton>
                  <CButton color="danger" size="sm" onClick={() => handleDeleteClick(ev.id_evaluation)}>Eliminar</CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
             {filteredList.length === 0 && <CTableRow><CTableDataCell colSpan="7" className="text-center">No hay registros.</CTableDataCell></CTableRow>}
          </CTableBody>
        </CTable>

        {/* --- MODAL DE ELIMINACIÓN --- */}
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static">
            <CModalHeader><CModalTitle>Confirmar Eliminación</CModalTitle></CModalHeader>
            <CModalBody>¿Está seguro de que desea eliminar esta evaluación? Esta acción no se puede deshacer.</CModalBody>
            <CModalFooter>
                <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>Eliminar</CButton>
                <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
            </CModalFooter>
        </CModal>

        {/* --- MODAL DE CREACIÓN / EDICIÓN --- */}
        <CModal visible={showModal} onClose={handleCloseModal} backdrop="static" size="lg">
          <CModalHeader><CModalTitle>{editMode ? 'Editar Evaluación' : 'Nueva Evaluación'}</CModalTitle></CModalHeader>
          <CModalBody>
            {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
            <CForm>
                <CRow className="mb-3">
                    <CCol md={6}>
                        {/* SELECT ESTUDIANTE */}
                        <CFormSelect 
                            label="Estudiante *" 
                            name="id_student" 
                            value={formData.id_student} 
                            onChange={handleInputChange} 
                            onBlur={handleBlur} 
                            invalid={!!errors.id_student}
                        >
                            <option value="">Seleccione un estudiante...</option>
                            {studentsList.map(s => (
                                <option key={s.id_student} value={s.id_student}>
                                    {s.first_name_student} {s.last_name_student}
                                </option>
                            ))}
                        </CFormSelect>
                        {renderError('id_student')}
                    </CCol>

                    <CCol md={6}>
                        {/* SELECT MATERIA */}
                        <CFormSelect 
                            label="Materia *" 
                            name="id_subject" 
                            value={formData.id_subject} 
                            onChange={handleInputChange} 
                            onBlur={handleBlur} 
                            invalid={!!errors.id_subject}
                        >
                            <option value="">Seleccione una materia...</option>
                            {subjectsList.map(s => (
                                <option key={s.id_subject} value={s.id_subject}>
                                    {s.name_subject || s.subject_name}
                                </option>
                            ))}
                        </CFormSelect>
                        {renderError('id_subject')}
                    </CCol>
                </CRow>

                <CRow className="mb-3">
                    <CCol md={6}>
                        {/* SELECT TIPO DE EVALUACIÓN */}
                        <CFormSelect 
                            label="Tipo de Evaluación *" 
                            name="evaluation_type" 
                            value={formData.evaluation_type} 
                            onChange={handleInputChange} 
                            onBlur={handleBlur} 
                            invalid={!!errors.evaluation_type}
                        >
                            <option value="">Seleccione el tipo...</option>
                            <option value="Exam">Examen</option>
                            <option value="Homework">Tarea</option>
                            <option value="Project">Proyecto</option>
                            <option value="Participation">Participación</option>
                        </CFormSelect>
                        {renderError('evaluation_type')}
                    </CCol>
                    <CCol md={6}>
                        <CFormInput 
                            type="date" 
                            label="Fecha *" 
                            name="evaluation_date" 
                            value={formData.evaluation_date} 
                            onChange={handleInputChange} 
                            onBlur={handleBlur} 
                            invalid={!!errors.evaluation_date} 
                        />
                        {renderError('evaluation_date')}
                    </CCol>
                </CRow>

                <CRow className="mb-3">
                    <CCol md={4}>
                         <CFormInput 
                            type="number" 
                            label="Nota Obtenida *" 
                            name="score" 
                            value={formData.score} 
                            onChange={handleInputChange} 
                            onBlur={handleBlur} 
                            invalid={!!errors.score} 
                         />
                         {renderError('score')}
                    </CCol>
                    <CCol md={4}>
                         <CFormInput 
                            type="number" 
                            label="Nota Máxima *" 
                            name="max_score" 
                            value={formData.max_score} 
                            onChange={handleInputChange} 
                            onBlur={handleBlur} 
                            invalid={!!errors.max_score} 
                         />
                         {renderError('max_score')}
                    </CCol>
                    <CCol md={4}>
                         {/* SELECT HORARIO (CRÍTICO) */}
                        <CFormSelect 
                            label="Horario/Sección *" 
                            name="id_class_schedules" 
                            value={formData.id_class_schedules} 
                            onChange={handleInputChange} 
                            onBlur={handleBlur} 
                            invalid={!!errors.id_class_schedules}
                        >
                            <option value="">Seleccione un horario...</option>
                            {schedulesList.map(sch => (
                                <option key={sch.id_class_schedules} value={sch.id_class_schedules}>
                                    {sch.id_class_schedules} - {sch.day_of_week} ({sch.start_time})
                                </option>
                            ))}
                        </CFormSelect>
                        {renderError('id_class_schedules')}
                    </CCol>
                </CRow>

                <div className="mb-3">
                    <CFormTextarea 
                        label="Observaciones (Opcional)" 
                        name="observations" 
                        value={formData.observations} 
                        onChange={handleInputChange} 
                        rows={3} 
                    />
                </div>
                
                {/* Campo opcional de Nota Total si se requiere */}
                 {/* <CFormInput type="number" label="Total (Op.)" name="total_grade" value={formData.total_grade} onChange={handleInputChange} /> */}

            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSave} disabled={isSaving}>Guardar</CButton>
            <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};
export default Evaluations;