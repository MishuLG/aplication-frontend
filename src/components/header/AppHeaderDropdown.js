import React, { useState, useEffect } from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilLockLocked,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import API_URL from '../../../config'


const DEFAULT_IMG = 'https://via.placeholder.com/150?text=U';

const AppHeaderDropdown = () => {
  const [profilePic, setProfilePic] = useState(DEFAULT_IMG)

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.profile_pic) {
            setProfilePic(data.profile_pic)
          }
        }
      } catch (error) {
        console.error("Error cargando imagen del header:", error)
      }
    }

    fetchProfileImage()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '#/login' 
    window.location.reload() 
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        {/* Aquí se muestra tu foto de perfil */}
        <CAvatar src={profilePic} size="md" status="success" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-light fw-semibold py-2">
          Mi Cuenta
        </CDropdownHeader>
        
        <CDropdownItem href="#/profile">
          <CIcon icon={cilUser} className="me-2" />
          Mi Perfil
        </CDropdownItem>
        
        <CDropdownDivider />
        
        <CDropdownItem onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Cerrar Sesión
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown