import React from 'react';

import axios from "axios";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import NavBar from '../NavBar';

import styles from './home.module.css';

function RegisterPage(props) {
    // const [token, setToken] = useState(props.token);
    const navigate = useNavigate();
    const [status, setStatus] = useState('');

    // CAN INCLUDE EMAIL LATER; for now, just username and password
    const [loginForm, setloginForm] = useState({
        username: "",
        password: "",
        confirmPassword: ""
    })

    /** MAY NEED THIS CODE LATER for CSRF
     * 
     *     // Create a payload with the username and password
    const payload = {
      username: username,
      password: password,
    };
    
    const csrfToken = getCookie('csrftoken'); // get CSRF token (to access resources in server endpoint)

    // Set the CSRF token in the headers
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
    };

    // Make a POST request using Axios
    axios.post(baseURL + '/users/login', payload, { headers })
     */

    function logMeIn(event) {

        event.preventDefault() // prevent default form submission behavior (because we want to connect to BE endpoint)

        if (loginForm.confirmPassword !== loginForm.password) {
            setStatus('Passwords do not match.');
            return;
        }

        axios({
          method: "POST",
          url:"/register", // endpoint in backend to login user and return access token
          // remember, users module is just base url (e.g. localhost:5000/login but other modules are not
          // e.g. localhost:5000/gpt/test)
          data:{
            username: loginForm.username,
            password: loginForm.password
           }
        })
        .then((response) => {

            console.log(response);
            console.log(response.data["success"])

            if (response.data["success"]) { // success is True

                // console.log("HELP ME LORD JESUS")

                props.setToken(response.data.access_token)

                // console.log("success 1")

                console.log(loginForm.username)

                props.setUsername(loginForm.username) // may want to first check if token is null

                // console.log("success 2")
                
                console.log("Success: User logged in")

                navigate('/') // if successful login, redirect to the home page
            }
            else {
                setloginForm(({ // update the login form (erase username and password)
                    username: "",
                    password: "",
                    confirmPassword: ""}))
                
                setStatus(response.data["msg"]);
            }
        }).catch((error) => {
          if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            }
        })
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setloginForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    return (
        <>
            <br />
            <br />

            <div className={styles.registerContainer}>
                <h3 id={styles.loginHeader}>Register</h3>

                {/** The login form is here below */}

                <form onSubmit={logMeIn}>
                    <label>
                        Username
                        <input type="text" value={loginForm.username} onChange={handleChange} name="username" placeholder="Username" className={styles.box} required/>
                    </label>

                    <br />

                    <label>
                        Password:
                        <input type="password" value={loginForm.password} onChange={handleChange} name="password" placeholder="Password" className={styles.box} required />
                    </label>

                    <br />

                    <label>
                        Confirm Password:
                        <input type="password" value={loginForm.confirmPassword} onChange={handleChange} name="confirmPassword" placeholder="Confirm Password" className={styles.box} required />
                    </label>

                    <br />
                        <button id={styles.submitButton} type="submit">Register</button>
                </form>

                <br />
                
                <p style={{color: 'red'}}>{status}</p> {/** For the error status message */}

            </div>
        </>
    );
}

export default RegisterPage;