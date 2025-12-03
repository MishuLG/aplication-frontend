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

const ClassSchedules = () => {
  const [classSchedules, setClassSchedules] = useState([]);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    classroom: '',
    start_time: '',
    end_time: '',
    unforeseen_events: '',
    day_of_week: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [filter, setFilter] = useState({ day_of_week: '', classroom: '' });

  const classSchedulesUrl = `${API_URL}/class_schedules`;

  useEffect(() => {
    fetchClassSchedules();
  }, []);

  const fetchClassSchedules = async () => {
    try {
      const response = await fetch(classSchedulesUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        const formattedData = data.map(schedule => ({
          ...schedule,
          day_of_week: schedule.day_of_week || '',
          classroom: schedule.classroom || '',
        }));
        setClassSchedules(formattedData);
      } else {
        console.error('Received data is not an array:', data);
        alert('Error: Datos recibidos no son válidos.');
      }
    } catch (error) {
      console.error('Error fetching class schedules:', error);
      alert('Ocurrió un error al obtener los horarios de clase. Por favor, inténtelo de nuevo.');
    }
  };

  const handleSaveSchedule = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${classSchedulesUrl}/${selectedSchedule.id_class_schedules}` : classSchedulesUrl;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      fetchClassSchedules();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Ocurrió un error al guardar el horario. Por favor, inténtelo de nuevo.');
    }
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      classroom: schedule.classroom,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      unforeseen_events: schedule.unforeseen_events,
      day_of_week: schedule.day_of_week,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteSchedule = async (id) => {
    try {
      const response = await fetch(`${classSchedulesUrl}/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      fetchClassSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Ocurrió un error al eliminar el horario. Por favor, inténtelo de nuevo.');
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      start_date: '',
      end_date: '',
      classroom: '',
      start_time: '',
      end_time: '',
      unforeseen_events: '',
      day_of_week: '',
    });
    setEditMode(false);
    setSelectedSchedule(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredSchedules = classSchedules.filter(
    (schedule) =>
      (schedule.day_of_week ? schedule.day_of_week.toLowerCase().includes(filter.day_of_week.toLowerCase()) : false) &&
      (schedule.classroom ? schedule.classroom.toLowerCase().includes(filter.classroom.toLowerCase()) : false)
  );

  return (
    <CCard>
      <CCardHeader>
        <h5>Horarios de Clase</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Agregar Horario
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filtrar por día de la semana"
            name="day_of_week"
            value={filter.day_of_week}
            onChange={handleFilterChange}
            className="mb-2"
          />
          <CFormInput
            placeholder="Filtrar por aula"
            name="classroom"
            value={filter.classroom}
            onChange={handleFilterChange}
          />
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>Fecha de Inicio</CTableHeaderCell>
              <CTableHeaderCell>Fecha de Fin</CTableHeaderCell>
              <CTableHeaderCell>Aula</CTableHeaderCell>
              <CTableHeaderCell>Hora de Inicio</CTableHeaderCell>
              <CTableHeaderCell>Hora de Fin</CTableHeaderCell>
              <CTableHeaderCell>Eventos Imprevistos</CTableHeaderCell>
              <CTableHeaderCell>Día de la Semana</CTableHeaderCell>
              <CTableHeaderCell>Creado En</CTableHeaderCell>
              <CTableHeaderCell>Actualizado En</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredSchedules.map((schedule) => (
              <CTableRow key={schedule.id_class_schedules}>
                <CTableDataCell>{schedule.id_class_schedules}</CTableDataCell>
                <CTableDataCell>{schedule.start_date}</CTableDataCell>
                <CTableDataCell>{schedule.end_date}</CTableDataCell>
                <CTableDataCell>{schedule.classroom}</CTableDataCell>
                <CTableDataCell>{schedule.start_time}</CTableDataCell>
                <CTableDataCell>{schedule.end_time}</CTableDataCell>
                <CTableDataCell>{schedule.unforeseen_events}</CTableDataCell>
                <CTableDataCell>{schedule.day_of_week}</CTableDataCell>
                <CTableDataCell>{schedule.created_at}</CTableDataCell>
                <CTableDataCell>{schedule.updated_at}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() => handleEditSchedule(schedule)}
                  >
                    Editar
                  </CButton>{' '}
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteSchedule(schedule.id_class_schedules)}
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
            <CModalTitle>{editMode ? 'Editar Horario' : 'Agregar Horario'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="date"
                label="Fecha de Inicio"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
              <CFormInput
                type="date"
                label="Fecha de Fin"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Aula"
                value={formData.classroom}
                onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                required
              />
              <CFormInput
                type="time"
                label="Hora de Inicio"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
              <CFormInput
                type="time"
                label="Hora de Fin"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
              <CFormTextarea
                label="Eventos Imprevistos"
                value={formData.unforeseen_events}
                onChange={(e) => setFormData({ ...formData, unforeseen_events: e.target.value })}
                rows="3"
              />
              <CFormSelect
                label="Día de la Semana"
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                required
              >
                <option value="">Seleccionar Día</option>
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </CFormSelect>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveSchedule}>
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

export default ClassSchedules;