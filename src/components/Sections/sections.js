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
} from '@coreui/react';
import API_URL from '../../../config';  

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [formData, setFormData] = useState({
    id_class_schedules: '',
    num_section: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [filter, setFilter] = useState({ id_class_schedules: '', num_section: '' });

  const sectionsUrl = `${API_URL}/sections`;

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch(sectionsUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSections(data);
      } else {
        console.error('Received data is not an array:', data);
        alert('Error: Invalid data received.');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      alert('An error occurred while fetching sections. Please try again.');
    }
  };

  const handleSaveSection = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${sectionsUrl}/${selectedSection.id_section}` : sectionsUrl;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      fetchSections();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving section:', error);
      alert('An error occurred while saving the section. Please try again.');
    }
  };

  const handleEditSection = (section) => {
    setSelectedSection(section);
    setFormData({
      id_class_schedules: section.id_class_schedules,
      num_section: section.num_section,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteSection = async (id) => {
    try {
      const response = await fetch(`${sectionsUrl}/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('An error occurred while deleting the section. Please try again.');
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      id_class_schedules: '',
      num_section: '',
    });
    setEditMode(false);
    setSelectedSection(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredSections = sections.filter(
  (section) => {
    const classScheduleId = section.id_class_schedules ? section.id_class_schedules.toString() : '';
    const sectionNumber = section.num_section ? section.num_section.toString() : '';

    return (
      classScheduleId.includes(filter.id_class_schedules) &&
      sectionNumber.includes(filter.num_section)
    );
  }
);


  return (
    <CCard>
      <CCardHeader>
        <h5>Secciones</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Agregar Sección
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filtrar por ID de horario de clase"
            name="id_class_schedules"
            value={filter.id_class_schedules}
            onChange={handleFilterChange}
            className="mb-2"
          />
          <CFormInput
            placeholder="Filtrar por número de sección"
            name="num_section"
            value={filter.num_section}
            onChange={handleFilterChange}
          />
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Sección</CTableHeaderCell>
              <CTableHeaderCell>ID Horario de Clase</CTableHeaderCell>
              <CTableHeaderCell>Número de Sección</CTableHeaderCell>
              <CTableHeaderCell>Creado En</CTableHeaderCell>
              <CTableHeaderCell>Actualizado En</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredSections.map((section) => (
              <CTableRow key={section.id_section}>
                <CTableDataCell>{section.id_section}</CTableDataCell>
                <CTableDataCell>{section.id_class_schedules}</CTableDataCell>
                <CTableDataCell>{section.num_section}</CTableDataCell>
                <CTableDataCell>{section.created_at}</CTableDataCell>
                <CTableDataCell>{section.updated_at}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="warning" size="sm" onClick={() => handleEditSection(section)}>
                    Editar
                  </CButton>{' '}
                  <CButton color="danger" size="sm" onClick={() => handleDeleteSection(section.id_section)}>
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} onClose={handleCloseModal}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Sección' : 'Agregar Sección'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                label="ID Horario de Clase"
                value={formData.id_class_schedules}
                onChange={(e) => setFormData({ ...formData, id_class_schedules: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Número de Sección"
                value={formData.num_section}
                onChange={(e) => setFormData({ ...formData, num_section: e.target.value })}
                required
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveSection}>
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

export default Sections;
