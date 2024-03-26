import React, { useState, useEffect } from "react";
import "./Parameters.css";
import DashboardR from "../DashboardR/DashboardR";

function Parameters() {
  const [showParameterValue, setShowParameterValue] = useState(false);
  const [parts, setParts] = useState([]);
  const [processName, setProcessName] = useState([]);
  const [selectedPartNo, setSelectedPartNo] = useState("");
  const token = JSON.parse(localStorage.getItem("Token"));
  const login = JSON.parse(localStorage.getItem("Login"));

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
        console.log("get processes Successfully", data.data);
        setProcessName(data.data);
        console.log("object processName", processName);
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

  return (
    <div>
      <div>
        <DashboardR />
      </div>

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
              <select>
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
          <p>
            Enter Parameter Name:
            <input placeholder="Process Name" />
          </p>
          <p>
            Enter Minimum:
            <input placeholder="Maximum" />
          </p>
          <p>
            Enter Maximum:
            <input placeholder="Minimum" />
          </p>
          <p>
            Enter Unit:
            <input placeholder="Unit" />
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
          <button>ADD</button>
        </div>

        <div className="process_err">
          <p>Error Message:</p>
        </div>
      </div>
    </div>
  );
}

export default Parameters;
