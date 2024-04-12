import React from "react";
// import { useUser } from '../../UserContext'

export default function DashBoardBelow() {

  const userDataString = localStorage.getItem("Login");
  const userData = userDataString ? JSON.parse(userDataString) : null;


  return (
    <div>
      <div className="dashboard__container">
        <div className="dashboard_container_leftside">
          <div>
            <div>
              <p className="dashboard_content">
                Total Lines:{userData?.total_lines}
                {/* <h4>{lines}</h4> */}
              </p>
            </div>
            <div className="dashboard_content_leftline"></div>
          </div>

          <div>
            <div>
              <p className="dashboard_content">
                Total Stations:{userData?.total_stations}
                {/* <h4>{totalStations} </h4> */}
              </p>
            </div>
            <div className="dashboard_content_leftline"></div>
          </div>

          <div>
            <div>
              <p className="dashboard_content">
                Active Stations:
                {/* <h4>{activeStations} </h4> */}
              </p>
            </div>
            <div className="dashboard_content_leftline"></div>
          </div>
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
                passed
              </h4>
            </p>
          </div>
          <div>
            <p className="dashboard_content">
              <h4>
                {/* {failVal} */}
                failed
              </h4>
            </p>
          </div>
          <div>
            <p className="dashboard_content">
              <h4>
                {/* {passVal+failVal}  */}
                Done
              </h4>
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard_line"></div>
    </div>
  );
}
