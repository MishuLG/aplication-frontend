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
  CAlert,
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

  // Estados de UI principales
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);
  const [filter, setFilter] = useState({ school_grade: '', school_year_status: '' });
  
  // Estados para validaciones y alertas
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para el Modal de Eliminación (igual que en UserCRUD)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const schoolYearsUrl = `${API_URL}/school_years`;

  const requiredFields = [
    'school_grade',
    'start_year',
    'end_of_year',
    'number_of_school_days',
    'scheduled_vacation',
    'special_events',
    'school_year_status',
  ];

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
        setAlertBox('Error: Datos recibidos no son válidos.');
      }
    } catch (error) {
      console.error('Error fetching school years:', error);
      setAlertBox('Ocurrió un error al obtener los años escolares.');
    }
  };

  // --- Lógica de Validación ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'number_of_school_days') {
       newValue = value.replace(/[^\d]/g, '');
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setAlertBox(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const strValue = String(value || '').trim();

    if (requiredFields.includes(name) && strValue === '') {
      setErrors((prev) => ({ ...prev, [name]: 'Este campo es obligatorio.' }));
      return;
    }

    if (name === 'number_of_school_days' && strValue) {
        if (parseInt(strValue, 10) <= 0) {
            setErrors((prev) => ({ ...prev, [name]: 'Debe ser mayor a 0.' }));
        }
    }

    if ((name === 'start_year' || name === 'end_of_year')) {
        validateDates(name === 'start_year' ? value : formData.start_year, 
                      name === 'end_of_year' ? value : formData.end_of_year);
    }
  };

  const validateDates = (start, end) => {
      if (start && end) {
          const startDate = new Date(start);
          const endDate = new Date(end);
          if (startDate >= endDate) {
              setErrors(prev => ({...prev, end_of_year: 'La fecha de fin debe ser posterior al inicio.'}));
          } else {
              setErrors(prev => {
                  const newErrs = {...prev};
                  if (newErrs.end_of_year === 'La fecha de fin debe ser posterior al inicio.') {
                      delete newErrs.end_of_year;
                  }
                  return newErrs;
              });
          }
      }
  };

  const validateForm = () => {
    const newErrors = {};
    
    requiredFields.forEach((field) => {
        if (!formData[field] || String(formData[field]).trim() === '') {
            newErrors[field] = 'Este campo es obligatorio.';
        }
    });

    if (formData.start_year && formData.end_of_year) {
        if (new Date(formData.start_year) >= new Date(formData.end_of_year)) {
            newErrors.end_of_year = 'La fecha de fin debe ser posterior al inicio.';
        }
    }

    if (formData.number_of_school_days && parseInt(formData.number_of_school_days, 10) <= 0) {
        newErrors.number_of_school_days = 'Debe ser un número positivo.';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    if (!isValid) {
        setAlertBox('Por favor, corrija los errores antes de guardar.');
    }
    
    return isValid;
  };

  // --- CRUD Operations ---

  const handleSaveSchoolYear = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    setAlertBox(null);

    const formattedData = {
      ...formData,
      start_year: new Date(formData.start_year).toISOString().split('T')[0],
      end_of_year: new Date(formData.end_of_year).toISOString().split('T')[0],
      scheduled_vacation: new Date(formData.scheduled_vacation).toISOString().split('T')[0],
      special_events: new Date(formData.special_events).toISOString().split('T')[0],
      number_of_school_days: parseInt(formData.number_of_school_days, 10)
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
        let errorText = `Error ${response.status}`;
        let errorData = null;
        try {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                errorData = await response.json();
                if (errorData.errors) {
                    if (Array.isArray(errorData.errors)) {
                        const mapped = {};
                        errorData.errors.forEach(err => mapped[err.field] = err.message);
                        setErrors(prev => ({ ...prev, ...mapped }));
                    } else {
                        setErrors(prev => ({ ...prev, ...errorData.errors }));
                    }
                }
                if (errorData.message) errorText = errorData.message;
            } else {
                errorText = await response.text();
            }
        } catch (e) { console.error("Error parsing response", e); }
        
        setAlertBox(errorText || 'Error del servidor al guardar.');
        setIsSaving(false);
        return;
      }

      await fetchSchoolYears();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving school year:', error);
      setAlertBox('Ocurrió un error de red al guardar. Por favor, inténtelo de nuevo.');
    } finally {
        setIsSaving(false);
    }
  };

  // --- Lógica del Modal de Eliminación ---

  const handleDeleteClick = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setIdToDelete(null);
  };

  const confirmDelete = async () => {
    if (idToDelete) {
      await handleDeleteSchoolYear(idToDelete);
    }
    setShowDeleteModal(false);
    setIdToDelete(null);
  };

  const handleDeleteSchoolYear = async (id) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${schoolYearsUrl}/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      await fetchSchoolYears();
    } catch (error) {
      console.error('Error deleting school year:', error);
      setAlertBox('Ocurrió un error al eliminar el año escolar.');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Helpers y Renderizado ---

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
    setErrors({});
    setAlertBox(null);
    setShowModal(true);
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
    setErrors({});
    setAlertBox(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const renderErrorText = (field) => {
    if (!errors[field]) return null;
    return (
      <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem' }}>
        {errors[field]}
      </div>
    );
  };

  const filteredSchoolYears = schoolYears.filter((schoolYear) => {
    const gradeMatch = (schoolYear.school_grade || '')
        .toLowerCase()
        .includes(filter.school_grade.toLowerCase());

    let statusString = '';
    const statusValue = schoolYear.school_year_status;

    if (typeof statusValue === 'boolean') {
        statusString = statusValue ? 'active' : 'inactive';
    } else if (typeof statusValue === 'string') {
        statusString = statusValue.toLowerCase();
    } 

    const filterStatus = filter.school_year_status.toLowerCase();
    const statusMatch = filterStatus === '' || statusString.includes(filterStatus);

    return gradeMatch && statusMatch;
  });

  return (
    <CCard>
      <CCardHeader>
        <h5>Años Escolares</h5>
        <CButton color="success" onClick={() => { resetForm(); setShowModal(true); }}>
          Agregar Año Escolar
        </CButton>
      </CCardHeader>
      <CCardBody>
        {alertBox && <CAlert color="danger" dismissible onClose={() => setAlertBox(null)}>{alertBox}</CAlert>}
        
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
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>Grado</CTableHeaderCell>
              <CTableHeaderCell>Inicio</CTableHeaderCell>
              <CTableHeaderCell>Fin</CTableHeaderCell>
              <CTableHeaderCell>Días</CTableHeaderCell>
              <CTableHeaderCell>Vacaciones</CTableHeaderCell>
              <CTableHeaderCell>Eventos</CTableHeaderCell>
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
                  <CButton color="danger" size="sm" onClick={() => handleDeleteClick(schoolYear.id_school_year)}>
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        {/* --- MODAL DE ELIMINACIÓN (Estilo UserCRUD) --- */}
        <CModal visible={showDeleteModal} onClose={handleCancelDelete} backdrop="static">
          <CModalHeader>
            <CModalTitle>Confirmar Eliminación</CModalTitle>
          </CModalHeader>
          <CModalBody>¿Está seguro de que desea eliminar este año escolar? Esta acción no se puede deshacer.</CModalBody>
          <CModalFooter>
            <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </CButton>
            <CButton color="secondary" onClick={handleCancelDelete} disabled={isDeleting}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>

        {/* --- MODAL DE CREACIÓN / EDICIÓN --- */}
        <CModal visible={showModal} onClose={handleCloseModal} backdrop="static">
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Año Escolar' : 'Agregar Año Escolar'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <div className="mb-3">
                  <CFormInput 
                    type="text" 
                    label="Grado Escolar" 
                    name="school_grade"
                    value={formData.school_grade} 
                    onChange={handleInputChange} 
                    onBlur={handleBlur}
                    invalid={!!errors.school_grade}
                  />
                  {renderErrorText('school_grade')}
              </div>

              <div className="mb-3">
                  <CFormInput 
                    type="date" 
                    label="Año de Inicio" 
                    name="start_year"
                    value={formData.start_year} 
                    onChange={handleInputChange} 
                    onBlur={handleBlur}
                    invalid={!!errors.start_year}
                  />
                  {renderErrorText('start_year')}
              </div>

              <div className="mb-3">
                  <CFormInput 
                    type="date" 
                    label="Año de Fin" 
                    name="end_of_year"
                    value={formData.end_of_year} 
                    onChange={handleInputChange} 
                    onBlur={handleBlur}
                    invalid={!!errors.end_of_year}
                  />
                  {renderErrorText('end_of_year')}
              </div>

              <div className="mb-3">
                  <CFormInput 
                    type="number" 
                    label="Días Escolares" 
                    name="number_of_school_days"
                    value={formData.number_of_school_days} 
                    onChange={handleInputChange} 
                    onBlur={handleBlur}
                    invalid={!!errors.number_of_school_days}
                  />
                  {renderErrorText('number_of_school_days')}
              </div>

              <div className="mb-3">
                  <CFormInput 
                    type="date" 
                    label="Vacaciones Programadas" 
                    name="scheduled_vacation"
                    value={formData.scheduled_vacation} 
                    onChange={handleInputChange} 
                    onBlur={handleBlur}
                    invalid={!!errors.scheduled_vacation}
                  />
                  {renderErrorText('scheduled_vacation')}
              </div>

              <div className="mb-3">
                  <CFormInput 
                    type="date" 
                    label="Eventos Especiales" 
                    name="special_events"
                    value={formData.special_events} 
                    onChange={handleInputChange} 
                    onBlur={handleBlur}
                    invalid={!!errors.special_events}
                  />
                  {renderErrorText('special_events')}
              </div>

              <div className="mb-3">
                  <CFormSelect 
                    label="Estado" 
                    name="school_year_status"
                    value={formData.school_year_status} 
                    onChange={handleInputChange} 
                    onBlur={handleBlur}
                    invalid={!!errors.school_year_status}
                  >
                    <option value="">Seleccionar Estado</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </CFormSelect>
                  {renderErrorText('school_year_status')}
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveSchoolYear} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </CButton>
            <CButton color="secondary" onClick={handleCloseModal} disabled={isSaving}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default SchoolYear;