import React, { useEffect, useRef, useState } from 'react';
import bg from "../Images/bg.png";
import './Register.css';
import { Link } from 'react-router-dom';

function Register() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const popUpRef = useRef(null);

  const firstNameRef = useRef(null);
  const midNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const employeeIdRef = useRef(null);
  const floorNumRef = useRef(null);
  const dobRef = useRef(null);
  const mobileRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [passwordError, setPasswordError] = useState('');
  const [mobileError,setMobileError]=useState('')

  const handleChange = (e) => {
    const password = passwordRef.current.value;
    if (password.length < 5) {
      setPasswordError('Password should be at least 5 characters long.');
    } else {
      setPasswordError('');
    }
    const { name, value } = e.target;

    if (name === 'mobile' && !/^\d{0,10}$/.test(value)) {
      setMobileError('Mobile number should be 10 digits');
    } else {
      setMobileError('');
    }

    if (name === 'password' && value.length < 5) {
      setPasswordError('Password should contain at least 5 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = '/floorincharge/operator/signup';
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("fName", firstNameRef.current.value);
      params.append("lName", lastNameRef.current.value);
      params.append("employee_id", employeeIdRef.current.value);
      params.append("skill_level", floorNumRef.current.value);
      params.append("dob", dobRef.current.value);
      params.append("mobile", mobileRef.current.value);
      params.append("email", emailRef.current.value);
      params.append("password", passwordRef.current.value);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      });

      if (response.ok) {
        setShowSuccessMessage(true);
        firstNameRef.current.value = '';
        midNameRef.current.value = '';
        lastNameRef.current.value = '';
        employeeIdRef.current.value = '';
        floorNumRef.current.value = '';
        dobRef.current.value = '';
        mobileRef.current.value = '';
        emailRef.current.value = '';
        passwordRef.current.value = '';
      } else {
        console.error("HTTP Error:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popUpRef.current && !popUpRef.current.contains(event.target)) {
        setShowSuccessMessage(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="login_section">
      <div className="login_left_sidebar">
        <div className="img_container">
          <img className="login_sidebar_img" src={bg} alt="Background" />
          <div className="overlay_text">INTERFACE</div>
          <div className="overlay_bottom_text">
            Developed By Cellus Tech India
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="register_right_sidebar">
          <div className='register_heading'>
            <h1>Sign Up</h1>
            <h3>Complete Registration Form</h3>
            <p>Fields marked as (*) Asterisk are important</p>
          </div>
          <div className='register_name_section'>
            <input ref={firstNameRef} placeholder='First Name *' type='text' name='firstName' className='register_input' required/>
            <input ref={midNameRef} placeholder='Mid Name ' type='text' name='midName' className='register_input'/>
            <input ref={lastNameRef} placeholder='Last Name *' type='text' name='lastName' className='register_input' required/>
          </div>

          <div className='register_employee_section'>
            <input ref={employeeIdRef} placeholder='Employee Id *' type='text' name='employeeId' className='register_input' required/>
            <input ref={floorNumRef} placeholder='Floor Num *' type='text' name='floorNum' className='register_input' required/>
          </div>

          <div className='register_mobile_section'>
            <input ref={dobRef} placeholder='D.O.B *' type='date' name='dob' className='register_input' required/>
            <input ref={mobileRef} placeholder='Mobile No. *' type='number' name='mobile' className='register_input' onChange={handleChange} required/>
            {mobileError && <p className="error_message">{mobileError}</p>}
          </div>
          <div className='register_password'>
            <input ref={passwordRef} placeholder='Password *' type='password' name='password' className='register_input' onChange={handleChange} required/>
            {passwordError && <p className="error_message">{passwordError}</p>}
          </div>

          <div className='register_note'>
            <p>NOTE:</p>
            <ol>
              <li>jjss</li>
              <li>lkkdnc</li>
              <li>ckdc</li>
            </ol>
          </div>

          <div className='register_account'>
            {/* <h4>Already Have An Account? <span><Link to=''>LOGIN</Link></span></h4> */}
            <button type="submit" className='register_btn'>Register</button>
            <Link to='/app'><button type="button" className='register_btn'>Back</button></Link>

          </div>
        </div>
      </form>

      {showSuccessMessage && (
        <div ref={popUpRef} className="success_popup">
          <p>Registration successful!</p>
        </div>
      )}
    </div>
  );
}

export default Register;
