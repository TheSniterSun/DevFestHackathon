import { useState } from 'react';

// functions to set and get username field with local storage

function useName() {

  function getUsername() {
    const username = localStorage.getItem('username');
    return username && username // only return if exists
  }

  const [username, setUsername] = useState(getUsername()); // hook
  // react page reloads when state changes

  function saveUsername(name) {
    localStorage.setItem('username', name);
    setUsername(name);
  };

  function removeUsername() {
    localStorage.removeItem("username");
    setUsername(null);
  }

  return {
    setUsername: saveUsername,
    username,
    removeUsername
  }

}

export default useName;