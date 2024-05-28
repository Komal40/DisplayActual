import React, { useState ,useEffect} from "react";
// import { useUser } from '../../UserContext'

export default function DashBoardBelow() {
  
// Parse the stored station data from localStorage
// const stationData = JSON.parse(localStorage.getItem("stationData"));

// Calculate total lines
// const totalLines = Object.keys(stationData.stations).length;

// Calculate total stations
// const totalStations = Object.values(stationData.stations).reduce((sum, stations) => sum + stations.length, 0;

const [totalLines, setTotalLines] = useState(null);
const [totalStations, setTotalStations] = useState(null);

useEffect(() => {
  // Function to calculate and set total lines and stations
  const fetchData = () => {
    const stationData = JSON.parse(localStorage.getItem("stationData"));

    if (stationData) {
      const lines = Object.keys(stationData.stations).length;
      const stations = Object.values(stationData.stations).reduce((sum, stations) => sum + stations.length, 0);

      setTotalLines(lines);
      setTotalStations(stations);
    }
  };

  // Fetch data initially
  fetchData();

  // Optionally, set up an interval to check for data changes in localStorage
  const interval = setInterval(fetchData, 1000); // Check every second

  // Cleanup interval on component unmount
  return () => clearInterval(interval);
}, []);


  return (
    <div>
      <div className="dashboard__container">
        <div className="dashboard_container_leftside">
          <div>
            <div>
              <p className="dashboard_content">
                Total Lines:&nbsp;
                <h4>{totalLines !== null ? totalLines : ""}</h4>
              </p>
            </div>
            <div className="dashboard_content_leftline"></div>
          </div>

          <div>
            <div>
              <p className="dashboard_content">
                Total Stations:&nbsp;
                <h4>{totalStations !== null ? totalStations : ""}</h4>
              </p>
            </div>
            <div className="dashboard_content_leftline"></div>
          </div>

          {/* <div>
            <div>
              <p className="dashboard_content">
                Active Stations:
                
              </p>
            </div>
            <div className="dashboard_content_leftline"></div>
          </div> */}
        </div>

        <div className="dasboard_container_rightside">
          {/* <div>
            <div>
              <p className="dashboard_content">
                PARTS: <h4> {passVal+failVal}/{parseInt(localStorage.getItem('qty')) || 0}</h4>
              </p>
            </div>
            <div className="dashboard_content_rightline"></div>
          </div> */}
          <div>
            <p className="dashboard_content">
              <h4>
                {/* {passVal} */}
                {/* passed */}
              </h4>
            </p>
          </div>
          <div>
            <p className="dashboard_content">
              <h4>
                {/* {failVal} */}
                {/* failed */}
              </h4>
            </p>
          </div>
          <div>
            <p className="dashboard_content">
              <h4>
                {/* {passVal+failVal}  */}
                {/* Done */}
              </h4>
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard_line"></div>
    </div>
  );
}
