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

    const isJson = (str) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    const renderEvents = (data) => { // this creates 
        if (data && data.solutions) { // if times exists
            return data.solutions.map((timeObj, index) => ( // render a new event object with specified params
                <Event 
                key={index} 
                username={props.username} 
                summary={timeObj.summary}
                content={timeObj.content}/>
            ));
        }
        return null;
    };

    const renderResponse = () => {
        if (response === '') {
            return null; // empty response
        } else if (isJson(response)) {
            const parsedResponse = JSON.parse(response);
            return (
                <>  
                    <p>Here are some suggestions:</p>
                    
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

    return (
        <div id="response" className={`${styles.bubble} ${styles.assistant} ${styles.eventContainer}`}>
            {renderResponse()} {/* This includes the event suggestions */}
        </div>
    );
}

export default AssistantResponse;
