import React from 'react';
import { useState } from 'react';
// import "./events.css";
import { useEffect } from 'react';
import { useContext } from 'react';
import axios from 'axios'; // Import Axios

import AssistantResponse from './AssistantResponse';

import styles from './chat.module.css';

// import Button from 'react-bootstrap/Button';

// this is only for rendering a text bubble
// we should know 2 things: 
// 1. Text: Text itself
// 2. Pos: Left or right

function TextBubble({text, sender}) {

    const response = text;

    // const logoPath = '/images/secra_logo.png';
    // const [text, setText] = useState('');
    const baseURL = "http://localhost:8000"; // for local dev this is the backend server
    // const { getCookie } = useContext(AuthContext);

    const [loadingText, setLoadingText] = useState("Generating response...");

    /** 
    useEffect(() => {
        let intervalId;

        if (response === "generating") {
            intervalId = setInterval(() => {
                setLoadingText(prev => { 
                    const dotCount = (prev.match(/\./g) || []).length;
                    if (dotCount < 3) {
                        return prev + ".";
                    } else {
                        return "Generating response";
                    }
                });
            }, 600);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [response]);
    */

    function renderMessage() {
        if (sender === 'user') {
           return <div className={`${styles.bubble} ${styles.user}`}>{text}</div>;
        }
        else { // assistant
            if (text === "generating") {
                return <div className={`${styles.bubble} ${styles.assistant}`}>{loadingText}</div>;
            }
            else if (text === "Hello, please share any water quality concerns. I will do my best to assist you.") {
                return <div className={`${styles.bubble} ${styles.assistant}`}>{text}</div>;
            }

            // format the solutions as a list for the user
            return (<>
                <AssistantResponse response={response}/>
            </>)
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