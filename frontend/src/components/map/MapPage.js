import React from 'react';
import { useState } from 'react';

import { useEffect } from 'react';
import { useContext } from 'react';

import NavBar from '../NavBar';

import axios from 'axios'; // Import Axios
import { user_authorized } from '../utils'

import { Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported
import styles from './map.module.css';

const baseURL = "http://localhost:8000"; // for local dev this is the backend server

function MapPage(props) {

    const logoPath = '/images/wewater.png'; // in public folder
    const token = props.token;
    const isLoggedIn = user_authorized(token);

    return (
        <div className="container">
            MAP PAGE HERE
        </div>
    );

}

export default MapPage;