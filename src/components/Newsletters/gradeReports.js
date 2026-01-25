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
  CBadge,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilPlus, cilSearch, cilDescription, cilCloudDownload, cilNotes } from '@coreui/icons';
import API_URL from '../../../config';

const GradeReports = () => {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState(1); // 1: Comunicados (Original), 2: Boletines PDF (Nuevo)
  
  // Data: Comunicados
  const [newsletters, setNewsletters] = useState([]);
  const [tutors, setTutors] = useState([]); 
  
  // Data: Boletines
  const [enrollments, setEnrollments] = useState([]); // Lista de alumnos con notas

  // Form Data (Para comunicados)
  const [formData, setFormData] = useState({
    uid_users: '',
    title: '',
    content: '',
    date_sent: '',
    newsletter_status: '',
    recipients: '',
  });
  
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const newslettersUrl = `${API_URL}/newsletters`;
  const tutorsUrl = `${API_URL}/tutors`; 
  const enrollmentsUrl = `${API_URL}/enrollments`; // Para los boletines
  const bulletinUrl = `${API_URL}/api/bulletin`;   // Ruta de descarga PDF

  useEffect(() => {
    fetchNewsletters();
    fetchTutors();
    fetchEnrollmentsForBulletins();
  }, []);

  // --- FETCHERS ---
  const fetchNewsletters = async () => {
    try {
      const response = await fetch(newslettersUrl, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNewsletters(data);
      }
    } catch (error) { console.error('Error fetching newsletters:', error); }
  };

  const fetchTutors = async () => {
    try {
      const response = await fetch(tutorsUrl, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTutors(data);
      }
    } catch (error) { console.error('Error fetching tutors:', error); }
  };

  const fetchEnrollmentsForBulletins = async () => {
      try {
          // Necesitamos una ruta que traiga inscripciones con datos de alumno y sección
          // Si tu API /enrollments ya hace include de Student y Section, esto funcionará.
          const response = await fetch(enrollmentsUrl, {
              headers: { 'Authorization': `Bearer ${getToken()}` }
          });
          if(response.ok) {
              const data = await response.json();
              setEnrollments(Array.isArray(data) ? data : []);
          }
      } catch (error) { console.error("Error fetching enrollments", error); }
  };

  // --- LÓGICA DE DESCARGA DE BOLETÍN ---
  const handleDownloadBulletin = async (id_enrollment) => {
      try {
          const response = await fetch(`${bulletinUrl}/${id_enrollment}`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${getToken()}` }
          });

          if (response.ok) {
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `Boletin_Notas_${id_enrollment}.pdf`);
              document.body.appendChild(link);
              link.click();
              link.parentNode.removeChild(link);
          } else {
              alert("No se pudo generar el boletín. Verifique si el estudiante tiene notas registradas.");
          }
      } catch (error) {
          console.error("Download error", error);
          alert("Error de conexión al descargar.");
      }
  };

  // --- CRUD COMUNICADOS (Lógica Original) ---
  const handleSaveNewsletter = async () => {
    setErrorMessage(null);
    if (!formData.uid_users) return setErrorMessage('Debe seleccionar un Tutor.');
    if (!formData.title.trim()) return setErrorMessage('El título es obligatorio.');
    if (!formData.content.trim()) return setErrorMessage('El contenido es obligatorio.');
    if (!formData.date_sent) return setErrorMessage('La fecha de envío es obligatoria.');
    if (!formData.newsletter_status) return setErrorMessage('Debe seleccionar un estado.');
    if (!formData.recipients.trim()) return setErrorMessage('Especifique los destinatarios (ej: "Padres de familia").');

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${newslettersUrl}/${selectedNewsletter.id_newsletters}` : newslettersUrl;

      const response = await fetch(url, {
        method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al guardar');

      fetchNewsletters();
      handleCloseModal();
      alert(editMode ? 'Reporte actualizado correctamente' : 'Reporte creado correctamente');
    } catch (error) { setErrorMessage(error.message); }
  };

  const handleEditNewsletter = (newsletter) => {
    setSelectedNewsletter(newsletter);
    setFormData({
      uid_users: newsletter.uid_users,
      title: newsletter.title,
      content: newsletter.content,
      date_sent: newsletter.date_sent ? newsletter.date_sent.split('T')[0] : '', 
      newsletter_status: newsletter.newsletter_status,
      recipients: newsletter.recipients,
    });
    setEditMode(true); setShowModal(true); setErrorMessage(null);
  };

  const handleDeleteNewsletter = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este reporte permanentemente?")) return;
    try {
      const response = await fetch(`${newslettersUrl}/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!response.ok) throw new Error('Error del servidor');
      fetchNewsletters();
    } catch (error) { alert('Error al eliminar el reporte.'); }
  };

  const resetForm = () => {
    setFormData({
      uid_users: '', title: '', content: '', date_sent: '', newsletter_status: '', recipients: '',
    });
    setEditMode(false); setSelectedNewsletter(null); setErrorMessage(null);
  };

  const handleCloseModal = () => { setShowModal(false); resetForm(); };

  // Filtrado
  const filteredNewsletters = newsletters.filter((item) => {
    const term = searchTerm.toLowerCase();
    const title = item.title ? item.title.toLowerCase() : '';
    return title.includes(term);
  });

  const filteredEnrollments = enrollments.filter((item) => {
      // Filtra alumnos activos o cursando para descargar boletines
      // O busca por nombre si 'item.Student' existe
      const term = searchTerm.toLowerCase();
      const studentName = item.Student ? `${item.Student.first_name_student} ${item.Student.last_name_student}`.toLowerCase() : '';
      return studentName.includes(term);
  });

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5><CIcon icon={cilDescription} className="me-2"/>Gestión de Informes y Boletines</h5>
      </CCardHeader>
      <CCardBody>
        
        {/* TABS DE NAVEGACIÓN */}
        <CNav variant="tabs" className="mb-4" style={{cursor:'pointer'}}>
            <CNavItem>
                <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)}>
                    <CIcon icon={cilDescription} className="me-2"/> Comunicados Generales
                </CNavLink>
            </CNavItem>
            <CNavItem>
                <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)}>
                    <CIcon icon={cilNotes} className="me-2"/> Boletines de Calificaciones
                </CNavLink>
            </CNavItem>
        </CNav>

        <CTabContent>
            {/* --- TAB 1: COMUNICADOS (NEWSLETTERS) --- */}
            <CTabPane visible={activeTab === 1}>
                <div className="d-flex justify-content-between mb-3">
                    <div style={{ maxWidth: '300px' }}>
                        <CFormInput 
                            placeholder="Buscar comunicado..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            prefix={<CIcon icon={cilSearch} />}
                        />
                    </div>
                    <CButton color="primary" onClick={() => setShowModal(true)}>
                        <CIcon icon={cilPlus} /> Crear Comunicado
                    </CButton>
                </div>

                <CTable bordered hover responsive striped className="align-middle">
                <CTableHead color="dark">
                    <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Título</CTableHeaderCell>
                    <CTableHeaderCell>Fecha Envío</CTableHeaderCell>
                    <CTableHeaderCell>Destinatarios</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                    <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {filteredNewsletters.length > 0 ? (
                        filteredNewsletters.map((newsletter) => (
                        <CTableRow key={newsletter.id_newsletters}>
                            <CTableDataCell>{newsletter.id_newsletters}</CTableDataCell>
                            <CTableDataCell>{newsletter.title}</CTableDataCell>
                            <CTableDataCell>{newsletter.date_sent}</CTableDataCell>
                            <CTableDataCell>{newsletter.recipients}</CTableDataCell>
                            <CTableDataCell>
                                <CBadge color={newsletter.newsletter_status === 'active' ? 'success' : 'secondary'}>
                                    {newsletter.newsletter_status === 'active' ? 'Activo' : 'Inactivo'}
                                </CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                            <CButton color="warning" variant="outline" size="sm" onClick={() => handleEditNewsletter(newsletter)} className="me-2">
                                <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton color="danger" variant="outline" size="sm" onClick={() => handleDeleteNewsletter(newsletter.id_newsletters)}>
                                <CIcon icon={cilTrash} />
                            </CButton>
                            </CTableDataCell>
                        </CTableRow>
                        ))
                    ) : (
                        <CTableRow>
                            <CTableDataCell colSpan="6" className="text-center py-4 text-muted">No hay comunicados.</CTableDataCell>
                        </CTableRow>
                    )}
                </CTableBody>
                </CTable>
            </CTabPane>

            {/* --- TAB 2: BOLETINES (PDF DOWNLOAD) --- */}
            <CTabPane visible={activeTab === 2}>
                <CAlert color="info">
                    Seleccione un estudiante de la lista para generar y descargar su boletín de calificaciones oficial en PDF.
                </CAlert>
                <div className="mb-3" style={{ maxWidth: '300px' }}>
                    <CFormInput 
                        placeholder="Buscar estudiante..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <CTable bordered hover responsive striped className="align-middle">
                    <CTableHead color="dark">
                        <CTableRow>
                            <CTableHeaderCell>Estudiante</CTableHeaderCell>
                            <CTableHeaderCell>Grado / Sección</CTableHeaderCell>
                            <CTableHeaderCell>Promedio Actual</CTableHeaderCell>
                            <CTableHeaderCell>Estado</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Descargar</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {filteredEnrollments.length > 0 ? (
                            filteredEnrollments.map((enrollment) => (
                                <CTableRow key={enrollment.id_enrollment}>
                                    <CTableDataCell>
                                        <span className="fw-bold">
                                            {enrollment.Student ? `${enrollment.Student.first_name_student} ${enrollment.Student.last_name_student}` : `ID: ${enrollment.id_student}`}
                                        </span>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        {enrollment.Section ? `Sección ${enrollment.Section.num_section}` : 'N/A'}
                                        {/* Aquí podrías agregar el Grado si viene en la data anidada */}
                                    </CTableDataCell>
                                    <CTableDataCell>{enrollment.final_average || '0.00'}</CTableDataCell>
                                    <CTableDataCell>
                                        <CBadge color={enrollment.status === 'Cursando' ? 'primary' : enrollment.status === 'Aprobado' ? 'success' : 'warning'}>
                                            {enrollment.status}
                                        </CBadge>
                                    </CTableDataCell>
                                    <CTableDataCell className="text-end">
                                        <CButton 
                                            color="dark" 
                                            size="sm" 
                                            onClick={() => handleDownloadBulletin(enrollment.id_enrollment)}
                                            title="Descargar PDF"
                                        >
                                            <CIcon icon={cilCloudDownload} className="me-2"/>
                                            Boletín Oficial
                                        </CButton>
                                    </CTableDataCell>
                                </CTableRow>
                            ))
                        ) : (
                            <CTableRow>
                                <CTableDataCell colSpan="5" className="text-center py-4 text-muted">
                                    No se encontraron estudiantes inscritos con calificaciones.
                                </CTableDataCell>
                            </CTableRow>
                        )}
                    </CTableBody>
                </CTable>
            </CTabPane>
        </CTabContent>

        {/* Agregamos backdrop="static" y keyboard={false} para mayor seguridad */}
        <CModal 
            visible={showModal} 
            onClose={handleCloseModal} 
            size="lg" 
            backdrop="static" 
            keyboard={false}
        >
          <CModalHeader closeButton>
            <CModalTitle>{editMode ? 'Editar Comunicado' : 'Nuevo Comunicado'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {errorMessage && <CAlert color="danger">{errorMessage}</CAlert>}
            
            <CForm>
              <div className="mb-3">
                <label className="form-label fw-bold">Tutor (Representante) *</label>
                <CFormSelect
                    value={formData.uid_users}
                    onChange={(e) => setFormData({ ...formData, uid_users: e.target.value })}
                >
                    <option value="">-- Seleccione un Tutor Registrado --</option>
                    {tutors.map((tutor) => (
                    <option key={tutor.uid_users} value={tutor.uid_users}>
                        {tutor.first_name} {tutor.last_name} (DNI: {tutor.dni})
                    </option>
                    ))}
                </CFormSelect>
              </div>

              <div className="row">
                  <div className="col-md-8 mb-3">
                    <label className="form-label fw-bold">Título del Reporte *</label>
                    <CFormInput
                        type="text"
                        placeholder="Ej: Reunión de Padres"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-bold">Fecha de Envío *</label>
                    <CFormInput
                        type="date"
                        value={formData.date_sent}
                        onChange={(e) => setFormData({ ...formData, date_sent: e.target.value })}
                    />
                  </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Contenido / Mensaje *</label>
                <CFormTextarea
                    rows="4"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Grupo Destinatario *</label>
                    <CFormInput
                        type="text"
                        value={formData.recipients}
                        onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Estado *</label>
                    <CFormSelect
                        value={formData.newsletter_status}
                        onChange={(e) => setFormData({ ...formData, newsletter_status: e.target.value })}
                    >
                        <option value="">-- Seleccione --</option>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                    </CFormSelect>
                  </div>
              </div>

            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
            <CButton color="primary" onClick={handleSaveNewsletter}>
              {editMode ? 'Guardar Cambios' : 'Crear Comunicado'}
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default GradeReports;