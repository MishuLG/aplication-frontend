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
  CAlert,
  CRow,
  CCol,
  CInputGroup,
  CInputGroupText,
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilPlus, 
  cilPencil, 
  cilTrash, 
  cilSearch, 
  cilBook, 
  cilList 
} from '@coreui/icons';
// Ajusta la ruta según tu estructura real
import API_URL from '../../../config';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    name_subject: '',
    description_subject: '',
  });

  // UI States
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Feedback
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Borrado
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const subjectsUrl = `${API_URL}/subjects`;

  useEffect(() => {
    fetchSubjects();
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

  const fetchSubjects = async () => {
    try {
      const res = await authenticatedFetch(subjectsUrl);
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (err) {
      console.error(err);
      setAlertBox('Error de conexión al cargar asignaturas');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name_subject.trim()) newErrors.name_subject = 'El nombre es obligatorio.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSubject = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    setAlertBox(null);

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${subjectsUrl}/${selectedSubject.id_subject}` : subjectsUrl;

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar');
      }

      await fetchSubjects();
      handleCloseModal();
    } catch (err) {
      setAlertBox(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await authenticatedFetch(`${subjectsUrl}/${idToDelete}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (!res.ok) {
          throw new Error(data.message);
      }
      
      await fetchSubjects();
      setShowDeleteModal(false);
    } catch (err) {
      alert(err.message); 
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      name_subject: subject.name_subject,
      description_subject: subject.description_subject || '',
    });
    setEditMode(true);
    setShowModal(true);
    setAlertBox(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name_subject: '', description_subject: '' });
    setEditMode(false);
    setSelectedSubject(null);
    setErrors({});
    setAlertBox(null);
  };

  // Filtrado
  const filteredSubjects = subjects.filter(s => 
    s.name_subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid mt-4">
      {/* KPI Cards */}
      <CRow className="mb-4">
          <CCol sm={6} lg={4}>
              <CCard className="border-start-4 border-start-primary shadow-sm h-100">
                  <CCardBody className="d-flex justify-content-between align-items-center p-3">
                      <div>
                          <div className="text-medium-emphasis small text-uppercase fw-bold">Total Registradas</div>
                          <div className="fs-4 fw-semibold text-body">{subjects.length}</div>
                      </div>
                      <div className="p-3 bg-primary bg-opacity-10 rounded-3 text-primary">
                        <CIcon icon={cilBook} size="xl" />
                      </div>
                  </CCardBody>
              </CCard>
          </CCol>
      </CRow>

      {/* TARGET TUTORIAL: TABLA DE MATERIAS */}
      <CCard className="shadow-sm border-0 tour-subjects-table">
        <CCardHeader className="py-3 d-flex justify-content-between align-items-center bg-transparent border-bottom-0">
            <h5 className="mb-0 text-body d-flex align-items-center">
               <CIcon icon={cilList} className="me-2 text-primary" /> Catálogo de Asignaturas
            </h5>
            {/* TARGET TUTORIAL: BOTÓN CREAR */}
            <CButton color="primary" onClick={() => { handleCloseModal(); setShowModal(true); }} className="d-flex align-items-center shadow-sm tour-subjects-create">
              <CIcon icon={cilPlus} className="me-2" /> Nueva Asignatura
            </CButton>
        </CCardHeader>

        <CCardBody>
            {alertBox && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}

            <CRow className="mb-4">
                <CCol md={6}>
                    {/* TARGET TUTORIAL: BÚSQUEDA */}
                    <CInputGroup className="shadow-sm tour-subjects-search">
                        <CInputGroupText className="bg-body border-end-0 text-medium-emphasis">
                            <CIcon icon={cilSearch} />
                        </CInputGroupText>
                        <CFormInput 
                            className="border-start-0 bg-body"
                            placeholder="Buscar asignatura por nombre..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </CInputGroup>
                </CCol>
            </CRow>

            <div className="table-responsive rounded-3 shadow-sm border">
                <CTable align="middle" className="mb-0" hover striped>
                  {/* ELIMINADO: color="light" para que se adapte al tema oscuro */}
                  <CTableHead className="bg-body-tertiary">
                    <CTableRow>
                      <CTableHeaderCell className="text-center py-3 text-secondary" style={{width: '80px'}}>ID</CTableHeaderCell>
                      <CTableHeaderCell className="py-3 text-secondary">Nombre</CTableHeaderCell>
                      <CTableHeaderCell className="py-3 text-secondary">Descripción</CTableHeaderCell>
                      <CTableHeaderCell className="text-end py-3 text-secondary pe-4">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredSubjects.map((subject) => (
                      <CTableRow key={subject.id_subject}>
                        <CTableDataCell className="text-center">
                            <span className="text-medium-emphasis font-monospace">#{subject.id_subject}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                            <div className="fw-bold text-primary">{subject.name_subject}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                            {subject.description_subject ? (
                                <div className="text-body text-truncate" style={{maxWidth: '300px'}}>
                                    {subject.description_subject}
                                </div>
                            ) : (
                                <span className="text-disabled small fst-italic">Sin descripción</span>
                            )}
                        </CTableDataCell>
                        <CTableDataCell className="text-end pe-3">
                          <CButton color="info" size="sm" variant="ghost" className="me-2" onClick={() => handleEditSubject(subject)} title="Editar">
                              <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton color="danger" size="sm" variant="ghost" onClick={() => handleDeleteClick(subject.id_subject)} title="Eliminar">
                              <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                    {filteredSubjects.length === 0 && (
                        <CTableRow>
                            <CTableDataCell colSpan="4" className="text-center py-5">
                                <div className="text-medium-emphasis">
                                    <CIcon icon={cilBook} size="xl" className="mb-3 text-disabled"/>
                                    <h5>No se encontraron asignaturas.</h5>
                                    <p className="small">Intenta crear una nueva o ajusta tu búsqueda.</p>
                                </div>
                            </CTableDataCell>
                        </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
            </div>
        </CCardBody>
      </CCard>

      {/* --- MODALES --- */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static" alignment="center">
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
            <p>¿Está seguro que desea eliminar la asignatura?</p>
            <CAlert color="warning" className="d-flex align-items-center border-0 shadow-sm">
                <CIcon icon={cilList} className="flex-shrink-0 me-2" size="xl"/>
                <div>
                   Si esta materia ya tiene notas cargadas o pertenece a un horario activo, <strong>no se podrá eliminar</strong> por seguridad.
                </div>
            </CAlert>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
          <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showModal} backdrop="static" onClose={handleCloseModal}>
        <CModalHeader>
          <CModalTitle>{editMode ? 'Editar Asignatura' : 'Nueva Asignatura'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
                <CFormInput
                  label="Nombre de Asignatura *"
                  name="name_subject"
                  placeholder="Ej: Matemáticas"
                  value={formData.name_subject}
                  onChange={handleInputChange}
                  invalid={!!errors.name_subject}
                />
                {errors.name_subject && <div className="text-danger small">{errors.name_subject}</div>}
            </div>
            <div className="mb-3">
                <CFormTextarea
                  label="Descripción"
                  name="description_subject"
                  placeholder="Breve descripción del contenido..."
                  value={formData.description_subject}
                  onChange={handleInputChange}
                  rows={3}
                />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={handleCloseModal}>Cancelar</CButton>
          <CButton color="primary" onClick={handleSaveSubject} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Subjects;