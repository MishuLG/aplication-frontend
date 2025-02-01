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

const Students = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    id_tutor: '',
    id_section: '',
    id_school_year: '',
    first_name_student: '',
    last_name_student: '',
    date_of_birth_student: '',
    health_record: '',
    gender: '',
    street: '',
    city: '',
    zip_code: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState({ first_name_student: '', id_section: '' });

  const BASE_URL = 'http://localhost:4000/api';

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${BASE_URL}/students`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSaveStudent = async () => {
    try {
      const requestOptions = {
        method: editMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      };

      const url = editMode
        ? `${BASE_URL}/students/${selectedStudent.id_student}`
        : `${BASE_URL}/students`;

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error('Failed to save student');
      }

      await fetchStudents();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      id_tutor: student.id_tutor,
      id_section: student.id_section,
      id_school_year: student.id_school_year,
      first_name_student: student.first_name_student,
      last_name_student: student.last_name_student,
      date_of_birth_student: student.date_of_birth_student
        ? student.date_of_birth_student.split('T')[0]
        : '',
      health_record: student.health_record,
      gender: student.gender,
      street: student.street,
      city: student.city,
      zip_code: student.zip_code,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteStudent = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/students/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      await fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id_tutor: '',
      id_section: '',
      id_school_year: '',
      first_name_student: '',
      last_name_student: '',
      date_of_birth_student: '',
      health_record: '',
      gender: '',
      street: '',
      city: '',
      zip_code: '',
    });
    setEditMode(false);
    setSelectedStudent(null);
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredStudents = students.filter(
    (student) =>
      (student.first_name_student &&
        student.first_name_student.toLowerCase().includes(filter.first_name_student.toLowerCase())) &&
      (student.id_section && student.id_section.toString().includes(filter.id_section))
  );

  return (
    <CCard>
      <CCardHeader>
        <h5>Students</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Add Student
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filter by first name"
            name="first_name_student"
            value={filter.first_name_student}
            onChange={handleFilterChange}
            className="mb-2"
          />
          <CFormInput
            placeholder="Filter by section ID"
            name="id_section"
            value={filter.id_section}
            onChange={handleFilterChange}
          />
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Student</CTableHeaderCell>
              <CTableHeaderCell>Tutor ID</CTableHeaderCell>
              <CTableHeaderCell>Section ID</CTableHeaderCell>
              <CTableHeaderCell>School Year ID</CTableHeaderCell>
              <CTableHeaderCell>First Name</CTableHeaderCell>
              <CTableHeaderCell>Last Name</CTableHeaderCell>
              <CTableHeaderCell>Date of Birth</CTableHeaderCell>
              <CTableHeaderCell>Health Record</CTableHeaderCell>
              <CTableHeaderCell>Gender</CTableHeaderCell>
              <CTableHeaderCell>Street</CTableHeaderCell>
              <CTableHeaderCell>City</CTableHeaderCell>
              <CTableHeaderCell>Zip Code</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredStudents.map((student) => (
              <CTableRow key={student.id_student}>
                <CTableDataCell>{student.id_student}</CTableDataCell>
                <CTableDataCell>{student.id_tutor}</CTableDataCell>
                <CTableDataCell>{student.id_section}</CTableDataCell>
                <CTableDataCell>{student.id_school_year}</CTableDataCell>
                <CTableDataCell>{student.first_name_student}</CTableDataCell>
                <CTableDataCell>{student.last_name_student}</CTableDataCell>
                <CTableDataCell>{student.date_of_birth_student}</CTableDataCell>
                <CTableDataCell>{student.health_record}</CTableDataCell>
                <CTableDataCell>{student.gender}</CTableDataCell>
                <CTableDataCell>{student.street}</CTableDataCell>
                <CTableDataCell>{student.city}</CTableDataCell>
                <CTableDataCell>{student.zip_code}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() => handleEditStudent(student)}
                  >
                    Edit
                  </CButton>{' '}
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteStudent(student.id_student)}
                  >
                    Delete
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} onClose={() => { setShowModal(false); resetForm(); }}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Edit Student' : 'Add Student'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                label="Tutor ID"
                value={formData.id_tutor}
                onChange={(e) => setFormData({ ...formData, id_tutor: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Section ID"
                value={formData.id_section}
                onChange={(e) => setFormData({ ...formData, id_section: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="School Year ID"
                value={formData.id_school_year}
                onChange={(e) => setFormData({ ...formData, id_school_year: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="First Name"
                value={formData.first_name_student}
                onChange={(e) => setFormData({ ...formData, first_name_student: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Last Name"
                value={formData.last_name_student}
                onChange={(e) => setFormData({ ...formData, last_name_student: e.target.value })}
                required
              />
              <CFormInput
                type="date"
                label="Date of Birth"
                value={formData.date_of_birth_student}
                onChange={(e) => setFormData({ ...formData, date_of_birth_student: e.target.value })}
                required
              />
              <CFormTextarea
                label="Health Record"
                value={formData.health_record}
                onChange={(e) => setFormData({ ...formData, health_record: e.target.value })}
                rows="3"
              />
              <CFormSelect
                label="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </CFormSelect>
              <CFormInput
                type="text"
                label="Street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Zip Code"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                required
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveStudent}>
              Save
            </CButton>
            <CButton color="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancel
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Students;