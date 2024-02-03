import { BrowserRouter, Route, Routes } from 'react-router-dom'

import useToken from './components/useToken'
import useName from './components/useName'
import './App.css'

import { useState, useEffect } from 'react';

import HomePage from './components/home/HomePage';
import LoginPage from './components/home/LoginPage';
import RegisterPage from './components/home/RegisterPage';

import ChatPage from './components/chat/ChatPage';
import NavBar from './components/NavBar';

// Rendered when user goes to base path (localhost:3000/)

function App() {
  const { token, removeToken, setToken } = useToken(); // useToken() is custom
  const { username, removeUsername, setUsername } = useName();
  // const [ username, setUsername ] = useState(null);

  console.log("username: " + username);

  return (
    // parent component
    <BrowserRouter> 
      <div className="App">

        <NavBar token={token} removeToken={removeToken} username={username} />
        {/** NavBar should ALWAYS exist, so render it here in main app */}

        {/** The ideal flow to have each element in the nav bar visible, but redirected
         * to login/register with no token upon clicking
        */}

        {/** So we just define routes here first */}
        <Routes>
            <Route path="/" element={<HomePage token={token} setToken={setToken} />} />
            {/** After logout, should be redirected to the home page */}

            <Route path="/login" element={<LoginPage token={token} setToken={setToken} setUsername={setUsername} />} />
            <Route path="/register" element={<RegisterPage token={token} setToken={setToken} setUsername={setUsername} />} />

            <Route path="/chat" element={<ChatPage token={token} setToken={setToken} username={username} />} />
        </Routes>

        {/* if no token, render the login component. else, define the routes / endpoints
        {!token && token !== "" && token !== undefined ?  

        <Login setToken={setToken} setUsername={setUsername} />

        :(
          <> 
            <Routes> 
              <Route exact path="/profile" element={<Profile token={token} setToken={setToken}/>}></Route>

              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/logout" element={<HomePage />} />

              <Route path="/events" element={<EventsPage />} />
            </Routes>
          </>
        )}
         */}

      </div>
      {/* The routes component is the most important part: updaet with the paths we want to serve */}
    </BrowserRouter>
  );
}

export default App;