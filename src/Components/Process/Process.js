import React, { useEffect, useRef, useState } from "react";
import "./Process.css";
import DashboardR from "../DashboardR/DashboardR";
import { useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Process() {
  const navigate = useNavigate();

  // const [showsg, setShowMsg]=useState(false)
  const [partName, setPartName] = useState("");
  const [processName, setProcessName] = useState("");
  const [processId, setProcessId] = useState("");
  const [processVal, setProcessVal]=useState("")
  const { popUpRef } = useRef();
  const [parts, setParts] = useState([]);
  const token = JSON.parse(localStorage.getItem("Token"));
  const [showMsg, setShowMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showErrPopup, setShowErrPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const login = JSON.parse(localStorage.getItem("Login"));

  const tokenExpired = useTokenExpirationCheck(token, navigate);
  // Example file input handler and component state
  const [files, setFiles] = useState([]);
  const handleFileChange = (e) => {
    // Filter out non-image files
    // const selectedFiles = Array.from(e.target.files).filter((file) =>
    //   file.type.startsWith("image/")
    // );
    // setFiles(selectedFiles);

    setFiles(Array.from(e.target.files));
  };

  const getParts = async (e) => {
    // e.preventDefault();
    const link = process.env.REACT_APP_BASE_URL;
    console.log("Base URL:", link);
    const endPoint = "/floorincharge/get_parts";
    const fullLink = link + endPoint;

    try {
      const response = await fetch(fullLink, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setParts(data.data);

        console.log("Parts fetched successfully!", data);
      } else {
        console.error("Failed to fetch parts");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getParts();
  }, []);

  const handleDropdownChange = async (e) => {
    setPartName(e.target.value);
    getParts();
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const addProcess = async (e) => {
    if (files.length == 0) {
      toast.error("Please Select Images");
    }

    if (!processId || !processName ||!processVal) {
      setErrorMessage("Please fill all the fields.");
      setShowErrPopup(true); // Show the pop-up if validation fails
      return;
    }

    // e.preventDefault();
    const link = process.env.REACT_APP_BASE_URL;
    console.log("Base URL:", link);
    const endPoint = "/floorincharge/add_process";
    const fullLink = link + endPoint;

    try {
      // const params = new URLSearchParams();
      const formData = new FormData();
      formData.append("process_name", processName);
      formData.append("process_id", processId);
      formData.append("belongs_to_part", partName);
      formData.append("added_by_owner", login.employee_id);
      formData.append("process_precedence", processVal)
      // params.append("file", " ");

      // Append all selected image files as an array under the 'file' key
      // const fileList = files.map((file) => file);
      // formData.append("file", fileList);
      files.forEach((file, index) => {
        formData.append("file", file);
      });

      const response = await fetch(fullLink, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShowPopup(true);
        const data = await response.json();
        setShowMsg(data.Message);
        setProcessName("");
        setProcessId("");
        // setPartName("");
        setProcessVal("")
        // setFiles([]); // Clear the files after successful upload
      } else {
        console.error("Failed to fetch parts", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleClickOutside = (e) => {
    setFiles([]);
    if (e.target.classList.contains("err_process_popup")) {
      // If clicked outside of the pop-up
      setShowErrPopup(false); // Close the pop-up
    }
    if (e.target.classList.contains("success_process_popup")) {
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
      <ToastContainer />

      {showErrPopup && (
        <div className="err_process_popup">
          <div className="err_process_content">
            <p>Please Fill all the details!</p>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="success_process_popup">
          <div className="success_process_content">
            <p>{showMsg}</p>
          </div>
        </div>
      )}

      <div className="process_container">
        <div className="process_head">
          <p>Select Part No:</p>
          <div className="update_dropdown">
            <select onChange={handleDropdownChange}>
              <option>Select</option>
              {/* Map over the parts and dynamically generate options */}
              {parts &&
                parts.map((part, index) => (
                  <option key={index}>{part.part_no}</option>
                ))}
            </select>
          </div>
          <div className="process_file">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div></div>
        <div className="parts_details">
          <p>
            Enter Process Name:
            <input
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              placeholder="Process Name"
              required
            />
          </p>
          <p>
            Enter Process Id:
            <input
              value={processId}
              onChange={(e) => setProcessId(e.target.value)}
              placeholder="Process Id"
              required
            />
          </p>

          <p>
            Process Precedence
            <input
              value={processVal}
              onChange={(e) => setProcessVal(e.target.value)}
              placeholder="Precedence"
              required
            />
          </p>
        </div>

        <div className="parts_add">
          <button type="submit" onClick={addProcess}>
            ADD
          </button>
        </div>

        {/* <div className='process_err'>
    <p>Error Message:</p>
</div> */}
      </div>
    </div>
  );
}

export default Process;
