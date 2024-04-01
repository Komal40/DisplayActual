import React, { useEffect, useRef, useState } from "react";
import "./Parts.css";
import DashboardR from "../DashboardR/DashboardR";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import { useNavigate } from "react-router-dom";

function Parts() {
  const navigate = useNavigate();

  const [showMsg, setShowMsg] = useState("");
  const [resMsg, setResMsg] = useState("");
  const [showErrPopup, setShowErrPopup] = useState(false);

  const popUpRef = useRef();
  const errRef = useRef();
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [partId, setPartId] = useState("");
  const [partName, setPartName] = useState("");
  const [error, setError] = useState("");
  const token = JSON.parse(localStorage.getItem("Token"));
  const login = JSON.parse(localStorage.getItem("Login"));

  const tokenExpired = useTokenExpirationCheck(token, navigate);

  // const handleClickOutside = (e) => {
  //     if (e.target.classList.contains("err_param_popup")) {
  //       // If clicked outside of the pop-up
  //       setShowErrPopup(false); // Close the pop-up
  //     }
  //     if (e.target.classList.contains("success_param_popup")) {
  //       // If clicked outside of the pop-up
  //       setShowMsg(false); // Close the pop-up
  //     }
  //   };

  //   useEffect(() => {
  //     if (showErrPopup || showMsg) {
  //       document.addEventListener("mousedown", handleClickOutside);
  //     } else {
  //       document.removeEventListener("mousedown", handleClickOutside);
  //     }
  //     return () => {
  //       document.removeEventListener("mousedown", handleClickOutside);
  //     };
  //   }, [showErrPopup, showMsg]);

  const Add_part = async (e) => {
    if (!partId || !partName) {
      setErrorMessage("Please fill all the fields.");
      setShowErrPopup(true); // Show the pop-up if validation fails
      return;
    }
    e.preventDefault();
    const link = process.env.REACT_APP_BASE_URL;
    console.log("Base URL:", link);
    const endPoint = "/floorincharge/add_part";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("part_name", partName);
      params.append("part_id", partId);
      params.append("added_by_owner", login.employee_id);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShowPopup(true);

        const data = await response.json();
        setShowMsg(data.Message);
        setPartId("");
        setPartName("");
      } else {
        // Handle error response here
        console.error("Failed to add part");
        setError("Failed to add part");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred");
    }
  };

  const handleClickOutside = (e) => {
    if (e.target.classList.contains("err_parts_popup")) {
      // If clicked outside of the pop-up
      setShowErrPopup(false); // Close the pop-up
    }
    if (e.target.classList.contains("success_parts_popup")) {
      // If clicked outside of the pop-up
      setShowPopup(false); // Close the pop-up
    }
  };

  useEffect(() => {
    if (showErrPopup || showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showErrPopup, showPopup]);

  return (
    <div>
      <div>
        <DashboardR />
      </div>

      <div className="parts_container">
        <div className="parts_heading">
          <p>Enter Part Name and Id and Click Add Button</p>
        </div>

        <div className="parts_details">
          <p>
            Enter Part Id:
            <input
              placeholder="Part Id"
              value={partId}
              onChange={(e) => setPartId(e.target.value)}
              required
            />
          </p>
          <p>
            Enter Part Name:
            <input
              placeholder="Part Name"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              required
            />
          </p>
        </div>

        <div className="parts_add">
          <button onClick={Add_part}>ADD</button>
        </div>

        {/* <div className="parts_err"><p>{error}</p></div> */}
      </div>

      {showErrPopup && (
        <div className="err_parts_popup">
          <div className="err_parts_content">
            <p>Please Fill all the details!</p>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="success_parts_popup">
          <div className="success_parts_content">
            <p>{showMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Parts;
