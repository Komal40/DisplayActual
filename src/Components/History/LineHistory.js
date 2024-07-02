import React, { startTransition, useEffect, useState } from "react";
import { json, useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
        alert("Select Line");
        return;
      }
      
    if (shift == "") {
      alert("Select Shift");
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

        if (response.ok) {
           
              
            if (data.Datas) {
              
                 // Replace single quotes with double quotes and `None` with `null`
                 const correctedFpaData = data.Datas.replace(/'/g, '"').replace(/None/g, 'null');
                // const correctedFpaData = response.Datas.replace(/'/g, '"').replace(/None/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
                const correctedData = data.Datas.replace(/'/g, '"').replace(/None/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
                // Parse the corrected JSON string
                 // Parse the corrected JSON string
                //  const parsedData = JSON.parse(correctedFpaData);


                  // Correct the data format
    // let correctedData = response.Datas;

    // Replace single quotes with double quotes
    // correctedData = correctedData.replace(/'/g, '"');

    // Replace None with null, True with true, and False with false
    // correctedData = correctedData.replace(/\bNone\b/g, 'null');
    // correctedData = correctedData.replace(/\bTrue\b/g, 'true');
    // correctedData = correctedData.replace(/\bFalse\b/g, 'false');

    // Parse the corrected JSON string
    const parsedData = JSON.parse(correctedData);
                setLineHistoryData(parsedData);
              }

            if (data && data.toggle !== undefined) {
              // Handle the data as needed
              console.log("Valid data received:", data);
            } else {
              console.error("Data format is unexpected or 'toggle' property is missing.");
            }
            
          } else {
            alert(data.Message);
          }

        }
        
    } catch (error) {
      console.error("Error :", error);
    }
  };




const [stationDataHistory, setStationDataHistory]=useState({})
  const showStationHistory=async(e)=>{
    if (stationval == "") {
        alert("Select Station");
        return;
      }

    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/generate_history_for_station";
    const fullLink = link + endPoint;

    const startDateFormatted = formatDate(selectedStartDate);
    const endDateFormatted = formatDate(selectedEndDate);

    try {
      const params = new URLSearchParams();
      params.append("station_id", stationval);      
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

        console.log("stationhistory",data)
        if (response.ok) {
           
              
            if (data.Messages) {
              
                 // Replace single quotes with double quotes and `None` with `null`
                 const correctedFpaData = data.Messages.replace(/'/g, '"').replace(/None/g, 'null');
                // const correctedFpaData = response.Datas.replace(/'/g, '"').replace(/None/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
                const correctedData = data.Messages.replace(/'/g, '"').replace(/None/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
                
    const parsedData = JSON.parse(correctedData);
    setStationDataHistory(parsedData);
              }

            if (data && data.toggle !== undefined) {
              // Handle the data as needed
              console.log("Valid data received:", data);
            } else {
              console.error("Data format is unexpected or 'toggle' property is missing.");
            }
            
          }
           else {
            alert(data.Message);
          }

        }
        
    } catch (error) {
      console.error("Error :", error);
    }
  }

  console.log("lineHistoryData",lineHistoryData)
  console.log("stationDataHistory",stationDataHistory)



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

  const generatestationButtons=()=>{
    return(
        lineStations && lineStations.map((station,index)=> <option key={index}>{station}</option>)
    )
  }
  const[lineStations, setLineStations]=useState([])
  const handleLineChange = (e) => {
    // G01 F02 L01
    setselectedLine(e);  
    const station=stationData.stations[e]
    setLineStations(station)
  };

  const [stationval, setStationVal]=useState("")
  const handleStationChange=(e)=>{
setStationVal(e)
  }

console.log("lineStations,stationval",lineStations,stationval)

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
  

  const renderTable = () => {
    const tableData = formatDataForTable(lineHistoryData);

    if (Object.keys(lineHistoryData).length === 0 && lineHistoryData.constructor === Object) {
      return null; // If no data, return null to render nothing
    }

    return (
        <>
        <div style={{margin:'1rem'}}>
            <button onClick={exportToExcel} className="task_assign_btn">
              Export To Excel
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
            <th>Failed</th>
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
              <td>{row.failed}</td>
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
     alert("No data to export");
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



// station history
  const parseStationHistoryData = (data) => {
    const parsedData = [];
    for (const date in data) {
      const tasks = data[date];
      for (const shift in tasks) {
        parsedData.push({ date, shift, ...tasks[shift] });
      }
    }
    return parsedData;
  };
  
  const groupByDate = (data) => {
    const groupedData = {};
    data.forEach((item) => {
      if (!groupedData[item.date]) {
        groupedData[item.date] = [];
      }
      groupedData[item.date].push(item);
    });
    return groupedData;
  };
  
  const renderStationTable = () => {
    const tableData = parseStationHistoryData(stationDataHistory);
    const groupedData = groupByDate(tableData);
  
    if (Object.keys(stationDataHistory).length === 0 && stationDataHistory.constructor === Object) {
      return null; // If no data, return null to render nothing
    }
  
    // Sort dates in decreasing order
    const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b) - new Date(a));
  
    return (
      <>
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={exportStationToExcel} className="task_assign_btn">
            Export Station History
          </button>
        </div>
        <table className="station-table small-font">
          <thead>
            <tr>
              <th>Date</th>
              <th>Shift</th>
              <th>Station ID</th>
              <th>Employee ID</th>
              <th>Part No</th>
              <th>Process No</th>
              <th>Start Shift Time</th>
              <th>End Shift Time</th>
              <th>Assigned by Owner</th>
              <th>Total Assigned Task</th>
              <th>Passed</th>
              <th>Failed</th>
              
            </tr>
          </thead>
          <tbody>
            {sortedDates.map((date) => {
              const rows = groupedData[date];
              return rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {rowIndex === 0 && (
                    <td rowSpan={rows.length}>{row.date}</td>
                  )}
                  <td>{row.shift}</td>
                  {rowIndex === 0 && (
                  <td rowSpan={rows.length}>{rowIndex === 0 ? row.station_id : ''}</td>
                )}
                  <td>{row.employee_id}</td>
                  <td>{row.part_no}</td>
                  <td>{row.process_no}</td>
                  <td>{row.start_shift_time}</td>
                  <td>{row.end_shift_time}</td>
                  <td>{row.assigned_by_owner}</td>
                  <td>{row.total_assigned_task}</td>
                  <td>{row.passed}</td>
                  <td>{row.failed}</td>
                 
                </tr>
              ));
            })}
          </tbody>
        </table>
      </>
    );
  };
  
// Function to format data for Excel export
const formatDataStationForTable = (data) => {
    const tableData = parseStationHistoryData(data);
    return tableData.map(row => ({
      Date: row.date,
      Shift: row.shift,
      "Station ID": row.station_id,
      "Employee ID": row.employee_id,
      "Part No": row.part_no,
      "Process No": row.process_no,
      "Start Shift Time": row.start_shift_time,
      "End Shift Time": row.end_shift_time,
      "Assigned by Owner": row.assigned_by_owner,
      "Total Assigned Task": row.total_assigned_task,
      Passed: row.passed,
      Failed: row.failed,
    }));
  };
  // Function to sort data by date in descending order
const sortByDateDescending = (data) => {
    return data.sort((a, b) => new Date(b.Date) - new Date(a.Date));
  };
  
  // Function to export station data to Excel
const exportStationToExcel = () => {

    if (Object.keys(stationDataHistory).length === 0 && stationDataHistory.constructor === Object) {
      alert("No data to export");
      return;
    }
  
    const formattedData = formatDataStationForTable(stationDataHistory);

    const sortedData = sortByDateDescending(formattedData);
  
    // Adjusting column widths
    const wscols = [
      { wch: 15 }, // Date
      { wch: 10 }, // Shift
      { wch: 20 }, // Station ID
      { wch: 15 }, // Employee ID
      { wch: 15 }, // Part No
      { wch: 20 }, // Process No
      { wch: 20 }, // Start Shift Time
      { wch: 20 }, // End Shift Time
      { wch: 20 }, // Assigned by Owner
      { wch: 20 }, // Total Assigned Task
      { wch: 10 }, // Passed
      { wch: 10 }, // Failed
    ];
  
    const ws = XLSX.utils.json_to_sheet(sortedData);
    ws["!cols"] = wscols;
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Station History Data");
  
    const date = new Date();
    const fileName = `Station_History_Data_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };
  


  const [activeTab, setActiveTab] = useState('line');
  const Tabs = ({ activeTab, setActiveTab }) => {
    return (
      <div className="tabs">
        <button onClick={() => setActiveTab('line')}>Line History</button>
        <button onClick={() => setActiveTab('station')}>Station History</button>
        <button onClick={() => setActiveTab('parts')}>Part History</button>
        <button onClick={() => setActiveTab('operator')}>Operator History</button>
      </div>
    );
  };








//   history for parts
const [parts, setParts]=useState([])
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

  useEffect(()=>{
   getParts(); 
  },[])

  const [selectedPartNo, setSelectedPartNo] = useState("");
  const handlePartChange = (e) => {
    e.preventDefault();
    const selectedPartNo = e.target.value;
    setSelectedPartNo(selectedPartNo);
  };

  const [PartDataHistory, setPartDataHistory]=useState({})
  const showPartHistory=async(e)=>{
    if (selectedPartNo == "") {
        alert("Select Part No");
        return;
      }

    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/generate_history_for_part";
    const fullLink = link + endPoint;

    const startDateFormatted = formatDate(selectedStartDate);
    const endDateFormatted = formatDate(selectedEndDate);

    try {
      const params = new URLSearchParams();
      params.append("part_no", selectedPartNo);      
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

        console.log("parthistory",data)
        if (response.ok) {
           
              
            if (data.Messages) {
              
                 // Replace single quotes with double quotes and `None` with `null`
                 const correctedFpaData = data.Messages.replace(/'/g, '"').replace(/None/g, 'null');
                // const correctedFpaData = response.Datas.replace(/'/g, '"').replace(/None/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
                const correctedData = data.Messages.replace(/'/g, '"').replace(/None/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
                
    const parsedData = JSON.parse(correctedData);
    setPartDataHistory(parsedData);
              }

            if (data && data.toggle !== undefined) {
              // Handle the data as needed
              console.log("Valid data received:", data);
            } else {
              console.error("Data format is unexpected or 'toggle' property is missing.");
            }
            
          }
           else {
            alert(data.Message);
          }

        }
        
    } catch (error) {
      console.error("Error :", error);
    }
  }

  const parsePartsHistoryData = (data) => {
    const parsedData = [];
    for (const date in data) {
      const shifts = data[date];
      for (const shift in shifts) {
        parsedData.push({ date, shift, ...shifts[shift] });
      }
    }
    return parsedData;
  };
  

  // Sorting and grouping data
  const getSortedAndGroupedData = (data) => {
    const tableData = parsePartsHistoryData(data);
    const groupedData = groupByDate(tableData);
    // Sort dates in decreasing order
    const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b) - new Date(a));
    return { sortedDates, groupedData };
  };
  
  const renderPartsTable = () => {
    const { sortedDates, groupedData } = getSortedAndGroupedData(PartDataHistory);
  
    if (Object.keys(PartDataHistory).length === 0 && PartDataHistory.constructor === Object) {
      return null; // If no data, return null to render nothing
    }
  
    return (
      <>
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={exportPartsToExcel} className="task_assign_btn">
            Export Part History
          </button>
        </div>
        <table className="station-table small-font">
          <thead>
            <tr>
              <th>Date</th>
              <th>Shift</th>
              <th>Station ID</th>
              <th>Employee ID</th>
              <th>Part No</th>
              <th>Process No</th>
              <th>Start Shift Time</th>
              <th>End Shift Time</th>
              <th>Assigned by Owner</th>
              <th>Total Assigned Task</th>
              <th>Passed</th>
              <th>Failed</th>
            </tr>
          </thead>
          <tbody>
            {sortedDates.map((date) => {
              const rows = groupedData[date];
              return rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {rowIndex === 0 && (
                    <td rowSpan={rows.length}>{row.date}</td>
                  )}
                  <td>{row.shift}</td>
                  <td>{row.station_id}</td>
                  <td>{row.employee_id}</td>
                  <td>{row.part_no}</td>
                  <td>{row.process_no}</td>
                  <td>{row.start_shift_time}</td>
                  <td>{row.end_shift_time}</td>
                  <td>{row.assigned_by_owner}</td>
                  <td>{row.total_assigned_task}</td>
                  <td>{row.passed}</td>
                  <td>{row.failed}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </>
    );
  };
  
  const exportPartsToExcel = () => {
    if (Object.keys(PartDataHistory).length === 0 && PartDataHistory.constructor === Object) {
      alert("No data to export");
      return;
    }
  
    const { sortedDates, groupedData } = getSortedAndGroupedData(PartDataHistory);
    const tableData = sortedDates.flatMap(date => groupedData[date]);
    const formattedData = tableData.map(row => ({
      Date: row.date,
      Shift: row.shift,
      "Station ID": row.station_id,
      "Employee ID": row.employee_id,
      "Part No": row.part_no,
      "Process No": row.process_no,
      "Start Shift Time": row.start_shift_time,
      "End Shift Time": row.end_shift_time,
      "Assigned by Owner": row.assigned_by_owner,
      "Total Assigned Task": row.total_assigned_task,
      Passed: row.passed,
      Failed: row.failed,
    }));
  
    // Adjusting column widths
    const wscols = [
      { wch: 15 }, // Date
      { wch: 10 }, // Shift
      { wch: 15 }, // Station ID
      { wch: 15 }, // Employee ID
      { wch: 15 }, // Part No
      { wch: 15 }, // Process No
      { wch: 20 }, // Start Shift Time
      { wch: 20 }, // End Shift Time
      { wch: 20 }, // Assigned by Owner
      { wch: 20 }, // Total Assigned Task
      { wch: 10 }, // Passed
      { wch: 10 }, // Failed
    ];
  
    const ws = XLSX.utils.json_to_sheet(formattedData);
    ws["!cols"] = wscols;
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Parts History Data");
  
    const date = new Date();
    const fileName = `Parts_History_Data_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };
  





  
  return (
    <>
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


<div className="tab_history_buttons">
<Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
</div>



{activeTab === 'line' && (
          <>
            <div className="history_above_lineData">
              <div className="task__qty">
                <p>Select Line: </p>
                <div className="update_dropdown">
                  <select value={selectedLine} onClick={(e) => handleLineChange(e.target.value)}>
                    <option value="">Select</option>
                    {generateLineButtons()}
                  </select>
                </div>
              </div>

              <div className="task__qty">
                <p>Select Shift: </p>
                <div className="update_dropdown">
                  <select value={shift} onChange={(e) => setShift(e.target.value)}>
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
              <div className="lineHistory-table">
                {renderTable()}
              </div>
            </div>
          </>
        )}

        {activeTab === 'station' && (
          <>
            <div className="history_above_lineData">
              <div className="task__qty">
                <p>Select Line: </p>
                <div className="update_dropdown">
                  <select value={selectedLine} onChange={(e) => handleLineChange(e.target.value)}>
                    <option value="">Select</option>
                    {generateLineButtons()}
                  </select>
                </div>
              </div>

              <div className="task__qty">
                <p>Select StationID: </p>
                <div className="update_dropdown">
                  <select value={stationval} onChange={(e) => handleStationChange(e.target.value)}>
                    <option value="">Select</option>
                    {generatestationButtons()}
                  </select>
                </div>
              </div>

              <div>
                <button className="task_assign_btn" onClick={showStationHistory}>
                  Show Station History
                </button>
              </div>
            </div>
            <div className="history__table">
              <div className="history_station_table">
                <div className="lineHistory-table">
                  {renderStationTable()}
                </div>
              </div>
            </div>
          </>
        )}


{activeTab === 'parts' && (
          <>
            <div className="history_above_lineData">
              <div className="task__qty">
              <p>Select Part Name:</p>
            <div className="update_dropdown">
              <select value={selectedPartNo} onChange={handlePartChange}>
                <option>Select</option>
                {parts &&
                  parts.map((part, index) => (
                    <option key={index}>{part.part_no}</option>
                  ))}
              </select>
                </div>
              </div>


              <div>
                <button className="task_assign_btn" onClick={showPartHistory}>
                  Show Part History
                </button>
              </div>
            </div>
            <div className="history__table">
              <div className="history_station_table">
                <div className="lineHistory-table">
                  {renderPartsTable()}
                </div>
              </div>
            </div>
          </>
        )}


      </div>
    </>
  );
}

export default LineHistory;