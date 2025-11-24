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
} from '@coreui/react';
import API_URL from '../../../config';  

const SubjectsTaken = () => {
  const [subjectsTaken, setSubjectsTaken] = useState([]);
  const [formData, setFormData] = useState({
    id_student: '',
    id_subject: '',
    id_school_year: '',
    final_grade: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubjectTaken, setSelectedSubjectTaken] = useState(null);
  const [filter, setFilter] = useState({ id_student: '', id_school_year: '' });

  const subjectsTakenUrl = `${API_URL}/subjects_taken`;

  useEffect(() => {
    fetchSubjectsTaken();
  }, []);

  const fetchSubjectsTaken = async () => {
    try {
      const response = await fetch(subjectsTakenUrl);
      if (!response.ok) {
        throw new Error('Error de respuesta de la red');
      }
      const data = await response.json();
      setSubjectsTaken(data);
    } catch (error) {
      console.error('Error al obtener las asignaturas tomadas:', error);
      alert('Ocurrió un error al obtener las asignaturas tomadas. Por favor, inténtelo de nuevo.');
    }
  };

  const handleSaveSubjectTaken = async () => {
    try {
      const url = editMode ? `${subjectsTakenUrl}/${selectedSubjectTaken.id_subject_taken}` : subjectsTakenUrl;
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error de respuesta de la red');
      }

      fetchSubjectsTaken();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error al guardar la asignatura tomada:', error);
      alert('Ocurrió un error al guardar la asignatura tomada. Por favor, inténtelo de nuevo.');
    }
  };

  const handleEditSubjectTaken = (subjectTaken) => {
    setSelectedSubjectTaken(subjectTaken);
    setFormData({
      id_student: subjectTaken.id_student,
      id_subject: subjectTaken.id_subject,
      id_school_year: subjectTaken.id_school_year,
      final_grade: subjectTaken.final_grade,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteSubjectTaken = async (id) => {
    try {
      const response = await fetch(`${subjectsTakenUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error de respuesta de la red');
      }

      fetchSubjectsTaken();
    } catch (error) {
      console.error('Error al eliminar la asignatura tomada:', error);
      alert('Ocurrió un error al eliminar la asignatura tomada. Por favor, inténtelo de nuevo.');
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      id_student: '',
      id_subject: '',
      id_school_year: '',
      final_grade: '',
    });
    setEditMode(false);
    setSelectedSubjectTaken(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredSubjectsTaken = subjectsTaken.filter(
    (subjectTaken) =>
      subjectTaken.id_student.toString().includes(filter.id_student) &&
      subjectTaken.id_school_year.toString().includes(filter.id_school_year)
  );

  return (
    <CCard>
      <CCardHeader>
        <h5>Asignaturas Tomadas</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Agregar Asignatura Tomada
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filtrar por ID de estudiante"
            name="id_student"
            value={filter.id_student}
            onChange={handleFilterChange}
            className="mb-2"
          />
          <CFormInput
            placeholder="Filtrar por ID de año escolar"
            name="id_school_year"
            value={filter.id_school_year}
            onChange={handleFilterChange}
          />
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Asignatura Tomada</CTableHeaderCell>
              <CTableHeaderCell>ID Estudiante</CTableHeaderCell>
              <CTableHeaderCell>ID Asignatura</CTableHeaderCell>
              <CTableHeaderCell>ID Año Escolar</CTableHeaderCell>
              <CTableHeaderCell>Calificación Final</CTableHeaderCell>
              <CTableHeaderCell>Creado En</CTableHeaderCell>
              <CTableHeaderCell>Actualizado En</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredSubjectsTaken.map((subjectTaken) => (
              <CTableRow key={subjectTaken.id_subject_taken}>
                <CTableDataCell>{subjectTaken.id_subject_taken}</CTableDataCell>
                <CTableDataCell>{subjectTaken.id_student}</CTableDataCell>
                <CTableDataCell>{subjectTaken.id_subject}</CTableDataCell>
                <CTableDataCell>{subjectTaken.id_school_year}</CTableDataCell>
                <CTableDataCell>{subjectTaken.final_grade}</CTableDataCell>
                <CTableDataCell>{subjectTaken.created_at}</CTableDataCell>
                <CTableDataCell>{subjectTaken.updated_at}</CTableDataCell>
                <CTableDataCell>
                  {/*<CButton
                    color="warning"
                    size="sm"
                    onClick={() => handleEditSubjectTaken(subjectTaken)}
                  >
                     Editar 
                  </CButton>{' '}*/}
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteSubjectTaken(subjectTaken.id_subject_taken)}
                  >
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} onClose={handleCloseModal}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Asignatura Tomada' : 'Agregar Asignatura Tomada'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                label="ID Estudiante"
                value={formData.id_student}
                onChange={(e) => setFormData({ ...formData, id_student: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="ID Asignatura"
                value={formData.id_subject}
                onChange={(e) => setFormData({ ...formData, id_subject: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="ID Año Escolar"
                value={formData.id_school_year}
                onChange={(e) => setFormData({ ...formData, id_school_year: e.target.value })}
                required
              />
              <CFormInput
                type="number"
                label="Calificación Final"
                value={formData.final_grade}
                onChange={(e) => setFormData({ ...formData, final_grade: e.target.value })}
                required
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveSubjectTaken}>
              Guardar
            </CButton>
            <CButton color="secondary" onClick={handleCloseModal}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default SubjectsTaken;
