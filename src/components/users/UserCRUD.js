import React, { useState } from 'react'
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
} from '@coreui/react'

const UserCRUD = () => {
  const [users, setUsers] = useState([
    { id: 1, DNI: 24567895, Firstname: 'John Doe', Lastname: 'Delgado', email: 'john@example.com' },
    { id: 2, DNI: 22654798, Firstname: 'Mary', Lastname: 'Caceres', email: 'mary@example.com' },
    { id: 3, DNI: 22567897, Firstname: 'Alex', Lastname: 'Perez', email: 'alex@example.com' },
  ])
  const [nextId, setNextId] = useState(4)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({ DNI: '', Firstname: '', Lastname: '', email: '' })

  const handleAddUser = () => {
    setFormData({ DNI: '', Firstname: '', Lastname: '', email: '' })
    setShowAddModal(true)
  }

  const handleEditUser = (userId) => {
    const user = users.find((u) => u.id === userId)
    setSelectedUser(user)
    setFormData({ DNI: user.DNI, Firstname: user.Firstname, Lastname: user.Lastname, email: user.email })
    setShowEditModal(true)
  }

  const handleDeleteUser = (userId) => {
    setSelectedUser(users.find((u) => u.id === userId))
    setShowDeleteModal(true)
  }

  const handleSaveUser = () => {
    if (showAddModal) {
      const newUser = { ...formData, id: nextId }
      setUsers([...users, newUser])
      setNextId(nextId + 1) 
      setShowAddModal(false)
    } else if (showEditModal && selectedUser) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...selectedUser, ...formData } : u)))
      setShowEditModal(false)
    }
  }

  const handleConfirmDelete = () => {
    const updatedUsers = users
      .filter((user) => user.id !== selectedUser.id) 
      .map((user) => {
        return user.id > selectedUser.id ? { ...user, id: user.id - 1 } : user
      })

    setUsers(updatedUsers) 
    setNextId(nextId - 1) 
    setShowDeleteModal(false)
  }

  return (
    <CContainer fluid>
      <CCard>
        <CCardHeader>
          <h5>Users</h5>
          <CButton color="primary" onClick={handleAddUser}>
          Add User
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>DNI</CTableHeaderCell>
                <CTableHeaderCell>Firstname</CTableHeaderCell>
                <CTableHeaderCell>Lastname</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.map((user) => (
                <CTableRow key={user.id}>
                  <CTableDataCell>{user.id}</CTableDataCell>
                  <CTableDataCell>{user.DNI}</CTableDataCell>
                  <CTableDataCell>{user.Firstname}</CTableDataCell>
                  <CTableDataCell>{user.Lastname}</CTableDataCell>
                  <CTableDataCell>{user.email}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="warning" onClick={() => handleEditUser(user.id)}>
                      Edit
                    </CButton>{' '}
                    <CButton color="danger" onClick={() => handleDeleteUser(user.id)}>
                      Delete
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      
      <CModal visible={showAddModal || showEditModal} onClose={() => setShowAddModal(false) || setShowEditModal(false)}>
        <CModalHeader>
          <CModalTitle>{showAddModal ? 'Add User' : 'Edit User'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              label="DNI"
              value={formData.DNI}
              onChange={(e) => setFormData({ ...formData, DNI: e.target.value })}
            />
            <CFormInput
              type="text"
              label="Firstname"
              value={formData.Firstname}
              onChange={(e) => setFormData({ ...formData, Firstname: e.target.value })}
            />
            <CFormInput
              type="text"
              label="Lastname"
              value={formData.Lastname}
              onChange={(e) => setFormData({ ...formData, Lastname: e.target.value })}
            />
            <CFormInput
              type="email"
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleSaveUser}>
            Save
          </CButton>
          <CButton color="secondary" onClick={() => setShowAddModal(false) || setShowEditModal(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>
            Are you sure you want to delete the user {selectedUser?.Firstname}?
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
    </CContainer>
  )
}

export default UserCRUD