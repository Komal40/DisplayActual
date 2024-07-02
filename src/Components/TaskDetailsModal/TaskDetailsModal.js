

// import React from "react";
// import "./CustomModal.css";

// const CustomModal = ({ show, onHide, taskArray, handleAssign }) => {
//   if (!show) return null;

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <div className="modal-header">
//           <h5 className="modal-title">Task Details</h5>
//           <button className="close-button" onClick={onHide}>
//             &times;
//           </button>
//         </div>
//         <div className="modal-body">
//           {taskArray.length > 0 ? (
//             <ul>
//               {taskArray.map((task, index) => (
//                 <li key={index}>
//                   <p>Station ID: {task.station_id}</p>
//                   <p>Employee ID: {task.employee_id}</p>
//                   <p>Part No: {task.part_no}</p>
//                   <p>Process No: {task.process_no}</p>
//                   <p>Shift: {task.shift}</p>
//                   <p>Start Shift Time: {task.start_shift_time}</p>
//                   <p>End Shift Time: {task.end_shift_time}</p>
//                   <p>Task ID: {task.temp_task_id}</p>
//                   <p>Total Assigned Task: {task.total_assigned_task}</p>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No tasks to display</p>
//           )}
//         </div>
//         <div className="modal-footer">
//           <button className="button secondary" onClick={onHide}>
//             Cancel
//           </button>
//           <button className="button primary" onClick={handleAssign}>
//             Assign Task
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomModal;





import React from "react";
import { Modal, Button } from "react-bootstrap";

const TaskDetailsModal = ({ show, onHide, taskArray, handleAssign }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Task Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {taskArray.length > 0 ? (
          <table className="station-table small-font">
            <thead>
              <tr>
                <th>Station ID</th>
                <th>Employee ID</th>
                <th>Part No</th>
                <th>Process No</th>
                <th>Shift</th>
                <th>Start Shift Time</th>
                <th>End Shift Time</th>
                <th>Task ID</th>
                <th>Total Assigned Task</th>
              </tr>
            </thead>
            <tbody>
              {taskArray.map((task, index) => (
                <tr key={index}>
                  <td>{task.station_id}</td>
                  <td>{task.employee_id}</td>
                  <td>{task.part_no}</td>
                  <td>{task.process_no}</td>
                  <td>{task.shift}</td>
                  <td>{task.start_shift_time}</td>
                  <td>{task.end_shift_time}</td>
                  <td>{task.temp_task_id}</td>
                  <td>{task.total_assigned_task}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No tasks to display</p>
        )}
      </Modal.Body>
      <Modal.Footer>
      {/* <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleAssign}>
          Assign Task
        </Button> */}
      <div style={{display:'flex'}}>
      <button className="task_assign_btn" style={{fontSize:'0.8rem'}} onClick={onHide} >
Cancel
        </button>
        <button className="task_assign_btn" style={{fontSize:'0.8rem'}} onClick={handleAssign}>
Assign 
        </button>
      </div>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskDetailsModal;

