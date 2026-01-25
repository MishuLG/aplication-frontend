import React from 'react'
import { CFooter } from '@coreui/react'
import '../css/header.css' 

const AppFooter = () => {
  return (
    <CFooter className="glass-footer border-0">
      <div>
        <span className="ms-1">&copy; 2026 <span className="fw-bold">ESCUELA</span>.</span>
        <span className="ms-1 text-opacity-75">Todos los derechos reservados.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Soporte:</span>
        <a href="#" target="_blank" rel="noopener noreferrer">
          Lendy Bustamante
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)