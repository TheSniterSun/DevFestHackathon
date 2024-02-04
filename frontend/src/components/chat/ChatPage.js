import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useContext } from 'react';

import { useNavigate } from 'react-router-dom';
import NavBar from '../NavBar';

import styles from './chat.module.css';
import axios from 'axios'; // Import Axios

import LoadingText from './AssistantResponse';
import AssistantResponse from './AssistantResponse';

import TextBubble from './TextBubble';

const URL = 'auth'; // change as needed

function ChatPage(props) {

    const logoPath = '/images/secra_logo.png';

    const text = "Hello, please share any water quality concerns. I will do my best to assist you."
    const [messages, setMessages] = useState([{text: text, sender: "gpt"}]); // empty array to start
    const navigate = useNavigate();
    const username = props.username;
    
    // FOR THE QUERY FORM
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");

    const submittedQuery = false;
    let gpt_response = "";

    let ex_string = "There's water pollution in our neighborhood, what should I do...";

    // use an array of dictionaries
    // for each dict:
    // prop 1: message itself
    // prop 2: loc (left vs. right for assistant vs. user)

    function submitQuery(event) {
        console.log("Hello testing how many times this is called")

        event.preventDefault() // prevent default form submission behavior (because we want to connect to BE endpoint)
        
        // setResponse("generating"); // "Generating response ... "

        onUserTextSubmit(query) // add to the messages array

        // add text for the message, and indication of the sender
        onGptTextSubmit("generating")

        axios({
          method: "POST",
          url:"/gpt/submit", // endpoint in backend to login user and return access token
          // remember, users module is just base url (e.g. localhost:5000/login but other modules are not
          // e.g. localhost:5000/gpt/test)
          // for some reason, proxy not working
          baseURL: 'http://127.0.0.1:5000', // for some reason, throws error with localhost
          headers: {
            Authorization: 'Bearer ' + props.token,
            'Content-Type': 'application/json'
          },
          
          data: {
            username: username,
            query: query,
          }

        })
        .then((response) => {

            const data = response.data; // need to access the actual JSON data returned

            // console.log(response);
            console.log(data["success"])

            // data is the JSON object returned by endpoint "chat/submit"
            gpt_response = data.response;

            console.log(gpt_response)

            gpt_response = data.response;

            onGptTextSubmit(gpt_response); // Add the GPT response to the messages

            // pass the JSON info to the Assistant response
            setResponse(gpt_response); // should be a JSON
            
            /*
            Once GPT returns the list of times, we want to render them as separate options / components
            All events should be similar/the same, except start, end, date
            Create a new component with these fields, then just show them side by side
            We need a way to figure out how to respond back with which option was clicked
            Specifically, 
            */

            // response is a JSON string, convert to JSON object
            // gpt_response = JSON.parse(gpt_response)

        }).catch((error) => {
          if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            }
        })
    }

    /** TREAT AS STRING NOT OBJECT WITH PROPS
    function handleQueryChange(event) {
        const { name, value } = event.target;
        setQuery(prevState => ({
            ...prevState,
            [name]: value
        }));
    }
    */

    function handleQueryChange(event) {
        setQuery(event.target.value);
    }

    function onUserTextSubmit(new_message) { // add text for the message, and indication of the sender
        setMessages(messages => [
            ...messages,
            { text: new_message, sender: 'user' } // Assuming 'user' as the sender
        ]);
    }

    function onGptTextSubmit(new_message) { // add text for the message, and indication of the sender
        setMessages(messages => [
            ...messages,
            { text: new_message, sender: 'gpt' } // Assuming 'user' as the sender
        ]);
    }

    // Generate JSX code for Display each item, Add array index as the key
    // for pos, it should be "left" for assistant and "right" for user
    const renderMessages = messages.map((item, index) => 
        <div key={index}>
            <TextBubble text={item['text']} sender={item['sender']}/>
        </div>
    );

    return (
        <>  
            <div className={styles.messageContainer}>
                {renderMessages}

                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />

                <form id="queryForm" className={styles.queryForm} onSubmit={submitQuery}>
                    <input type="text" value={query} onChange={handleQueryChange} name="query" id="query" placeholder="There's water pollution in our neighborhood, what should I do..." className={styles.box} required></input>
                    <input id="submitButton" type="submit" value="Submit" />
                </form>
            </div>
        </>
    );
}

export default ChatPage;