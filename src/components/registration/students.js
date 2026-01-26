import React, { useState, useEffect } from 'react';
import {
  CButton, CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableDataCell,
  CTableHead, CTableHeaderCell, CTableRow, CModal, CModalHeader, CModalTitle,
  CModalBody, CModalFooter, CForm, CFormInput, CFormSelect, CAlert,
  CRow, CCol, CInputGroup, CInputGroupText, CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilSearch, cilSchool, cilUser, cilCheckCircle, cilWarning, cilBan } from '@coreui/icons';
import API_URL from '../../../config';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [sections, setSections] = useState([]);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', dni: '', date_of_birth: '',
    gender: '', address: '', id_tutor: '', id_section: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const studentsUrl = `${API_URL}/students`;
  const tutorsUrl = `${API_URL}/tutors`;
  const sectionsUrl = `${API_URL}/sections`;

  useEffect(() => {
    fetchStudents();
    fetchDropdownData();
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
        const resTutors = await authenticatedFetch(tutorsUrl);
        if (resTutors.ok) setTutors(await resTutors.json());

        const resSections = await authenticatedFetch(sectionsUrl);
        if (resSections.ok) setSections(await resSections.json());
    } catch (error) { console.error("Error listas", error); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.id_tutor) return setAlertBox("Nombre y Tutor son obligatorios");
    setIsSaving(true);
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${studentsUrl}/${selectedId}` : studentsUrl;
      const payload = { ...formData, id_section: formData.id_section || null };

      const response = await authenticatedFetch(url, { method, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('Error al guardar');

      await fetchStudents();
      handleCloseModal();
    } catch (err) { setAlertBox(err.message); } 
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("¿Eliminar estudiante?")) return;
    try {
        const res = await authenticatedFetch(`${studentsUrl}/${id}`, { method: 'DELETE' });
        if(res.ok) fetchStudents();
    } catch(e) { alert("Error"); }
  };

  const handleEdit = (student) => {
    setSelectedId(student.id_student);
    setFormData({
      first_name: student.first_name, last_name: student.last_name,
      dni: student.dni || '', date_of_birth: student.date_of_birth || '',
      gender: student.gender || '', address: student.address || '',
      id_tutor: student.id_tutor || '', id_section: student.id_section || ''
    });
    setEditMode(true); setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false); setEditMode(false);
    setFormData({ first_name: '', last_name: '', dni: '', date_of_birth: '', gender: '', address: '', id_tutor: '', id_section: '' });
    setErrors({}); setAlertBox(null);
  };

  const renderStatusBadge = (student) => {
      const enrollmentStatus = student.Enrollments && student.Enrollments.length > 0 
          ? student.Enrollments[0].status 
          : null;

      if (enrollmentStatus === 'Cursando') {
          return <CBadge color="success" className="d-flex align-items-center gap-1" shape="rounded-pill"><CIcon icon={cilCheckCircle} size="sm"/> Validado</CBadge>;
      } else if (enrollmentStatus === 'Pre-Inscrito') {
          return <CBadge color="warning" className="d-flex align-items-center gap-1 text-dark" shape="rounded-pill"><CIcon icon={cilWarning} size="sm"/> Pendiente</CBadge>;
      } else {
          return <CBadge color="secondary" className="d-flex align-items-center gap-1" shape="rounded-pill"><CIcon icon={cilBan} size="sm"/> Sin Inscripción</CBadge>;
      }
  };

  const filteredStudents = students.filter(s => (s.first_name + ' ' + s.last_name).toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container-fluid mt-4">
      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent border-0 d-flex justify-content-between py-3">
            <h5 className="mb-0 text-body">Directorio Estudiantil</h5>
            <CButton color="primary" onClick={() => { handleCloseModal(); setShowModal(true); }}><CIcon icon={cilPlus} className="me-2"/>Nuevo</CButton>
        </CCardHeader>
        <CCardBody>
            <div className="mb-4" style={{maxWidth: '400px'}}>
                <CInputGroup>
                    <CInputGroupText className="bg-body border-end-0"><CIcon icon={cilSearch} /></CInputGroupText>
                    <CFormInput className="bg-body border-start-0" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </CInputGroup>
            </div>
            <CTable hover responsive align="middle">
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell>Estudiante</CTableHeaderCell>
                        <CTableHeaderCell>Representante</CTableHeaderCell>
                        <CTableHeaderCell>Sección</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Estado</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {filteredStudents.map((student) => (
                        <CTableRow key={student.id_student}>
                            <CTableDataCell>
                                <div className="fw-bold">{student.first_name} {student.last_name}</div>
                                <div className="small text-muted">{student.dni}</div>
                            </CTableDataCell>
                            <CTableDataCell>
                                {student.Tutor && student.Tutor.User ? (
                                    <div><CIcon icon={cilUser} size="sm" className="me-1"/>{student.Tutor.User.first_name} {student.Tutor.User.last_name}</div>
                                ) : <span className="text-danger small">Sin asignar</span>}
                            </CTableDataCell>
                            <CTableDataCell>
                                {student.Section ? <CBadge color="info" className="text-dark">{student.Section.Grade?.name_grade} "{student.Section.num_section}"</CBadge> : '-'}
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                                {renderStatusBadge(student)}
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                                <CButton color="info" size="sm" variant="ghost" className="me-2" onClick={() => handleEdit(student)}><CIcon icon={cilPencil}/></CButton>
                                <CButton color="danger" size="sm" variant="ghost" onClick={() => handleDelete(student.id_student)}><CIcon icon={cilTrash}/></CButton>
                            </CTableDataCell>
                        </CTableRow>
                    ))}
                </CTableBody>
            </CTable>
        </CCardBody>
      </CCard>

      <CModal visible={showModal} backdrop="static" onClose={handleCloseModal} size="lg">
        <CModalHeader><CModalTitle>{editMode ? 'Editar' : 'Inscribir'} Estudiante</CModalTitle></CModalHeader>
        <CModalBody>
          {alertBox && <CAlert color="danger">{alertBox}</CAlert>}
          <CForm>
            <CRow className="mb-3">
                <CCol md={6}><CFormInput label="Nombres *" name="first_name" value={formData.first_name} onChange={handleInputChange} /></CCol>
                <CCol md={6}><CFormInput label="Apellidos *" name="last_name" value={formData.last_name} onChange={handleInputChange} /></CCol>
            </CRow>
            <CRow className="mb-3">
                <CCol md={6}><CFormInput label="Cédula" name="dni" value={formData.dni} onChange={handleInputChange} /></CCol>
                <CCol md={6}><CFormInput type="date" label="Fecha Nac." name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} /></CCol>
            </CRow>
            
            <hr className="my-4"/>
            <h6 className="text-primary mb-3">Datos Académicos</h6>
            <CRow className="mb-3">
                <CCol md={12}>
                    <CFormSelect label="Representante *" name="id_tutor" value={formData.id_tutor} onChange={handleInputChange} className="bg-body">
                        <option value="">-- Seleccione --</option>
                        {tutors.map(tutor => (
                            <option key={tutor.id_tutor} value={tutor.id_tutor}>
                                {tutor.User ? `${tutor.User.first_name} ${tutor.User.last_name}` : 'Usuario desconocido'} - {tutor.User?.dni || 'S/C'}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
            </CRow>
            <CRow className="mb-3">
                <CCol md={12}>
                    <CFormSelect label="Sección" name="id_section" value={formData.id_section} onChange={handleInputChange}>
                        <option value="">-- Pendiente --</option>
                        {sections.map(sec => (
                            <option key={sec.id_section} value={sec.id_section}>
                                {sec.Grade?.name_grade} "{sec.num_section}"
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={handleCloseModal}>Cancelar</CButton>
          <CButton color="primary" onClick={handleSave}>Guardar</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Students;