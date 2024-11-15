import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CImage,
  CFormSelect
} from '@coreui/react';

const Profile = () => {
  const [profilePic, setProfilePic] = useState('https://via.placeholder.com/150');
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('johndoe@example.com');
  const [phone, setPhone] = useState('123-456-7890');
  const [address, setAddress] = useState('123 Main St, City, Country');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin'); 

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Updated profile data');
  };

  return (
    <CCard>
      <CCardHeader>User Profile</CCardHeader>
      <CCardBody>
        <div className="text-center mb-4">
          <CImage src={profilePic} className="img-thumbnail" width="150" height="150" alt="Profile" />
          <div>
            <CFormInput
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-photo"
            />
            <CButton color="primary" size="sm" className="mt-2" onClick={() => document.getElementById('upload-photo').click()}>
            Change Photo
            </CButton>
          </div>
        </div>

        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <CFormLabel>Name</CFormLabel>
            <CFormInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Email</CFormLabel>
            <CFormInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Phone</CFormLabel>
            <CFormInput
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Address</CFormLabel>
            <CFormInput
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address"
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Rol</CFormLabel>
            <CFormSelect
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Tutor">Tutor</option>
            </CFormSelect>
          </div>
          <div className="mb-3">
            <CFormLabel>Password</CFormLabel>
            <CFormInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
            />
          </div>
          <CButton color="success" type="submit" className="mt-3">
          Save changes
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default Profile;