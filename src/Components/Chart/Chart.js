import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import "./Chart.css";
import DatePicker from "react-datepicker";
import DashBoardAbove from "../DashboardR/DashBoardAbove";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChartComponent from "./ChartComponent";

export default function Chart() {
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [selectedPartNo, setSelectedPartNo] = useState("");
  const [selectedProcessNo, setSelectedProcessNo] = useState("");
  const [paramNo, setParamNo] = useState("");
  const [parts, setParts] = useState([]);
  const [processName, setProcessName] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState("");
  const [availableShifts, setAvailableShifts] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedShift, setSelectedShift]=useState('')
  const token = JSON.parse(localStorage.getItem("Token"));

  const handleStartDateChange = (date) => {
    setSelectedStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  const handlePartChange = (e) => {
    const selectedPartNo = e.target.value;
    setSelectedPartNo(selectedPartNo);
  };

  const handleProcessChange = (e) => {
    const val = e.target.value;
    setSelectedProcessNo(val);
  };

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

  useEffect(() => {
    if (selectedPartNo) {
      getProcesses(selectedPartNo);
    }
  }, [selectedPartNo]);

  useEffect(() => {
    if (selectedProcessNo) {
      getParameterNo();
    }
  }, [selectedProcessNo]);

  const getParameterNo = async (e) => {
    // e.preventDefault();
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/get_parameter";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("part_no", selectedPartNo);
      params.append("process_no", selectedProcessNo);

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
        // setParameters(data.data);
        const availableParameters = data.data.filter(
          (param) => param.readings_is_available
        );
        setParameters(availableParameters);
        console.log("object processName", processName);
      } else {
        console.error("Failed to fetch parts", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0"); // Month is zero-based
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [reading, setReading] = useState({});
  const [stationIds, setStationIds] = useState([]);

  const getReadings = async () => {
    if (paramNo === "") {
      toast.info("Please Select Parameter No.");
      return;
    }

    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/get_readings_for_chart";
    const fullLink = link + endPoint;

    const startDateFormatted = formatDate(selectedStartDate);
    const endDateFormatted = formatDate(selectedEndDate);

    try {
      const params = new URLSearchParams();
      params.append("start_date", startDateFormatted);
      params.append("end_date", endDateFormatted);
      params.append("parameter_no", paramNo);

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
        setReading(data.result);
       // Extract available dates from the response
    const dates = Object.keys(data.result);
    setAvailableDates(dates);
        extractStationIds(data.result);
      } else {
        console.error("Failed to fetch parts", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const extractStationIds = (result) => {
    const allStationIds = [];

    Object.keys(result).forEach((dateKey) => {
      const dateData = result[dateKey];
      Object.keys(dateData).forEach((stationId) => {
        if (!allStationIds.includes(stationId)) {
          allStationIds.push(stationId);
        }
      });
    });

    setStationIds(allStationIds);
  };


  const handleStationChange = (e) => {
    const selectedStationId = e.target.value;
    setSelectedStationId(selectedStationId);
   
    let foundShifts = [];
    // Iterate over each available date to find the station
    availableDates.forEach((date) => {
      if (reading[date] && reading[date][selectedStationId]) {
        const stationData = reading[date][selectedStationId];
        const shifts = Object.keys(stationData);
        foundShifts = foundShifts.concat(shifts);
      }
    });

    // Remove duplicates from found shifts
    const uniqueShifts = [...new Set(foundShifts)];
    // Set the available shifts for the selected station    
    setAvailableShifts(uniqueShifts);
  };

  const handleShiftChange = (e) => {
    // Handle shift selection
    setSelectedShift(e.target.value)
  };

  return (
    <>
      <ToastContainer />
      <div>
        <Navbar />
      </div>
      <div>
        <DashBoardAbove />
      </div>
      <div className="chart_main">
        <div className="date_chart_section">
          <div className="chart_date">
            <p>Select Start Date:&nbsp;&nbsp;</p>
            <DatePicker
              className="date_picker"
              selected={selectedStartDate}
              onChange={handleStartDateChange}
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div className="chart_date">
            <p>Select End Date:&nbsp;&nbsp;</p>
            <DatePicker
              className="date_picker"
              selected={selectedEndDate}
              onChange={handleEndDateChange}
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </div>

        <hr />

        <div>
          <div className="charts_parameters_head">
            <div className="process_head">
              <p>Part:</p>
              <div className="update_dropdown">
                <select onChange={handlePartChange}>
                  <option>Select</option>
                  {parts &&
                    parts.map((part, index) => (
                      <option key={index} value={part.part_no}>
                        {part.part_no}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="process_head">
              <p>Process:</p>
              <div className="update_dropdown">
                <select onChange={handleProcessChange}>
                  <option>Select</option>
                  {processName &&
                    processName.map((part, index) => (
                      <option key={index} value={part.process_no}>
                        {part.process_no}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="process_head">
              <p>Parameter No:</p>
              <div className="update_dropdown">
                <select onChange={(e) => setParamNo(e.target.value)}>
                  <option>Select</option>
                  {parameters &&
                    parameters.map((part, index) => (
                      <option key={index} value={part.parameter_no}>
                        {part.parameter_no}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="param_btn">
              <button className="task_assign_btn" onClick={getReadings}>
                Show Station ID
              </button>
            </div>
          </div>

          <div className="charts_stationID">
            <div className="chart_drop_station">
              <p>Select Station ID:</p>
              <div className="update_dropdown">
                <select onChange={handleStationChange}>
                  <option value="">Station Id</option>
                  {stationIds.map((stationId) => (
                    <option key={stationId} value={stationId}>
                      {stationId}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="chart_drop_station">
              <p>Select Shift</p>
              <div className="update_dropdown">
                <select onChange={handleShiftChange}>
                  <option value="">Select Shift</option>
                  {availableShifts.map((shift) => (
                    <option key={shift} value={shift}>
                      {shift}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
          </div>
        </div>
      </div>
{/*  availableDates, readingData, selectedStationId  */}
      {/* <ChartComponent availableDates={availableDates} readingData={reading} selectedStationId={selectedStationId}/> */}
      {selectedStationId && selectedShift && (
           <ChartComponent availableDates={availableDates} readingData={reading} selectedStationId={selectedStationId}
           selectedShift={selectedShift}/>
      )}
    </>
  );
}
