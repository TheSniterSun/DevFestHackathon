import React, { useState } from 'react';
import styles from './report.module.css';

import axios from 'axios'; // Import Axios

function ReportPage() {
  const [inputValue, setInputValue] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  const [inputValue3, setInputValue3] = useState('');
  const [inputValue4, setInputValue4] = useState('');
  const [inputValue5, setInputValue5] = useState('');
  const [inputValue6, setInputValue6] = useState('');
  const [inputValue7, setInputValue7] = useState('');
  const [inputValue8, setInputValue8] = useState('');
  const [inputValue9, setInputValue9] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [useCurrentLocation2, setUseCurrentLocation2] = useState(false);
  const [useCurrentLocation3, setUseCurrentLocation3] = useState(false);
  const [useCurrentLocation4, setUseCurrentLocation4] = useState(false);
  const [useCurrentLocation5, setUseCurrentLocation5] = useState(false);
  const [useCurrentLocation6, setUseCurrentLocation6] = useState(false);
  const [comment, setComment] = useState('');

  const handleCheckboxChange = () => {
    setUseCurrentLocation(!useCurrentLocation);
  };

  const handleCheckboxChange2 = () => {
    setUseCurrentLocation2(!useCurrentLocation2);
  };

  const handleCheckboxChange3 = () => {
    setUseCurrentLocation3(!useCurrentLocation3);
  };

  const handleCheckboxChange4 = () => {
    setUseCurrentLocation4(!useCurrentLocation4);
  };

  const handleCheckboxChange5 = () => {
    setUseCurrentLocation5(!useCurrentLocation5);
  };

  const handleCheckboxChange6 = () => {
    setUseCurrentLocation6(!useCurrentLocation6);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputChange2 = (e) => {
    setInputValue2(e.target.value);
  };

  const handleInputChange3 = (e) => {
    setInputValue3(e.target.value);
  };

  const handleInputChange4 = (e) => {
    setInputValue4(e.target.value);
  };

  const handleInputChange5 = (e) => {
    setInputValue5(e.target.value);
  };

  const handleInputChange6 = (e) => {
    setInputValue6(e.target.value);
  };

  const handleInputChange7 = (e) => {
    setInputValue7(e.target.value);
  };

  const handleInputChange8 = (e) => {
    setInputValue8(e.target.value);
  };

  const handleInputChange9 = (e) => {
    setInputValue9(e.target.value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  function handleSubmit(event) {
    console.log('Form submitted!');

    event.preventDefault() // prevent default form submission behavior (because we want to connect to BE endpoint)
    
    axios({
      method: "POST",
      url:"/submitData", // endpoint in backend to login user and return access token
      // remember, users module is just base url (e.g. localhost:5000/login but other modules are not
      // e.g. localhost:5000/gpt/test)
      // for some reason, proxy not working
      baseURL: 'http://127.0.0.1:5000', // for some reason, throws error with localhost
      headers: {
        'Content-Type': 'application/json'
      },
      
      data: {
        dataa: {
            street: inputValue,
            city: inputValue2,
            state: inputValue3,
            zip: inputValue4,

            chlorine: inputValue5,
            turbidity: inputValue6,
            fluorine: inputValue7,
            coliform: inputValue8,
            ecoli: inputValue9
        }
      }

    })
    .then((response) => {

        const data = response.data; // need to access the actual JSON data returned

        // console.log(response);
        console.log(data["success"])


    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
        }
    })
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Submit a Concern<button onClick={handleSubmit} className={styles.btn} style={{ marginLeft: '10px' }}>Submit</button></h1>
      <div className={styles.task}>
        Use current location: 
        <input type='checkbox' checked={useCurrentLocation} onChange={handleCheckboxChange} className={styles.formControlCheck} />
      </div>

      {useCurrentLocation ? null : (
        <div className={styles.task}>
          <span style={{ fontWeight: 'bold', color: 'grey' }}>Manually Fill In Your Location</span><br />
          Street: <span style={{position: 'relative', right:'-16px'}}><input type="text" value={inputValue} onChange={handleInputChange} className={`${styles.formControl} ${styles.input}`} /></span><br />
          City: <span style={{position: 'relative', right:'-31px'}}><input type="text" value={inputValue2} onChange={handleInputChange2} className={`${styles.formControl} ${styles.input}`} /></span><br />
          State: <span style={{position: 'relative', right:'-21px'}}><input type="text" value={inputValue3} onChange={handleInputChange3} className={`${styles.formControl} ${styles.input}`} /></span><br />
          Zip: <span style={{position: 'relative', right:'-39px'}}><input type="text" value={inputValue4} onChange={handleInputChange4} className={`${styles.formControl} ${styles.input}`} /></span><br />
        </div>
      )}
      <div className={styles.task}>
      <span style={{ fontWeight: 'bold', color: 'grey', marginBottom:'20px'}}>Report Details Of Your Location</span><br />
      <span style={{margin: '2px'}}><span style={{position: 'relative', right:'-16px', top:'5px'}}><input type='checkbox' checked={useCurrentLocation2} onChange={handleCheckboxChange2} className={styles.formControlCheck} /></span> <span style={{position: 'relative', right:'-30px', padding:'5px', top:'5px'}}>Chlorine</span><br /></span>
      {!useCurrentLocation2 ? null : (
        <div className='task'>
            <span style={{position: 'relative', right:'-32px'}}><input type="text" value={inputValue5} onChange={handleInputChange5} className={`${styles.formControl2} ${styles.input2}`} /> mg / L</span><br />
            {inputValue5 >= 4 && <span style={{position: 'relative', right:'-32px', color:'red'}}>Dangerous Levels!</span>}
        </div>
      )}
      <span style={{margin: '2px'}}><span style={{position: 'relative', right:'-16px', top:'5px'}}><input type='checkbox' checked={useCurrentLocation3} onChange={handleCheckboxChange3} className={styles.formControlCheck}/></span> <span style={{position: 'relative', right:'-30px', padding:'5px', top:'5px'}}>Turbidity</span><br /></span>
      {!useCurrentLocation3 ? null : (
        <div className={styles.task}>
            <span style={{position: 'relative', right:'-32px'}}><input type="text" value={inputValue6} onChange={handleInputChange6} className={`${styles.formControl2} ${styles.input2}`} /> NTU</span><br />
            {inputValue6 >= 5 && <span style={{position: 'relative', right:'-32px', color:'red'}}>Dangerous Levels!</span>}
        </div>
      )}
      <span style={{margin: '2px'}}><span style={{position: 'relative', right:'-16px', top:'5px'}}><input type='checkbox' checked={useCurrentLocation4} onChange={handleCheckboxChange4} className={styles.formControlCheck}/></span> <span style={{position: 'relative', right:'-30px', padding:'5px', top:'5px'}}>Fluorine</span><br /></span>
      {!useCurrentLocation4 ? null : (
        <div className={styles.task}>
            <span style={{position: 'relative', right:'-32px'}}><input type="text" value={inputValue7} onChange={handleInputChange7} className={`${styles.formControl2} ${styles.input2}`} /> mg / L</span><br />
            {inputValue7 >= 4 && <span style={{position: 'relative', right:'-32px', color:'red'}}>Dangerous Levels!</span>}
        </div>
      )}
      <span style={{margin: '2px'}}><span style={{position: 'relative', right:'-16px', top:'5px'}}><input type='checkbox' checked={useCurrentLocation5} onChange={handleCheckboxChange5} className={styles.formControlCheck}/></span> <span style={{position: 'relative', right:'-30px', padding:'5px', top:'5px'}}>Coliform</span><br /></span>
      {!useCurrentLocation5 ? null : (
        <div className={styles.task}>
            <span style={{position: 'relative', right:'-32px'}}><input type="text" value={inputValue8} onChange={handleInputChange8} className={`${styles.formControl2} ${styles.input2}`} /> MPN / 100 ml</span><br />
            {inputValue8 >= 5 && <span style={{position: 'relative', right:'-32px', color:'red'}}>Dangerous Levels!</span>}
        </div>
      )}
      <span style={{margin: '2px'}}><span style={{position: 'relative', right:'-16px', top:'5px'}}><input type='checkbox' checked={useCurrentLocation6} onChange={handleCheckboxChange6} className={styles.formControlCheck}/></span> <span style={{position: 'relative', right:'-30px', padding:'5px', top:'5px'}}>E. Coli</span><br /></span>
      {!useCurrentLocation6 ? null : (
        <div className={styles.task}>
            <span style={{position: 'relative', right:'-32px'}}><input type="text" value={inputValue9} onChange={handleInputChange9} className={`${styles.formControl2} ${styles.input2}`} /> MPN / 100 ml</span><br />
            {inputValue9 >= 5 && <span style={{position: 'relative', right:'-32px', color:'red'}}>Dangerous Levels!</span>}
        </div>
      )}
      </div>
      <div className={styles.task}>
      <span style={{ fontWeight: 'bold', color: 'grey', marginBottom:'20px'}}>Comments</span><br />
      <textarea value={comment} onChange={handleCommentChange} rows="4" cols="50" className={`${styles.formControl2} ${styles.input2}`} style={{ resize: 'none', marginTop:'10px'}}/>
      </div>
    </div>
  );
}

export default ReportPage;