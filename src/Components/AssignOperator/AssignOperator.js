import React, { useState } from "react";
import "./AssignOpertor.css";
import DashboardR from "../DashboardR/DashboardR";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AssignOperator() {
  const navigate = useNavigate();
  const stationData = JSON.parse(localStorage.getItem("stationData"));
  const stations = stationData.stations;

  const [shift, setShift] = useState("");
  const [stationId, setStationId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const token = JSON.parse(localStorage.getItem("Token"));
  const tokenExpired = useTokenExpirationCheck(token, navigate);

  const extractStationIds = (stations) => {
    const stationIds = [];
    for (const stationList of Object.values(stations)) {
      stationIds.push(...stationList);
    }
    return stationIds;
  };

  const stationIds = extractStationIds(stations);

  const handleEmployeeIdChange = (e) => {
    const value = e.target.value.toUpperCase();
    setEmployeeId(value);
  };

  const updateOperator = async () => {
    if(shift=="" || stationId=="" || employeeId==""){
        toast.info("Please Select all Details")
        return;
    }
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/operator/update";
    const fullLink = link + endPoint;

    try {
      const shiftA = shift === "A" ? 1 : 0;
      const shiftB = shift === "B" ? 1 : 0;
      const shiftC = shift === "C" ? 1 : 0;

      const params = new URLSearchParams();
      params.append("shift_A", shiftA);
      params.append("shift_B", shiftB);
      params.append("shift_C", shiftC);
      params.append("employee_id", employeeId);
      params.append("station_id", stationId);

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
        toast.success(data.Response);
        setShift("");
        setEmployeeId("");
        setStationId("");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.Response;
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <ToastContainer />
      <div>
        <DashboardR />
      </div>
      <div>
        <div className="parts_container">
          <div className="parts_details">
            <div className="assignOpt_shift">
              <p>Select Shift: </p>
              <div className="update_dropdown">
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                >
                  <option value="">Shift</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
            </div>

            <div className="assignOpt_shift">
              <p>Select Station Id : </p>
              <div className="update_dropdown">
                <select
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                >
                  <option value="">Station</option>
                  {stationIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p>
              Enter Employee Id:
              <input
                placeholder="Employee Id"
                required
                value={employeeId}
                onChange={handleEmployeeIdChange}
              />
            </p>
          </div>

          <div className="parts_add">
            <button onClick={updateOperator}>UPDATE</button>
          </div>
        </div>
      </div>
    </>
  );
}
