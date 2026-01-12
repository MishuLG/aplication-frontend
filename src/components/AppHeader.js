import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilContrast,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons'

// Importamos los estilos nuevos
import '../css/header.css'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'

const AppHeader = ({ onLogout }) => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  return (
    // CAMBIO: Agregamos 'glass-header'
    <CHeader position="sticky" className="mb-4 glass-header border-0" ref={headerRef}>
      <CContainer fluid className="header-container px-4">
        
        {/* Botón Menú Minimalista */}
        <CHeaderToggler
          className="header-toggler ps-1"
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        {/* Breadcrumb integrado en la misma línea para ahorrar espacio (Opcional, si prefieres debajo déjalo fuera) */}
        <div className="d-none d-md-flex ms-4">
            <AppBreadcrumb />
        </div>

        {/* Navegación Derecha */}
        <CHeaderNav className="ms-auto d-flex align-items-center gap-3">
          
          {/* Selector de Tema (Sol/Luna) Minimalista */}
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false} className="nav-icon-wrapper d-flex align-items-center justify-content-center p-2">
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem active={colorMode === 'light'} as="button" type="button" onClick={() => setColorMode('light')}>
                <CIcon className="me-2" icon={cilSun} size="lg" /> Claro
              </CDropdownItem>
              <CDropdownItem active={colorMode === 'dark'} as="button" type="button" onClick={() => setColorMode('dark')}>
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Oscuro
              </CDropdownItem>
              <CDropdownItem active={colorMode === 'auto'} as="button" type="button" onClick={() => setColorMode('auto')}>
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

          {/* Separador Sutil */}
          <div className="vr h-50 mx-1"></div>

          {/* Dropdown de Usuario */}
          <AppHeaderDropdown onLogout={onLogout} />
        </CHeaderNav>
      </CContainer>
      
      {/* Si prefieres el breadcrumb en una segunda línea, descomenta esto y quita el de arriba */}
      {/* <CContainer fluid className="px-4 border-top">
        <AppBreadcrumb />
      </CContainer> */}
    </CHeader>
  )
}

export default AppHeader