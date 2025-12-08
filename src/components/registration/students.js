import React, { useState, useEffect } from 'react';
import {
  CButton,
  CButtonGroup,
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
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons';
import API_URL from '../../../config';

const Students = () => {
  const [students, setStudents] = useState([]);
  
  // Listas para Selects
  const [tutorsList, setTutorsList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [schoolYearsList, setSchoolYearsList] = useState([]);
  const [usersList, setUsersList] = useState([]); // Para mapear nombres de tutores

  const [formData, setFormData] = useState({
    id_tutor: '',
    id_section: '',
    id_school_year: '',
    first_name_student: '',
    last_name_student: '',
    date_of_birth_student: '',
    health_record: '',
    gender: '',
    street: '',
    city: '',
    zip_code: '',
  });

  // UI States
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState({ first_name_student: '', id_section: '' });
  
  // Validaciones
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Borrado
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const studentsUrl = `${API_URL}/students`;

  // Campos requeridos
  const requiredFields = [
    'id_tutor',
    'id_section',
    'id_school_year',
    'first_name_student',
    'last_name_student',
    'date_of_birth_student',
    'gender',
    'street',
    'city',
    'zip_code',
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    // Cargar estudiantes y dependencias (Tutores, Usuarios para nombres, Secciones, Años)
    try {
        await fetchStudents();
        await fetchDependencies(`${API_URL}/tutors`, setTutorsList);
        await fetchDependencies(`${API_URL}/users`, setUsersList);
        await fetchDependencies(`${API_URL}/sections`, setSectionsList);
        await fetchDependencies(`${API_URL}/school_years`, setSchoolYearsList);
    } catch (error) {
        console.error("Error cargando datos iniciales:", error);
    }
  };

  const fetchDependencies = async (url, setter) => {
      try {
          const res = await fetch(url);
          if (res.ok) setter(await res.json());
      } catch (e) { console.error(`Error fetching ${url}`, e); }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(studentsUrl);
      if (!response.ok) throw new Error('Error al cargar estudiantes');
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      setAlertBox('Error al obtener la lista de estudiantes.');
    }
  };

  // --- VALIDACIONES ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Solo letras para nombres y ciudad
    if (['first_name_student', 'last_name_student', 'city'].includes(name)) {
      newValue = value.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g, '');
    }
    // Solo números y guiones para CP
    if (name === 'zip_code') {
      newValue = value.replace(/[^\d\-]/g, '');
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    
    // Limpiar error al escribir
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    setAlertBox(null);
  };

  const handleBlur = (e) => {
      const { name, value } = e.target;
      if (requiredFields.includes(name) && !value.trim()) {
          setErrors(prev => ({ ...prev, [name]: 'Este campo es obligatorio.' }));
      }
      
      // Validación de edad (ej. 3 años)
      if (name === 'date_of_birth_student' && value) {
          const dob = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
          
          if (age < 3) setErrors(prev => ({ ...prev, date_of_birth_student: 'Edad mínima: 3 años.' }));
          if (dob > today) setErrors(prev => ({ ...prev, date_of_birth_student: 'Fecha inválida.' }));
      }
  };

  const validateForm = () => {
      const newErrors = {};
      let isValid = true;

      requiredFields.forEach(field => {
          if (!formData[field] || String(formData[field]).trim() === '') {
              newErrors[field] = 'Este campo es obligatorio.';
              isValid = false;
          }
      });

      // Validación final de edad
      if (formData.date_of_birth_student) {
          const dob = new Date(formData.date_of_birth_student);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          if (age < 3) {
              newErrors.date_of_birth_student = 'Edad mínima: 3 años.';
              isValid = false;
          }
      }

      setErrors(newErrors);
      if (!isValid) setAlertBox('Por favor, corrija los errores del formulario.');
      return isValid;
  };

  // --- CRUD ---

  const handleSaveStudent = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    setAlertBox(null);

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${studentsUrl}/${selectedStudent.id_student}` : studentsUrl;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar.');
      }

      await fetchStudents();
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
        const res = await fetch(`${studentsUrl}/${idToDelete}`, { method: 'DELETE' });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Error al eliminar');
        }
        await fetchStudents();
        setShowDeleteModal(false);
    } catch (error) {
        setAlertBox(error.message);
        setShowDeleteModal(false);
    } finally {
        setIsDeleting(false);
    }
  };

  // --- UI Helpers ---

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      id_tutor: student.id_tutor || '',
      id_section: student.id_section || '',
      id_school_year: student.id_school_year || '',
      first_name_student: student.first_name_student,
      last_name_student: student.last_name_student,
      date_of_birth_student: student.date_of_birth_student ? student.date_of_birth_student.split('T')[0] : '',
      health_record: student.health_record || '',
      gender: student.gender || '',
      street: student.street || '',
      city: student.city || '',
      zip_code: student.zip_code || '',
    });
    setEditMode(true);
    setErrors({});
    setAlertBox(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      id_tutor: '', id_section: '', id_school_year: '',
      first_name_student: '', last_name_student: '', date_of_birth_student: '',
      health_record: '', gender: '', street: '', city: '', zip_code: '',
    });
    setEditMode(false);
    setSelectedStudent(null);
    setErrors({});
    setAlertBox(null);
  };

  const renderError = (field) => errors[field] ? <div style={{color: '#dc3545', fontSize: '0.8rem'}}>{errors[field]}</div> : null;

  // Helper para mostrar nombre del tutor en el Select (cruzando con la lista de usuarios)
  const getTutorLabel = (tutorId) => {
      const tutor = tutorsList.find(t => t.id_tutor === tutorId);
      if (!tutor) return `ID: ${tutorId}`;
      const user = usersList.find(u => u.uid_users === tutor.uid_users);
      return user ? `${user.first_name} ${user.last_name}` : `Tutor #${tutorId}`;
  };

  const filteredStudents = students.filter(s => 
      s.first_name_student.toLowerCase().includes(filter.first_name_student.toLowerCase())
  );

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="m-0">Estudiantes</h5>
        <CButton color="success" onClick={() => { handleCloseModal(); setShowModal(true); }}>
          <CIcon icon={cilPlus} className="me-2" /> Agregar
        </CButton>
      </CCardHeader>
      <CCardBody>
        {alertBox && !showModal && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}

        <div className="mb-3">
          <CFormInput
            placeholder="Buscar por nombre..."
            name="first_name_student"
            value={filter.first_name_student}
            onChange={(e) => setFilter({ ...filter, first_name_student: e.target.value })}
            style={{ maxWidth: '300px' }}
          />
        </div>

        <CTable hover responsive bordered>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>Nombre Completo</CTableHeaderCell>
              <CTableHeaderCell>Fecha Nac.</CTableHeaderCell>
              <CTableHeaderCell>Tutor</CTableHeaderCell>
              <CTableHeaderCell>Sección</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredStudents.map((s) => (
              <CTableRow key={s.id_student}>
                <CTableDataCell>{s.id_student}</CTableDataCell>
                <CTableDataCell>{s.first_name_student} {s.last_name_student}</CTableDataCell>
                <CTableDataCell>{s.date_of_birth_student}</CTableDataCell>
                <CTableDataCell>{getTutorLabel(s.id_tutor)}</CTableDataCell>
                <CTableDataCell>{s.id_section}</CTableDataCell>
                <CTableDataCell>
                  <CButtonGroup size="sm">
                    <CButton color="warning" variant="outline" onClick={() => handleEditStudent(s)}><CIcon icon={cilPencil} /></CButton>
                    <CButton color="danger" variant="outline" onClick={() => handleDeleteClick(s.id_student)}><CIcon icon={cilTrash} /></CButton>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        {/* Modal Delete */}
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static">
            <CModalHeader><CModalTitle>Confirmar</CModalTitle></CModalHeader>
            <CModalBody>¿Eliminar este estudiante? Esta acción borrará sus notas y asistencias.</CModalBody>
            <CModalFooter>
                <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>Eliminar</CButton>
                <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
            </CModalFooter>
        </CModal>

        {/* Modal Form */}
        <CModal visible={showModal} onClose={handleCloseModal} backdrop="static" size="lg">
          <CModalHeader><CModalTitle>{editMode ? 'Editar' : 'Nuevo'} Estudiante</CModalTitle></CModalHeader>
          <CModalBody>
            {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
            <CForm>
                <CRow className="mb-3">
                    <CCol md={4}>
                        <CFormSelect label="Tutor *" name="id_tutor" value={formData.id_tutor} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.id_tutor}>
                            <option value="">Seleccione Tutor...</option>
                            {tutorsList.map(t => <option key={t.id_tutor} value={t.id_tutor}>{getTutorLabel(t.id_tutor)}</option>)}
                        </CFormSelect>
                        {renderError('id_tutor')}
                    </CCol>
                    <CCol md={4}>
                        <CFormSelect label="Sección *" name="id_section" value={formData.id_section} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.id_section}>
                            <option value="">Seleccione Sección...</option>
                            {sectionsList.map(s => <option key={s.id_section} value={s.id_section}>Sección {s.num_section}</option>)}
                        </CFormSelect>
                        {renderError('id_section')}
                    </CCol>
                    <CCol md={4}>
                        <CFormSelect label="Año Escolar *" name="id_school_year" value={formData.id_school_year} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.id_school_year}>
                            <option value="">Seleccione Año...</option>
                            {schoolYearsList.map(y => <option key={y.id_school_year} value={y.id_school_year}>{y.school_grade} ({y.start_year})</option>)}
                        </CFormSelect>
                        {renderError('id_school_year')}
                    </CCol>
                </CRow>

                <CRow className="mb-3">
                    <CCol md={6}>
                        <CFormInput label="Nombre *" name="first_name_student" value={formData.first_name_student} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.first_name_student} />
                        {renderError('first_name_student')}
                    </CCol>
                    <CCol md={6}>
                        <CFormInput label="Apellido *" name="last_name_student" value={formData.last_name_student} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.last_name_student} />
                        {renderError('last_name_student')}
                    </CCol>
                </CRow>

                <CRow className="mb-3">
                    <CCol md={6}>
                        <CFormInput type="date" label="Fecha Nacimiento *" name="date_of_birth_student" value={formData.date_of_birth_student} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.date_of_birth_student} />
                        {renderError('date_of_birth_student')}
                    </CCol>
                    <CCol md={6}>
                        <CFormSelect label="Género *" name="gender" value={formData.gender} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.gender}>
                            <option value="">Seleccione...</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </CFormSelect>
                        {renderError('gender')}
                    </CCol>
                </CRow>

                <CRow className="mb-3">
                    <CCol md={5}><CFormInput label="Calle *" name="street" value={formData.street} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.street} />{renderError('street')}</CCol>
                    <CCol md={4}><CFormInput label="Ciudad *" name="city" value={formData.city} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.city} />{renderError('city')}</CCol>
                    <CCol md={3}><CFormInput label="C.P. *" name="zip_code" value={formData.zip_code} onChange={handleInputChange} onBlur={handleBlur} invalid={!!errors.zip_code} />{renderError('zip_code')}</CCol>
                </CRow>

                <CFormTextarea label="Historial Médico" name="health_record" value={formData.health_record} onChange={handleInputChange} rows={2} />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveStudent} disabled={isSaving}>Guardar</CButton>
            <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Students;