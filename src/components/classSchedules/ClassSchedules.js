import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormSelect,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert,
  CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilReload, cilTrash } from '@coreui/icons';
// Ajusta la ruta según tu estructura real. 
// Si config.js está en la raíz del proyecto y este archivo en src/components/classSchedules/, usa:
import API_URL from "../../../config"; 

const ClassSchedules = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // --- CONFIGURACIÓN DE LA MATRIZ DE HORARIO ---
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  
  const timeBlocks = [
    { start: '07:00', end: '07:45', label: 'Bloque 1' },
    { start: '07:45', end: '08:30', label: 'Bloque 2' },
    { start: '08:30', end: '09:00', label: 'RECREO', isBreak: true },
    { start: '09:00', end: '09:45', label: 'Bloque 3' },
    { start: '09:45', end: '10:30', label: 'Bloque 4' },
    { start: '10:30', end: '11:15', label: 'Bloque 5' },
    { start: '11:15', end: '12:00', label: 'Bloque 6' },
  ];

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchSchedules(selectedSection);
    } else {
      setSchedules([]);
    }
  }, [selectedSection]);

  const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '#/login';
    }
    return response;
  };

  const fetchSections = async () => {
    try {
      const res = await authenticatedFetch(`${API_URL}/sections`);
      if (res.ok) {
          const data = await res.json();
          setSections(data);
      }
    } catch (error) { console.error(error); }
  };

  const fetchSchedules = async (sectionId) => {
    setLoading(true);
    try {
      const res = await authenticatedFetch(`${API_URL}/class-schedules/section/${sectionId}`);
      if (res.ok) {
          const data = await res.json();
          setSchedules(data);
      }
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!selectedSection) return;
    if (!window.confirm("Se borrará el horario actual y se generará uno nuevo automáticamente. ¿Seguro?")) return;

    setLoading(true);
    try {
      const res = await authenticatedFetch(`${API_URL}/class-schedules/generate/${selectedSection}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (res.ok) {
        setAlert({ color: 'success', message: data.message });
        fetchSchedules(selectedSection); 
      } else {
        setAlert({ color: 'danger', message: data.message || 'Error al generar' });
      }
    } catch (error) {
        setAlert({ color: 'danger', message: 'Error de conexión' });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
      if(!window.confirm("¿Eliminar esta materia del horario?")) return;
      try {
          await authenticatedFetch(`${API_URL}/class-schedules/${id}`, { method: 'DELETE' });
          fetchSchedules(selectedSection);
      } catch (e) {}
  };

  // --- FUNCIONES AUXILIARES PARA LA MATRIZ ---

  const findClassInSlot = (day, startTime) => {
      return schedules.find(s => 
          s.day_of_week === day && 
          s.start_time.substring(0,5) === startTime
      );
  };

  const getSubjectColor = (subjectName) => {
      if (!subjectName) return 'secondary';
      // Colores ajustados para que se vean bien tanto en claro como oscuro (evitamos light/dark puros)
      const colors = ['primary', 'success', 'warning', 'info', 'danger'];
      let hash = 0;
      for (let i = 0; i < subjectName.length; i++) {
          hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm">
          {/* ELIMINADO: 'bg-white' para que el Header tome el color del tema (oscuro o claro) */}
          <CCardHeader className="py-3">
            <strong className="fs-5">Gestión de Horarios Académicos</strong>
          </CCardHeader>
          <CCardBody>
            {alert && <CAlert color={alert.color} dismissible onClose={() => setAlert(null)}>{alert.message}</CAlert>}

            <CRow className="mb-4 align-items-end g-3">
              <CCol md={6}>
                <label className="form-label text-medium-emphasis">Seleccione una Sección para ver su matriz:</label>
                <CFormSelect 
                  value={selectedSection} 
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  <option value="">-- Seleccionar Sección --</option>
                  {sections.map(s => (
                    <option key={s.id_section} value={s.id_section}>
                      {s.Grade?.name_grade || 'Grado'} - Sección "{s.section_identifier}"
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6} className="text-end">
                {selectedSection && (
                    <CButton color="primary" onClick={handleGenerate} disabled={loading}>
                        {loading ? <CSpinner size="sm" component="span" aria-hidden="true"/> : <CIcon icon={cilReload} className="me-2" />}
                        {loading ? ' Generando...' : ' Generar Horario Automático'}
                    </CButton>
                )}
              </CCol>
            </CRow>

            <hr className="mb-4 opacity-25"/> {/* Opacity ayuda a que la línea se vea bien en ambos modos */}

            {/* MENSAJE SI NO HAY HORARIO */}
            {selectedSection && schedules.length === 0 && !loading && (
                <div className="text-center py-5 text-medium-emphasis border rounded border-dashed">
                    <h4>No hay horario asignado.</h4>
                    <p className="mb-0">Haga clic en "Generar Horario Automático" para crear uno basado en el pensum.</p>
                </div>
            )}

            {/* MATRIZ DE HORARIO */}
            {selectedSection && schedules.length > 0 && (
                <div className="table-responsive">
                    <CTable bordered hover className="text-center align-middle caption-top">
                        <caption className="pt-0 pb-2">
                            <strong>Matriz de Horario Semanal</strong>
                        </caption>
                        {/* ELIMINADO: color="light" en el Head para evitar bloqueo de colores en modo oscuro */}
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell className="fw-bold bg-body-tertiary" style={{width: '120px'}}>HORA / DÍA</CTableHeaderCell>
                                {days.map(day => (
                                    <CTableHeaderCell key={day} className="fw-bold text-uppercase text-primary bg-body-tertiary">
                                        {day}
                                    </CTableHeaderCell>
                                ))}
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {timeBlocks.map((block, index) => (
                                <CTableRow key={index}>
                                    {/* Columna de Hora: Usamos bg-body-tertiary en vez de bg-light */}
                                    <CTableHeaderCell className="small text-medium-emphasis bg-body-tertiary">
                                        <div className="fw-bold">{block.start}</div>
                                        <div>a</div>
                                        <div className="fw-bold">{block.end}</div>
                                    </CTableHeaderCell>

                                    {/* Lógica para Recreo vs Clases */}
                                    {block.isBreak ? (
                                        <CTableDataCell colSpan={5} className="bg-secondary text-white fw-bold py-3" style={{letterSpacing: '2px'}}>
                                            *** {block.label} ***
                                        </CTableDataCell>
                                    ) : (
                                        days.map(day => {
                                            const session = findClassInSlot(day, block.start);
                                            const color = session ? getSubjectColor(session.Subject?.name_subject) : null;
                                            
                                            return (
                                                <CTableDataCell key={day} className="p-1" style={{height: '1px'}}> {/* height 1px truco para que los hijos tomen el 100% */}
                                                    {session ? (
                                                        <div className={`d-flex flex-column justify-content-between p-2 rounded h-100 text-white bg-${color} shadow-sm`} style={{minHeight: '80px'}}>
                                                            <div className="fw-bold mb-1" style={{fontSize: '0.9rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)'}}>
                                                                {session.Subject?.name_subject || 'Desconocida'}
                                                            </div>
                                                            <div className="text-end">
                                                                <CButton 
                                                                    size="sm" 
                                                                    color="light" 
                                                                    variant="ghost" 
                                                                    className="text-white p-0"
                                                                    title="Eliminar bloque"
                                                                    onClick={() => handleDelete(session.id_class_schedules)}
                                                                >
                                                                    <CIcon icon={cilTrash} size="sm" style={{opacity: 0.8}} />
                                                                </CButton>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex align-items-center justify-content-center h-100 text-disabled small">
                                                            -
                                                        </div>
                                                    )}
                                                </CTableDataCell>
                                            );
                                        })
                                    )}
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>
                </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default ClassSchedules;