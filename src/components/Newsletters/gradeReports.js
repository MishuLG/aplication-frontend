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
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilPlus, cilSearch, cilDescription } from '@coreui/icons';
import API_URL from '../../../config';

const GradeReports = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [tutors, setTutors] = useState([]); 
  
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

  useEffect(() => {
    fetchNewsletters();
    fetchTutors();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const response = await fetch(newslettersUrl, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNewsletters(data);
      } else {
        console.error('Error fetching newsletters');
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    }
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
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  const handleSaveNewsletter = async () => {
    setErrorMessage(null);

    // --- Validaciones Frontend ---
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

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar');
      }

      fetchNewsletters();
      handleCloseModal();
      alert(editMode ? 'Reporte actualizado correctamente' : 'Reporte creado correctamente');
    } catch (error) {
      setErrorMessage(error.message);
    }
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
    setEditMode(true);
    setShowModal(true);
    setErrorMessage(null);
  };

  const handleDeleteNewsletter = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este reporte permanentemente?")) return;

    try {
      const response = await fetch(`${newslettersUrl}/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (!response.ok) {
        throw new Error('Error del servidor');
      }

      fetchNewsletters();
    } catch (error) {
      alert('Error al eliminar el reporte.');
    }
  };

  const resetForm = () => {
    setFormData({
      uid_users: '',
      title: '',
      content: '',
      date_sent: '',
      newsletter_status: '',
      recipients: '',
    });
    setEditMode(false);
    setSelectedNewsletter(null);
    setErrorMessage(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };


  const filteredNewsletters = newsletters.filter((item) => {
    const term = searchTerm.toLowerCase();
    const tutorName = item.first_name ? `${item.first_name} ${item.last_name}`.toLowerCase() : '';
    const title = item.title ? item.title.toLowerCase() : '';
    return tutorName.includes(term) || title.includes(term);
  });

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5><CIcon icon={cilDescription} className="me-2"/>Gestión de Boletines / Reportes</h5>
        <CButton color="primary" onClick={() => setShowModal(true)}>
          <CIcon icon={cilPlus} /> Nuevo Reporte
        </CButton>
      </CCardHeader>
      <CCardBody>
        
        {/* Barra de Búsqueda */}
        <div className="mb-4 d-flex" style={{ maxWidth: '400px' }}>
             <CFormInput 
                placeholder="Buscar por tutor o título..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<CIcon icon={cilSearch} />}
             />
        </div>

        <CTable bordered hover responsive striped className="align-middle">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Tutor Asignado</CTableHeaderCell>
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
                    <CTableDataCell>
                        <strong>{newsletter.first_name} {newsletter.last_name}</strong>
                    </CTableDataCell>
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
                    <CTableDataCell colSpan="7" className="text-center py-4 text-muted">
                        No hay reportes registrados.
                    </CTableDataCell>
                </CTableRow>
            )}
          </CTableBody>
        </CTable>

        {/* Modal */}
        <CModal visible={showModal} onClose={handleCloseModal} size="lg">
          <CModalHeader closeButton>
            <CModalTitle>{editMode ? 'Editar Reporte' : 'Nuevo Reporte de Notas'}</CModalTitle>
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
                        placeholder="Ej: Boletín Primer Lapso 2024"
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
                <label className="form-label fw-bold">Contenido / Observaciones *</label>
                <CFormTextarea
                    rows="4"
                    placeholder="Escriba aquí los detalles del reporte..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Grupo Destinatario *</label>
                    <CFormInput
                        type="text"
                        placeholder="Ej: Padres, Alumno, Administrativo"
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
                        <option value="active">Activo (Visible)</option>
                        <option value="inactive">Inactivo (Borrador)</option>
                    </CFormSelect>
                  </div>
              </div>

            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>
              Cancelar
            </CButton>
            <CButton color="primary" onClick={handleSaveNewsletter}>
              {editMode ? 'Guardar Cambios' : 'Crear Reporte'}
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default GradeReports;