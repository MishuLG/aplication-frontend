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

const Students = () => {
  const [students, setStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState({ sectionId: '', schoolYearId: '', firstName: '', lastName: '', dateOfBirth: '', healthRecord: '' });
  
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleAddStudent = () => {
    setFormData({ sectionId: '', schoolYearId: '', firstName: '', lastName: '', dateOfBirth: '', healthRecord: '' });
    setShowAddModal(true);
  };

  const handleSaveStudent = () => {
    if (selectedStudent) {
      setStudents(students.map((student) => (student.id === selectedStudent.id ? { ...formData } : student)));
    } else {
      const newStudent = { id: students.length + 1, ...formData }; 
      setStudents([...students, newStudent]);
    }
    setShowAddModal(false);
    setSelectedStudent(null);
  };

  const handleDeleteStudent = (studentId) => {
    setSelectedStudent(students.find((s) => s.id === studentId));
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setStudents(students.filter((student) => student.id !== selectedStudent.id));
    setShowDeleteModal(false);
    setSelectedStudent(null);
  };

  return (
    <CCard>
      <CCardHeader>
        <h5>Registered Students</h5>
        <CButton color="success" onClick={handleAddStudent}>
        Add Student
        </CButton>
      </CCardHeader>
      <CCardBody>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>ID Section</CTableHeaderCell>
              <CTableHeaderCell>ID School year</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Lastname</CTableHeaderCell>
              <CTableHeaderCell>Birthdate</CTableHeaderCell>
              <CTableHeaderCell>Medical Record</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {students.map((student) => (
              <CTableRow key={student.id}>
                <CTableDataCell>{student.id}</CTableDataCell>
                <CTableDataCell>{student.sectionId}</CTableDataCell>
                <CTableDataCell>{student.schoolYearId}</CTableDataCell>
                <CTableDataCell>{student.firstName}</CTableDataCell>
                <CTableDataCell>{student.lastName}</CTableDataCell>
                <CTableDataCell>{student.dateOfBirth}</CTableDataCell>
                <CTableDataCell>{student.healthRecord}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="warning" onClick={() => {
                    setSelectedStudent(student);
                    setFormData(student);
                    setShowAddModal(true);
                  }}>
                    Edit
                  </CButton>{' '}
                  <CButton color="danger" onClick={() => handleDeleteStudent(student.id)}>
                    Delete
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showAddModal} onClose={() => setShowAddModal(false)}>
          <CModalHeader >
            <CModalTitle>{selectedStudent ? 'Edit Student' : 'Add Student'}</CModalTitle >
          </CModalHeader >
          <CModalBody >
            <CForm >
              <CFormInput
                type="text"
                label="ID Section"
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
              />
              <CFormInput
                type="text"
                label="ID School year"
                value={formData.schoolYearId}
                onChange={(e) => setFormData({ ...formData, schoolYearId: e.target.value })}
              />
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
                type="date"
                label="Birthdate"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
              <CFormInput
                type="text"
                label="Medical Record"
                value={formData.healthRecord}
                onChange={(e) => setFormData({ ...formData, healthRecord: e.target.value })}
              />
            </CForm >
          </CModalBody >
          <CModalFooter >
            <CButton color="success" onClick={handleSaveStudent}>
              Save
            </CButton >
            <CButton color="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </CButton >
          </CModalFooter >
        </CModal >
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <CModalHeader >
            <CModalTitle>Confirm Deletion</CModalTitle >
          </CModalHeader >
          <CModalBody >
            Are you sure you want to remove the student {selectedStudent?.firstName}?
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

export default Students;