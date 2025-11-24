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

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [formData, setFormData] = useState({
    id_student: '',
    id_section: '',
    attendance_date: '',
    status: '',
    remarks: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [filter, setFilter] = useState({ id_student: '', attendance_date: '' });

  const attendanceUrl = `${API_URL}/attendance`;

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    console.log('Attendance data:', attendanceRecords);
  }, [attendanceRecords]);

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch(attendanceUrl);
      const data = await response.json();

      if (Array.isArray(data)) {
        setAttendanceRecords(data);
      } else {
        console.error('Received data is not an array:', data);
        alert('Error: Invalid data received.');
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      alert('An error occurred while fetching attendance records. Please try again.');
    }
  };

  const saveAttendanceRecord = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${attendanceUrl}/${selectedAttendance.id_attendance}` : attendanceUrl;

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

      fetchAttendanceRecords();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving attendance record:', error);
      alert('An error occurred while saving the attendance record. Please try again.');
    }
  };

  const editAttendanceRecord = (attendance) => {
    setSelectedAttendance(attendance);
    setFormData({
      id_student: attendance.id_student,
      id_section: attendance.id_section,
      attendance_date: attendance.attendance_date,
      status: attendance.status,
      remarks: attendance.remarks,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const deleteAttendanceRecord = async (id) => {
    try {
      const response = await fetch(`${attendanceUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      alert('An error occurred while deleting the attendance record. Please try again.');
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      id_student: '',
      id_section: '',
      attendance_date: '',
      status: '',
      remarks: '',
    });
    setEditMode(false);
    setSelectedAttendance(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredAttendanceRecords = attendanceRecords.filter((attendance) => {
    const studentId = attendance.id_student ? attendance.id_student.toString() : '';
    const attendanceDate = attendance.attendance_date || '';

    return (
      studentId.includes(filter.id_student) &&
      attendanceDate.includes(filter.attendance_date)
    );
  });

  return (
    <CCard>
      <CCardHeader>
        <h5>Registros de Asistencia</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Agregar Registro de Asistencia
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
            type="date"
            placeholder="Filtrar por fecha"
            name="attendance_date"
            value={filter.attendance_date}
            onChange={handleFilterChange}
          />
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Asistencia</CTableHeaderCell>
              <CTableHeaderCell>ID Estudiante</CTableHeaderCell>
              <CTableHeaderCell>ID Sección</CTableHeaderCell>
              <CTableHeaderCell>Fecha de Asistencia</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Observaciones</CTableHeaderCell>
              <CTableHeaderCell>Creado En</CTableHeaderCell>
              <CTableHeaderCell>Actualizado En</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredAttendanceRecords.map((attendance) => (
              <CTableRow key={attendance.id_attendance}>
                <CTableDataCell>{attendance.id_attendance}</CTableDataCell>
                <CTableDataCell>{attendance.id_student}</CTableDataCell>
                <CTableDataCell>{attendance.id_section}</CTableDataCell>
                <CTableDataCell>{attendance.attendance_date}</CTableDataCell>
                <CTableDataCell>{attendance.status}</CTableDataCell>
                <CTableDataCell>{attendance.remarks}</CTableDataCell>
                <CTableDataCell>{attendance.created_at}</CTableDataCell>
                <CTableDataCell>{attendance.updated_at}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() => editAttendanceRecord(attendance)}
                  >
                    Editar
                  </CButton>{' '}
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => deleteAttendanceRecord(attendance.id_attendance)}
                  >
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} onClose={closeModal}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Registro de Asistencia' : 'Agregar Registro de Asistencia'}</CModalTitle>
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
                label="ID Sección"
                value={formData.id_section}
                onChange={(e) => setFormData({ ...formData, id_section: e.target.value })}
                required
              />
              <CFormInput
                type="date"
                label="Fecha de Asistencia"
                value={formData.attendance_date}
                onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
                required
              />
              <CFormSelect
                label="Estado"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="">Seleccionar Estado</option>
                <option value="Present">Presente</option>
                <option value="Absent">Ausente</option>
                <option value="Late">Tardanza</option>
              </CFormSelect>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={saveAttendanceRecord}>
              Guardar
            </CButton>
            <CButton color="secondary" onClick={closeModal}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Attendance;
