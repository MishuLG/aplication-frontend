import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react';
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';

import '../../css/header.css';

import avatar10 from './../../assets/images/avatars/10.png';

const AppHeaderDropdown = () => {
  const location = useLocation();

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar10} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="header-profile" placement="bottom-end">
        <CDropdownHeader className="bg-body-primary fw-semibold mb-2">Account</CDropdownHeader>
        
        <CDropdownItem as={NavLink} to="/updates">
          <CIcon icon={cilBell} className="me-2" />
          Updates
          <CBadge color="info" className="ms-2">42</CBadge>
        </CDropdownItem>
        
        <CDropdownItem as={NavLink} to="/messages">
          <CIcon icon={cilEnvelopeOpen} className="me-2" />
          Messages
          <CBadge color="success" className="ms-2">42</CBadge>
        </CDropdownItem>
        
        <CDropdownItem as={NavLink} to="/tasks">
          <CIcon icon={cilTask} className="me-2" />
          Tasks
          <CBadge color="danger" className="ms-2">42</CBadge>
        </CDropdownItem>
        
        <CDropdownItem as={NavLink} to="/comments">
          <CIcon icon={cilCommentSquare} className="me-2" />
          Comments
          <CBadge color="warning" className="ms-2">42</CBadge>
        </CDropdownItem>
        
        <CDropdownHeader className="bg-body-danger fw-bold my-2">Settings</CDropdownHeader>
        
        <CDropdownItem as={NavLink} to="/profile" className={`dropdown-item ${location.pathname === '/profile' ? 'active' : ''}`}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>

        <CDropdownItem as={NavLink} to="/settings">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>

        <CDropdownItem as={NavLink} to="/payments">
          <CIcon icon={cilCreditCard} className="me-2" />
          Payments
          <CBadge color="secondary" className="ms-2">42</CBadge>
        </CDropdownItem>

        <CDropdownItem as={NavLink} to="/projects">
          <CIcon icon={cilFile} className="me-2" />
          Projects
          <CBadge color="primary" className="ms-2">42</CBadge>
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem as={NavLink} to="/lock-account">
          <CIcon icon={cilLockLocked} className="me-2" />
          Lock Account
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
}

export default AppHeaderDropdown;