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
  CAvatar,
  CBadge,
  CInputGroup,
  CInputGroupText
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilPlus, 
  cilPencil, 
  cilTrash, 
  cilPeople, 
  cilSearch, 
  cilSchool, 
  cilUser,
  cilMoodGood,
  cilMoodVeryGood
} from '@coreui/icons';
import API_URL from '../../../config';

const Students = () => {
  const [students, setStudents] = useState([]);
  
  // Listas para Selects
  const [tutorsList, setTutorsList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [schoolYearsList, setSchoolYearsList] = useState([]);
  const [usersList, setUsersList] = useState([]); 

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
  const [filter, setFilter] = useState({ first_name_student: '' });
  
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
    try {
        await fetchStudents();
        await fetchDependencies(`${API_URL}/tutors`, setTutorsList);
        await fetchDependencies(`${API_URL}/users`, setUsersList);
        await fetchDependencies(`${API_URL}/sections`, setSectionsList);
        await fetchDependencies(`${API_URL}/school_years`, setSchoolYearsList);
    } catch (error) { console.error(error); }
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
    } catch (error) { setAlertBox('Error al obtener la lista de estudiantes.'); }
  };

  // --- VALIDACIONES ---

  const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (['first_name_student', 'last_name_student', 'city'].includes(name)) {
      newValue = value.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g, '');
    }
    if (name === 'zip_code') {
      newValue = value.replace(/[^\d\-]/g, '');
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    setAlertBox(null);
  };

  const handleBlur = (e) => {
      const { name, value } = e.target;
      if (requiredFields.includes(name) && !value.trim()) {
          setErrors(prev => ({ ...prev, [name]: 'Este campo es obligatorio.' }));
      }
  };

  const validateForm = () => {
      const newErrors = {};
      let isValid = true;

      requiredFields.forEach(field => {
          if (!formData[field] || String(formData[field]).trim() === '') {
              newErrors[field] = 'Campo obligatorio.';
              isValid = false;
          }
      });

      if (formData.date_of_birth_student) {
          const age = calculateAge(formData.date_of_birth_student);
          const dob = new Date(formData.date_of_birth_student);
          const today = new Date();
          today.setHours(0,0,0,0);

          if (dob > today) {
              newErrors.date_of_birth_student = 'Fecha inválida.';
              isValid = false;
          } else if (age < 3) {
              newErrors.date_of_birth_student = 'Edad mínima: 3 años.';
              isValid = false;
          }
      }

      setErrors(newErrors);
      if (!isValid) setAlertBox('Por favor, corrija los errores.');
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

  const handleDeleteClick = (id) => { setIdToDelete(id); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
        const res = await fetch(`${studentsUrl}/${idToDelete}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar');
        await fetchStudents();
        setShowDeleteModal(false);
    } catch (error) {
        setAlertBox(error.message);
        setShowDeleteModal(false);
    } finally {
        setIsDeleting(false);
    }
  };

  // --- Helpers UI ---

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
    setEditMode(true); setErrors({}); setAlertBox(null); setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      id_tutor: '', id_section: '', id_school_year: '',
      first_name_student: '', last_name_student: '', date_of_birth_student: '',
      health_record: '', gender: '', street: '', city: '', zip_code: '',
    });
    setEditMode(false); setSelectedStudent(null); setErrors({}); setAlertBox(null);
  };

  // --- HELPERS VISUALES (Minimalismo) ---

  const getInitials = (name, lastname) => {
      return `${name?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

  const getTutorLabel = (tutorId) => {
      const tutor = tutorsList.find(t => t.id_tutor === tutorId);
      if (!tutor) return `ID: ${tutorId}`;
      const user = usersList.find(u => u.uid_users === tutor.uid_users);
      return user ? `${user.first_name} ${user.last_name}` : `Tutor #${tutorId}`;
  };

  const getSectionLabel = (sectionId) => {
      const sec = sectionsList.find(s => s.id_section === sectionId);
      return sec ? `Sección ${sec.num_section}` : sectionId;
  };

  const renderError = (field) => errors[field] ? <div style={{color: '#dc3545', fontSize: '0.8rem'}}>{errors[field]}</div> : null;

  const filteredStudents = students.filter(s => 
      s.first_name_student.toLowerCase().includes(filter.first_name_student.toLowerCase())
  );

  // Stats
  const totalStudents = students.length;
  const maleStudents = students.filter(s => s.gender === 'M').length;
  const femaleStudents = students.filter(s => s.gender === 'F').length;

  return (
    <div className="container-fluid mt-4">
      
      {/* --- KPI CARDS (Minimalista & Dark Mode friendly) --- */}
      <CRow className="mb-4">
          <CCol sm={4}>
              <CCard className="border-start-4 border-start-primary shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Total Estudiantes</div>
                          <div className="fs-4 fw-semibold text-body">{totalStudents}</div>
                      </div>
                      <CIcon icon={cilPeople} size="xl" className="text-primary" />
                  </CCardBody>
              </CCard>
          </CCol>
          <CCol sm={4}>
              <CCard className="border-start-4 border-start-info shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Niños</div>
                          <div className="fs-4 fw-semibold text-body">{maleStudents}</div>
                      </div>
                      <CIcon icon={cilMoodGood} size="xl" className="text-info" />
                  </CCardBody>
              </CCard>
          </CCol>
          <CCol sm={4}>
              <CCard className="border-start-4 border-start-danger shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Niñas</div>
                          <div className="fs-4 fw-semibold text-body">{femaleStudents}</div>
                      </div>
                      <CIcon icon={cilMoodVeryGood} size="xl" className="text-danger" />
                  </CCardBody>
              </CCard>
          </CCol>
      </CRow>

      {/* --- SECCIÓN PRINCIPAL --- */}
      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 text-body">Directorio Estudiantil</h5>
            <CButton color="success" onClick={() => { handleCloseModal(); setShowModal(true); }} className="d-flex align-items-center text-white">
              <CIcon icon={cilPlus} className="me-2" /> Nuevo Estudiante
            </CButton>
        </CCardHeader>
        
        <CCardBody>
            {alertBox && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}

            {/* Filtro Simple */}
            <div className="mb-4" style={{ maxWidth: '300px' }}>
                <CInputGroup>
                    <CInputGroupText className="bg-transparent text-medium-emphasis border-end-0">
                        <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                        className="bg-transparent border-start-0"
                        placeholder="Buscar por nombre..."
                        value={filter.first_name_student}
                        onChange={(e) => setFilter({ ...filter, first_name_student: e.target.value })}
                    />
                </CInputGroup>
            </div>

            {/* Tabla Moderna */}
            <CTable align="middle" className="mb-0 border" hover responsive striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{width: '60px'}}><CIcon icon={cilSchool} /></CTableHeaderCell>
                  <CTableHeaderCell>Estudiante</CTableHeaderCell>
                  <CTableHeaderCell>Información Académica</CTableHeaderCell>
                  <CTableHeaderCell>Tutor Asignado</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredStudents.map((s) => {
                    const age = s.date_of_birth_student ? calculateAge(s.date_of_birth_student) : 'N/A';
                    return (
                      <CTableRow key={s.id_student}>
                        <CTableDataCell className="text-center">
                            <CAvatar size="md" color={s.gender === 'F' ? 'danger' : 'info'} textColor="white">
                                {getInitials(s.first_name_student, s.last_name_student)}
                            </CAvatar>
                        </CTableDataCell>
                        <CTableDataCell>
                            <div className="fw-bold text-body">{s.first_name_student} {s.last_name_student}</div>
                            <div className="small text-medium-emphasis">Edad: {age} años</div>
                        </CTableDataCell>
                        <CTableDataCell>
                            <div className="text-body">{getSectionLabel(s.id_section)}</div>
                            <div className="small text-medium-emphasis">Año Escolar: {s.id_school_year}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                            <div className="d-flex align-items-center">
                                <CIcon icon={cilUser} className="me-2 text-medium-emphasis"/>
                                {getTutorLabel(s.id_tutor)}
                            </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          <CButton color="light" size="sm" variant="ghost" className="me-2" onClick={() => handleEditStudent(s)}>
                              <CIcon icon={cilPencil} className="text-warning"/>
                          </CButton>
                          <CButton color="light" size="sm" variant="ghost" onClick={() => handleDeleteClick(s.id_student)}>
                              <CIcon icon={cilTrash} className="text-danger"/>
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    );
                })}
                {filteredStudents.length === 0 && (
                    <CTableRow>
                        <CTableDataCell colSpan="5" className="text-center py-4 text-medium-emphasis">
                            No se encontraron estudiantes.
                        </CTableDataCell>
                    </CTableRow>
                )}
              </CTableBody>
            </CTable>
        </CCardBody>
      </CCard>

      {/* --- MODALES --- */}
      
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static" alignment="center">
          <CModalHeader><CModalTitle>Confirmar Eliminación</CModalTitle></CModalHeader>
          <CModalBody>¿Eliminar este estudiante? Se perderán sus notas y asistencias.</CModalBody>
          <CModalFooter>
              <CButton color="secondary" variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
              <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </CButton>
          </CModalFooter>
      </CModal>

      <CModal visible={showModal} onClose={handleCloseModal} backdrop="static" size="lg">
        <CModalHeader><CModalTitle>{editMode ? 'Editar Estudiante' : 'Nuevo Estudiante'}</CModalTitle></CModalHeader>
        <CModalBody>
          {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
          <CForm>
              <h6 className="text-medium-emphasis mb-3">Datos Académicos</h6>
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

              <h6 className="text-medium-emphasis mb-3 mt-4">Datos Personales</h6>
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

              <CFormTextarea label="Historial Médico (Opcional)" name="health_record" value={formData.health_record} onChange={handleInputChange} rows={2} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={handleCloseModal}>Cancelar</CButton>
          <CButton color="success" onClick={handleSaveStudent} disabled={isSaving}>Guardar</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Students;