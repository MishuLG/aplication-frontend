import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <a href="https://coreui.io" target="_blank" rel="noopener noreferrer">
          Gestión Escolar
        </a>
        <span className="ms-1">&copy; 2026. Todos los derechos reservados.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Desarrollado por</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
          Lendy Bustamante
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)