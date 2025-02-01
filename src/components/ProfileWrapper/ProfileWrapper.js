
import React from 'react';
import Profile from '../profile/profile'; 

const ProfileWrapper = ({ currentUser, setUsers }) => {
  return <Profile currentUser={currentUser} setUsers={setUsers} />;
};

export default ProfileWrapper;