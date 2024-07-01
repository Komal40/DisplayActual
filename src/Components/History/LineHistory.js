import React, { startTransition, useEffect, useState } from "react";
import { json, useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardAbove from "../DashboardR/DashBoardAbove";
import * as XLSX from "xlsx";
import './History.css'

function LineHistory() {
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("Token"));
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const tokenExpired = useTokenExpirationCheck(token, navigate);
  const [shift, setShift] = useState("");
  const [selectedLine, setselectedLine] = useState("");
  const [lineHistoryData, setLineHistoryData] = useState({});
  const stationData=JSON.parse(localStorage.getItem("stationData"))


  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0"); // Month is zero-based
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const showLineHistory = async (e) => {
    if (selectedLine == "") {
        toast.error("Select Line");
        return;
      }
      
    if (shift == "") {
      toast.error("Select Shift");
      return;
    }

    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/line_history";
    const fullLink = link + endPoint;

    const startDateFormatted = formatDate(selectedStartDate);
    const endDateFormatted = formatDate(selectedEndDate);

    try {
      const params = new URLSearchParams();
      params.append("line_no", selectedLine);
      params.append("shift", shift);
      params.append("start_date", startDateFormatted);
      params.append("end_date", endDateFormatted);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response) {
        const data = await response.json();
        console.log("line history data", data);


        if (response.ok) {
            if (data.Datas) {
                 // Replace single quotes with double quotes and `None` with `null`
                 const correctedFpaData = data.Datas.replace(/'/g, '"').replace(/None/g, 'null');

                 // Parse the corrected JSON string
                 const parsedData = JSON.parse(correctedFpaData);
                setLineHistoryData(parsedData);
              }

            if (data && data.toggle !== undefined) {
              // Handle the data as needed
              console.log("Valid data received:", data);
            } else {
              console.error("Data format is unexpected or 'toggle' property is missing.");
            }
            
          } else {
            toast.error(data.Message);
          }

        }
        
    } catch (error) {
      console.error("Error :", error);
    }
  };

  const handleStartDateChange = (date) => {
    setSelectedStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  const generateLineButtons = () => {
    return (
      stationData.lines &&
      stationData.lines
        .sort((a, b) => {
          const lineA = parseInt(a.split("L")[1]);
          const lineB = parseInt(b.split("L")[1]);
          return lineA - lineB;
        })
        .map((line, index) => <option key={index}>{line}</option>)
    );
  };

  const handleLineChange = (e) => {
    setselectedLine(e);
  };


  const formatDataForTable = (data) => {
    const tableData = [];
    // Get all dates and sort them in descending order
    const dates = Object.keys(data).sort((a, b) => new Date(b) - new Date(a));
    // Iterate over sorted dates
    for (const date of dates) {
      const stations = data[date];
  
      // Flag to track the first row for each date
      let isFirstRow = true;
  
      // Iterate over stations for each date
      for (const [stationId, details] of Object.entries(stations)) {
        // Determine if it's the first row for the current date
        const rowData = isFirstRow ? { date, stationId, ...details } : { date: '', stationId, ...details };
        tableData.push(rowData);
        isFirstRow = false; // Set isFirstRow to false after the first row for the date
      }
    } 
    return tableData;
  };
  
  
  console.log("lineHistoryData",lineHistoryData)

  const renderTable = () => {
    const tableData = formatDataForTable(lineHistoryData);

    if (Object.keys(lineHistoryData).length === 0 && lineHistoryData.constructor === Object) {
      return null; // If no data, return null to render nothing
    }
    
    return (
        <>
        <div style={{marginBottom:'1rem'}}>
            <button onClick={exportToExcel} className="task_assign_btn">
              Export to Excel
            </button>
          </div>
      <table className="station-table small-font">
        <thead>
          <tr>
            <th>Date</th>
            <th>Station ID</th>
            <th>Employee ID</th>
            <th>Part No</th>
            <th>Process No</th>
            <th>Start Shift Time</th>
            <th>End Shift Time</th>
            <th>Assigned by Owner</th>
            <th>Total Assigned Task</th>
            <th>Passed</th>
            <th>Filled</th>
            <th>Operator Changed Status</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            
            <tr key={index}>
              <td>{row.date}</td>
              <td>{row.stationId}</td>
              <td>{row.employee_id}</td>
              <td>{row.part_no}</td>
              <td>{row.process_no}</td>
              <td>{row.start_shift_time}</td>
              <td>{row.end_shift_time}</td>
              <td>{row.assigned_by_owner}</td>
              <td>{row.total_assigned_task}</td>
              <td>{row.passed}</td>
              <td>{row.filled}</td>
              <td>{row.operator_changed_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </>
    );
  };


  const exportToExcel = () => {
    if (Object.keys(lineHistoryData).length === 0 && lineHistoryData.constructor === Object) {
      toast.error("No data to export");
      return;
    }

    const formattedData = formatDataForTable(lineHistoryData);

    // Adjusting column widths
    const wscols = [
      { wch: 15 }, // Date
      { wch: 15 }, // Station ID
      { wch: 15 }, // Employee ID
      { wch: 15 }, // Part No
      { wch: 15 }, // Process No
      { wch: 20 }, // Start Shift Time
      { wch: 20 }, // End Shift Time
      { wch: 20 }, // Assigned by Owner
      { wch: 20 }, // Total Assigned Task
      { wch: 10 }, // Passed
      { wch: 10 }, // Filled
      { wch: 20 }, // Operator Changed Status
    ];

    const ws = XLSX.utils.json_to_sheet(formattedData);
    ws["!cols"] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Line History Data");

    const date = new Date();
    const fileName = `Line_History_Data_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };


  return (
    <>
      <ToastContainer />
      <div>
        <DashboardAbove />
      </div>


      <div className="history__main">
        <div className="history_date_above">
          
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
           

             
        </div>
<hr style={{marginTop:'1rem', marginBottom:'1rem'}}/>
          <div className="history_above_lineData">
         <div className="task__qty">
         <p>Select Line: </p>
            <div className="update_dropdown">
              <select onClick={(e) => handleLineChange(e.target.value)}>
                <option value="">Select</option>
                {generateLineButtons()}
              </select>
            </div>
            </div>

            <div className="task__qty">
              <p>Select Shift: </p>
              <div className="update_dropdown">
                <select onChange={(e) => setShift(e.target.value)}>
                  <option value="">Shift</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
            </div>
           
            <div>
            <button className="task_assign_btn" onClick={showLineHistory}>
              Show Line History
            </button>
          </div>

          </div>
       

        <div className="history__table">
          <div className="history_station_table">
          <div className="lineHistory-table">
          {renderTable()}
        </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LineHistory;