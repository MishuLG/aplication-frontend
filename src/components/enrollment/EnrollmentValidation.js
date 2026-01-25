import React, { useState, useEffect } from 'react';
import {
  CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableHead, CTableHeaderCell, CTableRow, CTableDataCell, CButton, CBadge, CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCheckCircle } from '@coreui/icons';
// Ajusta la URL si es necesario
const API_URL = 'http://localhost:4000/api'; 

const EnrollmentValidation = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchPendingEnrollments();
  }, []);

  const fetchPendingEnrollments = async () => {
    try {
      const token = localStorage.getItem('token');
      // NOTA: Necesitamos crear este endpoint en el backend o filtrar en el frontend.
      // Por ahora simularemos trayendo todos y filtrando en JS.
      const response = await fetch(`${API_URL}/enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Filtramos solo los que están "Pre-Inscrito" (estado típico post-promoción)
      // O 'Cursando' si la promoción lo dejó así. Ajustamos según tu lógica.
      const pending = data.filter(e => e.status === 'Pre-Inscrito' || e.observations?.includes('Promoción Automática'));
      setEnrollments(pending);
    } catch (error) {
      console.error(error);
    }
  };

  const validateEnrollment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/enrollments/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'Cursando', observations: 'Inscripción Validada' })
      });

      if (response.ok) {
        setAlert({ color: 'success', message: '¡Inscripción validada correctamente!' });
        fetchPendingEnrollments(); // Recargar lista
      } else {
        throw new Error('Error al validar');
      }
    } catch (error) {
      setAlert({ color: 'danger', message: 'No se pudo validar la inscripción.' });
    }
  };

  return (
    <CCard>
      <CCardHeader>Validar Inscripciones (Promociones Pendientes)</CCardHeader>
      <CCardBody>
        {alert && <CAlert color={alert.color}>{alert.message}</CAlert>}
        
        <CTable hover responsive>
            <CTableHead>
                <CTableRow>
                    <CTableHeaderCell>Estudiante</CTableHeaderCell>
                    <CTableHeaderCell>Sección / Año</CTableHeaderCell>
                    <CTableHeaderCell>Estado Actual</CTableHeaderCell>
                    <CTableHeaderCell>Acción</CTableHeaderCell>
                </CTableRow>
            </CTableHead>
            <CTableBody>
                {enrollments.length > 0 ? enrollments.map(e => (
                    <CTableRow key={e.id_enrollment}>
                        <CTableDataCell>
                            {e.Student?.first_name_student} {e.Student?.last_name_student}
                            <div className="small text-muted">{e.Student?.dni}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                            {e.Section?.Grade?.name_grade} - {e.Section?.num_section}
                        </CTableDataCell>
                        <CTableDataCell>
                            <CBadge color="warning">{e.status}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                            <CButton color="success" size="sm" className="text-white" onClick={() => validateEnrollment(e.id_enrollment)}>
                                <CIcon icon={cilCheckCircle} className="me-2"/>
                                Confirmar Inscripción
                            </CButton>
                        </CTableDataCell>
                    </CTableRow>
                )) : (
                    <CTableRow>
                        <CTableDataCell colSpan="4" className="text-center text-muted">
                            No hay inscripciones pendientes por validar.
                        </CTableDataCell>
                    </CTableRow>
                )}
            </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

export default EnrollmentValidation;