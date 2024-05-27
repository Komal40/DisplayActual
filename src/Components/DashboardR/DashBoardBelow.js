import React from "react";
// import { useUser } from '../../UserContext'

export default function DashBoardBelow() {
  
// Parse the stored station data from localStorage
const stationData = JSON.parse(localStorage.getItem("stationData"));

// Calculate total lines
const totalLines = Object.keys(stationData.stations).length;

// Calculate total stations
const totalStations = Object.values(stationData.stations).reduce((sum, stations) => sum + stations.length, 0);


  return (
    <div>
      <div className="dashboard__container">
        <div className="dashboard_container_leftside">
          <div>
            <div>
              <p className="dashboard_content">
                Total Lines:&nbsp;
                <h4>{totalLines}</h4>
              </p>
            </div>
            <div className="dashboard_content_leftline"></div>
          </div>

          <div>
            <div>
              <p className="dashboard_content">
                Total Stations:&nbsp;
                <h4>{totalStations} </h4>
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
