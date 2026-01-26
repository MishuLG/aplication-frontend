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
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCheckCircle, cilPencil, cilTrash } from '@coreui/icons';
import API_URL from '../../../config';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  // Datos maestros
  const [allStudents, setAllStudents] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  
  // Datos filtrados para el formulario
  const [availableStudents, setAvailableStudents] = useState([]); 

  const [formData, setFormData] = useState({
    id_student: '',
    id_section: '',
    attendance_date: new Date().toISOString().split('T')[0], 
    status: 'Presente',
    remarks: '',
  });

  // UI States
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [filter, setFilter] = useState({ studentName: '', date: '' });

  // Feedback
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // URLs
  const attendanceUrl = `${API_URL}/attendance`;
  const studentsUrl = `${API_URL}/students`; 
  const sectionsUrl = `${API_URL}/sections`; 

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Efecto: Filtro dinámico de estudiantes al cambiar sección
  useEffect(() => {
    if (formData.id_section) {
        const filtered = allStudents.filter(s => String(s.id_section) === String(formData.id_section));
        setAvailableStudents(filtered);
    } else {
        setAvailableStudents([]);
    }
  }, [formData.id_section, allStudents]);

  // --- HELPER AUTENTICACIÓN ---
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
      const [resAtt, resSec, resStu] = await Promise.all([
          authenticatedFetch(attendanceUrl),
          authenticatedFetch(sectionsUrl),
          authenticatedFetch(studentsUrl)
      ]);

      if (resAtt.ok) setAttendanceRecords(await resAtt.json());
      if (resSec.ok) setSectionsList(await resSec.json());
      if (resStu.ok) setAllStudents(await resStu.json());

    } catch (error) {
      console.error(error);
      setAlertBox('Error de conexión al cargar datos.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.id_section) newErrors.id_section = 'Seleccione una sección.';
    if (!formData.id_student) newErrors.id_student = 'Seleccione un estudiante.';
    if (!formData.attendance_date) newErrors.attendance_date = 'Fecha requerida.';
    if (!formData.status) newErrors.status = 'Estado requerido.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    
    try {
      const method = editMode ? 'PUT' : 'POST';
      const idParam = selectedAttendance ? (selectedAttendance.attendance_id || selectedAttendance.id_attendance) : '';
      const url = editMode ? `${attendanceUrl}/${idParam}` : attendanceUrl;

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Error al guardar.');

      const resAtt = await authenticatedFetch(attendanceUrl);
      if (resAtt.ok) setAttendanceRecords(await resAtt.json());
      
      handleCloseModal();
    } catch (error) {
      setAlertBox(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
        const idParam = idToDelete.attendance_id || idToDelete.id_attendance;
        const res = await authenticatedFetch(`${attendanceUrl}/${idParam}`, { method: 'DELETE' });
        if(res.ok) {
            setAttendanceRecords(prev => prev.filter(a => 
                (a.attendance_id || a.id_attendance) !== (idToDelete.attendance_id || idToDelete.id_attendance)
            ));
            setShowDeleteModal(false);
        } else {
            alert("Error al eliminar");
        }
    } catch (e) { alert("Error de conexión"); }
  };

  const handleEdit = (item) => {
    setSelectedAttendance(item);
    setFormData({
      id_section: item.Section?.id_section || item.id_section || '',
      id_student: item.Student?.id_student || item.id_student || '',
      attendance_date: item.attendance_date || '',
      status: item.status || 'Presente',
      remarks: item.observations || item.remarks || ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({
        id_student: '',
        id_section: '',
        attendance_date: new Date().toISOString().split('T')[0],
        status: 'Presente',
        remarks: '',
    });
    setErrors({});
    setAlertBox(null);
  };

  const filteredRecords = attendanceRecords.filter(item => {
      const name = item.Student ? `${item.Student.first_name} ${item.Student.last_name}` : '';
      const matchName = name.toLowerCase().includes(filter.studentName.toLowerCase());
      const matchDate = filter.date ? item.attendance_date === filter.date : true;
      return matchName && matchDate;
  });

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 text-body"><CIcon icon={cilCheckCircle} className="me-2"/>Control de Asistencia</h5>
        <CButton color="primary" onClick={() => { handleCloseModal(); setShowModal(true); }}>
          Registrar Asistencia
        </CButton>
      </CCardHeader>
      
      <CCardBody>
        <div className="d-flex gap-3 mb-4">
            <CFormInput 
                placeholder="Buscar estudiante..." 
                value={filter.studentName}
                onChange={e => setFilter({...filter, studentName: e.target.value})}
                style={{maxWidth: '300px'}}
            />
            <CFormInput 
                type="date"
                value={filter.date}
                onChange={e => setFilter({...filter, date: e.target.value})}
                style={{maxWidth: '200px'}}
            />
        </div>

        <CTable hover responsive align="middle">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Fecha</CTableHeaderCell>
              <CTableHeaderCell>Estudiante</CTableHeaderCell>
              <CTableHeaderCell>Sección</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Observación</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredRecords.map((item, idx) => (
              <CTableRow key={idx}>
                <CTableDataCell className="text-body-secondary small">{item.attendance_date}</CTableDataCell>
                <CTableDataCell>
                    {item.Student ? (
                        <span className="fw-semibold">{item.Student.first_name} {item.Student.last_name}</span>
                    ) : <span className="text-danger small">Estudiante eliminado</span>}
                </CTableDataCell>
                <CTableDataCell>
                    {item.Section ? (
                        <CBadge color="light" textColor="dark" className="border">
                            {item.Section.Grade?.name_grade} "{item.Section.num_section}"
                        </CBadge>
                    ) : '-'}
                </CTableDataCell>
                <CTableDataCell>
                    <CBadge color={
                        item.status === 'Presente' ? 'success' : 
                        item.status === 'Ausente' ? 'danger' : 'warning'
                    }>
                        {item.status}
                    </CBadge>
                </CTableDataCell>
                <CTableDataCell className="small text-body-secondary text-truncate" style={{maxWidth: '200px'}}>
                    {item.observations || '-'}
                </CTableDataCell>
                <CTableDataCell className="text-end">
                    <CButton size="sm" color="warning" variant="ghost" onClick={() => handleEdit(item)} className="me-2"><CIcon icon={cilPencil}/></CButton>
                    <CButton size="sm" color="danger" variant="ghost" onClick={() => { setIdToDelete(item); setShowDeleteModal(true); }}><CIcon icon={cilTrash}/></CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
            {filteredRecords.length === 0 && (
                <CTableRow><CTableDataCell colSpan="6" className="text-center text-body-secondary py-4">No hay registros de asistencia.</CTableDataCell></CTableRow>
            )}
          </CTableBody>
        </CTable>
      </CCardBody>

      {/* MODAL */}
      <CModal visible={showModal} onClose={handleCloseModal} backdrop="static" size="lg">
        <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Asistencia' : 'Nueva Asistencia'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
            {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
            <CForm>
                <CRow className="mb-3">
                    <CCol md={6}>
                        <CFormSelect 
                            label="1. Seleccione Sección" 
                            name="id_section" 
                            value={formData.id_section} 
                            onChange={handleInputChange}
                            invalid={!!errors.id_section}
                        >
                            <option value="">-- Sección --</option>
                            {sectionsList.map(s => (
                                <option key={s.id_section} value={s.id_section}>
                                    {s.Grade?.name_grade} "{s.num_section}"
                                </option>
                            ))}
                        </CFormSelect>
                        {errors.id_section && <div className="text-danger small">{errors.id_section}</div>}
                    </CCol>
                    <CCol md={6}>
                        <CFormInput 
                            type="date" 
                            label="Fecha" 
                            name="attendance_date" 
                            value={formData.attendance_date} 
                            onChange={handleInputChange}
                        />
                    </CCol>
                </CRow>

                <div className="mb-3">
                    <label className="form-label">2. Seleccione Estudiante</label>
                    <CFormSelect 
                        name="id_student"
                        value={formData.id_student}
                        onChange={handleInputChange}
                        disabled={!formData.id_section}
                        invalid={!!errors.id_student}
                    >
                        <option value="">-- {formData.id_section ? 'Estudiante' : 'Primero elija sección'} --</option>
                        {availableStudents.map(st => (
                            <option key={st.id_student} value={st.id_student}>
                                {st.first_name} {st.last_name} (C.I: {st.dni})
                            </option>
                        ))}
                    </CFormSelect>
                    {errors.id_student && <div className="text-danger small">{errors.id_student}</div>}
                    {formData.id_section && availableStudents.length === 0 && (
                        <div className="text-warning small mt-1">Esta sección no tiene estudiantes inscritos.</div>
                    )}
                </div>

                <div className="mb-3">
                    <CFormSelect label="Estado" name="status" value={formData.status} onChange={handleInputChange}>
                        <option value="Presente">Presente</option>
                        <option value="Ausente">Ausente</option>
                        <option value="Retardo">Retardo</option>
                        <option value="Justificado">Justificado</option>
                    </CFormSelect>
                </div>

                <div className="mb-3">
                    <CFormTextarea label="Observación (Opcional)" name="remarks" value={formData.remarks} onChange={handleInputChange} rows={3} />
                </div>
            </CForm>
        </CModalBody>
        <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
            <CButton color="primary" onClick={handleSave} disabled={isSaving}>Guardar</CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL BORRAR */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static" alignment="center">
        <CModalHeader><CModalTitle>Confirmar</CModalTitle></CModalHeader>
        <CModalBody>¿Seguro que desea eliminar este registro?</CModalBody>
        <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>No</CButton>
            <CButton color="danger" onClick={handleDelete}>Sí, Eliminar</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default Attendance;