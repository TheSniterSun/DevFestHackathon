import React from 'react';
import { useState } from 'react';
// import "./events.css";
import { useEffect } from 'react';
import { useContext } from 'react';
import axios from 'axios'; // Import Axios

import styles from './chat.module.css';

// import Button from 'react-bootstrap/Button';

// this is only for rendering a text bubble
// we should know 2 things: 
// 1. Text: Text itself
// 2. Pos: Left or right

function TextBubble({text, sender}) {
    // const logoPath = '/images/secra_logo.png';
    // const [text, setText] = useState('');
    const baseURL = "http://localhost:8000"; // for local dev this is the backend server

    // const { getCookie } = useContext(AuthContext);

    function renderMessage() {
        if (sender === 'user') {
           return <div className={`${styles.bubble} ${styles.user}`}>{text}</div>;
        }
        else { // assistant
           return <div className={`${styles.bubble} ${styles.assistant}`}>{text}</div>;
        }
    }
    
    // ONCE USER SUBMITS TEXT MESSAGE, IT SHOULD SHOW UP AS A TEXT BUBBLE ON SCREEN
    // ALSO NEED TO SUBMIT TO DJANGO ENDPOINT

    return (
        <> 
            {/* now, with using CSS module, need to change how we set className */ }

            {renderMessage()}
        </>
    );
}

export default TextBubble;