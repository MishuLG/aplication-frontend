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
} from '@coreui/react';
import API_URL from '../../../config';

const GradeReports = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [users, setUsers] = useState([]);
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
  const [filter, setFilter] = useState({ title: '', newsletter_status: '' });

  const newslettersUrl = `${API_URL}/newsletters`;
  const usersUrl = `${API_URL}/users`;

  useEffect(() => {
    fetchNewsletters();
    fetchUsers();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const response = await fetch(newslettersUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setNewsletters(data);
      } else {
        console.error('Received data is not an array:', data);
        alert('Error: Datos recibidos no son válidos.');
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      alert('Ocurrió un error al obtener los reportes de calificaciones. Por favor, inténtelo de nuevo.');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(usersUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Received data is not an array:', data);
        alert('Error: Datos recibidos no son válidos.');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Ocurrió un error al obtener los usuarios. Por favor, inténtelo de nuevo.');
    }
  };

  const getAvailableUsers = () => {
    const assignedUserIds = newsletters.map((newsletter) => newsletter.uid_users);
    return users.filter((user) => !assignedUserIds.includes(user.uid_users));
  };

  const handleSaveNewsletter = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${newslettersUrl}/${selectedNewsletter.id_newsletters}` : newslettersUrl;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      fetchNewsletters();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving newsletter:', error);
      alert('Ocurrió un error al guardar el reporte de calificaciones. Por favor, inténtelo de nuevo.');
    }
  };

  const handleEditNewsletter = (newsletter) => {
    setSelectedNewsletter(newsletter);
    setFormData({
      uid_users: newsletter.uid_users,
      title: newsletter.title,
      content: newsletter.content,
      date_sent: newsletter.date_sent,
      newsletter_status: newsletter.newsletter_status,
      recipients: newsletter.recipients,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteNewsletter = async (id) => {
    try {
      const response = await fetch(`${newslettersUrl}/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      fetchNewsletters();
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      alert('Ocurrió un error al eliminar el reporte de calificaciones. Por favor, inténtelo de nuevo.');
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
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
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredNewsletters = newsletters.filter(
    (newsletter) =>
      newsletter.title.toLowerCase().includes(filter.title.toLowerCase()) &&
      (filter.newsletter_status === '' || newsletter.newsletter_status === filter.newsletter_status)
  );

  return (
    <CCard>
      <CCardHeader>
        <h5>Reportes de Calificaciones</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Agregar Reporte
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filtrar por título"
            name="title"
            value={filter.title}
            onChange={handleFilterChange}
            className="mb-2"
          />
          <CFormSelect
            placeholder="Filtrar por estado"
            name="newsletter_status"
            value={filter.newsletter_status}
            onChange={handleFilterChange}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </CFormSelect>
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Reporte</CTableHeaderCell>
              <CTableHeaderCell>ID Usuario</CTableHeaderCell>
              <CTableHeaderCell>Título</CTableHeaderCell>
              <CTableHeaderCell>Contenido</CTableHeaderCell>
              <CTableHeaderCell>Fecha de Envío</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Destinatarios</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredNewsletters.map((newsletter) => (
              <CTableRow key={newsletter.id_newsletters}>
                <CTableDataCell>{newsletter.id_newsletters}</CTableDataCell>
                <CTableDataCell>{newsletter.uid_users}</CTableDataCell>
                <CTableDataCell>{newsletter.title}</CTableDataCell>
                <CTableDataCell>{newsletter.content}</CTableDataCell>
                <CTableDataCell>{newsletter.date_sent}</CTableDataCell>
                <CTableDataCell>{newsletter.newsletter_status}</CTableDataCell>
                <CTableDataCell>{newsletter.recipients}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() => handleEditNewsletter(newsletter)}
                  >
                    Editar
                  </CButton>{' '}
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteNewsletter(newsletter.id_newsletters)}
                  >
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} onClose={handleCloseModal}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Reporte' : 'Agregar Reporte'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormSelect
                label="ID Usuario"
                value={formData.uid_users}
                onChange={(e) => setFormData({ ...formData, uid_users: e.target.value })}
                required
              >
                <option value="">Seleccionar Usuario</option>
                {getAvailableUsers().map((user) => (
                  <option key={user.uid_users} value={user.uid_users}>
                    {user.first_name} {user.last_name} ({user.uid_users})
                  </option>
                ))}
              </CFormSelect>
              <CFormInput
                type="text"
                label="Título"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <CFormTextarea
                label="Contenido"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows="3"
                required
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveNewsletter}>
              Guardar
            </CButton>
            <CButton color="secondary" onClick={handleCloseModal}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default GradeReports;