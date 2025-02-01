import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser, cilSettings } from '@coreui/icons';

import avatar10 from './../../assets/images/avatars/10.png';

const AppHeaderDropdown = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLockAccount = () => {
    if (onLogout) {
      onLogout();
      navigate('/login'); 
    } else {
      console.error('onLogout is not defined');
    }
  };

  return (
    <CDropdown variant="nav-item" placement="bottom-end">
      <CDropdownToggle caret={false}>
        <CAvatar src={avatar10} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="header-profile" placement="bottom-end">
        <CDropdownHeader className="bg-body-danger fw-bold my-2">Settings</CDropdownHeader>
        <CDropdownItem as={NavLink} to="/profile" className={`dropdown-item ${location.pathname === '/profile' ? 'active' : ''}`}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        {/* <CDropdownItem as={NavLink} to="/settings">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem> */}
        <CDropdownDivider />
        <CDropdownItem onClick={handleLockAccount}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Lock Account
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;
