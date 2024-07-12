import React, { startTransition, useEffect, useState } from "react";
import { json, useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DashboardAbove from "../DashboardR/DashBoardAbove";
import * as XLSX from "xlsx";
import "./History.css";

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
  const stationData = JSON.parse(localStorage.getItem("stationData"));

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
            const correctedFpaData = data.Datas.replace(/'/g, '"').replace(
              /None/g,
              "null"
            );
            // const correctedFpaData = response.Datas.replace(/'/g, '"').replace(/None/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
            const correctedData = data.Datas.replace(/'/g, '"')
              .replace(/None/g, "null")
              .replace(/\bTrue\b/g, "true")
              .replace(/\bFalse\b/g, "false");
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
            console.error(
              "Data format is unexpected or 'toggle' property is missing."
            );
          }
        } else {
          alert(data.Message);
        }
      }
    } catch (error) {
      console.error("Error :", error);
    }
  };

  const [stationDataHistory, setStationDataHistory] = useState({});
  const showStationHistory = async (e) => {
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

        console.log("stationhistory", data);
        if (response.ok) {
          if (data.Messages) {
            // Replace single quotes with double quotes and `None` with `null`
            const correctedFpaData = data.Messages.replace(/'/g, '"').replace(
              /None/g,
              "null"
            );
            // const correctedFpaData = response.Datas.replace(/'/g, '"').replace(/None/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
            const correctedData = data.Messages.replace(/'/g, '"')
              .replace(/None/g, "null")
              .replace(/\bTrue\b/g, "true")
              .replace(/\bFalse\b/g, "false");

            const parsedData = JSON.parse(correctedData);
            setStationDataHistory(parsedData);
          }

          if (data && data.toggle !== undefined) {
            // Handle the data as needed
            console.log("Valid data received:", data);
          } else {
            console.error(
              "Data format is unexpected or 'toggle' property is missing."
            );
          }
        } else {
          alert(data.Message);
        }
      }
    } catch (error) {
      console.error("Error :", error);
    }
  };

  console.log("lineHistoryData", lineHistoryData);
  console.log("stationDataHistory", stationDataHistory);

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

  const generatestationButtons = () => {
    return (
      lineStations &&
      lineStations.map((station, index) => (
        <option key={index}>{station}</option>
      ))
    );
  };
  
  const [lineStations, setLineStations] = useState([]);
  const handleLineChange = (e) => {
    // G01 F02 L01
    setselectedLine(e);
    const station = stationData.stations[e];
    setLineStations(station);
  };

  const [stationval, setStationVal] = useState("");
  const handleStationChange = (e) => {
    setStationVal(e);
  };

  console.log("lineStations,stationval", lineStations, stationval);

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
        const rowData = isFirstRow
          ? { date, stationId, ...details }
          : { date: "", stationId, ...details };
        tableData.push(rowData);
        isFirstRow = false; // Set isFirstRow to false after the first row for the date
      }
    }
    return tableData;
  };

  const renderTable = () => {
    const tableData = formatDataForTable(lineHistoryData);

    if (
      Object.keys(lineHistoryData).length === 0 &&
      lineHistoryData.constructor === Object
    ) {
      return null; // If no data, return null to render nothing
    }

    return (
      <>
        <div style={{ margin: "1rem" }}>
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
    if (
      Object.keys(lineHistoryData).length === 0 &&
      lineHistoryData.constructor === Object
    ) {
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
    const fileName = `Line_History_Data_${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}.xlsx`;
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

    if (
      Object.keys(stationDataHistory).length === 0 &&
      stationDataHistory.constructor === Object
    ) {
      return null; // If no data, return null to render nothing
    }

    // Sort dates in decreasing order
    const sortedDates = Object.keys(groupedData).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    return (
      <>
        <div style={{ marginBottom: "1rem" }}>
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
                  {rowIndex === 0 && <td rowSpan={rows.length}>{row.date}</td>}
                  <td>{row.shift}</td>
                  {rowIndex === 0 && (
                    <td rowSpan={rows.length}>
                      {rowIndex === 0 ? row.station_id : ""}
                    </td>
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
    return tableData.map((row) => ({
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
    if (
      Object.keys(stationDataHistory).length === 0 &&
      stationDataHistory.constructor === Object
    ) {
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
    const fileName = `Station_History_Data_${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const [activeTab, setActiveTab] = useState("line");

  const Tabs = ({ activeTab, setActiveTab }) => {
    return (
      <div className="tabs">
        <button
          className={`tab ${activeTab === "line" ? "active" : ""}`}
          onClick={() => setActiveTab("line")}
        >
          Line History
        </button>
        <button
          className={`tab ${activeTab === "station" ? "active" : ""}`}
          onClick={() => setActiveTab("station")}
        >
          Station History
        </button>
        <button
          className={`tab ${activeTab === "parts" ? "active" : ""}`}
          onClick={() => setActiveTab("parts")}
        >
          Part History
        </button>
        <button
          className={`tab ${activeTab === "operator" ? "active" : ""}`}
          onClick={() => setActiveTab("operator")}
        >
          Operator History
        </button>
      </div>
    );
  };

  //   history for parts
  const [parts, setParts] = useState([]);
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

  const [selectedPartNo, setSelectedPartNo] = useState("");
  const handlePartChange = (e) => {
    e.preventDefault();
    const selectedPartNo = e.target.value;
    setSelectedPartNo(selectedPartNo);
  };

  const [PartDataHistory, setPartDataHistory] = useState({});
  const showPartHistory = async (e) => {
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

        console.log("parthistory", data);
        if (response.ok) {
          if (data.Messages) {
            // Replace single quotes with double quotes and `None` with `null`
            const correctedFpaData = data.Messages.replace(/'/g, '"').replace(
              /None/g,
              "null"
            );
            // const correctedFpaData = response.Datas.replace(/'/g, '"').replace(/None/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
            const correctedData = data.Messages.replace(/'/g, '"')
              .replace(/None/g, "null")
              .replace(/\bTrue\b/g, "true")
              .replace(/\bFalse\b/g, "false");

            const parsedData = JSON.parse(correctedData);
            setPartDataHistory(parsedData);
          }

          if (data && data.toggle !== undefined) {
            // Handle the data as needed
            console.log("Valid data received:", data);
          } else {
            console.error(
              "Data format is unexpected or 'toggle' property is missing."
            );
          }
        } else {
          alert(data.Message);
        }
      }
    } catch (error) {
      console.error("Error :", error);
    }
  };

  console.log("PartDataHistory", PartDataHistory);

  const parsePartsHistoryData = (data) => {
    const parsedData = Object.keys(data)
      .map((date) => {
        const shifts = Object.keys(data[date]).reduce((acc, shift) => {
          return acc.concat(
            data[date][shift].map((entry) => ({
              date,
              shift,
              ...entry,
            }))
          );
        }, []);
        return shifts;
      })
      .flat();

    // Optionally, you can log the parsed data for verification
    console.log("Parsed Data:", parsedData);

    // Return the parsed data if you need to use it elsewhere
    return parsedData;
  };
  parsePartsHistoryData(PartDataHistory);

  const getSortedAndGroupedData = (data) => {
    const tableData = parsePartsHistoryData(data);

    // Group by date
    const groupedData = tableData.reduce((acc, entry) => {
      const { date, shift, ...rest } = entry;
      const existingEntry = acc.find((item) => item.date === date);

      if (existingEntry) {
        existingEntry.shifts.push({ shift, ...rest });
      } else {
        acc.push({
          date,
          shifts: [{ shift, ...rest }],
        });
      }

      return acc;
    }, []);

    // Optionally, log the grouped data for verification
    console.log("Grouped Data:", groupedData);

    // Return the grouped data
    return groupedData;
  };

  const renderPartsTable = () => {
    const groupedData = getSortedAndGroupedData(PartDataHistory);

    groupedData.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (
      Object.keys(PartDataHistory).length === 0 &&
      PartDataHistory.constructor === Object
    ) {
      return null; // If no data, return null to render nothing
    }

    return (
      <>
        <div style={{ marginBottom: "1rem" }}>
          <button onClick={exportPartsToExcel} className="task_assign_btn">
            Export Part History
          </button>
        </div>
        <div>
          <table className="station-table small-font">
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Employee ID</th>
                <th>Station ID</th>
                <th>Part Number</th>
                <th>Process Number</th>
                <th>Start Shift Time</th>
                <th>End Shift Time</th>
                <th>Assigned By Owner</th>
                <th>Total Assigned Tasks</th>
                <th>Passed</th>
                <th>Failed</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.map(({ date, shifts }) =>
                shifts.map((shift, index) => (
                  <tr key={`${date}_${index}`}>
                    {index === 0 ? (
                      <td rowSpan={shifts.length}>{date}</td>
                    ) : null}
                   
                    <td>{shift.shift}</td>
                    <td>{shift.employee_id}</td>
                    <td>{shift.station_id}</td>
                    <td>{shift.part_no}</td>
                    <td>{shift.process_no}</td>
                    <td>{shift.start_shift_time}</td>
                    <td>{shift.end_shift_time}</td>
                    <td>{shift.assigned_by_owner}</td>
                    <td>{shift.total_assigned_task}</td>
                    <td>{shift.passed !== null ? shift.passed : "-"}</td>
                    <td>{shift.failed !== null ? shift.failed : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const exportPartsToExcel = () => {
    if (
      Object.keys(PartDataHistory).length === 0 &&
      PartDataHistory.constructor === Object
    ) {
      alert("No data to export");
      return;
    }

    const groupedData = getSortedAndGroupedData(PartDataHistory);

    groupedData.sort((a, b) => new Date(b.date) - new Date(a.date));

    const filename = "PartHistory.xlsx";
    const wb = XLSX.utils.book_new();

    groupedData.forEach(({ date, shifts }) => {
      const data = shifts.map((shift) => ({
        Date: date,
        Shift: shift.shift,
        "Employee ID": shift.employee_id,
        "Station ID": shift.station_id,
        "Part Number": shift.part_no,
        "Process Number": shift.process_no,
        "Start Shift Time": shift.start_shift_time,
        "End Shift Time": shift.end_shift_time,
        "Assigned By Owner": shift.assigned_by_owner,
        "Total Assigned Tasks": shift.total_assigned_task,
        Passed: shift.passed !== null ? shift.passed : "-",
        Failed: shift.failed !== null ? shift.failed : "-",
      }));

      const ws = XLSX.utils.json_to_sheet(data);

      // Set column widths
      ws["!cols"] = [
        { wch: 15 }, // Date
        { wch: 10 }, // Shift
        { wch: 15 }, // Employee ID
        { wch: 20 }, // Station ID
        { wch: 15 }, // Part Number
        { wch: 20 }, // Process Number
        { wch: 20 }, // Start Shift Time
        { wch: 20 }, // End Shift Time
        { wch: 20 }, // Assigned By Owner
        { wch: 20 }, // Total Assigned Tasks
        { wch: 10 }, // Passed
        { wch: 10 }, // Failed
      ];

      XLSX.utils.book_append_sheet(wb, ws, date);
    });

    XLSX.writeFile(wb, filename);
  };

  //   history for operator

  // select employee name and skill from employee code
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [value, setValue] = useState("");
  const showEmployee = async (e) => {
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/operator/details";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("employee_id", value);

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
        setEmployeeDetails(data);
      } else {
        console.error("Failed to fetch employee details");
        setEmployeeDetails(null);
      }
    } catch (error) {
      console.error("Error:", error);
      setEmployeeDetails(null);
    }
  };

  const [OperatorDataHistory, setOperatorDataHistory] = useState({});
  const showOperatorHistory = async (e) => {
    if (value == "") {
      alert("Enter Operator Id");
      return;
    }

    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/generate_history_for_operator";
    const fullLink = link + endPoint;

    const startDateFormatted = formatDate(selectedStartDate);
    const endDateFormatted = formatDate(selectedEndDate);

    try {
      const params = new URLSearchParams();
      params.append("operator_id", value);
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

        console.log("parthistory", data);
        if (response.ok) {
          if (data.Messages) {
            // Replace single quotes with double quotes and `None` with `null`
            const correctedFpaData = data.Messages.replace(/'/g, '"').replace(
              /None/g,
              "null"
            );
            // const correctedFpaData = response.Datas.replace(/'/g, '"').replace(/None/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
            const correctedData = data.Messages.replace(/'/g, '"')
              .replace(/None/g, "null")
              .replace(/\bTrue\b/g, "true")
              .replace(/\bFalse\b/g, "false");

            const parsedData = JSON.parse(correctedData);
            setOperatorDataHistory(parsedData);
          }

          if (data && data.toggle !== undefined) {
            // Handle the data as needed
            console.log("Valid data received:", data);
          } else {
            console.error(
              "Data format is unexpected or 'toggle' property is missing."
            );
          }
        } else {
          alert(data.Message);
        }
      }
    } catch (error) {
      console.error("Error :", error);
    }
  };

  console.log("OperatorDataHistory", OperatorDataHistory);
  const parseOperatorData = (data) => {
    const parsedData = [];
    for (const date in data) {
      const shifts = data[date];
      for (const shift in shifts) {
        parsedData.push({ date, shift, ...shifts[shift] });
      }
    }
    return parsedData;
  };

  const renderOperatorTable = () => {
    if (
      Object.keys(OperatorDataHistory).length === 0 &&
      OperatorDataHistory.constructor === Object
    ) {
      return null; // If no data, return null to render nothing
    }

    const tableData = parseOperatorData(OperatorDataHistory);
    const groupedData = tableData.reduce((acc, item) => {
      acc[item.date] = acc[item.date] || [];
      acc[item.date].push(item);
      return acc;
    }, {});

    const sortedDates = Object.keys(groupedData).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    return (
      <div>
        <div style={{ marginBottom: "1rem" }}>
          <button onClick={exportOperatorToExcel} className="task_assign_btn">
            Export Operator History
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
                  {rowIndex === 0 && <td rowSpan={rows.length}>{row.date}</td>}
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
      </div>
    );
  };

  const exportOperatorToExcel = () => {
    const tableData = parseOperatorData(OperatorDataHistory);
    const groupedData = tableData.reduce((acc, item) => {
      acc[item.date] = acc[item.date] || [];
      acc[item.date].push(item);
      return acc;
    }, {});

    const sortedDates = Object.keys(groupedData).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    const dataToExport = sortedDates.flatMap((date) => {
      const rows = groupedData[date];
      return rows.map((row, rowIndex) => ({
        Date: rowIndex === 0 ? row.date : "",
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
    });

    // Adjusting column widths
    const wscols = [
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
    ];

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    ws["!cols"] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Operator History");

    XLSX.writeFile(wb, `Operator_History_${new Date().toISOString()}.xlsx`);
  };

  const handleEmployeeChange = (e) => {
    setValue(e.target.value);
    setEmployeeDetails(null); // Reset employee details when input changes
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
        <hr style={{ marginTop: "1rem", marginBottom: "1rem" }} />

        <div className="tab_history_buttons">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {activeTab === "line" && (
          <>
            <div className="history_above_lineData">
              <div className="task__qty">
                <p>Select Line: </p>
                <div className="update_dropdown">
                  <select
                    value={selectedLine}
                    onChange={(e) => handleLineChange(e.target.value)}
                  >
                    <option value="">Select</option>
                    {generateLineButtons()}
                  </select>
                </div>
              </div>

              <div className="task__qty">
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

              <div>
                <button className="task_assign_btn" onClick={showLineHistory}>
                  Show Line History
                </button>
              </div>
            </div>
            <div className="history__table">
              <div className="lineHistory-table">{renderTable()}</div>
            </div>
          </>
        )}

        {activeTab === "station" && (
          <>
            <div className="history_above_lineData">
              <div className="task__qty">
                <p>Select Line: </p>
                <div className="update_dropdown">
                  <select
                    value={selectedLine}
                    onChange={(e) => handleLineChange(e.target.value)}
                  >
                    <option value="">Select</option>
                    {generateLineButtons()}
                  </select>
                </div>
              </div>

              <div className="task__qty">
                <p>Select StationID: </p>
                <div className="update_dropdown">
                  <select
                    value={stationval}
                    onChange={(e) => handleStationChange(e.target.value)}
                  >
                    <option value="">Select</option>
                    {generatestationButtons()}
                  </select>
                </div>
              </div>

              <div>
                <button
                  className="task_assign_btn"
                  onClick={showStationHistory}
                >
                  Show Station History
                </button>
              </div>
            </div>
            <div className="history__table">
              <div className="history_station_table">
                <div className="lineHistory-table">{renderStationTable()}</div>
              </div>
            </div>
          </>
        )}

        {activeTab === "parts" && (
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
                <div className="lineHistory-table">{renderPartsTable()}</div>
              </div>
            </div>
          </>
        )}

        {activeTab === "operator" && (
          <>
            <div className="history_above_lineData">
              <div className="task__qty">
                <p>Enter Operator Id:</p>
                <div className="update_dropdown">
                  <input
                    className="task_station_input"
                    value={value}
                    onChange={handleEmployeeChange}
                  />
                </div>
                <p>
                  {employeeDetails
                    ? `${employeeDetails["First Name"]} ${employeeDetails["Last Name"]}`
                    : ""}
                </p>
              </div>

              <div>
                <button className="task_assign_btn" onClick={showEmployee}>
                  Show Name
                </button>
              </div>

              <div>
                <button
                  className="task_assign_btn"
                  onClick={showOperatorHistory}
                >
                  Operator History
                </button>
              </div>
            </div>
            <div className="history__table">
              <div className="history_station_table">
                <div className="lineHistory-table">{renderOperatorTable()}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default LineHistory;
