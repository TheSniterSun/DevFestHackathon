import React from 'react';
import { useState } from 'react';

import { useEffect } from 'react';
import { useContext } from 'react';

import NavBar from '../NavBar';

import axios from 'axios'; // Import Axios
import styles from './home.module.css';
import { user_authorized } from '../utils'

import { Link } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';

const baseURL = "http://localhost:8000"; // for local dev this is the backend server

function HomePage(props) {
    const logoPath = '/images/wewater.png'; // in public folder
    const token = props.token;
    const isLoggedIn = user_authorized(token);

    const navigate = useNavigate();

    function handleReportClick() {
        navigate('/report')
    }

    function handleMapClick() {
        navigate('/map')
    }

    function handleChatClick() {
        if (isLoggedIn) {
            navigate('/chat')
        }
        else {
            navigate('/login')
        }
    }

    return (
    <>
        <div className="container">
        
        <br />
        <br />

        <div className="row">
            <div className={styles.imageCenter}>
                    <img src={process.env.PUBLIC_URL + logoPath} className={styles.center} alt="logo" style={{ width: '600px', height: '150px', objectFit: 'cover'}}/>
                    {/*maxWidth: '954px', height: '283px' */}
            </div>
        </div>

        <br />

        <div className="row">
            <h2><span className={`${styles.homeDarkBlueText} ${styles.boldText}`}>WeWater</span> is a water quality monitoring system</h2>

            <br />
            <br />
            <br />

            <div className="col-md-4 textContainer" align="center">
                <h5>Self-report water quality concerns</h5>

                <br />

                <button className={styles.reportButton} onClick={handleReportClick}>Report</button>
            </div>

            <div className="col-md-4 textContainer">
                <h5>View high-risk areas in a map</h5>

                <br />

                <button className={styles.reportButton} onClick={handleMapClick}>View Map</button>
            </div>

            <div className="col-md-4 textContainer">
                <h5>General water advice (requires login)</h5>

                <br />

                <button className={styles.reportButton} onClick={handleChatClick}>Chat</button>
            </div>
        </div>
            
        <br />
        <br />

        </div>
    </>
    );
}

export default HomePage;