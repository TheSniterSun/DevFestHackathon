import React from 'react';
import { useState } from 'react';

import { useEffect } from 'react';
import { useContext } from 'react';

import NavBar from '../NavBar';

import axios from 'axios'; // Import Axios
import { user_authorized } from '../utils'

import { Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported
import styles from './about.module.css';

const baseURL = "http://localhost:8000"; // for local dev this is the backend server

function AboutPage(props) {

const logoPath = '/images/wewater.png'; // in public folder
const token = props.token;
const isLoggedIn = user_authorized(token);

return (
    <div className="container">
        <br />

        <div className="row">
            <div className="col-md-6">
                <br />
                <br />
                <br />

                <h2>Mission Statement</h2>

                <br />
                
                <p>Our mission is to improve water quality and promote sustainable water management in New York / New Jersey.
                In our hometowns, there were cases where public water was polluted (by e. coli) and there was little to no information before it was too late.

                <br />
                <br />

                Specifically, we had no way to report cases of sickness or contact local officials regarding the problem.
                And so we built WeWater to address these problems in areas near our school. 
                </p>
            </div>

            <div className="col-md-6">
                <div className="row">
                    <div className="col-md-6">
                        <h3>Brandon Pae</h3>
                        <img src={process.env.PUBLIC_URL + '/images/brandon.jpeg'} className="img-fluid" alt="title2" style={{ width: '150px', height: '200px', objectFit: 'cover'}}/>
                        <p>Sophomore in SEAS studying CS and entrepreneurship.</p>
                    </div>

                    <div className="col-md-6">
                        <h3>Daniel Manjarrez</h3>
                        <img src={process.env.PUBLIC_URL + '/images/daniel.png'} className="img-fluid" alt="title2" style={{ width: '150px', height: '200px', objectFit: 'cover'}}/>
                        <p>Sophomore in SEAS studying CS.</p>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <h3>Nicholas Djedjos</h3>
                        <img src={process.env.PUBLIC_URL + '/images/nicholas.png'} className="img-fluid" alt="title2" style={{ width: '150px', height: '200px', objectFit: 'cover'}}/>
                        <p>Sophomore in SEAS studying CS and BME.</p>
                    </div>

                    <div className="col-md-6">
                        <h3>Trinity Suma</h3>
                        <img src={process.env.PUBLIC_URL + '/images/trinity.png'} className="img-fluid" alt="title2" style={{ width: '150px', height: '200px', objectFit: 'cover'}}/>
                        <p>Sophomore in SEAS studying CS.</p>
                        </div>
                    </div>
                </div>
        </div>

        <hr />

        <div className="row">
            <div className="col-md-3">
            </div>

            <div className="col-md-6">
                <div>

                    <br />

                    <h2>Contact Us</h2>
                    <form>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name:</label>
                            <input type="text" className="form-control" id="name" name="name" required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email:</label>
                            <input type="email" className="form-control" id="email" name="email" required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="message" className="form-label">Message:</label>
                            <textarea className="form-control" id="message" name="message" rows="3" required></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary">Send</button>
                    </form>
                </div>
            </div>

            <div className="col-md-3">
            </div>
        </div>

        <br />
        <br />

    </div>
);
}

export default AboutPage;