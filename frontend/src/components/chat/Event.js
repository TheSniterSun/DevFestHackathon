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

function Event(props) {
    // <Event key={index} timeInfo={timeObj} summary={data.summary} location={data.location} timezone={data.timezone} />

    const username = props.username;

    const timeInfo = props.timeInfo;
    const summary = props.summary;
    const loc = props.location;
    const timezone = props.timezone;
    const recurrence = props.recurrence;

    const start = timeInfo['start'];
    const end = timeInfo['end'];
    const date = timeInfo['date'];

    let display_tz = "";
    
    if (timezone === "US/Eastern" || timezone === "America/New_York" || timezone === "ET") { // handle only ET for now
        display_tz = "ET";
    }

    let formatted_time = start + " to " + end + " " + display_tz;

    // prints too many times
    
    // console.log("Time: " + formatted_time + "\nDate: " + date); // this keeps printing over and over again

    // which means some component state is being updated repeatedly

    // if the user clicks to submit this time, then a request is made on the backend

    function submitTime() {
        // event.preventDefault() // prevent default form submission behavior (because we want to connect to BE endpoint)

        props.onEventClick("waiting");

        const event_info = {
            "summary": summary,
            "location": loc,
            "start": start,
            "end": end,
            "timezone": timezone,
            "date": date,
            "recurrence": recurrence,
        }

        axios({
          method: "POST",
          url:"/gcal/submit", // endpoint in backend to login user and return access token
          // remember, users module is just base url (e.g. localhost:5000/login but other modules are not
          // e.g. localhost:5000/gpt/test)
          // for some reason, proxy not working
          baseURL: 'http://127.0.0.1:5000', // for some reason, throws error with localhost
          headers: {
            // Authorization: 'Bearer ' + props.token, // later on, we should pass token as a prop and ensure JWT is required on backend
            'Content-Type': 'application/json'
          },
          
          data: JSON.stringify({
            event: event_info,
            username: username })

        })
        .then((response) => {

            const data = response.data; // need to access the actual JSON data returned

            // console.log(response);
            console.log(data["success"]) // should log true

            props.onEventClick("added"); // let the AssistantResponse know that we clicked the event

            console.log("called!!!!")

        }).catch((error) => {
          if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            }
        })
    }

    return (
        <div className={styles.eventCard}>
          <div className={styles.eventTime}>
            <span className={styles.icon}>🕒</span>
            <span className={styles.time}>
                {formatted_time}
            </span>
          </div>
          <div className={styles.eventDate}>
            <span className={styles.icon}>📅</span>
            <span className={styles.date}>
                {date}
            </span>
          </div>
          <button className={styles.addToCalendar} onClick={() => submitTime()}>Add to Calendar</button>
        </div>
      );
}

export default Event;