import React from 'react';
import { useState } from 'react';
// import "./events.css";
import { useEffect } from 'react';
import { useContext } from 'react';
import axios from 'axios'; // Import Axios

import { useNavigate } from 'react-router-dom';

import styles from './chat.module.css';

// import Button from 'react-bootstrap/Button';

// this is the component where the user enters text
// at the bottom of the screen

function TextEntry({onTextSubmit}) {
    // const logoPath = '/images/secra_logo.png';
    const [text, setText] = useState('');
    const baseURL = "http://localhost:8000"; // for local dev this is the backend server

    const submitIconPath = '/images/submit_icon.png';

    const navigate = useNavigate();

    const handleTextChange = (event) => { // pass in the event that occurs (some change / user interaction)
        setText(event.target.value);
    };
    
    // ONCE USER SUBMITS TEXT MESSAGE, IT SHOULD SHOW UP AS A TEXT BUBBLE ON SCREEN
    // ALSO NEED TO SUBMIT TO DJANGO ENDPOINT
    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        
        // first call a function in the parent component (EventsPage), to render the message

        const text_dict = {
            text: text,
            sender: 'user'
        };

        onTextSubmit(text_dict);

        // render the text bubble on screen by calling a function
        
        // const csrfToken = getCookie('csrftoken'); // get CSRF token (to access resources in server endpoint)

        // Set the CSRF token in the headers
        const headers = {
            'Content-Type': 'application/json',
            // 'X-CSRF-TOKEN': csrfToken,
        };
        
        const payload = JSON.stringify({query: text});

        // Make a POST request using Axios
        axios.post(baseURL + '/chat/submit', payload, { headers })
        .then(response => {
            // Handle the response data
            console.log('Response:', response.data);

            if (response.data["success"]) { // True
                
                // 
            }
            else {
                if (response.data["error"] === "User is not authenticated") {
                    navigate('/login');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    };

    return (
        <> 
            {/* now, with using CSS module, need to change how we set className */ }

            <form className={styles.bottomForm} onSubmit={handleSubmit}>
                <input type="text" value={text} onChange={handleTextChange} className={styles.box} placeholder="Message to assistant" required/>
                <button id={styles.submitButton} type="submit"><img src={submitIconPath} style={{width: "100%", height: "100%"}}alt="submit button"/> </button>
            </form>
        </>
    );
}

export default TextEntry;