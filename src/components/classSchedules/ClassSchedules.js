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
import { cilReload, cilTrash, cilPencil, cilSave, cilBan, cilMove } from '@coreui/icons';
import API_URL from "../../../config"; 

const ClassSchedules = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // --- ESTADOS PARA EDICIÓN ---
  const [isEditing, setIsEditing] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState(null); 
  const [tempSchedule, setTempSchedule] = useState([]); 

  // --- CONFIGURACIÓN DE BLOQUES ---
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

  // --- ESTILOS INYECTADOS (CSS EN JS) ---
  const styles = `
    @keyframes shake {
      0% { transform: rotate(0deg); }
      25% { transform: rotate(1deg); }
      75% { transform: rotate(-1deg); }
      100% { transform: rotate(0deg); }
    }
    
    @keyframes pulse-soft {
      0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.5); }
      70% { box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); }
      100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
    }

    .shake-animation {
      animation: shake 0.3s infinite ease-in-out;
    }

    .btn-pulse {
      animation: pulse-soft 2s infinite;
    }

    .edit-mode-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 1020;
      transition: opacity 0.3s;
    }

    .focused-content {
      position: relative;
      z-index: 1030;
      transition: all 0.3s;
    }

    .droppable-cell {
      transition: all 0.2s;
    }
    
    .droppable-cell.drag-over {
      background-color: rgba(var(--cui-primary-rgb), 0.2) !important;
      box-shadow: inset 0 0 0 2px var(--cui-primary) !important;
    }

    .drag-card {
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: grab;
    }

    .drag-card:active {
      cursor: grabbing;
      transform: scale(1.05);
      z-index: 1040;
    }
    
    .is-being-dragged {
      opacity: 0.3 !important;
      filter: grayscale(100%);
    }
  `;

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchSchedules(selectedSection);
    } else {
      setSchedules([]);
      setTempSchedule([]);
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
      if (res.ok) setSections(await res.json());
    } catch (error) { console.error(error); }
  };

  const fetchSchedules = async (sectionId) => {
    setLoading(true);
    try {
      const res = await authenticatedFetch(`${API_URL}/class-schedules/section/${sectionId}`);
      if (res.ok) {
          const data = await res.json();
          setSchedules(data);
          setTempSchedule(JSON.parse(JSON.stringify(data)));
      }
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  // --- ACCIONES PRINCIPALES ---

  const handleGenerate = async () => {
    if (!selectedSection) return;
    if (!window.confirm("Se borrará el horario actual y se generará uno nuevo. ¿Seguro?")) return;

    setLoading(true);
    try {
      const res = await authenticatedFetch(`${API_URL}/class-schedules/generate/${selectedSection}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setAlert({ color: 'success', message: data.message });
        fetchSchedules(selectedSection); 
      } else {
        setAlert({ color: 'danger', message: data.message || 'Error' });
      }
    } catch (error) { setAlert({ color: 'danger', message: 'Error de conexión' }); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
      if(!window.confirm("¿Eliminar esta materia del horario?")) return;
      try {
          await authenticatedFetch(`${API_URL}/class-schedules/${id}`, { method: 'DELETE' });
          fetchSchedules(selectedSection);
      } catch (e) {}
  };

  const handleSaveChanges = async () => {
    if (!window.confirm("¿Guardar la nueva distribución del horario?")) return;
    setLoading(true);
    try {
        const promises = tempSchedule.map(item => 
            authenticatedFetch(`${API_URL}/class-schedules/${item.id_class_schedules}`, {
                method: 'PUT',
                body: JSON.stringify({
                    id_section: item.id_section,
                    id_subject: item.id_subject,
                    day_of_week: item.day_of_week,
                    start_time: item.start_time,
                    end_time: item.end_time
                })
            })
        );
        await Promise.all(promises);
        setAlert({ color: 'success', message: '¡Horario actualizado exitosamente!' });
        setIsEditing(false);
        fetchSchedules(selectedSection); 
    } catch (error) {
        console.error(error);
        setAlert({ color: 'danger', message: 'Error al guardar cambios.' });
    }
    setLoading(false);
  };

  // --- LÓGICA DE ARRASTRAR Y SOLTAR (CORREGIDA - SWAP SEGURO) ---

  const handleDragStart = (e, itemId) => {
    if (!isEditing) return;
    setDraggedItemId(String(itemId)); // Convertir a string para comparar seguro
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e) => {
    setDraggedItemId(null);
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  };

  const handleDragOver = (e) => {
    if (isEditing) {
        e.preventDefault(); 
        e.currentTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, targetDay, targetStart, targetEnd) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (!isEditing || !draggedItemId) return;

    // Normalizar horas (HH:mm)
    const normTargetStart = targetStart.substring(0,5);
    const normTargetEnd = targetEnd.substring(0,5);

    // Clonar para manipular
    let newSchedule = JSON.parse(JSON.stringify(tempSchedule));

    // 1. Buscar el item ORIGEN (el que muevo)
    // CORRECCIÓN CLAVE: Usamos 'id_class_schedules' (plural) que es como viene de tu BD
    const sourceIndex = newSchedule.findIndex(s => String(s.id_class_schedules) === String(draggedItemId));
    
    if (sourceIndex === -1) {
        console.error("No se encontró el item arrastrado");
        return;
    }

    // 2. Buscar si hay un item DESTINO (alguien ocupando el lugar)
    const targetIndex = newSchedule.findIndex(s => 
      s.day_of_week === targetDay && 
      s.start_time.substring(0,5) === normTargetStart
    );

    // Guardar coordenadas originales del Origen (para el swap)
    const originalDay = newSchedule[sourceIndex].day_of_week;
    const originalStart = newSchedule[sourceIndex].start_time;
    const originalEnd = newSchedule[sourceIndex].end_time;

    // --- APLICAR MOVIMIENTO ---

    // A. Mover ORIGEN -> DESTINO
    newSchedule[sourceIndex].day_of_week = targetDay;
    newSchedule[sourceIndex].start_time = normTargetStart;
    newSchedule[sourceIndex].end_time = normTargetEnd;

    // B. Si había alguien en el destino -> Moverlo al ORIGEN (Swap)
    if (targetIndex !== -1 && targetIndex !== sourceIndex) {
        newSchedule[targetIndex].day_of_week = originalDay;
        newSchedule[targetIndex].start_time = originalStart;
        newSchedule[targetIndex].end_time = originalEnd;
    }

    setTempSchedule(newSchedule);
    setDraggedItemId(null);
  };

  // --- HELPERS VISUALES ---

  const findClassInSlot = (day, startTime) => {
      const data = isEditing ? tempSchedule : schedules;
      return data.find(s => 
          s.day_of_week === day && 
          s.start_time.substring(0,5) === startTime.substring(0,5)
      );
  };

  const getSubjectColor = (subjectName) => {
      if (!subjectName) return 'secondary';
      const colors = ['primary', 'success', 'warning', 'info', 'danger', 'dark'];
      let hash = 0;
      for (let i = 0; i < subjectName.length; i++) hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length];
  };

  return (
    <CRow>
      <style>{styles}</style>
      
      {isEditing && <div className="edit-mode-overlay" />} 

      <CCol xs={12} className={isEditing ? 'focused-content' : ''}>
        {/* TARGET TUTORIAL: TABLA DE HORARIOS */}
        <CCard className="mb-4 shadow-sm border-0 tour-schedules-table">
          <CCardHeader className="py-3 d-flex justify-content-between align-items-center bg-body-tertiary">
            <strong className="fs-5 text-body">Gestión de Horarios</strong>
            
            {selectedSection && schedules.length > 0 && (
                <div>
                    {!isEditing ? (
                        /* TARGET TUTORIAL: BOTÓN EDITAR */
                        <CButton color="info" variant="outline" className="fw-semibold tour-schedules-edit" onClick={() => {setIsEditing(true); setTempSchedule(JSON.parse(JSON.stringify(schedules)));}}>
                            <CIcon icon={cilPencil} className="me-2" /> Editar Distribución
                        </CButton>
                    ) : (
                        <div className="d-flex gap-2">
                            <CButton color="secondary" variant="ghost" onClick={() => { setIsEditing(false); setTempSchedule(schedules); setDraggedItemId(null); }}>
                                <CIcon icon={cilBan} className="me-2" /> Cancelar
                            </CButton>
                            <CButton color="success" className="text-white btn-pulse fw-bold" onClick={handleSaveChanges} disabled={loading}>
                                {loading ? <CSpinner size="sm"/> : <CIcon icon={cilSave} className="me-2" />}
                                Guardar Cambios
                            </CButton>
                        </div>
                    )}
                </div>
            )}
          </CCardHeader>
          <CCardBody className="bg-body">
            {alert && <CAlert color={alert.color} dismissible onClose={() => setAlert(null)}>{alert.message}</CAlert>}
            
            {isEditing && (
                <CAlert color="info" className="d-flex align-items-center border-info bg-info bg-opacity-10 text-body">
                    <CIcon icon={cilMove} className="me-3" size="xl"/>
                    <div>
                        <strong>MODO EDICIÓN:</strong> Arrastre las materias. Si suelta una materia sobre otra, se intercambiarán de lugar (Swap).
                    </div>
                </CAlert>
            )}

            {/* SELECCIÓN DE SECCIÓN */}
            <CRow className="mb-4 align-items-end g-3">
              <CCol md={6}>
                <label className="form-label text-body-secondary">Sección:</label>
                {/* TARGET TUTORIAL: BÚSQUEDA */}
                <div className="tour-schedules-search">
                    <CFormSelect 
                    value={selectedSection} 
                    onChange={(e) => setSelectedSection(e.target.value)}
                    disabled={isEditing}
                    className="bg-body text-body border-secondary-subtle"
                    >
                    <option value="">-- Seleccionar --</option>
                    {sections.map(s => (
                        <option key={s.id_section} value={s.id_section}>
                        {s.Grade?.name_grade} - "{s.section_identifier}"
                        </option>
                    ))}
                    </CFormSelect>
                </div>
              </CCol>
              <CCol md={6} className="text-end">
                {selectedSection && !isEditing && (
                    /* TARGET TUTORIAL: GENERAR */
                    <div className="tour-schedules-create">
                        <CButton color="primary" onClick={handleGenerate} disabled={loading}>
                            {loading ? '...' : <><CIcon icon={cilReload} className="me-2"/> Generar Automático</>}
                        </CButton>
                    </div>
                )}
              </CCol>
            </CRow>

            {/* TABLA PRINCIPAL */}
            {selectedSection && schedules.length > 0 && (
                <div className="table-responsive rounded-3 border border-secondary-subtle">
                    <CTable bordered hover className="text-center align-middle caption-top mb-0">
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell className="bg-body-tertiary text-body" style={{width:'100px'}}>HORA</CTableHeaderCell>
                                {days.map(d => <CTableHeaderCell key={d} className="bg-body-tertiary text-primary text-uppercase">{d}</CTableHeaderCell>)}
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {timeBlocks.map((block, idx) => (
                                <CTableRow key={idx}>
                                    <CTableHeaderCell className="small bg-body-tertiary text-body-secondary">
                                        <div className="fw-bold">{block.start}</div>
                                        <div>-</div>
                                        <div className="fw-bold">{block.end}</div>
                                    </CTableHeaderCell>

                                    {block.isBreak ? (
                                        <CTableDataCell colSpan={5} className="bg-secondary bg-opacity-25 text-body fw-bold py-2">RECREO</CTableDataCell>
                                    ) : (
                                        days.map(day => {
                                            const session = findClassInSlot(day, block.start);
                                            const color = session ? getSubjectColor(session.Subject?.name_subject) : null;
                                            
                                            // Estado visual del item (Corregido a Plural)
                                            const isBeingDragged = isEditing && session && String(session.id_class_schedules) === String(draggedItemId);

                                            return (
                                                <CTableDataCell 
                                                    key={`${day}-${block.start}`}
                                                    className={`p-1 position-relative droppable-cell`}
                                                    style={{
                                                        height: '1px',
                                                        border: isEditing ? '1px dashed var(--cui-border-color)' : '',
                                                        backgroundColor: 'transparent'
                                                    }}
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, day, block.start, block.end)}
                                                >
                                                    {session ? (
                                                        <div 
                                                                className={`drag-card d-flex flex-column justify-content-between p-2 rounded h-100 text-white bg-${color} shadow-sm ${isEditing ? 'shake-animation' : ''} ${isBeingDragged ? 'is-being-dragged' : ''}`}
                                                                style={{
                                                                    minHeight: '80px',
                                                                    userSelect: 'none'
                                                                }}
                                                                draggable={isEditing}
                                                                // CORRECCIÓN: Usamos id_class_schedules (plural)
                                                                onDragStart={(e) => handleDragStart(e, session.id_class_schedules)}
                                                                onDragEnd={handleDragEnd}
                                                                title={isEditing ? "Arrastra para mover" : ""}
                                                        >
                                                                <div className="fw-bold" style={{fontSize: '0.85rem', textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>
                                                                    {session.Subject?.name_subject}
                                                                </div>
                                                                {!isEditing && (
                                                                    <div className="text-end mt-1">
                                                                        <CButton size="sm" color="transparent" className="text-white p-0 opacity-75" onClick={() => handleDelete(session.id_class_schedules)}>
                                                                            <CIcon icon={cilTrash}/>
                                                                        </CButton>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    ) : (
                                                        <div className="h-100 d-flex align-items-center justify-content-center text-body-tertiary small">
                                                                {isEditing && <CIcon icon={cilMove} className="opacity-25"/>}
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