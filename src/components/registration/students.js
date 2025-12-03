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
  const [tutors, setTutors] = useState([]);
  const [sections, setSections] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
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
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState({ first_name_student: '', id_section: '' });
  const [validated, setValidated] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null); // alert box text
  const [errors, setErrors] = useState({}); // per-field errors (shows red + "✖")
  const [users, setUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const studentsUrl = `${API_URL}/students`;
  const tutorsUrl = `${API_URL}/tutors`;
  const sectionsUrl = `${API_URL}/sections`;
  const schoolYearsUrl = `${API_URL}/school_years`;
  const usersUrl = `${API_URL}/users`;

  useEffect(() => {
    fetchStudents();
    fetchTutors();
    fetchUsers();
    fetchSections();
    fetchSchoolYears();
  }, []);

  const handleDeleteClick = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setIdToDelete(null);
  };

  const confirmDelete = async () => {
    if (idToDelete) {
      try {
        const response = await fetch(`${studentsUrl}/${idToDelete}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Server response error');
        }
        await fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        // keep browser alert for non-creation errors (not requested to change)
        alert('An error occurred while deleting the student.');
      }
    }

    setShowDeleteModal(false);
    setIdToDelete(null);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(usersUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Received data is not an array for users:', data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('An error occurred while fetching users.');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(studentsUrl);
      const data = await response.json();

      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        console.error('The received data is not an array:', data);
        alert('Error: The received data is not valid.');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('An error occurred while fetching students. Please try again.');
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await fetch(tutorsUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setTutors(data);
      } else {
        console.error('Received data is not an array for tutors:', data);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      alert('An error occurred while fetching tutors.');
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch(sectionsUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSections(data);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchSchoolYears = async () => {
    try {
      const response = await fetch(schoolYearsUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSchoolYears(data);
      }
    } catch (error) {
      console.error('Error fetching school years:', error);
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'first_name_student' || name === 'last_name_student') {
      newValue = value.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g, '');
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // clear error for this field when user types
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setErrorMsg(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (requiredFields.includes(name) && String(value || '').trim() === '') {
      setErrors((prev) => ({
        ...prev,
        [name]: 'Este campo es obligatorio y no puede estar vacío.',
      }));
    } else {
      // specific checks
      if (name === 'date_of_birth_student') {
        const dob = new Date(value);
        if (isNaN(dob.getTime())) {
          setErrors((prev) => ({ ...prev, [name]: 'La fecha de nacimiento no es válida.' }));
          return;
        }
        const today = new Date();
        dob.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        if (dob > today) {
          setErrors((prev) => ({ ...prev, [name]: 'La fecha no puede ser futura.' }));
          return;
        }
        const minAgeDate = new Date();
        minAgeDate.setFullYear(today.getFullYear() - 4);
        minAgeDate.setHours(0, 0, 0, 0);
        if (dob > minAgeDate) {
          setErrors((prev) => ({ ...prev, [name]: 'Edad mínima 4 años.' }));
          return;
        }
        setErrors((prev) => ({ ...prev, [name]: '' }));
      } else if (name === 'zip_code' && value && isNaN(Number(value))) {
        setErrors((prev) => ({ ...prev, [name]: 'El código postal debe ser numérico.' }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = () => {
    setValidated(true);
    setErrorMsg(null);
    const newErrors = {};

    for (const field of requiredFields) {
      const val = formData[field];
      if (!val || String(val).trim() === '') {
        newErrors[field] = 'Este campo es obligatorio y no puede estar vacío.';
      }
    }

    if (formData.first_name_student && formData.first_name_student.trim().length < 2) {
      newErrors.first_name_student = 'El nombre debe tener al menos 2 caracteres.';
    }
    if (formData.last_name_student && formData.last_name_student.trim().length < 2) {
      newErrors.last_name_student = 'El apellido debe tener al menos 2 caracteres.';
    }

    if (formData.date_of_birth_student) {
      const dob = new Date(formData.date_of_birth_student);
      const today = new Date();
      dob.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (isNaN(dob.getTime())) {
        newErrors.date_of_birth_student = 'La fecha de nacimiento no es válida.';
      } else if (dob > today) {
        newErrors.date_of_birth_student = 'La fecha de nacimiento no puede ser futura.';
      } else {
        const minAgeDate = new Date();
        minAgeDate.setFullYear(today.getFullYear() - 4);
        minAgeDate.setHours(0, 0, 0, 0);
        if (dob > minAgeDate) {
          newErrors.date_of_birth_student = 'El estudiante no cumple con la edad mínima (4 años).';
        }
      }
    }

    if (formData.zip_code && isNaN(Number(formData.zip_code))) {
      newErrors.zip_code = 'El código postal debe ser un valor numérico válido.';
    }

    setErrors(newErrors);

    const isValid = Object.keys(newErrors).length === 0;
    setValidated(isValid);
    if (!isValid) {
      setErrorMsg('Corrija los errores marcados antes de guardar.');
    } else {
      setErrorMsg(null);
    }
    return isValid;
  };

  const markAllRequiredAsDuplicate = (message = 'El estudiante ya existe.') => {
    const dupErrors = {};
    requiredFields.forEach((f) => {
      dupErrors[f] = message;
    });
    setErrors(dupErrors);
    setErrorMsg(message); // shows CAlert on top of form
    setValidated(false);
  };

  const saveStudent = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode && selectedStudent ? `${studentsUrl}/${selectedStudent.id_student}` : studentsUrl;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMessage = 'Error en la respuesta del servidor';
        let errorData = null;
        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // ignore parse
        }

        // Detect duplicate based on status 409 or message containing keywords
        const msgLower = (errorMessage || '').toLowerCase();
        const isDuplicate =
          response.status === 409 ||
          /ya existe/.test(msgLower) ||
          /already exists/.test(msgLower) ||
          /duplicate/.test(msgLower) ||
          /ya existente/.test(msgLower);

        if (isDuplicate) {
          // show inline alert (CAlert) and mark required fields with red + ✖
          markAllRequiredAsDuplicate(errorData?.message || 'Ya existente');
          return;
        }

        throw new Error(errorMessage);
      }

      await fetchStudents();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
      // For other errors show inline alert (CAlert)
      setErrorMsg(error.message || 'Ocurrió un error al guardar el estudiante. Por favor, inténtelo de nuevo.');
    }
  };

  const editStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      id_tutor: student.id_tutor ?? '',
      id_section: student.id_section ?? '',
      id_school_year: student.id_school_year ?? '',
      first_name_student: student.first_name_student ?? '',
      last_name_student: student.last_name_student ?? '',
      date_of_birth_student: student.date_of_birth_student ? student.date_of_birth_student.split('T')[0] : '',
      health_record: student.health_record ?? '',
      gender: student.gender ?? '',
      street: student.street ?? '',
      city: student.city ?? '',
      zip_code: student.zip_code ?? '',
    });
    setEditMode(true);
    setValidated(false);
    setErrorMsg(null);
    setErrors({});
    setShowModal(true);
  };

  const deleteStudent = async (id) => {
    try {
      const response = await fetch(`${studentsUrl}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Server response error');
      await fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('An error occurred while deleting the student. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
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
    setEditMode(false);
    setSelectedStudent(null);
    setValidated(false);
    setErrorMsg(null);
    setErrors({});
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredStudents = students.filter((student) => {
    const studentName = student.first_name_student ? student.first_name_student.toLowerCase() : '';
    const sectionId = student.id_section ? student.id_section.toString() : '';
    return studentName.includes(filter.first_name_student.toLowerCase()) && sectionId.includes(filter.id_section);
  });

  const renderErrorText = (field) => {
    if (!errors[field]) return null;
    return (
      <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
        <strong style={{ marginRight: 6 }}>✖</strong>
        {errors[field]}
      </div>
    );
  };

  return (
    <CCard>
      <CCardHeader>
        <h5>Registros de Estudiantes</h5>
        <CButton
          color="success"
          variant="outline"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <CIcon icon={cilPlus} className="me-2" />
          Agregar Registro
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput placeholder="Filtrar por nombre" name="first_name_student" value={filter.first_name_student} onChange={handleFilterChange} className="mb-2" />
          <CFormInput placeholder="Filtrar por ID de sección" name="id_section" value={filter.id_section} onChange={handleFilterChange} />
        </div>

        <CTable className="table-fade-in" align="middle" small striped hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Estudiante</CTableHeaderCell>
              <CTableHeaderCell>ID Tutor</CTableHeaderCell>
              <CTableHeaderCell>ID Sección</CTableHeaderCell>
              <CTableHeaderCell>ID Año Escolar</CTableHeaderCell>
              <CTableHeaderCell>Nombre</CTableHeaderCell>
              <CTableHeaderCell>Apellido</CTableHeaderCell>
              <CTableHeaderCell>Fecha de Nacimiento</CTableHeaderCell>
              <CTableHeaderCell>Historial Médico</CTableHeaderCell>
              <CTableHeaderCell>Género</CTableHeaderCell>
              <CTableHeaderCell>Calle</CTableHeaderCell>
              <CTableHeaderCell>Ciudad</CTableHeaderCell>
              <CTableHeaderCell>Código Postal</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredStudents.map((student) => (
              <CTableRow key={student.id_student}>
                <CTableDataCell>{student.id_student}</CTableDataCell>
                <CTableDataCell>{student.id_tutor}</CTableDataCell>
                <CTableDataCell>{student.id_section}</CTableDataCell>
                <CTableDataCell>{student.id_school_year}</CTableDataCell>
                <CTableDataCell>{student.first_name_student}</CTableDataCell>
                <CTableDataCell>{student.last_name_student}</CTableDataCell>
                <CTableDataCell>{student.date_of_birth_student}</CTableDataCell>
                <CTableDataCell>{student.health_record}</CTableDataCell>
                <CTableDataCell>{student.gender}</CTableDataCell>
                <CTableDataCell>{student.street}</CTableDataCell>
                <CTableDataCell>{student.city}</CTableDataCell>
                <CTableDataCell>{student.zip_code}</CTableDataCell>
                <CTableDataCell>
                  <CButtonGroup size="sm">
                    <CButton color="warning" variant="ghost" onClick={() => editStudent(student)} title="Editar Registro">
                      <CIcon icon={cilPencil} />
                    </CButton>

                    <CButton color="danger" variant="ghost" onClick={() => handleDeleteClick(student.id_student)} title="Eliminar Registro">
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showDeleteModal} onClose={handleCancelDelete} backdrop="static">
          <CModalHeader>
            <CModalTitle>Confirmar Eliminación</CModalTitle>
          </CModalHeader>
          <CModalBody>¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.</CModalBody>
          <CModalFooter>
            <CButton color="danger" onClick={confirmDelete}>
              Aceptar (Eliminar)
            </CButton>
            <CButton color="secondary" onClick={handleCancelDelete}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>

        <CModal
          visible={showModal}
          size="lg"
          backdrop="static"
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Estudiante' : 'Agregar Estudiante'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {/* Inline alert box (no browser alert) */}
            {errorMsg && (
              <CAlert color="danger" className="mb-3">
                <strong>✖ </strong>
                {errorMsg}
              </CAlert>
            )}

            <CForm noValidate validated={validated} className="row g-3">
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormSelect
                    name="id_tutor"
                    label="ID Tutor (*)"
                    value={formData.id_tutor}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    invalid={!!errors.id_tutor}
                  >
                    <option value="">Seleccionar Tutor</option>
                    {tutors.map((tutor) => {
                      const user = users.find((u) => u.uid_users === tutor.uid_users);
                      const displayLabel = user ? `${tutor.id_tutor} (${user.first_name} ${user.last_name})` : `${tutor.id_tutor} (Usuario: ${tutor.uid_users})`;
                      return (
                        <option key={tutor.id_tutor} value={tutor.id_tutor}>
                          {displayLabel}
                        </option>
                      );
                    })}
                  </CFormSelect>
                  {renderErrorText('id_tutor')}
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    name="id_section"
                    label="ID Sección (*)"
                    value={formData.id_section}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    invalid={!!errors.id_section}
                  >
                    <option value="">Seleccionar Sección</option>
                    {sections.map((section) => (
                      <option key={section.id_section} value={section.id_section}>
                        {section.num_section}
                      </option>
                    ))}
                  </CFormSelect>
                  {renderErrorText('id_section')}
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    name="id_school_year"
                    label="ID Año Escolar (*)"
                    value={formData.id_school_year}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    invalid={!!errors.id_school_year}
                  >
                    <option value="">Seleccionar Año Escolar</option>
                    {schoolYears.map((year) => (
                      <option key={year.id_school_year} value={year.id_school_year}>
                        {year.school_grade} ({year.start_year})
                      </option>
                    ))}
                  </CFormSelect>
                  {renderErrorText('id_school_year')}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormInput
                    name="first_name_student"
                    type="text"
                    label="Nombre (*)"
                    value={formData.first_name_student}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    invalid={!!errors.first_name_student}
                  />
                  {renderErrorText('first_name_student')}
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    name="last_name_student"
                    type="text"
                    label="Apellido (*)"
                    value={formData.last_name_student}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    invalid={!!errors.last_name_student}
                  />
                  {renderErrorText('last_name_student')}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormInput
                    name="date_of_birth_student"
                    type="date"
                    label="Fecha de Nacimiento (*)"
                    value={formData.date_of_birth_student}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    invalid={!!errors.date_of_birth_student}
                  />
                  {renderErrorText('date_of_birth_student')}
                </CCol>
                <CCol md={6}>
                  <CFormSelect
                    name="gender"
                    label="Género (*)"
                    value={formData.gender}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    invalid={!!errors.gender}
                  >
                    <option value="">Seleccionar Género</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </CFormSelect>
                  {renderErrorText('gender')}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={5}>
                  <CFormInput
                    name="street"
                    type="text"
                    label="Calle (*)"
                    value={formData.street}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    invalid={!!errors.street}
                  />
                  {renderErrorText('street')}
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    name="city"
                    type="text"
                    label="Ciudad (*)"
                    value={formData.city}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    invalid={!!errors.city}
                  />
                  {renderErrorText('city')}
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    name="zip_code"
                    type="text"
                    label="Código Postal (*)"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    invalid={!!errors.zip_code}
                  />
                  {renderErrorText('zip_code')}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol xs={12}>
                  <CFormTextarea
                    name="health_record"
                    label="Historial Médico"
                    value={formData.health_record}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </CCol>
              </CRow>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={saveStudent}>
              Guardar
            </CButton>
            <CButton
              color="secondary"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Students;
