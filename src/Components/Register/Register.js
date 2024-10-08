import React, { useEffect, useRef, useState } from "react";
import bg from "../Images/bg.png";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import Modal from "../Modal/Modal";

function Register() {
 
const [globalShowModal, setglobalShowModal] = useState(false);
const [globalmodalMessage, setglobalModalMessage] = useState("");


const handleglobalShowModal = (message) => {
  setglobalModalMessage(message);
  setglobalShowModal(true);
};

const handleglobalCloseModal = () => {
  setglobalShowModal(false);
  setglobalModalMessage("");
};

  const navigate = useNavigate();

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
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const token = JSON.parse(localStorage.getItem("Token"));
  const tokenExpired = useTokenExpirationCheck(token, navigate);

  const empId = useRef(null);
  const empPass = useRef(null);

  const handleChange = (e) => {
    const password = passwordRef.current.value;
    if (password.length < 5) {
      setPasswordError("Password should be at least 5 characters long.");
    } else {
      setPasswordError("");
    }
    const { name, value } = e.target;

    if (name === "mobile" && !/^\d{0,10}$/.test(value)) {
      setMobileError("Mobile number should be 10 digits");
    } else {
      setMobileError("");
    }

    if (name === "password" && value.length < 5) {
      setPasswordError("Password should contain at least 5 characters");
    } else {
      setPasswordError("");
    }
    
  };


  // selecting operator image
  const fileInputRef = useRef(null);
  const [file, setFile]=useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    // const file = fileInputRef.current.files[0];
    const fileImage=e.target.files[0]
    setFile(fileImage)
  
    // Check if the file is an image
    if (!fileImage.type.startsWith('image/')) {
      setErrorMessage("Please select an image file.");
      return;
    }


    if (fileImage) {
      // Check the file size (in bytes)
      const maxSizeInBytes = 64 * 1024; // 64 KB = 64 * 1024 bytes
      if (fileImage.size > maxSizeInBytes) {
        setErrorMessage("Image size must be 64 KB or less.");
        return;
      }
  };
  setErrorMessage("")
}
  
  

  const handleSubmit = async (e) => {
    if (!file) {
      setErrorMessage("Please select an image.");
      return;
    }


    e.preventDefault();
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/operator/signup";
    const fullLink = link + endPoint;

    try {
      // const params = new URLSearchParams();
      const formData = new FormData();

      formData.append("fName", firstNameRef.current.value);
      formData.append("lName", lastNameRef.current.value);
      formData.append("employee_id", employeeIdRef.current.value);
      formData.append("skill_level", floorNumRef.current.value);
      formData.append("dob", dobRef.current.value);
      formData.append("mobile", mobileRef.current.value);
      formData.append("email", emailRef.current.value);
      formData.append("password", passwordRef.current.value);
      formData.append("file", file);


      const response = await fetch(fullLink, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShowSuccessMessage(true);
        firstNameRef.current.value = "";
        midNameRef.current.value = "";
        lastNameRef.current.value = "";
        employeeIdRef.current.value = "";
        floorNumRef.current.value = "";
        dobRef.current.value = "";
        mobileRef.current.value = "";
        emailRef.current.value = "";
        passwordRef.current.value = "";
       setFile(null)
       setErrorMessage("")
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message;
        alert(errorMessage);
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

  const changePassword = async (e) => {
    e.preventDefault();
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/operator/change_password";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("employee_id", empId.current.value);
      params.append("password", empPass.current.value);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        handleglobalShowModal(data.Response);
        empId.current.value = "";
        empPass.current.value = "";
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.Message;
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const showModalForPass = () => {
    setIsModalOpen(true);
  };


  return (
    <>
    <div>
      {globalShowModal && <Modal message={globalmodalMessage} onClose={handleglobalCloseModal} />}
      </div>

      <div className="register_login_section">
        {/* <div className="register_left_sidebar">
        <div className="img_container">
          <img className="login_sidebar_img" src={bg} alt="Background" />
          <div className="overlay_text">INTERFACE</div>
          <div className="overlay_bottom_text">
            Developed By Cellus Tech India
          </div>
        </div>
      </div> */}

        <form onSubmit={handleSubmit}>
          <div className="register_right_sidebar">
            <div className="register_heading">
              <h1>Sign Up</h1>
              <h3>Complete Registration Form</h3>
              <p>Fields marked as (*) Asterisk are important</p>
            </div>
            <div className="register_name_section">
              <input
                ref={firstNameRef}
                placeholder="First Name *"
                type="text"
                name="firstName"
                className="register_input"
                required
              />
              <input
                ref={midNameRef}
                placeholder="Mid Name "
                type="text"
                name="midName"
                className="register_input"
              />
              <input
                ref={lastNameRef}
                placeholder="Last Name *"
                type="text"
                name="lastName"
                className="register_input"
                required
              />
            </div>

            <div className="register_employee_section">
              <input
                ref={employeeIdRef}
                placeholder="Employee Id *"
                type="text"
                name="employeeId"
                className="register_input"
                required
              />
              <input
                ref={floorNumRef}
                placeholder="Floor Num *"
                type="text"
                name="floorNum"
                className="register_input"
                required
              />
              
              
             <input
              type="file"
              accept="image/*"
              placeholder="Operator Image"
              onChange={handleFileChange}
            />
              
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            </div>

            <div className="register_mobile_section">
              <input
                ref={dobRef}
                placeholder="D.O.B *"
                type="date"
                name="dob"
                className="register_input"
                required
              />
              <input
                ref={mobileRef}
                placeholder="Mobile No. *"
                type="number"
                name="mobile"
                className="register_input"
                onChange={handleChange}
                required
              />
              <input
                ref={emailRef}
                placeholder="Enter email *"
                type="email"
                name="email"
                className="register_input"
                
                required
              />
              {mobileError && <p className="error_message">{mobileError}</p>}
            </div>
            <div className="register_password">
              <input
                ref={passwordRef}
                placeholder="Password *"
                type="password"
                name="password"
                className="register_input"
                onChange={handleChange}
                required
              />
              {passwordError && (
                <p className="error_message">{passwordError}</p>
              )}
            </div>

            {/* <div className='register_note'>
            <p>NOTE:</p>
            <ol>
              <li></li>            
            </ol>
          </div> */}

            <div className="register_account">
              {/* <h4>Already Have An Account? <span><Link to=''>LOGIN</Link></span></h4> */}
              <button type="submit" className="register_btn">
                Register
              </button>
              <Link to="/app">
                <button type="button" className="register_btn">
                  Back
                </button>
              </Link>
            </div>

            <div>
              <p
                style={{ color: "red", cursor: "pointer" }}
                onClick={showModalForPass}
              >
                Change Password
              </p>
            </div>
          </div>
        </form>

        {showSuccessMessage && (
          <div ref={popUpRef} className="success_popup">
            <p>Registration successful!</p>
          </div>
        )}
      </div>

      <div>
        {isModalOpen && (
         <div>
           <div className="notify_modal">
            <div className="notify_modal-content">
              <span
                className="notify_close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </span>
              <h2>Change Password</h2>
              <div className="register_change_password">
                <form onSubmit={changePassword}>
                  <input
                    placeholder="Employee Id"
                    ref={empId}
                    name="employee_id"
                    className="register_input_forgot"
                    required
                  />
                  <input
                    placeholder="New Password"
                    ref={empPass}
                    name="password"
                    type="password"
                    className="register_input_forgot"
                    required
                    onChange={handleChange}
                  />
                  <button type="submit" className="change_pass_btn">
                    Change Password
                  </button>
                </form>
              </div>
            </div>
          </div>
         </div>
        )}
      </div>
    </>
  );
}

export default Register;