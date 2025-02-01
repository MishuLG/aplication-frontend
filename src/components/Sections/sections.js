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

  const API_URL = 'http://localhost:4000/api/sections';

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const handleSaveSection = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${API_URL}/${selectedSection.id_section}` : API_URL;

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      fetchSections();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving section:', error);
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
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
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
    (section) =>
      section.id_class_schedules.toString().includes(filter.id_class_schedules) &&
      section.num_section.toString().includes(filter.num_section)
  );

  return (
    <CCard>
      <CCardHeader>
        <h5>Sections</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Add Section
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filter by class schedule ID"
            name="id_class_schedules"
            value={filter.id_class_schedules}
            onChange={handleFilterChange}
            className="mb-2"
          />
          <CFormInput
            placeholder="Filter by section number"
            name="num_section"
            value={filter.num_section}
            onChange={handleFilterChange}
          />
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Section</CTableHeaderCell>
              <CTableHeaderCell>Class Schedule ID</CTableHeaderCell>
              <CTableHeaderCell>Section Number</CTableHeaderCell>
              <CTableHeaderCell>Created At</CTableHeaderCell>
              <CTableHeaderCell>Updated At</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
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
                    Edit
                  </CButton>{' '}
                  <CButton color="danger" size="sm" onClick={() => handleDeleteSection(section.id_section)}>
                    Delete
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} onClose={handleCloseModal}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Edit Section' : 'Add Section'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                label="Class Schedule ID"
                value={formData.id_class_schedules}
                onChange={(e) => setFormData({ ...formData, id_class_schedules: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Section Number"
                value={formData.num_section}
                onChange={(e) => setFormData({ ...formData, num_section: e.target.value })}
                required
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveSection}>
              Save
            </CButton>
            <CButton color="secondary" onClick={handleCloseModal}>
              Cancel
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Sections;
