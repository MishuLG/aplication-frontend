import React, { useState, useEffect } from 'react';
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CTable, CTableBody, CTableHead, CTableHeaderCell, CTableRow, CTableDataCell,
  CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormInput, CFormSelect, CAlert, CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilSchool } from '@coreui/icons';

// URL BASE
const API_URL = 'http://localhost:4000/api';

const Sections = () => {
  // --- ESTADOS ---
  const [sections, setSections] = useState([]);
  const [grades, setGrades] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  
  const [visible, setVisible] = useState(false); // Modal
  const [editing, setEditing] = useState(false); // Modo Edición
  const [alert, setAlert] = useState(null); // Alertas de error/éxito

  // Formulario
  const [formData, setFormData] = useState({
    id_section: null,
    num_section: '',   // Nombre de la sección (A, B, U...)
    id_grade: '',      // ID del Grado (1er, 2do...)
    id_school_year: '' // ID del Año Escolar
  });

  // --- CARGA INICIAL ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [secRes, gradRes, yearRes] = await Promise.all([
        fetch(`${API_URL}/sections`, { headers }),
        fetch(`${API_URL}/grades`, { headers }),
        fetch(`${API_URL}/school_years`, { headers })
      ]);

      if (secRes.ok) setSections(await secRes.json());
      if (gradRes.ok) setGrades(await gradRes.json());
      if (yearRes.ok) {
        const years = await yearRes.json();
        setSchoolYears(years);
        
        // Auto-seleccionar año activo para facilitar el registro
        const active = years.find(y => y.school_year_status === 'Activo');
        if (active) {
            setFormData(prev => ({ ...prev, id_school_year: active.id_school_year }));
        }
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      setAlert({ color: 'danger', message: 'Error de conexión al cargar datos.' });
    }
  };

  // --- MANEJO DEL FORMULARIO ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    // 1. Validación Frontend
    if (!formData.num_section || !formData.id_grade || !formData.id_school_year) {
      setAlert({ color: 'warning', message: 'Faltan datos: Nombre, Grado y Año Escolar son obligatorios.' });
      return;
    }

    const token = localStorage.getItem('token');
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `${API_URL}/sections/${formData.id_section}` : `${API_URL}/sections`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            num_section: formData.num_section,
            id_grade: formData.id_grade,
            id_school_year: formData.id_school_year
        })
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ color: 'success', message: `Sección ${editing ? 'actualizada' : 'creada'} con éxito` });
        setVisible(false);
        resetForm();
        fetchData(); // Recargar tabla
      } else {
        // Aquí mostramos el error que envía el backend (ej: Grado no existe)
        setAlert({ color: 'danger', message: data.message || 'Error al guardar.' });
      }
    } catch (error) {
      setAlert({ color: 'danger', message: 'Error de servidor.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta sección?')) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/sections/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
            setAlert({ color: 'success', message: 'Sección eliminada.' });
            fetchData();
        } else {
            const data = await response.json();
            setAlert({ color: 'danger', message: data.message || 'No se pudo eliminar.' });
        }
    } catch (error) {
        setAlert({ color: 'danger', message: 'Error al intentar eliminar.' });
    }
  };

  // --- UTILIDADES ---
  const openModal = (section = null) => {
    setAlert(null);
    if (section) {
      setEditing(true);
      setFormData({
        id_section: section.id_section,
        num_section: section.num_section,
        id_grade: section.id_grade,
        id_school_year: section.id_school_year
      });
    } else {
      setEditing(false);
      resetForm();
    }
    setVisible(true);
  };

  const resetForm = () => {
    // Mantenemos el año activo si existe, limpiamos lo demás
    const activeYear = schoolYears.find(y => y.school_year_status === 'Activo');
    setFormData({
      id_section: null,
      num_section: '',
      id_grade: '',
      id_school_year: activeYear ? activeYear.id_school_year : ''
    });
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 text-primary fw-bold">Gestión de Secciones (Aulas)</h5>
            <CButton color="primary" onClick={() => openModal()}>
              <CIcon icon={cilPlus} className="me-2" /> Nueva Sección
            </CButton>
          </CCardHeader>
          <CCardBody>
            {alert && <CAlert color={alert.color} dismissible onClose={() => setAlert(null)}>{alert.message}</CAlert>}

            <CTable hover responsive align="middle">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Identificador</CTableHeaderCell>
                  <CTableHeaderCell>Grado Académico</CTableHeaderCell>
                  <CTableHeaderCell>Año Escolar</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {sections.map((sec) => (
                  <CTableRow key={sec.id_section}>
                    <CTableDataCell>
                        <div className="d-flex align-items-center">
                            <div className="bg-light text-primary rounded p-2 me-3">
                                <CIcon icon={cilSchool} size="xl"/>
                            </div>
                            <div>
                                <div className="fw-bold">Sección "{sec.num_section}"</div>
                                <div className="small text-muted">Capacidad: {sec.capacity || 30} est.</div>
                            </div>
                        </div>
                    </CTableDataCell>
                    <CTableDataCell>
                        <CBadge color="info" shape="rounded-pill" className="px-3">
                            {sec.Grade ? sec.Grade.name_grade : 'Grado Desconocido'}
                        </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                        <div className="fw-semibold">
                            {sec.SchoolYear ? sec.SchoolYear.name_period : 'N/A'}
                        </div>
                        {sec.SchoolYear?.school_year_status === 'Activo' && 
                            <span className="small text-success">● Activo</span>
                        }
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton color="light" size="sm" variant="ghost" className="me-2" onClick={() => openModal(sec)}>
                        <CIcon icon={cilPencil} className="text-warning"/>
                      </CButton>
                      <CButton color="light" size="sm" variant="ghost" onClick={() => handleDelete(sec.id_section)}>
                        <CIcon icon={cilTrash} className="text-danger"/>
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      {/* MODAL CREAR/EDITAR */}
      <CModal visible={visible} onClose={() => setVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>{editing ? 'Editar Sección' : 'Crear Nueva Sección'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
                <CFormSelect 
                    label="Año Escolar" 
                    name="id_school_year" 
                    value={formData.id_school_year} 
                    onChange={handleInputChange}
                >
                    <option value="">Seleccione...</option>
                    {schoolYears.map(year => (
                        <option key={year.id_school_year} value={year.id_school_year}>
                            {year.name_period} ({year.school_year_status})
                        </option>
                    ))}
                </CFormSelect>
            </div>

            <div className="mb-3">
                <CFormSelect 
                    label="Grado Académico" 
                    name="id_grade" 
                    value={formData.id_grade} 
                    onChange={handleInputChange}
                >
                    <option value="">Seleccione Grado...</option>
                    {grades.map(grade => (
                        <option key={grade.id_grade} value={grade.id_grade}>
                            {grade.name_grade}
                        </option>
                    ))}
                </CFormSelect>
            </div>

            <div className="mb-3">
                <CFormInput 
                    label="Identificador de Sección" 
                    name="num_section" 
                    value={formData.num_section} 
                    onChange={handleInputChange}
                    placeholder="Ej: A, B, U, Mañana..."
                    text="Solo una letra o palabra corta para identificar el grupo."
                />
            </div>
            
            {/* AQUÍ ELIMINAMOS EL CAMPO DE DÍA Y HORA QUE NO TIENE LÓGICA */}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Cancelar</CButton>
          <CButton color="primary" onClick={handleSubmit}>Guardar Sección</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Sections;