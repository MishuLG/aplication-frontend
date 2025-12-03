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
  CFormSelect,
} from '@coreui/react';
import API_URL from '../../../config';  

const SchoolYear = () => {
  const [schoolYears, setSchoolYears] = useState([]);
  const [formData, setFormData] = useState({
    school_grade: '',
    start_year: '',
    end_of_year: '',
    number_of_school_days: '',
    scheduled_vacation: '',
    special_events: '',
    school_year_status: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);
  const [filter, setFilter] = useState({ school_grade: '', school_year_status: '' });

  const schoolYearsUrl = `${API_URL}/school_years`;

  useEffect(() => {
    fetchSchoolYears();
  }, []);

  const fetchSchoolYears = async () => {
    try {
      const response = await fetch(schoolYearsUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSchoolYears(data);
      } else {
        console.error('Received data is not an array:', data);
        alert('Error: Datos recibidos no son válidos.');
      }
    } catch (error) {
      console.error('Error fetching school years:', error);
      alert('Ocurrió un error al obtener los años escolares. Por favor, inténtelo de nuevo.');
    }
  };

  const handleSaveSchoolYear = async () => {
    if (!formData.start_year || !formData.end_of_year || !formData.scheduled_vacation || !formData.special_events) {
      alert("Por favor, completa todos los campos de fecha.");
      return;
    }

    const formattedData = {
      ...formData,
      start_year: new Date(formData.start_year).toISOString().split('T')[0],
      end_of_year: new Date(formData.end_of_year).toISOString().split('T')[0],
      scheduled_vacation: new Date(formData.scheduled_vacation).toISOString().split('T')[0],
      special_events: new Date(formData.special_events).toISOString().split('T')[0],
    };

    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${schoolYearsUrl}/${selectedSchoolYear.id_school_year}` : schoolYearsUrl;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      fetchSchoolYears();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving school year:', error);
      alert('Ocurrió un error al guardar el año escolar. Por favor, inténtelo de nuevo.');
    }
  };

  const handleEditSchoolYear = (schoolYear) => {
    setSelectedSchoolYear(schoolYear);
    setFormData({
      school_grade: schoolYear.school_grade,
      start_year: schoolYear.start_year,
      end_of_year: schoolYear.end_of_year,
      number_of_school_days: schoolYear.number_of_school_days,
      scheduled_vacation: schoolYear.scheduled_vacation,
      special_events: schoolYear.special_events,
      school_year_status: schoolYear.school_year_status,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteSchoolYear = async (id) => {
    try {
      const response = await fetch(`${schoolYearsUrl}/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      fetchSchoolYears();
    } catch (error) {
      console.error('Error deleting school year:', error);
      alert('Ocurrió un error al eliminar el año escolar. Por favor, inténtelo de nuevo.');
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      school_grade: '',
      start_year: '',
      end_of_year: '',
      number_of_school_days: '',
      scheduled_vacation: '',
      special_events: '',
      school_year_status: '',
    });
    setEditMode(false);
    setSelectedSchoolYear(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

const filteredSchoolYears = schoolYears.filter((schoolYear) => {
    // Manejo seguro del Grado Escolar (siempre debe ser string para toLowerCase)
    const gradeMatch = (schoolYear.school_grade || '')
        .toLowerCase()
        .includes(filter.school_grade.toLowerCase());

    // 1. Obtener el estado del año escolar de forma segura.
    let statusString = '';
    const statusValue = schoolYear.school_year_status;

    // Si el valor es booleano (true/false, como viene de la DB), convertirlo a 'active'/'inactive'.
    if (typeof statusValue === 'boolean') {
        statusString = statusValue ? 'active' : 'inactive';
    } else if (typeof statusValue === 'string') {
        // Si ya es un string (quizás de una inserción anterior), usarlo.
        statusString = statusValue.toLowerCase();
    } 

    // 2. Realizar el filtrado por estado.
    const filterStatus = filter.school_year_status.toLowerCase();
    const statusMatch = filterStatus === '' || statusString.includes(filterStatus);

    return gradeMatch && statusMatch;
});

  return (
    <CCard>
      <CCardHeader>
        <h5>Años Escolares</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Agregar Año Escolar
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filtrar por grado escolar"
            name="school_grade"
            value={filter.school_grade}
            onChange={handleFilterChange}
            className="mb-2"
          />
          <CFormInput
            placeholder="Filtrar por estado"
            name="school_year_status"
            value={filter.school_year_status}
            onChange={handleFilterChange}
          />
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Año Escolar</CTableHeaderCell>
              <CTableHeaderCell>Grado Escolar</CTableHeaderCell>
              <CTableHeaderCell>Año de Inicio</CTableHeaderCell>
              <CTableHeaderCell>Año de Fin</CTableHeaderCell>
              <CTableHeaderCell>Días Escolares</CTableHeaderCell>
              <CTableHeaderCell>Vacaciones Programadas</CTableHeaderCell>
              <CTableHeaderCell>Eventos Especiales</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredSchoolYears.map((schoolYear) => (
              <CTableRow key={schoolYear.id_school_year}>
                <CTableDataCell>{schoolYear.id_school_year}</CTableDataCell>
                <CTableDataCell>{schoolYear.school_grade}</CTableDataCell>
                <CTableDataCell>{schoolYear.start_year}</CTableDataCell>
                <CTableDataCell>{schoolYear.end_of_year}</CTableDataCell>
                <CTableDataCell>{schoolYear.number_of_school_days}</CTableDataCell>
                <CTableDataCell>{schoolYear.scheduled_vacation}</CTableDataCell>
                <CTableDataCell>{schoolYear.special_events}</CTableDataCell>
                <CTableDataCell>{schoolYear.school_year_status}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="warning" size="sm" onClick={() => handleEditSchoolYear(schoolYear)}>
                    Editar
                  </CButton>{' '}
                  <CButton color="danger" size="sm" onClick={() => handleDeleteSchoolYear(schoolYear.id_school_year)}>
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} onClose={handleCloseModal}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Año Escolar' : 'Agregar Año Escolar'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput type="text" label="Grado Escolar" value={formData.school_grade} onChange={(e) => setFormData({ ...formData, school_grade: e.target.value })} required />
              <CFormInput type="date" label="Año de Inicio" value={formData.start_year} onChange={(e) => setFormData({ ...formData, start_year: e.target.value })} required />
              <CFormInput type="date" label="Año de Fin" value={formData.end_of_year} onChange={(e) => setFormData({ ...formData, end_of_year: e.target.value })} required />
              <CFormInput type="number" label="Días Escolares" value={formData.number_of_school_days} onChange={(e) => setFormData({ ...formData, number_of_school_days: e.target.value })} required />
              <CFormSelect label="Estado" value={formData.school_year_status} onChange={(e) => setFormData({ ...formData, school_year_status: e.target.value })} required>
                <option value="">Seleccionar Estado</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </CFormSelect>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveSchoolYear}>
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

export default SchoolYear;