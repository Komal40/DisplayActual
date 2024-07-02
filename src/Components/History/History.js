import React, { useState, useEffect } from "react";
import DashboardAbove from "../DashboardR/DashBoardAbove";
import "./History.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";


function History() {
  const navigate = useNavigate();

  const [selectedHisDate, setSelectedHisDate] = useState(new Date());
  const totalLines = localStorage.getItem("TotalLines");
  const [allStationData, setallStationData] = useState({});
  const token = JSON.parse(localStorage.getItem("Token"));
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
  const [modalHisOpen, setmodalHisOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [shift, setShift] = useState("");


  const tokenExpired = useTokenExpirationCheck(token, navigate);

  const handleDateChange = (date) => {
    setSelectedHisDate(date);
  };

  useEffect(() => {
    const fetchData = async () => {
      const link = process.env.REACT_APP_BASE_URL;
      const endPoint = "/floorincharge/stations_info";
      const fullLink = link + endPoint;

      try {
        const params = new URLSearchParams();
        params.append("floor_no", floor_no);

        const response = await fetch(fullLink, {
          method: "POST",
          body: params,
          headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log("object response data", responseData);
          // Parse All_stations
          const stationsString = responseData.All_stations.replace(/'/g, '"');
          const stations = JSON.parse(stationsString);
          // Parse lines
          const linesString = responseData.lines.replace(/'/g, '"');
          const lines = JSON.parse(linesString);
          // Parse totalLines
          const totalLines = parseInt(responseData.totalLines);
          // Set totalLines in local storage
          localStorage.setItem("TotalLines", totalLines);
          // getTotalLines(totalLines);

          setallStationData({
            stations: stations,
            lines: lines,
            totalLines: totalLines,
          });

          console.log("object set station on add station data", allStationData);
        } else {
          const errorData = await response.text();
          console.error("API Error:", errorData);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [token]);

  // const initialSelectedLine = selectedLine || "L01";
  const [selectedLine, setselectedLine] = useState("");
  const generateLineButtons = () => {
    return (
      allStationData.lines &&
      allStationData.lines
        .sort((a, b) => {
          // Extract the line numbers from the line names
          const lineA = parseInt(a.split("L")[1]);
          const lineB = parseInt(b.split("L")[1]);
          // Compare the line numbers
          return lineA - lineB;
        })

        .map((line, index) => (
          <option key={index}>
            {/* {`Line ${parseInt(line.split("L")[1])}`} */}
            {line}
          </option>
        ))
    );
  };

  const handleLineChange = (e) => {
    // G01 F02 L02
    setselectedLine(e);
  };

  console.log("selectedLine", selectedLine);

  const [fpaData, setFpaData] = useState(null);
  const fetchHistory = async (e) => {
    
    if(selectedLine===""){
        alert("Select Line")
        return;
    }

    if(shift==""){
      alert("Select Shift")
      return;
  }

    
      const formattedDate = `${selectedHisDate.getFullYear()}-${
        selectedHisDate.getMonth() + 1 < 10
          ? "0" + (selectedHisDate.getMonth() + 1)
          : selectedHisDate.getMonth() + 1
      }-${selectedHisDate.getDate()}`;

    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/get_fpa_failed_history";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("line_no", selectedLine);
      params.append("date", formattedDate);
      params.append("shift", shift);

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
          console.log(data)
            // The FPA_Data is a string that needs to be parsed correctly
                    // Replace single quotes with double quotes and `None` with `null`
                    const correctedFpaData = data.FPA_Data.replace(/'/g, '"').replace(/None/g, 'null');

                    // Parse the corrected JSON string
                    const parsedFpaData = JSON.parse(correctedFpaData);

                    // Store the parsed data in the state
                    setFpaData(parsedFpaData);
        } else {
          alert(data.Message);
        }
      }
    } catch (error) {
      console.error("Error :", error);
    }
  };


  console.log("fpaData",fpaData)
    // Function to handle click and open modal
  const handleClick = (item) => {
    setSelectedStation(item);
    setmodalHisOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setmodalHisOpen(false);
  };


  const filteredData = fpaData && fpaData.filter(item => {
    const itemDate = new Date(item[8]);
    return item[2].includes(selectedLine) && itemDate.toDateString() === selectedHisDate.toDateString();
});

const mergedData = [];
if (fpaData) {
  const groupedByDate = {};
  fpaData.forEach(item => {
    const itemDate = new Date(item[8]).toDateString();
    if (!groupedByDate[itemDate]) {
      groupedByDate[itemDate] = [];
    }
    groupedByDate[itemDate].push(item);
  });

  Object.keys(groupedByDate).forEach(date => {
    const items = groupedByDate[date];
    items.forEach((item, index) => {
      const rowData = {
        date: index === 0 ? new Date(item[8]).toLocaleDateString() : "",
        stationNo: item[2],
        partId: item[0],
        shift: item[5],
        fpa: item[4],
        time: item[6],
      };
      mergedData.push(rowData);
    });
  });
}


const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(mergedData);

  // Set column widths (example: increase width of first and third columns)
  const wscols = [
    { wch: 15 }, // Width of 15 for the first column
    { wch: 20 }, // Width of 20 for the third column
   
  ];

  ws['!cols'] = wscols; // Assign the column widths to the worksheet

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "History Data");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const fileName = "history_data.xlsx";
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, fileName);
};



  return (
    <>
      <div>
        <DashboardAbove />
      </div>

      <div className="history__main">
      <div className="history__above_data">
      <div className="history_head">
          <div className="history__contain">
            <p>Select Date:</p>
            <DatePicker
              className="date_picker"
              selected={selectedHisDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
            />

           
          </div>
        </div>

        <div className="update_dropdown">
             <div className="history_line"> 
             <p>Select Line:</p>
              <select onClick={(e) => handleLineChange(e.target.value)}>
                <option>Select</option>
                {generateLineButtons()}
              </select>
             </div>
            </div>



            <div className="task__qty">
            <p>Select Shift</p>
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
          <button className="task_assign_btn" onClick={fetchHistory}>Fetch Data</button>
        </div>
      </div>

      <div className="history__table">
      <div className="history_station_table">
      {/* {filteredData && 
      filteredData.length > 0 ? (
                <table className="station-table">
                    <thead>
                        <tr>
                        <th>Date</th>
                            <th>Station No</th>
                            <th>Part Id</th>
                            <th>Shift</th>
                            <th>FPA</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, index) => (
                            <tr key={index}>
                                <td>{item[8]}</td>
                                <td>{item[2]}</td>
                                <td>{item[0]}</td>
                                <td>{item[5]}</td>
                                <td>{item[4]}</td>
                                <td>{item[6]}</td>

                               
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                ""
            )} */}
      
      
      {mergedData && mergedData.length > 0 ? (
        <>
        <div style={{marginBottom:'1rem'}}>
            <button onClick={exportToExcel} className="task_assign_btn">
              Export to Excel
            </button>
          </div>
              <table className="station-table small-font">
                <thead >
                  <tr>
                    <th>Date</th>
                    <th>Station No</th>
                    <th>Part Id</th>
                    <th>Shift</th>
                    <th>FPA</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {mergedData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.date}</td>
                      <td>{item.stationNo}</td>
                      <td>{item.partId}</td>
                      <td>{item.shift}</td>
                      <td>{item.fpa}</td>
                      <td>{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </> ) : (
              ""
            )

          }

      {/* Modal Popup */}
      {modalHisOpen && (
        <div className="modal_history-overlay">
          <div className="modal_history">
            <div className="modal_history-content">
              <h2>Station Information</h2>
              <p>Station No: {selectedStation ? selectedStation[2] : ''}</p>
              <p>{selectedStation ? (selectedStation[2] === null ? 'None' : selectedStation[2]) : ''}</p>
              <button style={{marginTop:'1rem'}} onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
      </div>
    </>
  );
}

export default History;
