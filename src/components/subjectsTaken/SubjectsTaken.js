import React, { useState, useEffect } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
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
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons';

const API_URL = 'http://localhost:4000/api';

const SubjectsTaken = () => {
  const [subjectsTaken, setSubjectsTaken] = useState([]);
  const [formData, setFormData] = useState({
    id_student: '',
    id_subject: '',
    id_school_year: '',
    final_grade: '',
  });
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubjectTaken, setSelectedSubjectTaken] = useState(null);
  const [filter, setFilter] = useState({ id_student: '', id_school_year: '' });

  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const subjectsTakenUrl = `${API_URL}/subjects_taken`;
  const studentsUrl = `${API_URL}/students`;
  const subjectsUrl = `${API_URL}/subjects`;
  const schoolYearsUrl = `${API_URL}/school_years`;

  useEffect(() => {
    fetchSubjectsTaken();
    fetchDependencies();
  }, []);

  const fetchSubjectsTaken = async () => {
    try {
      const response = await fetch(subjectsTakenUrl);
      if (!response.ok) throw new Error('Error de red');
      const data = await response.json();
      setSubjectsTaken(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('fetchSubjectsTaken error', error);
      setAlertBox('Error al obtener asignaturas tomadas');
    }
  };

  const fetchDependencies = async () => {
    try {
      const [studentsRes, subjectsRes, yearsRes] = await Promise.all([
        fetch(studentsUrl),
        fetch(subjectsUrl),
        fetch(schoolYearsUrl),
      ]);

      const studentsData = studentsRes.ok ? await studentsRes.json() : [];
      const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
      const yearsData = yearsRes.ok ? await yearsRes.json() : [];

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setSchoolYears(Array.isArray(yearsData) ? yearsData : []);
    } catch (error) {
      console.error('fetchDependencies error', error);
      setAlertBox('Error al cargar dependencias (estudiantes, asignaturas o años)');
    }
  };

  const openNewModal = () => {
    setFormData({ id_student: '', id_subject: '', id_school_year: '', final_grade: '' });
    setSelectedSubjectTaken(null);
    setEditMode(false);
    setErrors({});
    setAlertBox(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedSubjectTaken(item);
    setFormData({
      id_student: item.id_student != null ? String(item.id_student) : '',
      id_subject: item.id_subject != null ? String(item.id_subject) : '',
      id_school_year: item.id_school_year != null ? String(item.id_school_year) : '',
      final_grade: item.final_grade != null ? String(item.final_grade) : '',
    });
    setEditMode(true);
    setErrors({});
    setAlertBox(null);
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
    setAlertBox(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setIdToDelete(null);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${subjectsTakenUrl}/${idToDelete}`, { method: 'DELETE' });
      if (!res.ok) {
        let txt = `Error ${res.status}`;
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const jd = await res.json();
            txt = jd.message || JSON.stringify(jd);
          } else {
            txt = await res.text();
          }
        } catch (_) {}
        setAlertBox(txt || 'Error al eliminar registro');
        setIsDeleting(false);
        return;
      }
      await fetchSubjectsTaken();
      setShowDeleteModal(false);
      setIdToDelete(null);
    } catch (err) {
      console.error('confirmDelete error', err);
      setAlertBox(err.message || 'Error al eliminar registro');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredSubjectsTaken = subjectsTaken.filter((item) => {
    const studentFilter = (filter.id_student || '').toLowerCase();
    const yearFilter = (filter.id_school_year || '').toLowerCase();

    const studentName = (item.student_name || '').toLowerCase();
    const subjectName = (item.name_subject || '').toLowerCase();
    const studentId = item.id_student != null ? String(item.id_student).toLowerCase() : '';

    const studentMatch =
      studentName.includes(studentFilter) || subjectName.includes(studentFilter) || studentId.includes(studentFilter);

    const schoolYearDesc = (item.school_year || '').toLowerCase();
    const schoolYearId = item.id_school_year != null ? String(item.id_school_year).toLowerCase() : '';
    const yearMatch = schoolYearDesc.includes(yearFilter) || schoolYearId.includes(yearFilter);

    return studentMatch && yearMatch;
  });

  const validateField = (name, value) => {
    let msg = '';
    const v = value != null ? String(value).trim() : '';

    if (name === 'id_student') {
      if (v === '') msg = 'Seleccione un estudiante.';
      else if (!students.find((s) => String(s.id_student || s.id || '').toLowerCase() === v.toLowerCase())) {
        msg = 'Estudiante inválido.';
      }
    }

    if (name === 'id_subject') {
      if (v === '') msg = 'Seleccione una asignatura.';
      else if (!subjects.find((s) => String(s.id_subject || '').toLowerCase() === v.toLowerCase())) {
        msg = 'Asignatura inválida.';
      }
    }

    if (name === 'id_school_year') {
      if (v === '') msg = 'Seleccione un año escolar.';
      else if (!schoolYears.find((y) => String(y.id_school_year || '').toLowerCase() === v.toLowerCase())) {
        msg = 'Año escolar inválido.';
      }
    }

    if (name === 'final_grade') {
      if (v === '') msg = 'Ingrese la calificación final.';
      else {
        const num = Number(v);
        if (Number.isNaN(num)) msg = 'Calificación debe ser numérica.';
        else if (num < 0 || num > 100) msg = 'Calificación debe estar entre 0 y 100.';
        else {
          const match = /^-?\d+(\.\d{1,2})?$/.test(v);
          if (!match) msg = 'La calificación puede tener hasta 2 decimales.';
        }
      }
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  const validateAll = () => {
    const e1 = validateField('id_student', formData.id_student);
    const e2 = validateField('id_subject', formData.id_subject);
    const e3 = validateField('id_school_year', formData.id_school_year);
    const e4 = validateField('final_grade', formData.final_grade);

    if (e1 && e2) {
      const sid = String(formData.id_student).trim();
      const subid = String(formData.id_subject).trim();

      const duplicateAnyYear = subjectsTaken.find((s) => {
        if (editMode && selectedSubjectTaken && String(s.id_subject_taken) === String(selectedSubjectTaken.id_subject_taken)) return false;
        return String(s.id_student) === sid && String(s.id_subject) === subid;
      });

      if (duplicateAnyYear) {
        setErrors((prev) => ({ ...prev, id_subject: 'El estudiante ya tiene registrada esta asignatura en otro año escolar.' }));
        setAlertBox('El estudiante ya tiene registrada esta asignatura en otro año escolar.');
        return false;
      }
    }

    if (e1 && e2 && e3) {
      const sid = String(formData.id_student).trim();
      const subid = String(formData.id_subject).trim();
      const yearid = String(formData.id_school_year).trim();

      const duplicateExact = subjectsTaken.find((s) => {
        if (editMode && selectedSubjectTaken && String(s.id_subject_taken) === String(selectedSubjectTaken.id_subject_taken)) return false;
        return String(s.id_student) === sid && String(s.id_subject) === subid && String(s.id_school_year) === yearid;
      });

      if (duplicateExact) {
        setErrors((prev) => ({ ...prev, id_subject: 'Ya existe la combinación Estudiante-Asignatura-Año.' }));
        setAlertBox('Ya existe la combinación Estudiante-Asignatura-Año.');
        return false;
      }
    }

    const ok = e1 && e2 && e3 && e4 && !errors.id_student && !errors.id_subject && !errors.id_school_year && !errors.final_grade;
    if (!ok) setAlertBox('Corrija los errores antes de guardar.');
    else setAlertBox(null);
    return ok;
  };

  const parsePostgresUniqueError = (err) => {
    const result = { field: 'registro', value: null, message: 'Valor duplicado' };
    try {
      if (!err) return result;
      if (typeof err.detail === 'string') {
        const m = err.detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
        if (m) {
          result.field = m[1];
          result.value = m[2];
          result.message = `Ya existe ${result.field}: ${result.value}`;
          return result;
        }
      }
      if (err.constraint && typeof err.constraint === 'string') {
        const c = err.constraint;
        if (/student.*subject|student_subject|subjects_taken_unique/i.test(c)) {
          result.field = 'id_subject';
          result.message = 'Combinación Estudiante-Asignatura-Año duplicada';
          return result;
        }
      }
      if (err.message) result.message = err.message;
    } catch (e) {
    }
    return result;
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSaving) return;
    if (!validateAll()) return;

    setIsSaving(true);
    setAlertBox(null);

    try {
      const payload = {
        id_student: Number(formData.id_student),
        id_subject: Number(formData.id_subject),
        id_school_year: Number(formData.id_school_year),
        final_grade: Number(formData.final_grade),
      };

      const method = editMode && selectedSubjectTaken ? 'PUT' : 'POST';
      const url = editMode && selectedSubjectTaken ? `${subjectsTakenUrl}/${selectedSubjectTaken.id_subject_taken}` : subjectsTakenUrl;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorText = `Error ${res.status}`;
        let errorData = null;
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            errorData = await res.json();
            if (errorData.errors && typeof errorData.errors === 'object') {
              setErrors((prev) => ({ ...prev, ...errorData.errors }));
            }
            if (errorData.message) errorText = errorData.message;
          } else {
            errorText = await res.text();
          }
        } catch (parseErr) {
          console.error('parse error', parseErr);
        }

        const textLower = (errorText || '').toLowerCase();
        if (res.status === 409 || /ya existe|duplicate|already exists/.test(textLower) || (errorData && errorData.code === '23505')) {
          const parsed = parsePostgresUniqueError(errorData || { detail: errorText, constraint: '' });
          const field = parsed.field || 'id_subject';
          const msg = parsed.value ? `Ya existe ${parsed.value}` : parsed.message || 'Valor duplicado';
          setErrors((prev) => ({ ...prev, [field]: msg }));
          setAlertBox(parsed.message);
          setIsSaving(false);
          return;
        }

        setAlertBox(errorText || 'Error del servidor al guardar');
        setIsSaving(false);
        return;
      }

      await fetchSubjectsTaken();
      setShowModal(false);
      setSelectedSubjectTaken(null);
      setEditMode(false);
      setFormData({ id_student: '', id_subject: '', id_school_year: '', final_grade: '' });
    } catch (err) {
      console.error('handleSave error', err);
      setAlertBox(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Asignaturas Tomadas (Subjects Taken)</strong>
          </CCardHeader>
          <CCardBody>
            {alertBox && (
              <CAlert color="danger" className="mb-3">
                {alertBox}
              </CAlert>
            )}

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormInput
                  label="Filtrar por Estudiante o Asignatura"
                  placeholder="Nombre, Asignatura o ID de estudiante"
                  name="id_student"
                  value={filter.id_student}
                  onChange={handleFilterChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  label="Filtrar por Año Escolar"
                  placeholder="Año escolar o ID"
                  name="id_school_year"
                  value={filter.id_school_year}
                  onChange={handleFilterChange}
                />
              </CCol>
              <CCol md={4} className="d-flex align-items-end justify-content-end">
                <CButton color="primary" onClick={openNewModal}>
                  <CIcon icon={cilPlus} className="me-2" />
                  Agregar Asignatura
                </CButton>
              </CCol>
            </CRow>

            <CTable responsive striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Estudiante</CTableHeaderCell>
                  <CTableHeaderCell>Asignatura</CTableHeaderCell>
                  <CTableHeaderCell>Año Escolar</CTableHeaderCell>
                  <CTableHeaderCell>Calificación Final</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredSubjectsTaken.map((item) => (
                  <CTableRow key={item.id_subject_taken}>
                    <CTableDataCell>{item.id_subject_taken}</CTableDataCell>
                    <CTableDataCell>
                      {item.student_name || 'Sin nombre'} {item.id_student ? `(ID: ${item.id_student})` : ''}
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.name_subject || 'Sin asignatura'} {item.id_subject ? `(ID: ${item.id_subject})` : ''}
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.school_year || 'Sin año'} {item.id_school_year ? `(ID: ${item.id_school_year})` : ''}
                    </CTableDataCell>
                    <CTableDataCell>{item.final_grade != null ? item.final_grade : ''}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="info" size="sm" className="me-2" onClick={() => handleEdit(item)}>
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton color="danger" size="sm" onClick={() => handleDeleteClick(item.id_subject_taken)}>
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={showModal} backdrop="static" onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{editMode ? 'Editar' : 'Agregar'} Asignatura Tomada</CModalTitle>
        </CModalHeader>

        <CForm onSubmit={handleSave}>
          <CModalBody>
            <CFormSelect
              label="Estudiante *"
              value={formData.id_student}
              onChange={(e) => {
                setFormData((p) => ({ ...p, id_student: e.target.value }));
                setErrors((p) => ({ ...p, id_student: '' }));
              }}
              onBlur={(e) => validateField('id_student', e.target.value)}
              invalid={!!errors.id_student}
            >
              <option value="">Seleccionar Estudiante</option>
              {students.map((student) => {
                const studentId = student.id_student ?? student.id ?? '';
                const firstName = student.first_name_student ?? student.firstName ?? 'Sin Nombre';
                const lastName = student.last_name_student ?? student.lastName ?? '';
                return (
                  <option key={studentId} value={studentId}>
                    {firstName} {lastName} (ID: {studentId})
                  </option>
                );
              })}
            </CFormSelect>
            {errors.id_student && (
              <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>
                <strong style={{ marginRight: 6 }}>✖</strong>
                {errors.id_student}
              </div>
            )}

            <CFormSelect
              label="Asignatura *"
              value={formData.id_subject}
              onChange={(e) => {
                setFormData((p) => ({ ...p, id_subject: e.target.value }));
                setErrors((p) => ({ ...p, id_subject: '' }));
              }}
              onBlur={(e) => validateField('id_subject', e.target.value)}
              invalid={!!errors.id_subject}
              className="mt-3"
            >
              <option value="">Seleccionar Asignatura</option>
              {subjects.map((subject) => (
                <option key={subject.id_subject} value={subject.id_subject}>
                  {subject.name_subject} (ID: {subject.id_subject})
                </option>
              ))}
            </CFormSelect>
            {errors.id_subject && (
              <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>{errors.id_subject}</div>
            )}

            <CFormSelect
              label="Año Escolar *"
              value={formData.id_school_year}
              onChange={(e) => {
                setFormData((p) => ({ ...p, id_school_year: e.target.value }));
                setErrors((p) => ({ ...p, id_school_year: '' }));
              }}
              onBlur={(e) => validateField('id_school_year', e.target.value)}
              invalid={!!errors.id_school_year}
              className="mt-3"
            >
              <option value="">Seleccionar Año Escolar</option>
              {schoolYears.map((year) => (
                <option key={year.id_school_year} value={year.id_school_year}>
                  {year.school_year} (ID: {year.id_school_year})
                </option>
              ))}
            </CFormSelect>
            {errors.id_school_year && (
              <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>{errors.id_school_year}</div>
            )}

            <CFormInput
              type="number"
              label="Calificación Final *"
              value={formData.final_grade}
              onChange={(e) => {
                const v = e.target.value;
                setFormData((p) => ({ ...p, final_grade: v }));
                setErrors((p) => ({ ...p, final_grade: '' }));
              }}
              onBlur={(e) => validateField('final_grade', e.target.value)}
              invalid={!!errors.final_grade}
              className="mt-3"
              min="0"
              max="100"
              step="0.01"
            />
            {errors.final_grade && (
              <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>{errors.final_grade}</div>
            )}
          </CModalBody>

          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)} disabled={isSaving}>
              Cerrar
            </CButton>
            <CButton color="primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      <CModal visible={showDeleteModal} onClose={handleCancelDelete} backdrop="static" alignment="center">
        <CModalHeader>
          <CModalTitle>Confirmar eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>¿Está seguro que desea eliminar este registro? Esta acción no se puede deshacer.</CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </CButton>
          <CButton color="secondary" onClick={handleCancelDelete} disabled={isDeleting}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default SubjectsTaken;
