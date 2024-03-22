import React, { useEffect, useState } from "react";
import "./Login.css";
import bg from "../Images/bg.png";
import { json, useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";
import { Link } from "react-router-dom";


export default function Login() {
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const {setLoginData}=useUser()



  const clickLogin = async (e) => {
    e.preventDefault();
  
    const link = process.env.REACT_APP_BASE_URL;
    console.log('Base URL:', link);
    const endPoint = '/floorincharge/login';
    const fullLink = link + endPoint;
  
    try {
      const params = new URLSearchParams();
      params.append("employee_id", name);
      params.append("password", pass);
      
      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("loginData", data);

        localStorage.setItem('Login',JSON.stringify(data))
        if (data.token) {
          localStorage.setItem('floor_no', JSON.stringify(data.floor_no))
          localStorage.setItem('Token', JSON.stringify(data.token));
          setLoginData(data)
          // const token = localStorage.getItem('Token');
          if (data.token !== undefined && data.token !== null) {
            // Token exists, navigate to dashboard
            setName("");
            setPass("");
            navigate('/app');
          } else {
            // Token does not exist, show error message
            setError("Failed to login. Please try again later.");
          }
        }
      } 
      // else if (response.status == 401) {
      //   localStorage.removeItem("Token");
      //   navigate('/');
      // }
      else {
        console.error("HTTP Error:", response.status);
        navigate('/');
        setError("Failed to login. Please try again later.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred");
    }
  };
  
  


  return (
    <>
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
          <div className="login_details">
            <h2>
              <strong>
                Login To <span style={{ color: "#FF9209" }}>Continue</span>
              </strong>
            </h2>
            <div className="dropdown">
              <select>
                <option>Admin</option>
                {/* <option>Super Admin</option> */}
              </select>
            </div>
            <div className="login_below_section">
              <h3>Enter Your Username and Password</h3>
              <div className="user_pass">
                <form className="login_form" onSubmit={clickLogin}>
                  <div className="form_details">
                    <label htmlFor="name" className="user_label">
                      Username
                    </label>
                    <input
                      type="text"
                      // required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />

                    <label htmlFor="password" className="pass_label">
                      Password
                    </label>
                    <input
                      type="password"
                      // required
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                    />
                  </div>

                  {/* <div className="forgot_text">Forgot Password? </div> */}

                  <div className="login_btn">
                    <button type="submit">Login</button>
                  </div>
                  
                  <div className="pass_or_fail">
                    <div>
                      {error && <div className="error_message">{error}</div>}
                    </div>
                    <div className="success_msg">
                      {msg && <div className="success_message">{msg}</div>}
                    </div>
                  </div>
                  <div style={{marginTop:'2%'}}>
                  <h4>Don't have an account{"  "}?{"      "}
                    <Link to=''>Sign Up</Link>
                  </h4>
                  </div>
                  <div></div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
