import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilUser,
  cilUserFollow,
  cilPencil,
  cilMoodVeryGood,
  cilNotes,
  cilFile,
  cilCalendar,
  cilCheckCircle,
  cilPeople
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  
  // --- NUEVA SECCIÓN: GESTIÓN ACADÉMICA (Ciclo Escolar) ---
  {
    component: CNavTitle,
    name: 'Gestión Académica',
  },
  {
    component: CNavItem,
    name: 'Control Año Escolar',
    to: '/school_year',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
 {
    component: CNavGroup,
    name: 'Inscripciones',
    to: '/enrollments',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Directorio Estudiantil',
        to: '/students',
      },
      // --- AGREGA ESTO SI NO ESTÁ ---
      {
        component: CNavItem,
        name: 'Validar Ingresos',
        to: '/enrollments/validate',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Boletines y Reportes', // Reutilizamos gradeReports
    to: '/grade_reports',
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
  },

  // --- CONFIGURACIÓN Y MANTENIMIENTO ---
  {
    component: CNavTitle,
    name: 'Configuración',
  },
  {
    component: CNavItem,
    name: 'Usuarios y Tutores',
    to: '/users',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Carga Académica',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Secciones',
        to: '/sections',
      },
      {
        component: CNavItem,
        name: 'Materias (Pensum)',
        to: '/subjects',
      },
      {
        component: CNavItem,
        name: 'Horarios',
        to: '/class_schedules',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Asistencias',
    to: '/attendance',
    icon: <CIcon icon={cilMoodVeryGood} customClassName="nav-icon" />
  },
  {
    component: CNavItem,
    name: 'Evaluaciones',
    to: '/evaluations',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
]

export default _nav