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

const URL = 'auth'; // change as needed

function ChatPage(props) {

    const logoPath = '/images/secra_logo.png';
    const [messages, setMessages] = useState(Array(0)); // empty array to start
    const navigate = useNavigate();
    const username = props.username;
    
    // FOR THE QUERY FORM
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");

    const submittedQuery = false;
    let gpt_response = "";

    // use an array of dictionaries
    // for each dict:
    // prop 1: message itself
    // prop 2: loc (left vs. right for assistant vs. user)

    function onTextSubmit(new_message) {
        setMessages(messages => (
            [...messages, new_message] // this message is a dict (has text, sender as 2 fields)
        ));
    };

    function submitQuery(event) {

        console.log("Hello testing how many times this is called")

        event.preventDefault() // prevent default form submission behavior (because we want to connect to BE endpoint)
        
        setResponse("generating"); // "Generating response ... "

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

            // setResponse(gpt_response);
            // NOW PARSE THE JSON TO OBTAIN THE RELEVANT EVENT INFORMATION:
            
            /* 
            let times = gpt_response['times']; // array of JSON objects
            let num_times = times.length;

            if (num_times === 0) {
                throw new Error("No suggested times found");
            }

            // OTHER EVENT PARAMS 
            let timezone = gpt_response['timezone']
            let summary = gpt_response['summary'];
            let loc = gpt_response['location']; // location is a keyword in JS
            let recurrence = gpt_response['recurrence'];

            // iterate over the times and pass them into components to display
            
            let start = "";
            let end = "";
            let date = "";

            let time = "";

            // edit this with React later
            for (let i = 0; i < num_times; i++) {
                time = times[i]

                start = time['start'];
                end = time['end'];
                date = time['date'];

                let display_tz = "";
                
                if (timezone == "US/Eastern" || timezone == "America/New_York" || timezone == "ET") { // handle only ET for now
                    display_tz = "ET";
                }

                let formatted_time = start + " to " + end + " " + display_tz;

                console.log("Option " + (i + 1) + ":\nTime: " + formatted_time + "\nDate: " + date);
            }
            */

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

    return (
        <>  

        <div className={styles.container}>
            <h1 id={styles.header}><span style={{color: 'blue'}} id="username">{username}</span>'s Assistant</h1>
            
            <br />
            
            <h3>Your Message</h3>

            <br />

            <form id="queryForm" onSubmit={submitQuery}>
                <input type="text" value={query} onChange={handleQueryChange} name="query" id="query" placeholder="Schedule a meeting..." className={styles.box} required></input>
                <input id="submitButton" type="submit" value="Submit" />
            </form>
        
            {/* GPT RESPONSE HERE */}

            {/* Once GPT returns a response, we use components (for Event) to represent the times */}
            <br />
            <br />
            <AssistantResponse response={response} username={username} />

        </div>
        
        {/*-- From tester1.secra calendar 
        <div align="center">

        <div style={{ position: 'relative', width: '800px', height: '600px' }}>

        <iframe 
            src="https://calendar.google.com/calendar/embed?src=tester1.secra%40gmail.com&ctz=America%2FNew_York" 
            title="User's Google Calendar" 
            style={{ border: 0, width: '100%', height: '100%' }} >
        </iframe>

        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            // backgroundColor: 'rgba(173, 216, 230, 0.5)', // Light blue color with opacity
            pointerEvents: 'none' // To allow interaction with the iframe
        }}></div>

        </div>


        </div> */}
        </>
    );
}

export default ChatPage;