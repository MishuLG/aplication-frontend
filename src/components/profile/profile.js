import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CImage,
  CFormSelect,
  CAlert,
  CRow,
  CCol
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilLockLocked, cilSave, cilCamera } from '@coreui/icons';
import API_URL from '../../../config';

// Imagen genérica por defecto
const DEFAULT_IMG = 'https://via.placeholder.com/150?text=No+Image';

const Profile = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dni: '',
    number_tlf: '',
    email: '',
    date_of_birth: '',
    gender: '',
    password: '',
    role: '',
    profile_pic: '' 
  });
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewImage, setPreviewImage] = useState(DEFAULT_IMG);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if(response.status === 401 || response.status === 403) {
            window.location.href = '/login'; 
            return;
        }
        throw new Error('No se pudo cargar el perfil');
      }

      const data = await response.json();
      
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        dni: data.dni || '',
        number_tlf: data.number_tlf || '',
        email: data.email || '',
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        password: '',
        role: data.id_rols,
        profile_pic: data.profile_pic || '' 
      });

      setPreviewImage(data.profile_pic || DEFAULT_IMG);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'danger', text: 'Error al cargar los datos del usuario.' });
      setLoading(false);
    }
  };

  // --- LÓGICA DE COMPRESIÓN DE IMAGEN ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(!file.type.startsWith('image/')) {
        setMessage({ type: 'warning', text: 'Solo se permiten archivos de imagen.' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const scaleSize = MAX_WIDTH / image.width;
          
          canvas.width = image.width < MAX_WIDTH ? image.width : MAX_WIDTH;
          canvas.height = image.width < MAX_WIDTH ? image.height : image.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          setPreviewImage(dataUrl);
          setFormData(prev => ({ ...prev, profile_pic: dataUrl }));
        };
        image.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.first_name || !formData.last_name || !formData.number_tlf) {
        setMessage({ type: 'warning', text: 'Nombre, Apellido y Teléfono no pueden estar vacíos.' });
        return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
            first_name: formData.first_name,
            last_name: formData.last_name,
            number_tlf: formData.number_tlf,
            password: formData.password,
            profile_pic: formData.profile_pic 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar');
      }

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      setFormData(prev => ({ ...prev, password: '' }));
      
      if(result.user && result.user.profile_pic) {
          setPreviewImage(result.user.profile_pic);
      }

    } catch (error) {
        if (error.message.includes('Payload Too Large')) {
            setMessage({ type: 'danger', text: 'La imagen es demasiado pesada. Intenta con una más pequeña.' });
        } else {
            setMessage({ type: 'danger', text: error.message });
        }
    }
  };

  if (loading) return <div className="text-center p-5">Cargando perfil...</div>;

  return (
    <CRow className="justify-content-center">
      <CCol md={8}>
        <CCard>
          <CCardHeader>
            <h5><CIcon icon={cilUser} className="me-2" />Mi Perfil</h5>
          </CCardHeader>
          <CCardBody>
            {message.text && (
                <CAlert color={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
                    {message.text}
                </CAlert>
            )}

            {/* FOTO DE PERFIL */}
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                <CImage 
                    src={previewImage} 
                    className="rounded-circle border border-3 border-secondary" 
                    width="150" 
                    height="150" 
                    style={{ objectFit: 'cover' }}
                />
                <CButton 
                    color="primary" 
                    size="sm" 
                    className="position-absolute bottom-0 end-0 rounded-circle p-2"
                    onClick={() => document.getElementById('upload-photo').click()}
                    title="Cambiar Foto"
                >
                    <CIcon icon={cilCamera} />
                </CButton>
              </div>
              
              <CFormInput
                type="file"
                id="upload-photo"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              
              <div className="mt-2 text-muted small">
                 Rol: <strong>{formData.role === 1 ? 'Administrador' : formData.role === 2 ? 'Profesor/Tutor' : 'Usuario'}</strong>
              </div>
            </div>

            <CForm onSubmit={handleSubmit}>
              <CRow>
                  <CCol md={6} className="mb-3">
                    <CFormLabel>Nombre *</CFormLabel>
                    <CFormInput
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel>Apellido *</CFormLabel>
                    <CFormInput
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </CCol>
              </CRow>

              <CRow>
                  <CCol md={6} className="mb-3">
                    <CFormLabel>DNI / Cédula <small className="text-muted">(No editable)</small></CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.dni}
                      disabled
                      className="opacity-75"
                    />
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel>Email <small className="text-muted">(No editable)</small></CFormLabel>
                    <CFormInput
                      type="email"
                      value={formData.email}
                      disabled
                      className="opacity-75"
                    />
                  </CCol>
              </CRow>

              <CRow>
                   <CCol md={6} className="mb-3">
                    <CFormLabel>Fecha de Nacimiento <small className="text-muted">(No editable)</small></CFormLabel>
                    <CFormInput
                      type="date"
                      value={formData.date_of_birth}
                      disabled
                      className="opacity-75"
                    />
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel>Género <small className="text-muted">(No editable)</small></CFormLabel>
                    <CFormSelect value={formData.gender} disabled className="opacity-75">
                      <option value="Male">Masculino</option>
                      <option value="Female">Femenino</option>
                      <option value="Other">Otro</option>
                    </CFormSelect>
                  </CCol>
              </CRow>

              <hr />
              <h6 className="text-muted mb-3">Datos de Contacto y Seguridad</h6>

              <CRow>
                  <CCol md={6} className="mb-3">
                    <CFormLabel>Teléfono de Contacto *</CFormLabel>
                    <CFormInput
                      type="tel"
                      name="number_tlf"
                      value={formData.number_tlf}
                      onChange={handleChange}
                      required
                    />
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel><CIcon icon={cilLockLocked} size="sm"/> Cambiar Contraseña</CFormLabel>
                    <CFormInput
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Dejar vacío para mantener la actual"
                      autoComplete="new-password"
                    />
                  </CCol>
              </CRow>

              <div className="d-grid gap-2 col-6 mx-auto mt-4">
                <CButton color="primary" type="submit">
                  <CIcon icon={cilSave} className="me-2" />
                  Guardar Cambios
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Profile;