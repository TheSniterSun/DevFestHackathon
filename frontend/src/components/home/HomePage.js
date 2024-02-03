import React from 'react';
import { useState } from 'react';

import { useEffect } from 'react';
import { useContext } from 'react';

import NavBar from '../NavBar';

import axios from 'axios'; // Import Axios
import styles from './home.module.css';
import { user_authorized } from '../utils'

import { Link } from 'react-router-dom';

const baseURL = "http://localhost:8000"; // for local dev this is the backend server

function HomePage(props) {
    const logoPath = '/images/wewater.png'; // in public folder
    const token = props.token;
    const isLoggedIn = user_authorized(token);

    return (
    <>
        <br />
        <br />

        <h1 className={styles.textCenter}>Welcome to WeWater!</h1>

        <div className={styles.imageCenter}>
            <img src={process.env.PUBLIC_URL + logoPath} className={styles.center} alt="logo" />
        </div>

        <div className={styles.textCenter}>
            <h2>WeWater is a water quality monitoring system with 3 features:</h2>

            <br />

            <h2 className={styles.centerContainer}>
                <ul className={styles.noBullets}>
                    <li> <span className={`${styles.homeDarkBlueText} ${styles.boldText}`}>- </span> Self-report water quality concerns </li>
                    <li> <span className={`${styles.homeDarkBlueText} ${styles.boldText}`}>- </span> Show high-risk areas with an interactive map </li>
                    <li> <span className={`${styles.homeDarkBlueText} ${styles.boldText}`}>- </span> Contact relevant policy officials </li>
                </ul>
            </h2>

            { isLoggedIn ? (

            <h2>
                Thanks for signing in! Get started with <Link className={styles.homeLightBlueText} to="/chat">Chat</Link>.
            </h2> ):

            (<h2>
                To get started, please <Link className={styles.homeLightBlueText} to="/login">login</Link> or <Link className={styles.homeLightBlueText} to="/register">register</Link>.
            </h2>)

            }

        </div>
    </>
    );
}

export default HomePage;