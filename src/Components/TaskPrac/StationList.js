// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, useNavigate, BrowserRouter } from 'react-router-dom';
import TaskPrac from './TaskPrac';
import TaskPrac2 from './TaskPrac2';
import './StationList.css'

const StationList = () => {
  const navigate = useNavigate();
  const [selectedValue, setSelectedValue] = useState(null);

  const handleClick = (value) => {
    setSelectedValue(value);
    if (value === 'customize') {
      navigate('/customize');
    } else {
      navigate('/global');
    }
  };

  return (
    <div className="home-container">
    <div className="modal_customize" onClick={() => handleClick('customize')}>
      <h2>Customize</h2>
      <p>Click here to go to the Customize Page.</p>
    </div>
    <div className="modal_customize" onClick={() => handleClick('global')}>
      <h2>Global</h2>
      <p>Click here to go to the Global Page.</p>
    </div>
  </div>
  );
};


export default StationList;