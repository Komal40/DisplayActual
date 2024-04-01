import React from 'react'
import './Task.css'
import DashBoardAbove from '../DashboardR/DashBoardAbove'



function Task() {

  return (
    <>
    
    <div>
        <DashBoardAbove/>
    </div>

    <div className='task__main'>
        <div className='task__head'>
            <div className='task_left_head'>
            <p className='task_left_view'>View Running Task</p>
            <button className='task_left_btn'>View</button>
            </div>

            <div className='task_right_head'>
                <p className='task_right_view'>Add Previous Task to Logs</p>
                <button className='task_right_btn'>Add</button>
            </div>
        </div>
        <hr/>

        <div className='task_buttons'>

        </div>

        <div className='task_qty_section'>
<div className='task__qty'>
    <p >Enter Quantity</p>
    <input className='task_qty_input'/>
    <p>Or</p>
    <button className='task_qty_btn'>Fetch From Quantity</button>
</div>

<div className='task_dropdown'>
      <p>Select Part Name:</p>
            <div className="update_dropdown">
            <select>
                            <option>Select</option>
                            

                        </select>      
            </div>
      </div>
        </div>

        <div className='task_stations_container'>
        <div className='task_stations'>
<div className='task_stations_left'>
    <h4>F01 L02 S02</h4>
    <div className='task_stations_part'>
    <p>Part: IMF 001</p>
    </div>
    <div  className='task_stations_part'>
    <p>Process: IMF 001</p>
    </div>
    <div  className='task_stations_part'>
    <p>Employee:</p>
    </div>
</div>

<div className='task_stations_right'>
    <input className='task_station_input'/>
    <div className='task_dropdown'>
    <select><option>Change</option></select>
    </div>
    <div className='task_dropdown'>
    <select><option>Change</option></select>
    </div> <div className='task_dropdown'>
    <select><option>Change</option></select>
    </div>
</div>
</div>

        </div>
    </div>
    </>
  )
}

export default Task;

