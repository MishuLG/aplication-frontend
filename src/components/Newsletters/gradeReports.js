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

  const API_URL = 'http://localhost:4000/api/newsletters';
  const USERS_API_URL = 'http://localhost:4000/api/users';

  useEffect(() => {
    fetchNewsletters();
    fetchUsers();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setNewsletters(data);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
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
    const assignedUserIds = newsletters.map((newsletter) => newsletter.uid_users);
    return users.filter((user) => !assignedUserIds.includes(user.uid_users));
  };

  const handleSaveNewsletter = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${API_URL}/${selectedNewsletter.id_newsletters}` : API_URL;

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      fetchNewsletters();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving newsletter:', error);
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
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchNewsletters();
    } catch (error) {
      console.error('Error deleting newsletter:', error);
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
        <h5>Grade Reports</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Add Newsletter
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filter by title"
            name="title"
            value={filter.title}
            onChange={handleFilterChange}
            className="mb-2"
          />
          <CFormSelect
            placeholder="Filter by status"
            name="newsletter_status"
            value={filter.newsletter_status}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </CFormSelect>
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Newsletter</CTableHeaderCell>
              <CTableHeaderCell>User ID</CTableHeaderCell>
              <CTableHeaderCell>Title</CTableHeaderCell>
              <CTableHeaderCell>Content</CTableHeaderCell>
              <CTableHeaderCell>Date Sent</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Recipients</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
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
                    Edit
                  </CButton>{' '}
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteNewsletter(newsletter.id_newsletters)}
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
            <CModalTitle>{editMode ? 'Edit Newsletter' : 'Add Newsletter'}</CModalTitle>
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
              <CFormInput
                type="text"
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <CFormTextarea
                label="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows="3"
                required
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveNewsletter}>
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

export default GradeReports;
