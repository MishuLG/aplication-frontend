import React, { useState } from 'react';
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
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', active: true },
    { id: 2, name: 'Mary Smith', email: 'mary@example.com', role: 'Teacher', active: true },
    { id: 3, name: 'Alex Johnson', email: 'alex@example.com', role: 'Teacher', active: false },
  ]);
  
  const [nextId, setNextId] = useState(4);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaffMember, setSelectedStaffMember] = useState(null);
  
  
  const [formData, setFormData] = useState({ name: '', email: '', role: '', active: true });

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
      const newStaffMember = { ...formData, id: nextId };
      setStaffMembers([...staffMembers, newStaffMember]);
      setNextId(nextId + 1);
      setShowAddModal(false);
    } else if (showEditModal && selectedStaffMember) {
      setStaffMembers(staffMembers.map((s) => (s.id === selectedStaffMember.id ? { ...selectedStaffMember, ...formData } : s)));
      setShowEditModal(false);
    }
  };

  const handleConfirmDelete = (staffId) => {
    setStaffMembers(staffMembers.filter((member) => member.id !== staffId));
    setShowEditModal(false); 
    alert('User deleted successfully');
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