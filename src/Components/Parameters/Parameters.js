import React, { useState, useEffect } from "react";
import "./Parameters.css";
import DashboardR from "../DashboardR/DashboardR";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import { useNavigate } from "react-router-dom";

function Parameters() {

  const navigate=useNavigate()

  const [showParameterValue, setShowParameterValue] = useState(false);
  const [parts, setParts] = useState([]);
  const [processName, setProcessName] = useState([]);
  const [selectedPartNo, setSelectedPartNo] = useState("");
  const [selectedProcessNo, setSelectedProcessNo] = useState("");
  const [paramName, setParamName] = useState("");
  const [paramId, setParamId] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [unit, setUnit] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showMsg, setShowMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showErrPopup, setShowErrPopup] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
 

  const login = JSON.parse(localStorage.getItem("Login"));

  const token = JSON.parse(localStorage.getItem("Token"));
  const tokenExpired = useTokenExpirationCheck(token, navigate);


  const getParts = async (e) => {
    const link = process.env.REACT_APP_BASE_URL;
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
        console.log("param", data.data);
        setParts(data.data);
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

  const closePopup = () => {
    // Function to close the pop-up
    setShowErrPopup(false);
  };

  const handleClickOutside = (e) => {
    if (e.target.classList.contains("err_param_popup")) {
      // If clicked outside of the pop-up
      setShowErrPopup(false); // Close the pop-up
    }
    if (e.target.classList.contains("success_param_popup")) {
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

  const getProcesses = async (e) => {
    // e.preventDefault();
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/get_processes";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("part_no", selectedPartNo);
      console.log("selectedPartNo", selectedPartNo);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        setProcessName(data.data);
        console.log("object processName", processName);
      } else {
        console.error("Failed to fetch parts", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addParameters = async (e) => {
    if (!paramName || !paramId || !selectedPartNo || !selectedProcessNo) {
      setErrorMessage("Please fill all the fields.");
      setShowErrPopup(true); // Show the pop-up if validation fails
      return;
    }

    // e.preventDefault();
    const link = process.env.REACT_APP_BASE_URL;
    console.log("Base URL:", link);
    const endPoint = "/floorincharge/add_parameter";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("parameter_name", paramName);
      params.append("parameter_no", selectedProcessNo + " " + paramId);
      params.append("process_no", selectedProcessNo);
      params.append("belongs_to_part", selectedPartNo);
      params.append("added_by_owner", login.employee_id);
      params.append("min", min);
      params.append("max", max);
      params.append("unit", unit);

      // Log individual parameters
      params.forEach((value, key) => console.log(`${key}: ${value}`));

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShowPopup(true);
        const data = await response.json();
        console.log("objectresponse.Message", data.Message);
        setShowMsg(data.Message);
        setParamId('')
        setParamName('')
        setSelectedPartNo('')
        setSelectedProcessNo('')
      } else {
        console.error("Failed to fetch parts", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handlePartChange = (e) => {
    const selectedPartNo = e.target.value;
    setSelectedPartNo(selectedPartNo);
  };

  useEffect(() => {
    if (selectedPartNo) {
      getProcesses(selectedPartNo);
    }
  }, [selectedPartNo]);

  const handleDropdownChange = (e) => {
    const selectedValue = e.target.value;
    setShowParameterValue(selectedValue === "Yes");
  };

  const handleProcessChange = (e) => {
    const val = e.target.value;
    setSelectedProcessNo(val);
  };

  return (
    <div>
      <div>
        <DashboardR />
      </div>

      {showErrPopup && (
        <div className="err_param_popup">
          <div className="err_param_content">
            <p>Please Fill all the details!</p>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="success_param_popup">
          <div className="success_param_content">
            <p>{showMsg}</p>
          </div>
        </div>
      )}

      <div className="parameters_container">
        <div className="parameters_head">
          <div className="process_head">
            <p>Select Part Name:</p>
            <div className="update_dropdown">
              <select onChange={handlePartChange}>
                <option>Select</option>
                {parts &&
                  parts.map((part, index) => (
                    <option key={index}>{part.part_no}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="process_head">
            <p>Select Process Name:</p>
            <div className="update_dropdown">
              <select onChange={handleProcessChange}>
                <option>Select</option>
                {processName &&
                  processName.map((part, index) => (
                    <option key={index}>{part.process_no}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <div className="parts_details">
          <p className="param_title">
            Enter Parameter Name:
            <input
              placeholder="Parameter Name"
              value={paramName}
              onChange={(e) => setParamName(e.target.value)}
            />
          </p>
          <p>
            Enter Parameter Id:
            <input
              placeholder="Parameter Id"
              value={paramId}
              onChange={(e) => setParamId(e.target.value)}
            />
          </p>
          <p>
            Enter Minimum:
            <input
              placeholder="Enter Min Value"
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
          </p>
          <p>
            Enter Maximum:
            <input
              placeholder="Enter Max Value"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </p>
          <p>
            Enter Unit:
            <input
              placeholder="Enter Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </p>
        </div>

        <div className="parameters_read">
          <p>Is Parameters used for readings?</p>
          <div className="update_dropdown">
            <select onChange={handleDropdownChange}>
              <option>Select</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        </div>

        {showParameterValue && (
          <div className="parameter_value">
            <p>
              Enter UCL:
              <input placeholder="UCL" />
            </p>
            <p>
              Enter LCL:
              <input placeholder="LCL" />
            </p>
          </div>
        )}

        <div className="parts_add">
          <button onClick={addParameters}>ADD</button>
        </div>

        <div className="process_err">
          <p>Error Message:</p>
        </div>

        {/* <div className="process_err">
          <p>{errorMessage}</p>
          <p>{successMessage}</p>
        </div> */}
      </div>
    </div>
  );
}

export default Parameters;
