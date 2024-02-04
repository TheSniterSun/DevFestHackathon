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

    const summary = props.summary;
    const content = props.content;

    return (
      <div className={styles.eventCard}>
      <div className={styles.eventTitle}>
        {summary}
      </div>
      <div className={styles.eventContent}>
            {content}
      </div>
    </div>
    );
}

export default Event;