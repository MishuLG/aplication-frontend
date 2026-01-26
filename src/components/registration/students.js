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
  cilPlus, cilPencil, cilTrash, cilSearch, cilPeople, cilSchool, cilUser
} from '@coreui/icons';
import API_URL from '../../../config';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]); // Lista de Representantes
  const [sections, setSections] = useState([]); // Lista de Secciones

  // Datos del Formulario
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dni: '',
    date_of_birth: '',
    gender: '',
    address: '',
    id_tutor: '', // Campo Vital: ID del Representante
    id_section: '' // Opcional al inicio
  });

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // URLs
  const studentsUrl = `${API_URL}/students`;
  const tutorsUrl = `${API_URL}/tutors`;
  const sectionsUrl = `${API_URL}/sections`;

  useEffect(() => {
    fetchStudents();
    fetchDropdownData(); // Cargamos tutores y secciones al iniciar
  }, []);

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

  const fetchStudents = async () => {
    try {
      const res = await authenticatedFetch(studentsUrl);
      if (res.ok) setStudents(await res.json());
    } catch (error) { console.error(error); }
  };

  const fetchDropdownData = async () => {
    try {
        // 1. Cargar Tutores (Representantes)
        const resTutors = await authenticatedFetch(tutorsUrl);
        if (resTutors.ok) setTutors(await resTutors.json());

        // 2. Cargar Secciones (Opcional para asignar de una vez)
        const resSections = await authenticatedFetch(sectionsUrl);
        if (resSections.ok) setSections(await resSections.json());
    } catch (error) { console.error("Error cargando listas desplegables", error); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.first_name) newErrors.first_name = 'Nombre requerido';
    if (!formData.last_name) newErrors.last_name = 'Apellido requerido';
    if (!formData.id_tutor) newErrors.id_tutor = 'Debe seleccionar un Representante';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Fecha de nacimiento requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    setAlertBox(null);

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${studentsUrl}/${selectedId}` : studentsUrl;

      // Limpieza de datos (enviar null en vez de string vacía para opcionales)
      const payload = {
          ...formData,
          id_section: formData.id_section || null
      };

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Error al guardar');

      await fetchStudents();
      handleCloseModal();
    } catch (err) {
      setAlertBox(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("¿Estás seguro de eliminar este estudiante?")) return;
    try {
        const res = await authenticatedFetch(`${studentsUrl}/${id}`, { method: 'DELETE' });
        if(res.ok) fetchStudents();
        else alert("No se puede eliminar el estudiante (posiblemente tenga notas).");
    } catch(e) { alert("Error de conexión"); }
  };

  const handleEdit = (student) => {
    setSelectedId(student.id_student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      dni: student.dni || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || '',
      address: student.address || '',
      id_tutor: student.id_tutor || '',
      id_section: student.id_section || ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ 
        first_name: '', last_name: '', dni: '', date_of_birth: '', 
        gender: '', address: '', id_tutor: '', id_section: '' 
    });
    setEditMode(false);
    setErrors({});
    setAlertBox(null);
  };

  // Filtrado
  const filteredStudents = students.filter(s => 
    (s.first_name + ' ' + s.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.dni && s.dni.includes(searchTerm))
  );

  return (
    <div className="container-fluid mt-4">
      {/* KPI Cards */}
      <CRow className="mb-4">
          <CCol sm={6} lg={4}>
              <CCard className="border-start-4 border-start-info shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Matrícula Total</div>
                          <div className="fs-4 fw-semibold text-body">{students.length}</div>
                      </div>
                      <div className="p-3 bg-info bg-opacity-10 rounded-3 text-info">
                        <CIcon icon={cilPeople} size="xl" />
                      </div>
                  </CCardBody>
              </CCard>
          </CCol>
      </CRow>

      <CCard className="shadow-sm border-0">
        <CCardHeader className="py-3 d-flex justify-content-between align-items-center bg-transparent border-bottom-0">
            <h5 className="mb-0 text-body d-flex align-items-center">
               <CIcon icon={cilSchool} className="me-2 text-primary" /> Directorio Estudiantil
            </h5>
            <CButton color="primary" onClick={() => { handleCloseModal(); setShowModal(true); }} className="d-flex align-items-center shadow-sm">
              <CIcon icon={cilPlus} className="me-2" /> Nuevo Estudiante
            </CButton>
        </CCardHeader>

        <CCardBody>
            <CRow className="mb-4">
                <CCol md={6}>
                    <CInputGroup className="shadow-sm">
                        <CInputGroupText className="bg-body border-end-0 text-medium-emphasis">
                            <CIcon icon={cilSearch} />
                        </CInputGroupText>
                        <CFormInput 
                            className="border-start-0 bg-body"
                            placeholder="Buscar por nombre o cédula..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </CInputGroup>
                </CCol>
            </CRow>

            <div className="table-responsive rounded-3 shadow-sm border">
                <CTable align="middle" className="mb-0" hover striped>
                  <CTableHead className="bg-body-tertiary">
                    <CTableRow>
                      <CTableHeaderCell className="text-secondary py-3 ps-4">Estudiante</CTableHeaderCell>
                      <CTableHeaderCell className="text-secondary py-3">Representante</CTableHeaderCell>
                      <CTableHeaderCell className="text-secondary py-3">Grado / Sección</CTableHeaderCell>
                      <CTableHeaderCell className="text-end text-secondary py-3 pe-4">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredStudents.map((student) => (
                      <CTableRow key={student.id_student}>
                        <CTableDataCell className="ps-4">
                            <div className="fw-bold text-primary">{student.first_name} {student.last_name}</div>
                            <div className="small text-medium-emphasis">
                                {student.dni ? `C.I: ${student.dni}` : 'Sin Cédula'}
                            </div>
                        </CTableDataCell>
                        <CTableDataCell>
                            {/* Mostrar datos del Representante vinculado */}
                            {student.Tutor && student.Tutor.User ? (
                                <div className="d-flex align-items-center">
                                    <CIcon icon={cilUser} size="sm" className="me-2 text-info"/>
                                    <span>{student.Tutor.User.first_name} {student.Tutor.User.last_name}</span>
                                </div>
                            ) : (
                                <span className="text-danger small">Sin asignar</span>
                            )}
                        </CTableDataCell>
                        <CTableDataCell>
                            {student.Section ? (
                                <CBadge color="success" shape="rounded-pill">
                                    {student.Section.Grade?.name_grade} "{student.Section.section_identifier}"
                                </CBadge>
                            ) : (
                                <span className="text-medium-emphasis small">No inscrito</span>
                            )}
                        </CTableDataCell>
                        <CTableDataCell className="text-end pe-4">
                          <CButton color="info" size="sm" variant="ghost" className="me-2" onClick={() => handleEdit(student)}>
                              <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton color="danger" size="sm" variant="ghost" onClick={() => handleDelete(student.id_student)}>
                              <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                        <CTableRow>
                            <CTableDataCell colSpan="4" className="text-center py-5">
                                <div className="text-medium-emphasis">
                                    <h5>No se encontraron estudiantes.</h5>
                                </div>
                            </CTableDataCell>
                        </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
            </div>
        </CCardBody>
      </CCard>

      {/* --- MODAL DE INSCRIPCIÓN / EDICIÓN --- */}
      <CModal visible={showModal} backdrop="static" onClose={handleCloseModal} size="lg">
        <CModalHeader>
          <CModalTitle>{editMode ? 'Editar Datos del Estudiante' : 'Inscribir Nuevo Estudiante'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
          <CForm>
            <h6 className="text-primary mb-3">Datos Personales</h6>
            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormInput label="Nombres *" name="first_name" value={formData.first_name} onChange={handleInputChange} invalid={!!errors.first_name} />
                    {errors.first_name && <div className="text-danger small">{errors.first_name}</div>}
                </CCol>
                <CCol md={6}>
                    <CFormInput label="Apellidos *" name="last_name" value={formData.last_name} onChange={handleInputChange} invalid={!!errors.last_name} />
                    {errors.last_name && <div className="text-danger small">{errors.last_name}</div>}
                </CCol>
            </CRow>
            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormInput label="Cédula Escolar / DNI" name="dni" value={formData.dni} onChange={handleInputChange} />
                </CCol>
                <CCol md={6}>
                    <CFormInput type="date" label="Fecha de Nacimiento *" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} invalid={!!errors.date_of_birth}/>
                    {errors.date_of_birth && <div className="text-danger small">{errors.date_of_birth}</div>}
                </CCol>
            </CRow>
            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormSelect label="Género" name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option value="">Seleccione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </CFormSelect>
                </CCol>
                <CCol md={6}>
                    <CFormInput label="Dirección" name="address" value={formData.address} onChange={handleInputChange} />
                </CCol>
            </CRow>

            <hr className="my-4"/>
            <h6 className="text-primary mb-3">Representante y Académico</h6>
            
            <CRow className="mb-3">
                <CCol md={12}>
                    {/* DROPDOWN DE TUTORES */}
                    <CFormSelect 
                        label="Representante Legal *" 
                        name="id_tutor" 
                        value={formData.id_tutor} 
                        onChange={handleInputChange}
                        invalid={!!errors.id_tutor}
                        className="bg-body" // Asegura contraste
                    >
                        <option value="">-- Seleccione al Representante --</option>
                        {tutors.map(tutor => (
                            <option key={tutor.id_tutor} value={tutor.id_tutor}>
                                {tutor.User.first_name} {tutor.User.last_name} - {tutor.User.dni}
                            </option>
                        ))}
                    </CFormSelect>
                    {errors.id_tutor && <div className="text-danger small">{errors.id_tutor}</div>}
                    <div className="form-text">Solo aparecen usuarios registrados con rol de Profesor o Representante.</div>
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CCol md={12}>
                    <CFormSelect label="Asignar Sección (Opcional)" name="id_section" value={formData.id_section} onChange={handleInputChange}>
                        <option value="">-- Sin Asignar (Pendiente) --</option>
                        {sections.map(sec => (
                            <option key={sec.id_section} value={sec.id_section}>
                                {sec.Grade?.name_grade} - Sección "{sec.section_identifier}" ({sec.SchoolYear?.period})
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
            </CRow>

          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={handleCloseModal}>Cancelar</CButton>
          <CButton color="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Estudiante'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Students;