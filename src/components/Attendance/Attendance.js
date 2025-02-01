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

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [formData, setFormData] = useState({
    id_student: '',
    id_section: '',
    attendance_date: '',
    status: '',
    remarks: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [filter, setFilter] = useState({ id_student: '', attendance_date: '' });

  const API_URL = 'http://localhost:4000/api/attendance';

  useEffect(() => {
    fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setAttendances(data);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const handleSaveAttendance = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${API_URL}/${selectedAttendance.id_attendance}` : API_URL;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      fetchAttendances();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving attendance record:', error);
    }
  };

  const handleEditAttendance = (attendance) => {
    setSelectedAttendance(attendance);
    setFormData({
      id_student: attendance.id_student,
      id_section: attendance.id_section,
      attendance_date: attendance.attendance_date,
      status: attendance.status,
      remarks: attendance.remarks,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteAttendance = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      fetchAttendances();
    } catch (error) {
      console.error('Error deleting attendance record:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      id_student: '',
      id_section: '',
      attendance_date: '',
      status: '',
      remarks: '',
    });
    setEditMode(false);
    setSelectedAttendance(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredAttendances = attendances.filter(
    (attendance) =>
      attendance.id_student.toString().includes(filter.id_student) &&
      attendance.attendance_date.includes(filter.attendance_date)
  );

  return (
    <CCard>
      <CCardHeader>
        <h5>Attendance</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Add Attendance Record
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filter by student ID"
            name="id_student"
            value={filter.id_student}
            onChange={handleFilterChange}
            className="mb-2"
          />
          <CFormInput
            type="date"
            placeholder="Filter by date"
            name="attendance_date"
            value={filter.attendance_date}
            onChange={handleFilterChange}
          />
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Attendance</CTableHeaderCell>
              <CTableHeaderCell>Student ID</CTableHeaderCell>
              <CTableHeaderCell>Section ID</CTableHeaderCell>
              <CTableHeaderCell>Attendance Date</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Remarks</CTableHeaderCell>
              <CTableHeaderCell>Created At</CTableHeaderCell>
              <CTableHeaderCell>Updated At</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredAttendances.map((attendance) => (
              <CTableRow key={attendance.id_attendance}>
                <CTableDataCell>{attendance.id_attendance}</CTableDataCell>
                <CTableDataCell>{attendance.id_student}</CTableDataCell>
                <CTableDataCell>{attendance.id_section}</CTableDataCell>
                <CTableDataCell>{attendance.attendance_date}</CTableDataCell>
                <CTableDataCell>{attendance.status}</CTableDataCell>
                <CTableDataCell>{attendance.remarks}</CTableDataCell>
                <CTableDataCell>{attendance.created_at}</CTableDataCell>
                <CTableDataCell>{attendance.updated_at}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() => handleEditAttendance(attendance)}
                  >
                    Edit
                  </CButton>{' '}
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteAttendance(attendance.id_attendance)}
                  >
                    Delete
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} onClose={handleCloseModal}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Edit Attendance Record' : 'Add Attendance Record'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                label="Student ID"
                value={formData.id_student}
                onChange={(e) => setFormData({ ...formData, id_student: e.target.value })}
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
                type="date"
                label="Attendance Date"
                value={formData.attendance_date}
                onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
                required
              />
              <CFormSelect
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="">Select Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </CFormSelect>
              <CFormTextarea
                label="Remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows="3"
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveAttendance}>
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

export default Attendance;