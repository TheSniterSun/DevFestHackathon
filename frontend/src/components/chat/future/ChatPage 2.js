import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useContext } from 'react';

import { useNavigate } from 'react-router-dom';
import NavBar from '../NavBar';

import styles from './chat.module.css';
import axios from 'axios'; // Import Axios

import TextEntry from './TextEntry';
import TextBubble from './TextBubble';

const URL = 'auth'; // change as needed

function ChatPage(props) {

    return 4

    const logoPath = '/images/secra_logo.png';
    const [messages, setMessages] = useState(Array(0)); // empty array to start
    const navigate = useNavigate();

    // use an array of dictionaries
    // for each dict:
    // prop 1: message itself
    // prop 2: loc (left vs. right for assistant vs. user)

    function onTextSubmit(new_message) {
        setMessages(messages => (
            [...messages, new_message] // this message is a dict (has text, sender as 2 fields)
        ));
    };

    // Generate JSX code for Display each item, Add array index as the key
    // for pos, it should be "left" for assistant and "right" for user
    const renderMessages = messages.map((item, index) => 
        <div key={index}>
            <TextBubble text={item['text']} sender={item['sender']}/>
        </div>
    );

    return (
        <>  
            <div className="container">
                <h1 id="header">Your Chatbot</h1>
                
                {renderMessages}

                <TextEntry onTextSubmit={onTextSubmit}/>
            </div>
        </>
    );
}

export default ChatPage;