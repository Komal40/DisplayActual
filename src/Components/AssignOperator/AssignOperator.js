import React from 'react'
import './AssignOpertor.css'
import DashboardR from '../DashboardR/DashboardR'

export default function AssignOperator() {

    const stationData=JSON.parse(localStorage.getItem("stationData"));
    const stations=stationData.stations

    const extractStationIds = (stations) => {
        const stationIds = [];
        for (const stationList of Object.values(stations)) {
          stationIds.push(...stationList);
        }
        return stationIds;
      };
    
      const stationIds = extractStationIds(stations);


  return (
    <>
    <div>
        <DashboardR/>
    </div>
    <div>
    <div className="parts_container">

        <div className="parts_details">
       <div className='assignOpt_shift'>
       <p>
        Select Shift: </p>
              <div className="update_dropdown">
              <select  >
                <option value="">Shift</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
              </div>       
       </div>
       
      <div className='assignOpt_shift'>
      <p>
            Select Station Id : </p>
            <div className="update_dropdown">
              <select  >
              <option value="">Station id</option>
                  {stationIds.map((id) => (
                    <option key={id} value={id}>{id}</option>
                  ))}
              </select>
              </div>
      </div>
         
         
          <p>
            Enter Employee Id:
            <input
              placeholder="Employee Id"              
              required
            />
          </p>

          
          
        </div>

        <div className="parts_add">
          <button >ADD</button>
        </div>
      </div>
    </div>
    </>
  )
}
