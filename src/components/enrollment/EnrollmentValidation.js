import React, { useState, useEffect } from 'react';
import {
  CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableHead, CTableHeaderCell, CTableRow, CTableDataCell, CButton, CBadge, CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCheckCircle, cilSchool } from '@coreui/icons';
import API_URL from '../../../config'; 

const EnrollmentValidation = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchPendingEnrollments();
  }, []);

  const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { ...options, headers });
    return response;
  };

  const fetchPendingEnrollments = async () => {
    try {
      const response = await authenticatedFetch(`${API_URL}/enrollments`);
      if (response.ok) {
          const data = await response.json();
          const pending = data.filter(e => 
              e.status === 'Pre-Inscrito' || 
              (e.observations && e.observations.includes('Promoción'))
          );
          setEnrollments(pending);
      }
    } catch (error) { console.error(error); }
  };

  const validateEnrollment = async (id) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/enrollments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
            status: 'Cursando', 
            observations: 'Inscripción Validada por Admin' 
        })
      });

      if (response.ok) {
        setAlert({ color: 'success', message: '¡Estudiante validado! Ahora está Cursando.' });
        fetchPendingEnrollments(); 
      } else {
        throw new Error('Error al validar');
      }
    } catch (error) {
      setAlert({ color: 'danger', message: 'Error de conexión.' });
    }
  };

  return (
    <div className="container-fluid mt-4">
        <CCard className="shadow-sm border-0 tour-enrollment-table">
        <CCardHeader className="bg-transparent border-0 py-3">
            <h5 className="mb-0 text-body"><CIcon icon={cilSchool} className="me-2"/>Validación de Inscripciones</h5>
        </CCardHeader>
        <CCardBody>
            {alert && <CAlert color={alert.color} dismissible onClose={() => setAlert(null)}>{alert.message}</CAlert>}
            
            <CTable hover responsive align="middle">
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell>Estudiante</CTableHeaderCell>
                        <CTableHeaderCell>Cédula</CTableHeaderCell>
                        <CTableHeaderCell>Sección Asignada</CTableHeaderCell>
                        {/* TARGET: APUNTAMOS AL ENCABEZADO (Siempre existe) */}
                        <CTableHeaderCell className="tour-header-status">Estado Actual</CTableHeaderCell>
                        {/* TARGET: APUNTAMOS AL ENCABEZADO (Siempre existe) */}
                        <CTableHeaderCell className="tour-header-actions">Acción</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {enrollments.length > 0 ? enrollments.map(e => (
                        <CTableRow key={e.id_enrollment}>
                            <CTableDataCell className="fw-bold">
                                {e.Student?.first_name} {e.Student?.last_name}
                            </CTableDataCell>
                            <CTableDataCell>{e.Student?.dni}</CTableDataCell>
                            <CTableDataCell>
                                {e.Section?.Grade?.name_grade} "{e.Section?.num_section}"
                            </CTableDataCell>
                            <CTableDataCell>
                                <CBadge color="warning" shape="rounded-pill">{e.status}</CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                                <CButton color="success" size="sm" onClick={() => validateEnrollment(e.id_enrollment)}>
                                    <CIcon icon={cilCheckCircle} className="me-2 text-white"/> <span className="text-white">Validar</span>
                                </CButton>
                            </CTableDataCell>
                        </CTableRow>
                    )) : (
                        <CTableRow>
                            <CTableDataCell colSpan="5" className="text-center text-medium-emphasis py-5">
                                No hay estudiantes pendientes por validar.
                            </CTableDataCell>
                        </CTableRow>
                    )}
                </CTableBody>
            </CTable>
        </CCardBody>
        </CCard>
    </div>
  );
};

export default EnrollmentValidation;