import React, { useState } from 'react';
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
  CFormInput
} from '@coreui/react';


const generateRandomUID = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uid = '';
  for (let i = 0; i < 7; i++) {
    uid += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return uid;
};

const Tutors = () => {
    const [tutors, setTutors] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const [formData, setFormData] = useState({
      uidUser: '',
      firstName: '',
      lastName: '',
      idCard: '',
      phoneNumber: '',
      email: '',
      dateOfBirth: '',
      createdAt: new Date().toISOString().split('T')[0], 
      updatedAt: new Date().toISOString().split('T')[0],
      isActive: true
    });

    const [selectedTutor, setSelectedTutor] = useState(null);

    const handleAddTutor = () => {
        setFormData({
          uidUser: generateRandomUID(), 
          firstName: '',
          lastName: '',
          idCard: '',
          phoneNumber: '',
          email: '',
          dateOfBirth: '',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          isActive: true
        });
        setShowAddModal(true);
    };

    const handleSaveTutor = () => {
        if (selectedTutor) {
            setTutors(tutors.map((tutor) => (tutor.uidUser === selectedTutor.uidUser ? { ...formData } : tutor)));
        } else {
            const newTutor = { ...formData }; 
            setTutors([...tutors, newTutor]);
        }
        setShowAddModal(false);
        setSelectedTutor(null);
    };

    const handleDeleteTutor = (uidUser) => {
        setSelectedTutor(tutors.find((t) => t.uidUser === uidUser));
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (selectedTutor) {
            const updatedTutors = tutors.filter((tutor) => tutor.uidUser !== selectedTutor.uidUser);
            setTutors(updatedTutors);
        }
        setShowDeleteModal(false);
        alert('Tutor successfully removed');
        setSelectedTutor(null);
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
                            <CTableHeaderCell>UID Users</CTableHeaderCell>
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
                          <CTableRow key={tutor.uidUser}>
                            <CTableDataCell>{tutor.uidUser}</CTableDataCell>
                            <CTableDataCell>{tutor.firstName}</CTableDataCell>
                            <CTableDataCell>{tutor.lastName}</CTableDataCell>
                            <CTableDataCell>{tutor.idCard}</CTableDataCell>
                            <CTableDataCell>{tutor.phoneNumber}</CTableDataCell>
                            <CTableDataCell>{tutor.email}</CTableDataCell>
                            <CTableDataCell>{tutor.dateOfBirth}</CTableDataCell>
                            <CTableDataCell>
                              <CButton color="warning" onClick={() => {
                                  setSelectedTutor(tutor);
                                  setFormData(tutor); 
                                  setShowAddModal(true);
                              }}>
                                Edit
                              </CButton>{' '}
                              <CButton color="danger" onClick={() => handleDeleteTutor(tutor.uidUser)}>
                                Delete
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                    </CTableBody>

                </CTable>

                <CModal visible={showAddModal} onClose={() => {
                    setShowAddModal(false);
                    setSelectedTutor(null);
                }}>
                    <CModalHeader >
                        <CModalTitle>{selectedTutor ? 'Edit Tutor' : 'Add Tutor'}</CModalTitle >
                    </CModalHeader >
                    <CModalBody >
                        <CForm >
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
                        </CForm >
                    </CModalBody >
                    <CModalFooter >
                        <CButton color="success" onClick={handleSaveTutor}>
                          Save
                        </CButton >
                        <CButton color="secondary" onClick={() => {
                          setShowAddModal(false);
                          setSelectedTutor(null);
                        }}>
                          Cancel
                        </CButton >
                    </CModalFooter >
                </CModal >

                <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                    <CModalHeader >
                        <CModalTitle>Confirm Deletion</CModalTitle >
                    </CModalHeader >
                    <CModalBody >
                        Are you sure you want to remove the tutor {selectedTutor?.firstName}?
                    </CModalBody >
                    <CModalFooter >
                        <CButton color="danger" onClick={handleConfirmDelete}>
                          Delete
                        </CButton >
                        <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
                          Cancel
                        </CButton >
                    </CModalFooter >
                </CModal >

            </CCardBody >
        </CCard >

);

};

export default Tutors;