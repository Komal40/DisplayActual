import React, { useState } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import {HashLink} from 'react-router-hash-link'
import './Navbar.css';
import { useNavigate } from 'react-router-dom';


export default function Navbar() {

    const [closeMenu, setCloseMenu]=useState(false);

    const handleClick=()=>{
        setCloseMenu(closeMenu);
    }

    const navigate = useNavigate();

    const handleLogout = () => {
      // Clear token from localStorage
      localStorage.removeItem("Login");
      localStorage.removeItem("Token")
      // Navigate to the login page
      navigate('/');
    };


  return (
    <>
    <div>
      <nav className={closeMenu?'nav_active':'navbar'}>
      <div className={closeMenu?'nav_arrow_active':'nav_arrow'} >
      <h2>INTERFACE
        {/* <span><FaArrowLeft onClick={()=>handleClick()}/></span> */}
        </h2>
      </div>
     <div><FaArrowRight onClick={()=>handleClick()} className={closeMenu?'right_arrow_active':'right_arrow'} /></div>
        <div className={closeMenu?'content_container_active':'content_container'}>
        <ul >
            <li><HashLink to='/app' className='dashboard_items'>DASHBOARD</HashLink></li>
            {/* <li><HashLink to='/update' className='dashboard_items'>UPDATE FLOOR</HashLink></li>
            <li><HashLink to='/assign' className='dashboard_items'> ASSIGN PARTS</HashLink></li> */}
            <li><HashLink to='/prevdata' className='dashboard_items'>Previous Data</HashLink></li>
            <li><HashLink to='/update' className='dashboard_items'>LINES</HashLink></li>
            <li><HashLink to='/task' className='dashboard_items'>TASK</HashLink></li>
            <li><HashLink className='dashboard_items'>PART</HashLink></li>
            <li><HashLink className='dashboard_items'>PROCESS</HashLink></li>
            <li><HashLink to='/timing' className='dashboard_items'>TIMINGS</HashLink></li>
            <li><HashLink className='dashboard_items' to='/chart'>GENERATE CHART</HashLink></li>
            <li><HashLink className='dashboard_items'>ACCOUNT</HashLink></li>
            <hr style={{width:'100%'}}/>
            <li onClick={handleLogout}><HashLink className='dashboard_items' >LOG OUT</HashLink></li>
        </ul>
        </div>
      </nav>
    </div>
    </>
  )
}




