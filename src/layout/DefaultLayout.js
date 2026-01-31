import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import AppTutorial from '../components/AppTutorial' 

const DefaultLayout = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          <AppContent />
        </div>
        <AppFooter />
      </div>
      
      {/* El tutorial se carga aquí, solo visible cuando el usuario ya entró al sistema */}
      <AppTutorial /> 
    </div>
  )
}

export default DefaultLayout