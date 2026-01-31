import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom'; 
import { CButton, useColorModes } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilInfo } from '@coreui/icons';

const AppTutorial = () => {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState([]);
  const location = useLocation(); 
  
  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const isDark = colorMode === 'dark' || (colorMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const getStepsByRoute = (pathname) => {
    // Normalizamos la ruta (quitamos slash final y pasamos a minúsculas)
    const path = pathname.replace(/\/$/, "").toLowerCase();

    switch (path) {
      // ----------------------------------------------------
      // 1. DASHBOARD
      // ----------------------------------------------------
      case '/dashboard':
      case '/': 
        return [
          {
            target: 'body',
            content: <div style={{textAlign: 'center'}}><h3>¡Bienvenido al Panel Principal! 👋</h3><p>Aquí tienes un resumen general de tu institución.</p></div>,
            placement: 'center',
            disableBeacon: true, // Abre directo
          },
          {
            target: '.tour-dashboard-kpi',
            content: 'Estas tarjetas te muestran las estadísticas clave: Total de estudiantes, asistencia y evaluaciones.',
          },
          {
            target: '.tour-sidebar',
            content: 'Usa este menú lateral para navegar a los módulos de Control de Años, Estudiantes y Profesores.',
          },
          {
            target: '.tour-user-dropdown',
            content: 'Aquí puedes ver tu perfil y cerrar sesión.',
          }
        ];

      // ----------------------------------------------------
      // 2. AÑO ESCOLAR
      // ----------------------------------------------------
      case '/school_years': 
      case '/school-years':
      case '/schoolyear':
      case '/school_year':
        return [
          {
            target: '.tour-schoolyear-table', 
            content: 'Aquí verás el historial completo de todos los periodos escolares registrados.',
            disableBeacon: true, // Abre directo
          },
          {
            target: '.tour-schoolyear-create', 
            content: 'Usa este botón para registrar un nuevo año escolar manualmente si es necesario.',
          },
          {
            target: '.tour-schoolyear-active', 
            content: 'Este panel te muestra el año escolar que está activo actualmente.',
          },
          {
            target: '.tour-schoolyear-close', 
            content: '¡Importante! Al finalizar el año, usa este botón para cerrar el ciclo y promover automáticamente a los estudiantes.',
          },
          {
            target: '.tour-schoolyear-search', 
            content: 'Puedes buscar periodos anteriores rápidamente por nombre.',
          }
        ];

      // ----------------------------------------------------
      // 3. ESTUDIANTES
      // ----------------------------------------------------
      case '/students':
      case '/estudiantes':
      case '/directory':
        return [
          {
            target: '.tour-student-table', 
            content: 'Este es el directorio general de estudiantes inscritos en la institución.',
            disableBeacon: true, // Abre directo
          },
          {
            target: '.tour-student-create', 
            content: 'Haz clic aquí para inscribir a un nuevo estudiante en el sistema.',
          },
          {
            target: '.tour-student-filters', 
            content: 'Usa estos filtros para buscar rápidamente por Cédula, Nombre o Grado.',
          },
          {
            target: '.tour-student-actions', 
            content: 'Desde aquí puedes ver el perfil completo, editar datos o retirar al estudiante.',
          }
        ];

      // ----------------------------------------------------
      // 4. VALIDAR INGRESOS (INSCRIPCIONES)
      // ----------------------------------------------------
      case '/enrollments':
      case '/inscripciones':
      case '/ingresos':
      case '/validate':
      case '/enrollments/validate':
        return [
          {
            target: '.tour-enrollment-table', 
            content: 'En esta pantalla gestionas las solicitudes de inscripción pendientes.',
            disableBeacon: true, // Abre directo
          },
          {
            target: '.tour-header-status', 
            content: (
                <div>
                    <p>En esta columna verás el estado <strong>"Pre-Inscrito"</strong>.</p>
                    <small className="text-muted">Nota: Si la tabla está vacía, espera a que un estudiante se registre.</small>
                </div>
            ),
          },
          {
            target: '.tour-header-actions', 
            content: (
                <div>
                    <p>Aquí aparecerá el botón <strong>"Validar"</strong> para aceptar al alumno.</p>
                    <strong style={{color: '#d9534f'}}>Importante:</strong>
                    <p className="small mt-1">Si no ves botones, es porque no hay estudiantes pendientes ahora.</p>
                </div>
            ),
          }
        ];

      // ----------------------------------------------------
      // 5. BOLETINES Y REPORTES
      // ----------------------------------------------------
      case '/reports':
      case '/reportes':
      case '/boletines':
      case '/grades':
      case '/grade_reports': 
        return [
          {
            target: '.tour-reports-tabs', 
            content: 'Este módulo tiene dos secciones: Comunicados Generales y Boletines de Notas. Puedes alternar entre ellas aquí.',
            disableBeacon: true, // Abre directo
          },
          {
            target: '.tour-reports-newsletters', 
            content: 'En la pestaña "Comunicados", puedes crear avisos importantes que se enviarán a los padres o tutores.',
          },
          {
            target: '.tour-reports-bulletins', 
            content: 'En la pestaña "Boletines", busca a cualquier estudiante y descarga su reporte de notas oficial en PDF.',
          }
        ];

      // ----------------------------------------------------
      // 6. USUARIOS
      // ----------------------------------------------------
      case '/users':
      case '/usuarios':
      case '/admin/users':
        return [
          {
            target: '.tour-users-kpi',
            content: 'Resumen rápido: Total de usuarios, activos y administradores.',
            disableBeacon: true, // Abre directo
          },
          {
            target: '.tour-users-table',
            content: 'Lista maestra de todos los usuarios (Admins, Profesores, Alumnos).',
          },
          {
            target: '.tour-users-create',
            content: 'Registrar un nuevo usuario en la plataforma.',
          },
          {
            target: '.tour-users-search',
            content: 'Busca usuarios por Nombre o Correo Electrónico.',
          }
        ];

      // ----------------------------------------------------
      // 7. TUTORES
      // ----------------------------------------------------
      case '/tutors':
      case '/tutores':
      case '/representantes':
        return [
          {
            target: '.tour-tutors-table',
            content: 'Directorio de Representantes/Tutores asignados.',
            disableBeacon: true, // Abre directo
          },
          {
            target: '.tour-tutors-create',
            content: 'Vincular un usuario existente como Tutor.',
          },
          {
            target: '.tour-tutors-search',
            content: 'Buscar tutor por nombre o DNI.',
          }
        ];

      // ----------------------------------------------------
      // 8. SECCIONES (AULAS)
      // ----------------------------------------------------
      case '/sections':
      case '/secciones':
      case '/aulas':
        return [
          {
            target: '.tour-sections-kpi',
            content: 'Resumen de capacidad y cobertura de grados.',
            disableBeacon: true, // Abre directo
          },
          {
            target: '.tour-sections-table',
            content: 'Listado de todas las secciones creadas.',
          },
          {
            target: '.tour-sections-create',
            content: 'Crear una nueva sección para un grado y año escolar.',
          },
          {
            target: '.tour-sections-search',
            content: 'Filtra por identificador (ej: "A") o por grado.',
          }
        ];

      // ----------------------------------------------------
      // 9. MATERIAS (ASIGNATURAS)
      // ----------------------------------------------------
      case '/subjects':
      case '/materias':
      case '/asignaturas':
      case '/classes':
        return [
          {
            target: '.tour-subjects-table', 
            content: 'Aquí se gestionan las materias o asignaturas académicas.',
            disableBeacon: true, // Abre directo
          },
          {
            target: '.tour-subjects-create', 
            content: 'Usa este botón para registrar una nueva materia.',
          },
          {
            target: '.tour-subjects-search', 
            content: 'Filtra las materias por nombre o descripción.',
          }
        ];

      // ----------------------------------------------------
      // 10. HORARIOS (CLASS SCHEDULES)
      // ----------------------------------------------------
      case '/class_schedules':
      case '/class-schedules':
      case '/schedules':
      case '/horarios':
      case '/timetables':
      case '/clases':
        return [
          {
            target: '.tour-schedules-search', 
            content: 'Primero, selecciona una sección para ver su horario actual.',
            disableBeacon: true, // Abre directo
          },
          {
            target: '.tour-schedules-create', 
            content: 'Si el horario está vacío, usa este botón para generarlo automáticamente.',
          },
          {
            target: '.tour-schedules-table', 
            content: 'Aquí verás la distribución de clases por día y hora.',
          },
          { 
            target: '.tour-schedules-edit', 
            content: (
                <div>
                    <h5>¡Edición Interactiva! 🖱️</h5>
                    <p>Al activar este botón, podrás <strong>arrastrar y soltar</strong> (drag & drop) las materias para reorganizar los bloques fácilmente.</p>
                </div>
            ) 
          }
        ];

      // ----------------------------------------------------
      // 11. ASISTENCIAS
      // ----------------------------------------------------
      case '/attendance':
      case '/asistencias':
      case '/roll-call':
      case '/daily-attendance':
        return [
          {
            target: '.tour-attendance-filters', 
            content: 'Paso 1: Selecciona el Grado, la Sección y la Fecha para cargar la lista de clase.',
            disableBeacon: true, // Abre directo
          },
          {
            target: '.tour-attendance-list', 
            content: 'Paso 2: Marca el estado de cada estudiante (Presente, Ausente, Retardo, Justificado).',
          },
          {
            target: '.tour-attendance-save', 
            content: 'Paso 3: ¡Muy importante! Haz clic aquí para guardar el registro de asistencia del día.',
          }
        ];

      // ----------------------------------------------------
      // 12. EVALUACIONES (NOTAS) - NUEVO
      // ----------------------------------------------------
      case '/evaluations':
      case '/evaluaciones':
      case '/calificaciones':
      case '/grades_entry':
      case '/assessments':
        return [
          {
            target: '.tour-evaluations-filters', 
            content: 'Para empezar, selecciona el Periodo, Grado, Sección y la Materia a evaluar.',
            disableBeacon: true, // Abre directo
          },
          {
            target: '.tour-evaluations-config', 
            content: 'Configura aquí el Plan de Evaluación (Lapsos y porcentajes) antes de cargar notas.',
          },
          {
            target: '.tour-evaluations-table', 
            content: 'En esta tabla verás a los estudiantes. Ingresa las calificaciones en las columnas correspondientes.',
          },
          {
            target: '.tour-evaluations-save', 
            content: 'Al finalizar, recuerda guardar los cambios para actualizar el boletín.',
          }
        ];

      // ----------------------------------------------------
      // CASO POR DEFECTO
      // ----------------------------------------------------
      default:
        return [];
    }
  };

  // --- EFECTO: SOLO CARGAR PASOS, NO INICIAR AUTOMÁTICAMENTE ---
  useEffect(() => {
    const currentSteps = getStepsByRoute(location.pathname);
    setSteps(currentSteps);
    // IMPORTANTE: Forzamos el estado a false para evitar auto-inicio
    setRun(false); 
  }, [location.pathname]); 

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
    }
  };

  // --- FUNCIÓN MANUAL PARA EL BOTÓN ---
  const startTutorial = () => {
    const currentSteps = getStepsByRoute(location.pathname);
    
    if (currentSteps.length > 0) {
        setSteps(currentSteps);
        setRun(false); // Resetear por si acaso
        setTimeout(() => setRun(true), 10); // Iniciar con ligero retardo
    } else {
        alert(`No hay tutorial configurado para la ruta: ${location.pathname}`);
    }
  };

  const joyrideStyles = {
    options: {
      zIndex: 10000,
      primaryColor: '#321fdb',
      backgroundColor: isDark ? '#212631' : '#fff',
      arrowColor: isDark ? '#212631' : '#fff',
      textColor: isDark ? '#ebedef' : '#333',
      overlayColor: 'rgba(0, 0, 0, 0.6)',
    },
    buttonNext: { backgroundColor: '#321fdb', color: '#fff', borderRadius: '4px' },
    buttonBack: { color: isDark ? '#ebedef' : '#321fdb', marginRight: 10 },
    buttonSkip: { color: isDark ? '#8a93a2' : '#636f83' },
  };
  
  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        disableOverlayClose={true}
        disableBeacon={true} // REFUERZO GLOBAL: Evita el botón "Open dialog"
        callback={handleJoyrideCallback}
        styles={joyrideStyles}
        locale={{ back: 'Atrás', close: 'Cerrar', last: 'Finalizar', next: 'Siguiente', skip: 'Omitir' }}
      />

      <div className="tour-help-btn position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1050 }}>
        <CButton 
            color="info" 
            className="text-white shadow-lg rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '50px', height: '50px', border: '2px solid white' }}
            onClick={startTutorial}
            title="Ayuda / Tutorial"
        >
            <CIcon icon={cilInfo} size="xl" />
        </CButton>
      </div>
    </>
  );
};

export default AppTutorial;