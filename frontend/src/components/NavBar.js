// Navbar.js
import React from 'react';
import styles from './navbar.module.css'; // Import the CSS file
// import { BrowserRouter as Router } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import { user_authorized } from './utils';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function NavBar(props) {

    // const [user, setUser] = useState(null);
    // const { logout, getUser } = useContext(AuthContext);
    // const baseURL = "http://localhost:8000"; // for local dev this is the backend server

    // to track if logged in just, pass in the auth token as a prop
    const navigate = useNavigate();
    const token = props.token;

    let isLoggedIn = user_authorized(token);
    let username = props.username; // if user is not logged in, it's null
    // could also retrieve from local storage later

    function logMeOut() {
        axios({
          method: "POST",
          url:"/logout",
        })
        .then((response) => {
           props.removeToken() // remove the token from local storage
        }).catch((error) => {
          if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            }
        })
    }

    // check if the user has a token
    function handleChat() {
        if (isLoggedIn) {
            navigate('/chat')
        }
        else {
            navigate('/login')
        }
    }

    return (
        <>
        {/* Expands on larger screen sizes; Note: bg-body-tertiary is just a type of background color */}
        <Navbar expand="lg" className={styles.navbar} data-bs-theme="dark">
          <Container>
            <Navbar.Brand href="/">Secra</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">

            {/* Change this so it's NOT a dropdown later */}
              <Nav className="ml-auto">
                {/* First need to check that the user is logged in*/}
                <Nav.Link onClick={handleChat}>Chat</Nav.Link>
              </Nav>

            </Navbar.Collapse>

            {/* Cannot use if statements */}

            <Navbar.Collapse className="justify-content-end">
                <Nav className="ml-auto">
                    {isLoggedIn ? (
                    <>
                      <Navbar.Text>
                        Signed in as: {username}
                      </Navbar.Text>

                      <Nav.Link onClick={logMeOut}>Logout</Nav.Link>
                    </>
                    ): (
                        <>
                          <Nav.Link href="/login">Login</Nav.Link>
                          <Nav.Link href="/register">Register</Nav.Link>
                            
                        </>
                    )}
                </Nav>
            </Navbar.Collapse>

          </Container>
        </Navbar>
        </>
    );
}

export default NavBar; // NavBar is our class, Navbar is the react-bootstrap one