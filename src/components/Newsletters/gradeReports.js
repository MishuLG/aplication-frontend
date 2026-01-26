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
  CTabPane,
  CRow, // <--- AGREGADO
  CCol  // <--- AGREGADO
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilPlus, cilDescription, cilCloudDownload, cilNotes } from '@coreui/icons';
import API_URL from '../../../config';

const GradeReports = () => {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState(1);
  
  // Data
  const [newsletters, setNewsletters] = useState([]);
  const [tutors, setTutors] = useState([]); 
  const [enrollments, setEnrollments] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    uid_users: '',
    title: '',
    content: '',
    date_sent: new Date().toISOString().split('T')[0],
    newsletter_status: 'active',
    recipients: '',
  });
  
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

 // URLs
  const newslettersUrl = `${API_URL}/newsletters`;
  const tutorsUrl = `${API_URL}/tutors`; 
  const enrollmentsUrl = `${API_URL}/enrollments`; 
  
  // RUTA CORRECTA: Sin '/bulletin' extra
  // Esto generará: http://localhost:4000/api/bulletins/1
  const bulletinUrl = `${API_URL}/bulletins`;

  // Helper de Autenticación
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
      try {
          const [resNews, resTutors, resEnroll] = await Promise.all([
              authenticatedFetch(newslettersUrl),
              authenticatedFetch(tutorsUrl),
              authenticatedFetch(enrollmentsUrl)
          ]);

          if (resNews.ok) setNewsletters(await resNews.json());
          if (resTutors.ok) setTutors(await resTutors.json());
          if (resEnroll.ok) setEnrollments(await resEnroll.json());

      } catch (error) { console.error("Error cargando datos:", error); }
  };

  // --- DESCARGA PDF ---
  const handleDownloadBulletin = async (id_enrollment) => {
      try {
          const token = localStorage.getItem('token');
          // Usamos la URL corregida
          const response = await fetch(`${bulletinUrl}/${id_enrollment}`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `Boletin_${id_enrollment}.pdf`);
              document.body.appendChild(link);
              link.click();
              link.parentNode.removeChild(link);
          } else {
              alert("No se pudo generar el boletín. Verifique si hay notas cargadas.");
          }
      } catch (error) { alert("Error de conexión."); }
  };

  // --- CRUD COMUNICADOS ---
  const handleSaveNewsletter = async () => {
    setErrorMessage(null);
    
    // Validaciones
    if (!formData.uid_users) return setErrorMessage('Seleccione un Tutor.');
    if (!formData.title.trim()) return setErrorMessage('El título es obligatorio.');
    if (!formData.content.trim()) return setErrorMessage('El contenido es obligatorio.');
    if (!formData.recipients.trim()) return setErrorMessage('El grupo destinatario es obligatorio.');

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${newslettersUrl}/${selectedNewsletter.id_newsletters}` : newslettersUrl;

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Error al guardar');
      }

      await fetchData(); 
      handleCloseModal();
    } catch (error) { setErrorMessage(error.message); }
  };

  const handleEditNewsletter = (item) => {
    setSelectedNewsletter(item);
    setFormData({
      uid_users: item.uid_users,
      title: item.title,
      content: item.content,
      date_sent: item.date_sent ? item.date_sent.split('T')[0] : '', 
      newsletter_status: item.newsletter_status || 'active',
      recipients: item.recipients,
    });
    setEditMode(true); setShowModal(true);
  };

  const handleDeleteNewsletter = async (id) => {
    if (!window.confirm("¿Eliminar reporte?")) return;
    try {
      await authenticatedFetch(`${newslettersUrl}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) { alert('Error al eliminar.'); }
  };

  const handleCloseModal = () => { 
      setShowModal(false); 
      setFormData({ 
          uid_users: '', 
          title: '', 
          content: '', 
          date_sent: new Date().toISOString().split('T')[0], 
          newsletter_status: 'active', 
          recipients: '' 
      });
      setEditMode(false); 
      setErrorMessage(null);
  };

  // --- FILTROS ---
  const filteredNewsletters = newsletters.filter((item) => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter((item) => {
      const term = searchTerm.toLowerCase();
      const name = item.Student ? `${item.Student.first_name} ${item.Student.last_name}`.toLowerCase() : '';
      const dni = item.Student?.dni || '';
      return name.includes(term) || dni.includes(term);
  });

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader className="bg-transparent border-0 d-flex align-items-center py-3">
        <h5 className="mb-0 text-body"><CIcon icon={cilDescription} className="me-2"/>Gestión de Informes y Boletines</h5>
      </CCardHeader>
      
      <CCardBody>
        <CNav variant="tabs" className="mb-4 border-bottom-0" style={{cursor:'pointer'}}>
            <CNavItem>
                <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)}>
                    <CIcon icon={cilDescription} className="me-2"/> Comunicados
                </CNavLink>
            </CNavItem>
            <CNavItem>
                <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)}>
                    <CIcon icon={cilNotes} className="me-2"/> Boletines de Notas
                </CNavLink>
            </CNavItem>
        </CNav>

        <CTabContent>
            {/* TAB 1: COMUNICADOS */}
            <CTabPane visible={activeTab === 1}>
                <div className="d-flex justify-content-between mb-3">
                    <CFormInput 
                        placeholder="Buscar por título..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ maxWidth: '300px' }}
                    />
                    <CButton color="primary" onClick={() => setShowModal(true)}>
                        <CIcon icon={cilPlus} className="me-2"/> Crear Comunicado
                    </CButton>
                </div>

                <CTable hover responsive align="middle">
                <CTableHead>
                    <CTableRow>
                    <CTableHeaderCell>Título</CTableHeaderCell>
                    <CTableHeaderCell>Fecha</CTableHeaderCell>
                    <CTableHeaderCell>Destinatario</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {filteredNewsletters.map((item) => (
                        <CTableRow key={item.id_newsletters}>
                            <CTableDataCell className="fw-semibold">{item.title}</CTableDataCell>
                            <CTableDataCell className="text-body-secondary small">{item.date_sent}</CTableDataCell>
                            <CTableDataCell>{item.recipients}</CTableDataCell>
                            <CTableDataCell>
                                <CBadge color={item.newsletter_status === 'active' ? 'success' : 'secondary'}>
                                    {item.newsletter_status === 'active' ? 'Activo' : 'Inactivo'}
                                </CBadge>
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                                <CButton color="warning" variant="ghost" size="sm" onClick={() => handleEditNewsletter(item)} className="me-2"><CIcon icon={cilPencil}/></CButton>
                                <CButton color="danger" variant="ghost" size="sm" onClick={() => handleDeleteNewsletter(item.id_newsletters)}><CIcon icon={cilTrash}/></CButton>
                            </CTableDataCell>
                        </CTableRow>
                    ))}
                    {filteredNewsletters.length === 0 && <CTableRow><CTableDataCell colSpan="5" className="text-center text-body-secondary py-4">No hay comunicados registrados.</CTableDataCell></CTableRow>}
                </CTableBody>
                </CTable>
            </CTabPane>

            {/* TAB 2: BOLETINES */}
            <CTabPane visible={activeTab === 2}>
                <CAlert color="info" className="d-flex align-items-center">
                    <CIcon icon={cilCloudDownload} className="me-2"/>
                    Descargue el boletín oficial de calificaciones por estudiante.
                </CAlert>
                
                <div className="mb-3" style={{ maxWidth: '300px' }}>
                    <CFormInput 
                        placeholder="Buscar estudiante..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <CTable hover responsive align="middle">
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Estudiante</CTableHeaderCell>
                            <CTableHeaderCell>Grado / Sección</CTableHeaderCell>
                            <CTableHeaderCell>Promedio</CTableHeaderCell>
                            <CTableHeaderCell>Estado</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Acción</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {filteredEnrollments.map((enrollment) => (
                            <CTableRow key={enrollment.id_enrollment}>
                                <CTableDataCell>
                                    <span className="fw-bold d-block">
                                        {enrollment.Student?.first_name} {enrollment.Student?.last_name}
                                    </span>
                                    <span className="small text-body-secondary">{enrollment.Student?.dni}</span>
                                </CTableDataCell>
                                <CTableDataCell>
                                    {enrollment.Section ? (
                                        <CBadge color="light" textColor="dark" className="border">
                                            {enrollment.Section.Grade?.name_grade} "{enrollment.Section.num_section}"
                                        </CBadge>
                                    ) : <span className="text-danger small">Sin Sección</span>}
                                </CTableDataCell>
                                <CTableDataCell className="fw-bold">
                                    {/* Muestra promedio con 2 decimales */}
                                    {enrollment.final_average ? Number(enrollment.final_average).toFixed(2) : '0.00'}
                                </CTableDataCell>
                                <CTableDataCell>
                                    <CBadge color="info">{enrollment.status}</CBadge>
                                </CTableDataCell>
                                <CTableDataCell className="text-end">
                                    <CButton color="dark" variant="outline" size="sm" onClick={() => handleDownloadBulletin(enrollment.id_enrollment)}>
                                        <CIcon icon={cilCloudDownload} className="me-2"/> PDF
                                    </CButton>
                                </CTableDataCell>
                            </CTableRow>
                        ))}
                        {filteredEnrollments.length === 0 && <CTableRow><CTableDataCell colSpan="5" className="text-center text-body-secondary py-4">No hay estudiantes inscritos.</CTableDataCell></CTableRow>}
                    </CTableBody>
                </CTable>
            </CTabPane>
        </CTabContent>

        {/* MODAL COMUNICADO */}
        <CModal visible={showModal} onClose={handleCloseModal} backdrop="static" size="lg">
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar' : 'Crear'} Comunicado</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {errorMessage && <CAlert color="danger">{errorMessage}</CAlert>}
            <CForm>
              <CRow className="mb-3">
                  <CCol md={6}>
                    <label className="form-label">Tutor Destinatario</label>
                    <CFormSelect value={formData.uid_users} onChange={(e) => setFormData({ ...formData, uid_users: e.target.value })}>
                        <option value="">-- Seleccione --</option>
                        {tutors.map((t) => (
                            <option key={t.uid_users || t.id_tutor} value={t.uid_users}>
                                {t.User ? `${t.User.first_name} ${t.User.last_name}` : 'Usuario desconocido'} (DNI: {t.dni})
                            </option>
                        ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <label className="form-label">Grupo Destinatario (Opcional)</label>
                    <CFormInput placeholder="Ej: Padres de 1er Grado" value={formData.recipients} onChange={(e) => setFormData({ ...formData, recipients: e.target.value })} />
                  </CCol>
              </CRow>

              <div className="mb-3">
                <label className="form-label">Título del Comunicado</label>
                <CFormInput value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Contenido</label>
                <CFormTextarea rows="5" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
              </div>

              <CRow>
                  <CCol md={6}>
                    <label className="form-label">Fecha de Envío</label>
                    <CFormInput type="date" value={formData.date_sent} onChange={(e) => setFormData({ ...formData, date_sent: e.target.value })} />
                  </CCol>
                  <CCol md={6}>
                    <label className="form-label">Estado</label>
                    <CFormSelect value={formData.newsletter_status} onChange={(e) => setFormData({ ...formData, newsletter_status: e.target.value })}>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                    </CFormSelect>
                  </CCol>
              </CRow>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
            <CButton color="primary" onClick={handleSaveNewsletter}>Guardar Comunicado</CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default GradeReports;