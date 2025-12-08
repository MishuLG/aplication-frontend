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

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  // Estados para las listas desplegables (Dropdowns)
  const [studentsList, setStudentsList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);

  const [formData, setFormData] = useState({
    id_student: '',
    id_section: '',
    attendance_date: '',
    status: '',
    remarks: '',
  });

  // Estados de UI
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [filter, setFilter] = useState({ id_student: '', attendance_date: '' });

  // Estados de Validación y Feedback
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para Modal de Eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const attendanceUrl = `${API_URL}/attendance`;
  const studentsUrl = `${API_URL}/students`; // Asumiendo que esta ruta existe
  const sectionsUrl = `${API_URL}/sections`; // Asumiendo que esta ruta existe

  const requiredFields = ['id_student', 'id_section', 'attendance_date', 'status'];

  useEffect(() => {
    fetchAttendanceRecords();
    fetchStudents();
    fetchSections();
  }, []);

  // --- Funciones de Carga de Datos ---

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch(attendanceUrl);
      if (!response.ok) throw new Error('Error al cargar asistencias');
      const data = await response.json();
      setAttendanceRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAlertBox('Error al cargar los registros de asistencia.');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(studentsUrl);
      if (response.ok) {
        const data = await response.json();
        setStudentsList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error cargando estudiantes:", error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch(sectionsUrl);
      if (response.ok) {
        const data = await response.json();
        setSectionsList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error cargando secciones:", error);
    }
  };

  // --- Validaciones y Manejo de Inputs ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setAlertBox(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (requiredFields.includes(name) && String(value || '').trim() === '') {
      setErrors((prev) => ({ ...prev, [name]: 'Este campo es obligatorio.' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!formData[field] || String(formData[field]).trim() === '') {
        newErrors[field] = 'Este campo es obligatorio.';
        isValid = false;
      }
    });

    // Validación de fecha futura
    if (formData.attendance_date) {
        const date = new Date(formData.attendance_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date > today) {
            newErrors.attendance_date = 'La fecha no puede ser futura.';
            isValid = false;
        }
    }

    setErrors(newErrors);
    if (!isValid) setAlertBox('Por favor, completa los campos requeridos.');
    return isValid;
  };

  // --- CRUD Operations ---

  const handleSaveAttendance = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setAlertBox(null);

    const payload = {
        id_student: parseInt(formData.id_student),
        id_section: parseInt(formData.id_section),
        attendance_date: formData.attendance_date,
        status: formData.status,
        remarks: formData.remarks 
    };

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${attendanceUrl}/${selectedAttendance.id_attendance}` : attendanceUrl;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar.');
      }

      await fetchAttendanceRecords();
      handleCloseModal();
    } catch (error) {
      console.error(error);
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
      const response = await fetch(`${attendanceUrl}/${idToDelete}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar.');
      
      await fetchAttendanceRecords();
      setShowDeleteModal(false);
      setIdToDelete(null);
    } catch (error) {
      setAlertBox('No se pudo eliminar el registro.');
      setShowDeleteModal(false); 
    } finally {
      setIsDeleting(false);
    }
  };

  // --- UI Helpers ---

  const handleEdit = (attendance) => {
    setSelectedAttendance(attendance);
    setFormData({
      id_student: attendance.id_student || '',
      id_section: attendance.id_section || '',
      attendance_date: attendance.attendance_date || '',
      status: attendance.status || '',
      remarks: attendance.remarks || '',
    });
    setEditMode(true);
    setErrors({});
    setAlertBox(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      id_student: '',
      id_section: '',
      attendance_date: '',
      status: '',
      remarks: '',
    });
    setEditMode(false);
    setSelectedAttendance(null);
    setErrors({});
    setAlertBox(null);
  };

  const renderErrorText = (field) => {
    if (!errors[field]) return null;
    return <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem' }}>{errors[field]}</div>;
  };

  // Filtros en la tabla
  const filteredRecords = attendanceRecords.filter((attendance) => {
    // Buscamos el nombre del estudiante en la lista cargada para filtrar por nombre (más amigable) o por ID
    const studentObj = studentsList.find(s => s.id_student === attendance.id_student);
    const studentName = studentObj ? `${studentObj.first_name_student} ${studentObj.last_name_student}` : '';
    
    const searchLower = filter.id_student.toLowerCase();
    
    const studentMatch = 
        String(attendance.id_student).includes(searchLower) || 
        studentName.toLowerCase().includes(searchLower);

    const dateMatch = (attendance.attendance_date || '').includes(filter.attendance_date);
    return studentMatch && dateMatch;
  });

  // Función auxiliar para obtener nombre del estudiante por ID para la tabla
  const getStudentName = (id) => {
      const s = studentsList.find(item => item.id_student === id);
      return s ? `${s.first_name_student} ${s.last_name_student}` : id;
  };

  // Función auxiliar para obtener nombre de la sección por ID para la tabla
  const getSectionName = (id) => {
      const s = sectionsList.find(item => item.id_section === id);
      return s ? `Sección ${s.num_section}` : id;
  };

  return (
    <CCard>
      <CCardHeader>
        <h5>Registros de Asistencia</h5>
        <CButton color="success" onClick={() => { handleCloseModal(); setShowModal(true); }}>
          Agregar Registro
        </CButton>
      </CCardHeader>
      <CCardBody>
        {alertBox && !showModal && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}

        <div className="mb-3 d-flex gap-2">
          <CFormInput
            placeholder="Buscar por estudiante..."
            name="id_student"
            value={filter.id_student}
            onChange={(e) => setFilter({ ...filter, id_student: e.target.value })}
            style={{ maxWidth: '250px' }}
          />
          <CFormInput
            type="date"
            name="attendance_date"
            value={filter.attendance_date}
            onChange={(e) => setFilter({ ...filter, attendance_date: e.target.value })}
            style={{ maxWidth: '200px' }}
          />
        </div>

        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Estudiante</CTableHeaderCell>
              <CTableHeaderCell>Sección</CTableHeaderCell>
              <CTableHeaderCell>Fecha</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Observaciones</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredRecords.map((attendance) => (
              <CTableRow key={attendance.id_attendance}>
                <CTableDataCell>{getStudentName(attendance.id_student)}</CTableDataCell>
                <CTableDataCell>{getSectionName(attendance.id_section)}</CTableDataCell>
                <CTableDataCell>{attendance.attendance_date}</CTableDataCell>
                <CTableDataCell>{attendance.status}</CTableDataCell>
                <CTableDataCell>{attendance.remarks}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="warning" size="sm" onClick={() => handleEdit(attendance)} className="me-2">
                    Editar
                  </CButton>
                  <CButton color="danger" size="sm" onClick={() => handleDeleteClick(attendance.id_attendance)}>
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
             {filteredRecords.length === 0 && (
                <CTableRow>
                    <CTableDataCell colSpan="6" className="text-center">No se encontraron registros.</CTableDataCell>
                </CTableRow>
            )}
          </CTableBody>
        </CTable>

        {/* --- MODAL DE ELIMINACIÓN --- */}
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static">
          <CModalHeader>
            <CModalTitle>Confirmar Eliminación</CModalTitle>
          </CModalHeader>
          <CModalBody>¿Eliminar este registro de asistencia?</CModalBody>
          <CModalFooter>
            <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>Eliminar</CButton>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancelar</CButton>
          </CModalFooter>
        </CModal>

        {/* --- MODAL DE EDICIÓN / CREACIÓN --- */}
        <CModal visible={showModal} onClose={handleCloseModal} backdrop="static">
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Asistencia' : 'Nueva Asistencia'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
            <CForm>
              <CRow className="mb-3">
                <CCol md={6}>
                    {/* SELECT PARA ESTUDIANTES */}
                    <CFormSelect
                        label="Estudiante *"
                        name="id_student"
                        value={formData.id_student}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        invalid={!!errors.id_student}
                    >
                        <option value="">Seleccionar Estudiante</option>
                        {studentsList.map(student => (
                            <option key={student.id_student} value={student.id_student}>
                                {student.first_name_student} {student.last_name_student} ({student.id_student})
                            </option>
                        ))}
                    </CFormSelect>
                    {renderErrorText('id_student')}
                </CCol>

                <CCol md={6}>
                    {/* SELECT PARA SECCIONES */}
                    <CFormSelect
                        label="Sección *"
                        name="id_section"
                        value={formData.id_section}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        invalid={!!errors.id_section}
                    >
                         <option value="">Seleccionar Sección</option>
                        {sectionsList.map(section => (
                            <option key={section.id_section} value={section.id_section}>
                                Sección {section.num_section}
                            </option>
                        ))}
                    </CFormSelect>
                    {renderErrorText('id_section')}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                    <CFormInput
                        type="date"
                        label="Fecha *"
                        name="attendance_date"
                        value={formData.attendance_date}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        invalid={!!errors.attendance_date}
                    />
                    {renderErrorText('attendance_date')}
                </CCol>
                <CCol md={6}>
                    <CFormSelect
                        label="Estado *"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        invalid={!!errors.status}
                    >
                        <option value="">Seleccionar...</option>
                        <option value="Present">Presente</option>
                        <option value="Absent">Ausente</option>
                        <option value="Late">Tardanza</option>
                        <option value="Excused">Justificado</option>
                    </CFormSelect>
                    {renderErrorText('status')}
                </CCol>
              </CRow>

              <div className="mb-3">
                <CFormTextarea
                    label="Observaciones"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={3}
                />
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveAttendance} disabled={isSaving}>Guardar</CButton>
            <CButton color="secondary" onClick={handleCloseModal} disabled={isSaving}>Cancelar</CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Attendance;