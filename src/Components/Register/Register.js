import React from 'react'
import bg from "../Images/bg.png";
import './Register.css'


function Register() {
  return (
    <div className="login_section">
        <div className="login_left_sidebar">
          <div className="img_container">
            <img className="login_sidebar_img" src={bg} />
            <div className="overlay_text">INTERFACE</div>
            <div className="overlay_bottom_text">
              Developed By Cellus Tech India
            </div>
          </div>
          {/* <div className='login_sidebar_img' ></div> */}
        </div>

        <div className="login_right_sidebar">
         
        </div>
      </div>
  )
}

export default Register
