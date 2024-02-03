import React, { useState, useEffect } from 'react';
import Event from './Event';
import styles from './chat.module.css';

function AssistantResponse(props) {
    const response = props.response; // text response ("generating" or the actual returned value, which includes "")
    
    // NOTE: IF ANY STATE HERE CHANGES, THEN THE CHILD INSTANCES ALSO RE-RENDERS
    // WHICH CAUSES THE INFINITE LOOPS

    const [eventResponse, setEventResponse] = useState(''); // either "", "waiting", "added"

    const [loadingText, setLoadingText] = useState("Generating response.");

    const [loadingEventText, setLoadingEventText] = useState("Adding to your calendar.");

    const [eventNum, setEventNum] = useState(0);

    // for the gpt response
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

    // for calendar response
    useEffect(() => {
        let intervalId;

        if (eventResponse === "waiting") {
            intervalId = setInterval(() => {
                setLoadingEventText(prev => { 
                    const dotCount = (prev.match(/\./g) || []).length;
                    if (dotCount < 3) {
                        return prev + ".";
                    } else {
                        return "Adding to your calendar";
                    }
                });
            }, 600);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [eventResponse]);

    const isJson = (str) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    const handleEventClick = (index, status) => {

        console.log("EVENT CLICK TRIGGERED!!!!!");

        setEventResponse(status); // either "waiting" or "added"

        if (status === "added") { // otherwise triggers multiple times
            setEventNum(index + 1);
        }
    };

    const renderEvents = (data) => { // this creates 
        if (data && data.times) { // if times exists
            return data.times.map((timeObj, index) => ( // render a new event object with specified params
                <Event 
                key={index} 
                username={props.username} 
                timeInfo={timeObj} 
                summary={data.summary} 
                location={data.location} 
                timezone={data.timezone} 
                recurrence={data.recurrence}
                onEventClick={(status) => handleEventClick(index, status)}/>
            ));
        }
        return null;
    };

    const renderResponse = () => {
        if (response === '') {
            return null; // empty response
        } else if (response === 'generating') {
            return <p>{loadingText}</p>;
        } else if (isJson(response)) {
            const parsedResponse = JSON.parse(response);
            return (
                <>  
                    <p>Here are some suggestions based on your availability:</p>
                    
                    <br />

                    <div className={styles.eventsContainer}>
                        {renderEvents(parsedResponse)}
                    </div>
                </>
            );
        } else { // this should NOT occur
            throw new Error("response is not valid");
        }
    };

    // I KNOW THE FUCKING ERROR
    // eventResponse is never changed to another value! HEHEHEHEHEHEHEHEHE
    // it's not really needed because it adds the event so quickly so

    // for adding the calendar event specifically
    const renderEventResponse = () => {
        if (eventResponse === '') {
            return null; // empty response
        } 
        else if (eventResponse === "waiting") {
             return (<>

             <br />
             <p>{loadingEventText}</p>

             </>);
        }
        else { // for the real response
            return (
            <>
            <br />
                <p>
                    Thank you for choosing <span className={styles.blueText}>event {eventNum}</span>! It has been added to your calendar.

                    <br />
                    To continue scheduling more events, please submit a new message above or refresh the page.
                </p>
            </>);
        } 
    };

    return (
        <div id="response">
            <h3>Assistant Response</h3>
            {renderResponse()} {/* This includes the event suggestions */}

            {renderEventResponse()} {/* This is just feedback (when they add an event) */}
        </div>
    );
}

export default AssistantResponse;
