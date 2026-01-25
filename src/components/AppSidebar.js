import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CImage,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
  // Se eliminaron CSidebarFooter y CSidebarToggler
} from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'

// sidebar nav config
import navigation from '../_nav'

// Importar CSS
import '../css/header.css'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      className="modern-sidebar border-0"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="sidebar-header-modern">
        <CSidebarBrand to="/" className="d-flex align-items-center justify-content-center w-100 text-decoration-none">
          {/* Logo */}
          <CImage 
            src='src/assets/images/icon.png' 
            height={32} 
            className="d-inline-block align-middle"
          />
          {/* Texto LICEO */}
          <span className="sidebar-brand-text">ESCUELA</span>
        </CSidebarBrand>
        
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      {/* Navegación */}
      <AppSidebarNav items={navigation} />

      {/* Footer eliminado para quitar el botón con bugs */}
    </CSidebar>
  )
}

export default React.memo(AppSidebar)