import React, { useState } from 'react';
import styles from './report.module.css';

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

  const handleSubmit = () => {
    console.log('Form submitted!');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>
        Submit a Concern
        <button onClick={handleSubmit} className={styles.btn} style={{ marginLeft: '10px' }}>
          Submit
        </button>
      </h1>
      <div className={styles.task}>
        Use current location:
        <input
          type='checkbox'
          checked={useCurrentLocation}
          onChange={handleCheckboxChange}
          className={styles['form-control-check']}
        />
      </div>

      {useCurrentLocation ? null : (
        <div className={styles.task}>
          <span className={styles.boldText}>Manually Fill In Your Location</span>
          <br />
          Street: <span className={styles.inputWrapper}><input type="text" value={inputValue} onChange={handleInputChange} className={styles.input} /></span>
          <br />
          City: <span className={styles.inputWrapper}><input type="text" value={inputValue2} onChange={handleInputChange2} className={styles.input} /></span>
          <br />
          State: <span className={styles.inputWrapper}><input type="text" value={inputValue3} onChange={handleInputChange3} className={styles.input} /></span>
          <br />
          Zip: <span className={styles.inputWrapper}><input type="text" value={inputValue4} onChange={handleInputChange4} className={styles.input} /></span>
          <br />
        </div>
      )}
      <div className={styles.task}>
        <span className={styles.boldText}>Report Details Of Your Location</span>
        <br />
        <span className={styles.checkboxRow}>
          <input type='checkbox' checked={useCurrentLocation2} onChange={handleCheckboxChange2} className={styles['form-control-check']} />
          <span className={styles.checkboxLabel}>Chlorine</span>
        </span>
        {!useCurrentLocation2 ? null : (
          <div className={styles.task}>
            <span className={styles.inputWrapper}>
              <input type="text" value={inputValue5} onChange={handleInputChange5} className={styles['form-control-2']} />
            </span>
            mg / L
            {inputValue5 >= 4 && (
              <span className={styles.dangerText}>Dangerous Levels!</span>
            )}
          </div>
        )}
        <span className={styles.checkboxRow}>
          <input type='checkbox' checked={useCurrentLocation3} onChange={handleCheckboxChange3} className={styles['form-control-check']} />
          <span className={styles.checkboxLabel}>Turbidity</span>
        </span>
        {!useCurrentLocation3 ? null : (
          <div className={styles.task}>
            <span className={styles.inputWrapper}>
              <input type="text" value={inputValue6} onChange={handleInputChange6} className={styles['form-control-2']} />
            </span>
            NTU
            {inputValue6 >= 5 && (
              <span className={styles.dangerText}>Dangerous Levels!</span>
            )}
          </div>
        )}
        <span className={styles.checkboxRow}>
          <input type='checkbox' checked={useCurrentLocation4} onChange={handleCheckboxChange4} className={styles['form-control-check']} />
          <span className={styles.checkboxLabel}>Fluorine</span>
        </span>
        {!useCurrentLocation4 ? null : (
          <div className={styles.task}>
            <span className={styles.inputWrapper}>
              <input type="text" value={inputValue7} onChange={handleInputChange7} className={styles['form-control-2']} />
            </span>
            mg / L
            {inputValue7 >= 4 && (
              <span className={styles.dangerText}>Dangerous Levels!</span>
            )}
          </div>
        )}
        <span className={styles.checkboxRow}>
          <input type='checkbox' checked={useCurrentLocation5} onChange={handleCheckboxChange5} className={styles['form-control-check']} />
          <span className={styles.checkboxLabel}>Coliform</span>
        </span>
        {!useCurrentLocation5 ? null : (
          <div className={styles.task}>
            <span className={styles.inputWrapper}>
              <input type="text" value={inputValue8} onChange={handleInputChange8} className={styles['form-control-2']} />
            </span>
            MPN / 100 ml
            {inputValue8 >= 5 && (
              <span className={styles.dangerText}>Dangerous Levels!</span>
            )}
          </div>
        )}
        <span className={styles.checkboxRow}>
          <input type='checkbox' checked={useCurrentLocation6} onChange={handleCheckboxChange6} className={styles['form-control-check']} />
          <span className={styles.checkboxLabel}>E. Coli</span>
        </span>
        {!useCurrentLocation6 ? null : (
          <div className={styles.task}>
            <span className={styles.inputWrapper}>
              <input type="text" value={inputValue9} onChange={handleInputChange9} className={styles['form-control-2']} />
            </span>
            MPN / 100 ml
            {inputValue9 >= 5 && (
              <span className={styles.dangerText}>Dangerous Levels!</span>
            )}
          </div>
        )}
      </div>
      <div className={styles.task}>
        <span className={styles.boldText}>Comments</span>
        <br />
        <textarea
          value={comment}
          onChange={handleCommentChange}
          rows="4"
          cols="50"
          className={styles['form-control-2']}
          style={{ resize: 'none', marginTop: '10px' }}
        />
      </div>
    </div>
  );
}

export default ReportPage;
