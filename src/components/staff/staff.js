import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
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
  CFormSelect
} from '@coreui/react';


const StaffCRUD = () => {
  const [staffMembers, setStaffMembers] = useState([

  ]);
  
  const [nextId, setNextId] = useState(4);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaffMember, setSelectedStaffMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: '', active: true });

  const API_URL = 'http://localhost:3001/staffMembers';

  useEffect(() => {
    axios.get(API_URL)
      .then((response) => setStaffMembers(response.data))
      .catch((error) => console.error('Error fetching staff members:', error));
  }, []);

  const handleAddStaff = () => {
    setFormData({ name: '', email: '', role: '', active: true });
    setShowAddModal(true);
  };

  const handleEditStaff = (staffId) => {
    const staffMember = staffMembers.find((s) => s.id === staffId);
    setSelectedStaffMember(staffMember);
    setFormData({ ...staffMember });
    setShowEditModal(true);
  };

  const handleSaveStaff = () => {
    if (showAddModal) {
      axios.post(API_URL, formData)
        .then((response) => {
          setStaffMembers([...staffMembers, response.data]);
          setShowAddModal(false);
        })
        .catch((error) => console.error('Error adding staff member:', error));
    } else if (showEditModal && selectedStaffMember) {
      axios.put(`${API_URL}/${selectedStaffMember.id}`, formData)
        .then(() => {
          setStaffMembers(
            staffMembers.map((s) =>
              s.id === selectedStaffMember.id ? { ...selectedStaffMember, ...formData } : s
            )
          );
          setShowEditModal(false);
        })
        .catch((error) => console.error('Error updating staff member:', error));
    }
  };

  const handleConfirmDelete = (staffId) => {
    axios.delete(`${API_URL}/${staffId}`)
      .then(() => {
        setStaffMembers(staffMembers.filter((member) => member.id !== staffId));
        alert('User deleted successfully');
      })
      .catch((error) => console.error('Error deleting staff member:', error));
  };

  return (
    <CContainer fluid>
      <CCard>
        <CCardHeader>
          <h5>Staff Members</h5>
          <CButton color="success" onClick={handleAddStaff}>
            Add Staff
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CTable bordered hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {staffMembers.map((member) => (
                <CTableRow key={member.id}>
                  <CTableDataCell>{member.id}</CTableDataCell>
                  <CTableDataCell>{member.name}</CTableDataCell>
                  <CTableDataCell>{member.email}</CTableDataCell>
                  <CTableDataCell>{member.role}</CTableDataCell>
                  <CTableDataCell>{member.active ? 'Active' : 'Inactive'}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="warning" onClick={() => handleEditStaff(member.id)}>
                      Edit
                    </CButton>{' '}
                    <CButton color="danger" onClick={() => handleConfirmDelete(member.id)}>
                      Delete
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      
      <CModal visible={showAddModal || showEditModal} onClose={() => {
        setShowAddModal(false);
        setShowEditModal(false);
      }}>
        <CModalHeader>
          <CModalTitle>{showAddModal ? 'Add Staff' : 'Edit Staff'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <CFormInput
              type="email"
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <CFormSelect
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="">Select a role</option> 
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
            </CFormSelect>

            <div className="mb-3">
              <input 
                type="checkbox" 
                checked={formData.active} 
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })} 
              />
              {' '} Active
            </div>

          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="success" onClick={handleSaveStaff}>
            Save
          </CButton>
          <CButton color="secondary" onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
          }}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

    </CContainer>
  );
};

export default StaffCRUD;