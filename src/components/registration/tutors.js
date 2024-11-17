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

import axios from 'axios';

const Tutors = () => {
  const [tutors, setTutors] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idCard: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  const [selectedTutor, setSelectedTutor] = useState(null);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await axios.get('http://localhost:3001/tutors');
        setTutors(response.data);
      } catch (error) {
        console.error('Error fetching tutors:', error);
      }
    };

    fetchTutors();
  }, []);

  const handleSaveTutor = async () => {
    try {
      if (selectedTutor) {
        const response = await axios.put(
          `http://localhost:3001/tutors/${selectedTutor.id}`,
          formData
        );
        setTutors(
          tutors.map((tutor) =>
            tutor.id === selectedTutor.id ? response.data : tutor
          )
        );
      } else {
        const response = await axios.post('http://localhost:3001/tutors', formData);
        setTutors([...tutors, response.data]);
      }
      setShowAddModal(false);
      setSelectedTutor(null);
    } catch (error) {
      console.error('Error saving tutor:', error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/tutors/${selectedTutorId}`);
      setTutors(tutors.filter((tutor) => tutor.id !== selectedTutorId));
      setShowDeleteModal(false);
      setSelectedTutorId(null);
      alert('Tutor successfully deleted');
    } catch (error) {
      console.error('Error deleting tutor:', error);
    }
  };

  const handleAddTutor = () => {
    setFormData({
      firstName: '',
      lastName: '',
      idCard: '',
      phoneNumber: '',
      email: '',
      dateOfBirth: '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isActive: true,
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedTutorId(id);
    setShowDeleteModal(true);
  };

  return (
    <CCard>
      <CCardHeader>
        <h5>Registered Tutors</h5>
        <CButton color="success" onClick={handleAddTutor}>
          Add Tutor
        </CButton>
      </CCardHeader>

      <CCardBody>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Lastname</CTableHeaderCell>
              <CTableHeaderCell>ID Card</CTableHeaderCell>
              <CTableHeaderCell>Telephone Number</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Birthdate</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {tutors.map((tutor) => (
              <CTableRow key={tutor.id}>
                <CTableDataCell>{tutor.firstName}</CTableDataCell>
                <CTableDataCell>{tutor.lastName}</CTableDataCell>
                <CTableDataCell>{tutor.idCard}</CTableDataCell>
                <CTableDataCell>{tutor.phoneNumber}</CTableDataCell>
                <CTableDataCell>{tutor.email}</CTableDataCell>
                <CTableDataCell>{tutor.dateOfBirth}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="warning"
                    onClick={() => {
                      setSelectedTutor(tutor);
                      setFormData(tutor);
                      setShowAddModal(true);
                    }}
                  >
                    Edit
                  </CButton>{' '}
                  <CButton color="danger" onClick={() => handleDeleteClick(tutor.id)}>
                    Delete
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showAddModal} onClose={() => setShowAddModal(false)}>
          <CModalHeader>
            <CModalTitle>{selectedTutor ? 'Edit Tutor' : 'Add Tutor'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                label="Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <CFormInput
                type="text"
                label="Lastname"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
              <CFormInput
                type="text"
                label="ID Card"
                value={formData.idCard}
                onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
              />
              <CFormInput
                type="tel"
                label="Telephone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
              <CFormInput
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <CFormInput
                type="date"
                label="Birthdate"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveTutor}>
              Save
            </CButton>
            <CButton color="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </CButton>
          </CModalFooter>
        </CModal>

        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <CModalHeader>
            <CModalTitle>Confirm Deletion</CModalTitle>
          </CModalHeader>
          <CModalBody>
            Are you sure you want to remove the tutor{' '}
            {tutors.find((tutor) => tutor.id === selectedTutorId)?.firstName}?
          </CModalBody>
          <CModalFooter>
            <CButton color="danger" onClick={handleConfirmDelete}>
              Delete
            </CButton>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Tutors;
