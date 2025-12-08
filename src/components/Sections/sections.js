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
  CAlert,
  CRow,
  CCol,
} from '@coreui/react';
import API_URL from '../../../config';

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [formData, setFormData] = useState({
    id_class_schedules: '',
    num_section: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [filter, setFilter] = useState({ id_class_schedules: '', num_section: '' });
  const [errors, setErrors] = useState({});
  const [alertBox, setAlertBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sectionsUrl = `${API_URL}/sections`;

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await fetch(sectionsUrl);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSections(data);
      } else {
        console.error('fetchSections: invalid data', data);
        setAlertBox('Error: datos de secciones no válidos');
      }
    } catch (err) {
      console.error('fetchSections error', err);
      setAlertBox('Error al obtener secciones');
    }
  };

  const parsePostgresUniqueError = (err) => {
    const result = { field: 'registro', value: null, message: 'Valor duplicado' };
    try {
      if (!err) return result;
      if (typeof err.detail === 'string') {
        const m = err.detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
        if (m) {
          result.field = m[1] || result.field;
          result.value = m[2] || null;
          result.message = result.value ? `Ya existe ${result.field}: ${result.value}` : `Valor duplicado en ${result.field}`;
          return result;
        }
      }
      if (err.constraint && typeof err.constraint === 'string') {
        const c = err.constraint;
        if (/num_section/i.test(c)) result.field = 'num_section';
        else if (/id_class/i.test(c)) result.field = 'id_class_schedules';
        result.message = `Valor duplicado en ${result.field}`;
      }
      if (err.message) result.message = err.message;
    } catch (e) {
      // ignore
    }
    return result;
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredSections = sections.filter((section) => {
    const classScheduleId = section.id_class_schedules ? section.id_class_schedules.toString() : '';
    const sectionNumber = section.num_section ? section.num_section.toString() : '';
    return classScheduleId.includes(filter.id_class_schedules) && sectionNumber.includes(filter.num_section);
  });

  const resetForm = () => {
    setFormData({ id_class_schedules: '', num_section: '' });
    setEditMode(false);
    setSelectedSection(null);
    setErrors({});
    setAlertBox(null);
    setIsSaving(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setShowModal(false);
    resetForm();
  };

  const handleEditSection = (section) => {
    setSelectedSection(section);
    setFormData({
      id_class_schedules: section.id_class_schedules != null ? String(section.id_class_schedules) : '',
      num_section: section.num_section != null ? String(section.num_section) : '',
    });
    setEditMode(true);
    setErrors({});
    setAlertBox(null);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'id_class_schedules') {
      v = v.replace(/[^\d]/g, '');
    }
    if (name === 'num_section') {
      v = v.replace(/[^a-zA-Z0-9\-_]/g, '');
      if (v.length > 20) v = v.slice(0, 20);
    }
    setFormData((p) => ({ ...p, [name]: v }));
    setErrors((p) => ({ ...p, [name]: '' }));
    setAlertBox(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let msg = '';
    const val = value != null ? String(value).trim() : '';
    if (name === 'id_class_schedules') {
      if (val === '') msg = 'ID Horario de Clase es obligatorio.';
      else {
        const num = Number(val);
        if (!Number.isInteger(num) || num <= 0) msg = 'ID Horario de Clase debe ser un entero positivo.';
      }
    } else if (name === 'num_section') {
      if (val === '') msg = 'Número de Sección es obligatorio.';
      else if (val.length < 1) msg = 'Número de Sección no puede estar vacío.';
      else if (val.length > 20) msg = 'Número de Sección demasiado largo (máx 20).';
      else if (!/^[a-zA-Z0-9\-_]+$/.test(val)) msg = 'Número de Sección inválido. Solo letras, números, - y _.';
    }
    setErrors((p) => ({ ...p, [name]: msg }));
    return msg === '';
  };

  const validateAll = () => {
    const e1 = validateField('id_class_schedules', formData.id_class_schedules);
    const e2 = validateField('num_section', formData.num_section);

    if (e1 && e2) {
      const idVal = String(formData.id_class_schedules).trim();
      const numVal = String(formData.num_section).trim();
      const duplicate = sections.find((s) => {
        const sameId = String(s.id_class_schedules) === idVal;
        const sameNum = String(s.num_section) === numVal;
        if (editMode && selectedSection) {
          if (String(selectedSection.id_section) === String(s.id_section)) return false;
        }
        return sameId && sameNum;
      });
      if (duplicate) {
        setErrors((p) => ({ ...p, num_section: 'Ya existe una sección con ese horario y número.' }));
        setAlertBox('Ya existe una sección con ese horario y número.');
        return false;
      }
    }

    const ok = e1 && e2 && !errors.id_class_schedules && !errors.num_section;
    if (!ok) setAlertBox('Corrija los errores antes de guardar.');
    else setAlertBox(null);
    return ok;
  };

  const handleSaveSection = async () => {
    if (isSaving) return;
    if (!validateAll()) return;

    setIsSaving(true);
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode && selectedSection ? `${sectionsUrl}/${selectedSection.id_section}` : sectionsUrl;

      const payload = {
        id_class_schedules: Number(formData.id_class_schedules),
        num_section: String(formData.num_section).trim(),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorText = `Error ${response.status}`;
        let errorData = null;
        try {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            errorData = await response.json();
            if (errorData.errors && typeof errorData.errors === 'object') {
              setErrors((prev) => ({ ...prev, ...errorData.errors }));
            }
            if (errorData.message) errorText = errorData.message;
          } else {
            errorText = await response.text();
          }
        } catch (parseErr) {
          console.error('parse server error', parseErr);
        }

        const textLower = (errorText || '').toLowerCase();
        if (
          response.status === 409 ||
          /ya existe|duplicate|already exists/.test(textLower) ||
          (errorData && errorData.code === '23505')
        ) {
          const parsed = parsePostgresUniqueError(errorData || { detail: errorText, constraint: '' });
          const field = parsed.field || 'num_section';
          const msg = parsed.value ? `Ya existe ${parsed.value}` : parsed.message || 'Valor duplicado';
          setErrors((prev) => ({ ...prev, [field]: msg }));
          setAlertBox(parsed.message);
          setIsSaving(false);
          return;
        }

        setAlertBox(errorText || 'Error del servidor al guardar sección');
        setIsSaving(false);
        return;
      }

      await fetchSections();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('handleSaveSection error', err);
      setAlertBox(err.message || 'Error al guardar sección');
    } finally {
      setIsSaving(false);
    }
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
      const res = await fetch(`${sectionsUrl}/${idToDelete}`, { method: 'DELETE' });
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
        setAlertBox(txt || 'Error al eliminar sección');
        setIsDeleting(false);
        return;
      }
      await fetchSections();
      setShowDeleteModal(false);
      setIdToDelete(null);
    } catch (err) {
      console.error('confirmDelete error', err);
      setAlertBox(err.message || 'Error al eliminar sección');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 style={{ margin: 0 }}>Secciones</h5>
        <CButton color="success" onClick={openAddModal}>
          Agregar Sección
        </CButton>
      </CCardHeader>

      <CCardBody>
        {alertBox && (
          <CAlert color="danger" style={{ marginBottom: 12 }}>
            {alertBox}
          </CAlert>
        )}

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <CFormInput
            placeholder="Filtrar por ID Horario"
            name="id_class_schedules"
            value={filter.id_class_schedules}
            onChange={handleFilterChange}
            style={{ maxWidth: 200 }}
          />
          <CFormInput
            placeholder="Filtrar por Número de Sección"
            name="num_section"
            value={filter.num_section}
            onChange={handleFilterChange}
            style={{ maxWidth: 200 }}
          />
          <CButton color="secondary" onClick={() => setFilter({ id_class_schedules: '', num_section: '' })}>
            Limpiar
          </CButton>
        </div>

        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Sección</CTableHeaderCell>
              <CTableHeaderCell>ID Horario de Clase</CTableHeaderCell>
              <CTableHeaderCell>Número de Sección</CTableHeaderCell>
              <CTableHeaderCell>Creado En</CTableHeaderCell>
              <CTableHeaderCell>Actualizado En</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredSections.map((section) => (
              <CTableRow key={section.id_section}>
                <CTableDataCell>{section.id_section}</CTableDataCell>
                <CTableDataCell>{section.id_class_schedules}</CTableDataCell>
                <CTableDataCell>{section.num_section}</CTableDataCell>
                <CTableDataCell>{section.created_at}</CTableDataCell>
                <CTableDataCell>{section.updated_at}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() => handleEditSection(section)}
                    style={{ marginRight: 8 }}
                  >
                    Editar
                  </CButton>
                  <CButton color="danger" size="sm" onClick={() => handleDeleteClick(section.id_section)}>
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} backdrop="static" onClose={handleCloseModal} size="sm">
          <CModalHeader>
            <CModalTitle>{editMode ? 'Editar Sección' : 'Agregar Sección'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {alertBox && (
              <CAlert color="danger" style={{ marginBottom: 12 }}>
                {alertBox}
              </CAlert>
            )}

            <CForm>
              <CRow className="mb-2">
                <CCol xs={12}>
                  <CFormInput
                    name="id_class_schedules"
                    placeholder="ID Horario de Clase *"
                    value={formData.id_class_schedules}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    invalid={!!errors.id_class_schedules}
                  />
                  {errors.id_class_schedules && (
                    <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>
                      <strong style={{ marginRight: 6 }}>✖</strong>
                      {errors.id_class_schedules}
                    </div>
                  )}
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={12}>
                  <CFormInput
                    name="num_section"
                    placeholder="Número de Sección *"
                    value={formData.num_section}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    invalid={!!errors.num_section}
                  />
                  {errors.num_section && (
                    <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>
                      <strong style={{ marginRight: 6 }}>✖</strong>
                      {errors.num_section}
                    </div>
                  )}
                </CCol>
              </CRow>
            </CForm>
          </CModalBody>

          <CModalFooter>
            <CButton color="success" onClick={handleSaveSection} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </CButton>
            <CButton color="secondary" onClick={handleCloseModal} disabled={isSaving}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>

        <CModal visible={showDeleteModal} onClose={handleCancelDelete} backdrop="static" alignment="center">
          <CModalHeader>
            <CModalTitle>Confirmar eliminación</CModalTitle>
          </CModalHeader>
          <CModalBody>¿Está seguro que desea eliminar esta sección? Esta acción no se puede deshacer.</CModalBody>
          <CModalFooter>
            <CButton color="danger" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </CButton>
            <CButton color="secondary" onClick={handleCancelDelete} disabled={isDeleting}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Sections;
