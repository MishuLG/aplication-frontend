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
  CFormSelect,
} from '@coreui/react';

const Tutors = () => {
  const [tutors, setTutors] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    uid_users: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [filter, setFilter] = useState({ uid_users: '' });

  const API_URL = 'http://localhost:4000/api/tutors';
  const USERS_API_URL = 'http://localhost:4000/api/users';

  useEffect(() => {
    fetchTutors();
    fetchUsers();
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTutors(data);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(USERS_API_URL);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getAvailableUsers = () => {
    const assignedUserIds = tutors.map((tutor) => tutor.uid_users);
    return users.filter((user) => !assignedUserIds.includes(user.uid_users));
  };

  const handleSaveTutor = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${API_URL}/${selectedTutor.id_tutor}` : API_URL;

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      fetchTutors();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving tutor:', error);
    }
  };

  const handleEditTutor = (tutor) => {
    setSelectedTutor(tutor);
    setFormData({
      uid_users: tutor.uid_users,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteTutor = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchTutors();
    } catch (error) {
      console.error('Error deleting tutor:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      uid_users: '',
    });
    setEditMode(false);
    setSelectedTutor(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredTutors = tutors.filter(
    (tutor) => tutor.uid_users && tutor.uid_users.toString().includes(filter.uid_users)
  );

  return (
    <CCard>
      <CCardHeader>
        <h5>Tutors</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Add Tutor
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filter by User ID"
            name="uid_users"
            value={filter.uid_users}
            onChange={handleFilterChange}
            className="mb-2"
          />
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Tutor</CTableHeaderCell>
              <CTableHeaderCell>User ID</CTableHeaderCell>
              <CTableHeaderCell>Created At</CTableHeaderCell>
              <CTableHeaderCell>Updated At</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredTutors.map((tutor) => (
              <CTableRow key={tutor.id_tutor}>
                <CTableDataCell>{tutor.id_tutor}</CTableDataCell>
                <CTableDataCell>{tutor.uid_users}</CTableDataCell>
                <CTableDataCell>{tutor.created_at}</CTableDataCell>
                <CTableDataCell>{tutor.updated_at}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="warning" size="sm" onClick={() => handleEditTutor(tutor)}>
                    Edit
                  </CButton>{' '}
                  <CButton color="danger" size="sm" onClick={() => handleDeleteTutor(tutor.id_tutor)}>
                    Delete
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} onClose={handleCloseModal}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Edit Tutor' : 'Add Tutor'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormSelect
                label="User ID"
                value={formData.uid_users}
                onChange={(e) => setFormData({ ...formData, uid_users: e.target.value })}
                required
              >
                <option value="">Select User</option>
                {getAvailableUsers().map((user) => (
                  <option key={user.uid_users} value={user.uid_users}>
                    {user.first_name} {user.last_name} ({user.uid_users})
                  </option>
                ))}
              </CFormSelect>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveTutor}>
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

export default Tutors;
