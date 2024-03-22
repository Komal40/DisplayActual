import React from 'react'
import './Process.css'
import DashboardR from '../DashboardR/DashboardR'

function Process() {
  return (
    <div>
      <div>
        <DashboardR/>
      </div>

      <div className='process_container'>
      <div className='process_head'>
      <p>Select Part Name:</p>
            <div className="update_dropdown">
              <select>
                <option>Select </option>
              </select>          
            </div>
      </div>

      <div className="parts_details">
            <p>Enter Process Name:<input placeholder="Process Name"/></p>
            <p>Enter Process Id:<input placeholder="Process Id"/></p>
        </div>


        <div className="parts_add">
            <button>ADD</button>
        </div>

<div className='process_err'>
    <p>Error Message:</p>
</div>
      </div>
    </div>
  )
}

export default Process;
