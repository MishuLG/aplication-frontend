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
  CFormTextarea,
  CFormSelect,
} from '@coreui/react';
import API_URL from '../../../config'; 

const Students = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    id_tutor: '',
    id_section: '',
    id_school_year: '',
    first_name_student: '',
    last_name_student: '',
    date_of_birth_student: '',
    health_record: '',
    gender: '',
    street: '',
    city: '',
    zip_code: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState({ first_name_student: '', id_section: '' });

  const studentsUrl = `${API_URL}/students`;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(studentsUrl);
      const data = await response.json();

      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        console.error('The received data is not an array:', data);
        alert('Error: The received data is not valid.');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('An error occurred while fetching students. Please try again.');
    }
  };

  const saveStudent = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode
        ? `${studentsUrl}/${selectedStudent.id_student}`
        : studentsUrl;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      await fetchStudents();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('An error occurred while saving the student. Please try again.');
    }
  };

  const editStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      id_tutor: student.id_tutor,
      id_section: student.id_section,
      id_school_year: student.id_school_year,
      first_name_student: student.first_name_student,
      last_name_student: student.last_name_student,
      date_of_birth_student: student.date_of_birth_student
        ? student.date_of_birth_student.split('T')[0]
        : '',
      health_record: student.health_record,
      gender: student.gender,
      street: student.street,
      city: student.city,
      zip_code: student.zip_code,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const deleteStudent = async (id) => {
    try {
      const response = await fetch(`${studentsUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      await fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('An error occurred while deleting the student. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      id_tutor: '',
      id_section: '',
      id_school_year: '',
      first_name_student: '',
      last_name_student: '',
      date_of_birth_student: '',
      health_record: '',
      gender: '',
      street: '',
      city: '',
      zip_code: '',
    });
    setEditMode(false);
    setSelectedStudent(null);
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredStudents = students.filter((student) => {
    const studentName = student.first_name_student
      ? student.first_name_student.toLowerCase()
      : '';
    const sectionId = student.id_section ? student.id_section.toString() : '';

    return (
      studentName.includes(filter.first_name_student.toLowerCase()) &&
      sectionId.includes(filter.id_section)
    );
  });

  return (
    <CCard>
      <CCardHeader>
        <h5>Registros de Estudiantes</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Agregar Estudiante
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filtrar por nombre"
            name="first_name_student"
            value={filter.first_name_student}
            onChange={handleFilterChange}
            className="mb-2"
          />
          <CFormInput
            placeholder="Filtrar por ID de sección"
            name="id_section"
            value={filter.id_section}
            onChange={handleFilterChange}
          />
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Estudiante</CTableHeaderCell>
              <CTableHeaderCell>ID Tutor</CTableHeaderCell>
              <CTableHeaderCell>ID Sección</CTableHeaderCell>
              <CTableHeaderCell>ID Año Escolar</CTableHeaderCell>
              <CTableHeaderCell>Nombre</CTableHeaderCell>
              <CTableHeaderCell>Apellido</CTableHeaderCell>
              <CTableHeaderCell>Fecha de Nacimiento</CTableHeaderCell>
              <CTableHeaderCell>Historial Médico</CTableHeaderCell>
              <CTableHeaderCell>Género</CTableHeaderCell>
              <CTableHeaderCell>Calle</CTableHeaderCell>
              <CTableHeaderCell>Ciudad</CTableHeaderCell>
              <CTableHeaderCell>Código Postal</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredStudents.map((student) => (
              <CTableRow key={student.id_student}>
                <CTableDataCell>{student.id_student}</CTableDataCell>
                <CTableDataCell>{student.id_tutor}</CTableDataCell>
                <CTableDataCell>{student.id_section}</CTableDataCell>
                <CTableDataCell>{student.id_school_year}</CTableDataCell>
                <CTableDataCell>{student.first_name_student}</CTableDataCell>
                <CTableDataCell>{student.last_name_student}</CTableDataCell>
                <CTableDataCell>{student.date_of_birth_student}</CTableDataCell>
                <CTableDataCell>{student.health_record}</CTableDataCell>
                <CTableDataCell>{student.gender}</CTableDataCell>
                <CTableDataCell>{student.street}</CTableDataCell>
                <CTableDataCell>{student.city}</CTableDataCell>
                <CTableDataCell>{student.zip_code}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() => editStudent(student)}
                  >
                    Editar
                  </CButton>{' '}
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => deleteStudent(student.id_student)}
                  >
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} onClose={() => { setShowModal(false); resetForm(); }}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Estudiante' : 'Agregar Estudiante'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                label="ID Tutor"
                value={formData.id_tutor}
                onChange={(e) => setFormData({ ...formData, id_tutor: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="ID Sección"
                value={formData.id_section}
                onChange={(e) => setFormData({ ...formData, id_section: e.target.value })}
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
                type="text"
                label="Nombre"
                value={formData.first_name_student}
                onChange={(e) => setFormData({ ...formData, first_name_student: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Apellido"
                value={formData.last_name_student}
                onChange={(e) => setFormData({ ...formData, last_name_student: e.target.value })}
                required
              />
              <CFormInput
                type="date"
                label="Fecha de Nacimiento"
                value={formData.date_of_birth_student}
                onChange={(e) => setFormData({ ...formData, date_of_birth_student: e.target.value })}
                required
              />
              <CFormTextarea
                label="Historial Médico"
                value={formData.health_record}
                onChange={(e) => setFormData({ ...formData, health_record: e.target.value })}
                rows="3"
              />
              <CFormSelect
                label="Género"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
              >
                <option value="">Seleccionar Género</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </CFormSelect>
              <CFormInput
                type="text"
                label="Calle"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Ciudad"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Código Postal"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                required
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={saveStudent}>
              Guardar
            </CButton>
            <CButton color="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Students;