import React, { useEffect ,useState } from 'react';
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

const API_URL = 'http://localhost:3001/users'; 

const Profile = ({ currentUser, setUsers }) => {
  const [profilePic, setProfilePic] = useState('https://via.placeholder.com/150');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetch(`${API_URL}/${currentUser.id}`)
        .then(response => response.json())
        .then(data => {
          setName(`${data.Firstname} ${data.Lastname}`);
          setEmail(data.email);
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setRole(data.role || '');
          setProfilePic(data.profilePic || 'https://via.placeholder.com/150');
        })
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, [currentUser]);


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

    if (!name || !email || !role) {
      alert('Please fill in all required fields.');
      return;
    }

    const updatedUser = {
      id: currentUser.id,
      DNI: currentUser.DNI, 
      Firstname: name.split(' ')[0],
      Lastname: name.split(' ')[1],
      email,
      phone,
      address,
      role,
      profilePic
    };

    fetch(`${API_URL}/${currentUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser),
    })
    .then(response => response.json())
    .then(() => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === currentUser.id ? updatedUser : user))
      );
      alert('Profile updated successfully!');
    })
    .catch(error => console.error('Error updating user data:', error));
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
              placeholder="Full name" required
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Email</CFormLabel>
            <CFormInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" required
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
              onChange={(e) => setRole(e.target.value)} required
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