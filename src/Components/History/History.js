import React, { useState, useEffect } from "react";
import DashboardAbove from "../DashboardR/DashBoardAbove";
import "./History.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";

function History() {
  const navigate = useNavigate();

  const [selectedHisDate, setSelectedHisDate] = useState(new Date());
  const totalLines = localStorage.getItem("TotalLines");
  const [allStationData, setallStationData] = useState({});
  const token = JSON.parse(localStorage.getItem("Token"));
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
  const [modalHisOpen, setmodalHisOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

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
        toast.error("Select Line")
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
          toast.error(data.Message);
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
    const itemDate = new Date(item[6]);
    return item[0].includes(selectedLine) && itemDate.toDateString() === selectedHisDate.toDateString();
});




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

            
        <div>
          <button className="task_assign_btn" onClick={fetchHistory}>Fetch Data</button>
        </div>
      </div>



      <div className="history__table">

      <div className="history_station_table">
      
    
      {filteredData && 
      filteredData.length > 0 ? (
                <table className="station-table">
                    <thead>
                        <tr>
                            <th>Station No</th>
                            <th>Shift</th>
                            <th>FPA</th>
                            <th>Time</th>
                            <th>Date</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, index) => (
                            <tr key={index}>
                                <td>{item[0]}</td>
                                <td>{item[3]}</td>
                                <td>{item[2]}</td>
                                <td>{item[4]}</td>
                                <td>{item[6]}</td>
                                <td>
                                    {/* Add any actions here, like buttons */}
                                    <button onClick={() => handleClick(item)}>Data</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                ""
            )}
      
      
   

      {/* Modal Popup */}
      {modalHisOpen && (
        <div className="modal_history-overlay">
          <div className="modal_history">
            <div className="modal_history-content">
              <h2>Station Information</h2>
              <p>Station No: {selectedStation ? selectedStation[0] : ''}</p>
              <p>{selectedStation ? (selectedStation[5] === null ? 'None' : selectedStation[5]) : ''}</p>
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
