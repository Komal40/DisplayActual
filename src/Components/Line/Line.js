import React, { useEffect, useState } from "react";
import "./Line.css";


function Line({ no,processData,length,partData }) {

 const stationProcessData = processData.filter(data => data.station_id.includes(`L${no}`));

 // Calculate the total number of passes and fails based on the filtered stationProcessData
//  const passes = stationProcessData.reduce((total, data) => total + (data.passed || 0), 0);
//  const fails = stationProcessData.reduce((total, data) => total + (data.failed || 0), 0);

// Initialize variables to store total failed tasks and minimum passes
let totalFailed = 0;
// let minPasses = processData.length == 0 ? 0 : Number.MAX_SAFE_INTEGER;
let minPasses = processData.length === 0 ? 0 : processData.length === 1 ? processData[0].passed : Number.MAX_SAFE_INTEGER;
let stations=0;

// Iterate over the processData array
processData.forEach(station => {
    // Add the failed tasks of the current station to the total
    totalFailed += station.failed || 0;
    // Update the minimum passes if the passes of the current station is less than the current minimum
    minPasses = Math.min(minPasses, station.passed);
    stations++
});

// Log the total failed tasks and minimum passes
console.log("Total failed tasks:", totalFailed);
console.log("Minimum passes:", minPasses);


  return (
    <div>
      <div className="dashboard__below_container">
        <div className="dashboard_container_leftbelowside">
          <div>
            <div>
              <p className="dashboard_content">
                <h4> Line {no} </h4>
              </p>
            </div>
            <div className="dashboard_content_leftbelowline"></div>
          </div>

          <div>
            <div>
              <p className="dashboard_content">
                <h4 style={{ display: "flex" }}>
                  Stations:&nbsp;{length}
                  {/* {lineData.stations_count &&
                    lineData.stations_count
                      .filter((item) => item.line_number == `${no}`)
                      .map((filteredItem) => (
                        <p key={filteredItem.line_number}>
                          {' '}{filteredItem.number_of_stations}
                        </p>
                      ))} */}
                </h4>
              </p>
            </div>
            <div className="dashboard_content_leftbelowline"></div>
          </div>

          {/* <div>
            <div>
              <p className="dashboard_content">
                <h4 style={{ display: "flex" }}>
                  {"Part Name: "}{partData}
                 
                </h4>
              </p>
            </div>
            <div className="dashboard_content_leftbelowline"></div>
          </div> */}
           {/* {lineData.part_data &&
                    lineData.part_data
                      .filter((part) => part.line_id === `${no}`)
                      .map((part) => (
                        <p key={part.line_id + part.part_id}>
                           {' '}{part.part_name}
                        </p>
                      ))} */}
        </div>

        <div className="dasboard_container_rightside">
          {/* <div>
            <div>
              <p className="dashboard_content">
                PARTS: <h4> 899/67</h4>
              </p>
            </div>
            <div className="dashboard_content_rightline"></div>
          </div> */}
          <div>
            <p className="dashboard_content">
            <h4>{processData.length === 1 ? processData[0].passed : minPasses} &nbsp;passed</h4>
            </p>
          </div>
          <div>
            <p className="dashboard_content">
              <h4>{totalFailed}&nbsp;failed</h4>
            </p>
          </div>
          <div>
            <p className="dashboard_content">
              <h4>{minPasses+totalFailed}&nbsp;Done</h4>
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard_card_content"></div>
    </div>
  );
}

export default Line;