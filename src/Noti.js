import React, { useState, useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import "./DashboardAbove.css";

const DashboardAbove = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [approvedNotifications, setApprovedNotifications] = useState(() => {
    // Initialize from localStorage if available, otherwise, use an empty array
    const storedApprovedNotifications = localStorage.getItem("approvedNotifications");
    return storedApprovedNotifications ? JSON.parse(storedApprovedNotifications) : [];
  });
  const userData = JSON.parse(localStorage.getItem("Login"));
  const token = JSON.parse(localStorage.getItem("Token"));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);


  const formattedDateTime = () => {
        const suffixes = ["st", "nd", "rd"];
        const currentDate = new Date();
    
          // Get the date components
          const day = currentDate.getDate();
          const monthName = currentDate.toLocaleString("en-US", { month: "short" });
          const year = currentDate.getFullYear();
      
          // Get the time components
          const hours = currentDate.getHours();
          const minutes = currentDate.getMinutes();
          const seconds = currentDate.getSeconds();
          let daySuffix = "th";
        if (day >= 1 && day <= 3) {
          daySuffix = suffixes[day - 1] || "th";
        }
    
        const formattedDate = `${day}${daySuffix} ${monthName} ${year}`;
        const formattedTime = `${hours}:${minutes}:${seconds}`;
    
        // return currentDate.toLocaleString("en-US", {
        //   hour: "numeric",
        //   minute: "numeric",   
        //   second: "numeric",
        //   hour12: true,
        // });
        return `${formattedDate} : ${formattedTime}`;
        
      }; 

  const fetchNotifications = async () => {
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/get_notifications";
    const fullLink = link + endPoint;
  
    try {
      const params = new URLSearchParams();
      params.append("floor_no", userData?.floor_no);
  
      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        // Set approved status for each notification
        const updatedNotifications = data.Notifications.map(notification => ({
          ...notification,
          approved: approvedNotifications.includes(notification.notification_id)
        }));
        setNotifications(updatedNotifications);
        setShowModal(true);
      } else {
        console.error("Failed to fetch notifications", response.status);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  

  const handleDeleteNotification = async (id) => {
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/delete_notification";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("notification_id", id);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedNotifications = notifications.filter((notification) => notification.notification_id !== id);
        setNotifications(updatedNotifications);
        // toast.success("Notification deleted successfully");
      } else {
        console.error("Failed to delete notification", response.status);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };
  useEffect(() => {
    // Store approvedNotifications in localStorage whenever it changes
    localStorage.setItem("approvedNotifications", JSON.stringify(approvedNotifications));
  }, [approvedNotifications]);

  const handleApprovedNotification = async (id) => {
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/approve_notifications";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("notification_id", id);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedNotifications = notifications.map((notification) =>
          notification.notification_id === id ? { ...notification, approved: true } : notification
        );
        setNotifications(updatedNotifications);
        setApprovedNotifications([...approvedNotifications, id]);
        // toast.success("Notification approved successfully");
      } else {
        console.error("Failed to approve notification", response.status);
      }
    } catch (error) {
      console.error("Error approving notification:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleModalClick = (e) => {
    if (e.target.className === "notify_modal") {
      closeModal();
    }
  };

  const groupNotificationsByStation = () => {
    return notifications.reduce((acc, notification) => {
      if (!acc[notification.station_id]) {
        acc[notification.station_id] = [];
      }
      acc[notification.station_id].push(notification);
      return acc;
    }, {});
  };

  const groupedNotifications = groupNotificationsByStation();


  return (
    <div className="dashboard_container">
    
      <div className="dashboard_navbar">
        <div>
          <p className="dashboard_content">
            Name: &nbsp;<h4>{userData ? `${userData.fName} ${userData.lName}` : "Loading..."}</h4>
          </p>
        </div>
        <div>
          <p className="dashboard_content">
            User Id:&nbsp; <h4>{userData ? userData.employee_id : ""}</h4>
          </p>
        </div>
        <div className="date_time">
          <p className="dashboard_content">{formattedDateTime()}</p>
        </div>
        <div className="dashboard_content">
          <IoNotificationsOutline className="notify_bell" onClick={fetchNotifications} />
        </div>
      </div>
      
      {showModal && (
  <div className="notify_modal" onClick={handleModalClick}>
    <div className="notify_modal-content">
      <div className="notification-header">
        <h2>Notifications</h2>
        <span className="notify_close" onClick={() => setShowModal(false)}>
          &times;
        </span>
      </div>
      <div className="notification-list">
        {Object.keys(groupedNotifications).map((stationId) => (
          <div key={stationId} className="notification-group">
            <div className="notification-group-header">
              <h3>Station {stationId}</h3>
            </div>
            {groupedNotifications[stationId]
              .slice() // Create a copy of the array
              .reverse() // Reverse the array
              .map((notification, index) => (
                <div key={notification.notification_id} className="notification-item">
                  <p className="time">{`${notification.created_time} on ${notification.created_date}`}</p>
                  <p className="content">{`${index + 1}. ${notification.csp_name}`}</p>
                  <div className="notification-buttons">
                    <button
                      className={`approved ${notification.approved ? 'approved-text' : ''}`}
                      onClick={() => handleApprovedNotification(notification.notification_id)}
                      disabled={approvedNotifications.includes(notification.notification_id)}
                    >
                      {approvedNotifications.includes(notification.notification_id) ? "Approved" : "Approve"}
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteNotification(notification.notification_id)}>
                      &times;
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default DashboardAbove;

// import React, { useState, useEffect } from "react";
// import { IoNotificationsOutline } from "react-icons/io5";
// import "./DashboardAbove.css";

// const DashBoardAbove = () => {
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [showModal, setShowModal] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const userData = JSON.parse(localStorage.getItem("Login"));
//   const token = JSON.parse(localStorage.getItem("Token"));

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);
//     return () => clearInterval(intervalId);
//   }, []);

//   const formattedDateTime = () => {
//     const suffixes = ["st", "nd", "rd"];
//     const currentDate = new Date();

//       // Get the date components
//       const day = currentDate.getDate();
//       const monthName = currentDate.toLocaleString("en-US", { month: "short" });
//       const year = currentDate.getFullYear();
  
//       // Get the time components
//       const hours = currentDate.getHours();
//       const minutes = currentDate.getMinutes();
//       const seconds = currentDate.getSeconds();
//       let daySuffix = "th";
//     if (day >= 1 && day <= 3) {
//       daySuffix = suffixes[day - 1] || "th";
//     }

//     const formattedDate = `${day}${daySuffix} ${monthName} ${year}`;
//     const formattedTime = `${hours}:${minutes}:${seconds}`;

//     // return currentDate.toLocaleString("en-US", {
//     //   hour: "numeric",
//     //   minute: "numeric",   
//     //   second: "numeric",
//     //   hour12: true,
//     // });
//     return `${formattedDate} : ${formattedTime}`;
    
//   }; 

//   const handleShowNotifications = async () => {
//     const link = process.env.REACT_APP_BASE_URL;
//     const endPoint = "/floorincharge/get_notifications";
//     const fullLink = link + endPoint;

//     try {
//       const params = new URLSearchParams();
//       params.append("floor_no", userData?.floor_no);

//       const response = await fetch(fullLink, {
//         method: "POST",
//         body: params,
//         headers: {
//           "Content-type": "application/x-www-form-urlencoded",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setNotifications(data.Notifications);
//         setShowModal(true);
//       } else {
//         console.error("Failed to fetch notifications", response.status);
//       }
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     }
//   };

//   const handleDeleteNotification = async (id) => {
//     const link = process.env.REACT_APP_BASE_URL;
//     const endPoint = "/floorincharge/delete_notification";
//     const fullLink = link + endPoint;

//     try {
//       const params = new URLSearchParams();
//       params.append("notification_id", id);

//       const response = await fetch(fullLink, {
//         method: "POST",
//         body: params,
//         headers: {
//           "Content-type": "application/x-www-form-urlencoded",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         const updatedNotifications = notifications.filter((notification) => notification.notification_id !== id);
//         setNotifications(updatedNotifications);
//       } else {
//         console.error("Failed to delete notification", response.status);
//       }
//     } catch (error) {
//       console.error("Error deleting notification:", error);
//     }
//   };

//   return (
//     <div className="dashboard_container">
//       <div className="dashboard_navbar">
//         <div>
//           <p className="dashboard_content">
//             Name: &nbsp;<h4>{userData ? `${userData.fName} ${userData.lName}` : "Loading..."}</h4>
//           </p>
//         </div>
//         <div>
//           <p className="dashboard_content">
//             User Id:&nbsp; <h4>{userData ? userData.employee_id : ""}</h4>
//           </p>
//         </div>
//         <div className="date_time">
//           <p className="dashboard_content">{formattedDateTime()}</p>
//         </div>
//         <div className="dashboard_content">
//           <IoNotificationsOutline className="notify_bell" onClick={handleShowNotifications} />
//         </div>
//       </div>
//       {showModal && (
//         <div className="notify_modal">
//           <div className="notify_modal-content">
//             <span className="notify_close" onClick={() => setShowModal(false)}>
//               &times;
//             </span>
//             <h2>Notifications</h2>
//             <ul className="notification-list">
//               {notifications.map((notification, index) => (
//                 <li key={notification.notification_id} className="notification-item">
//                   <p>
//                     <span>{`${index + 1}. ${notification.csp_name} at ${notification.station_id}, created at ${notification.created_time} on ${notification.created_date}`}</span>
//                     <button className="delete-button" onClick={() => handleDeleteNotification(notification.notification_id)}>
//                       &times;
//                     </button>
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DashBoardAbove;






// .notify_modal {
//     display: block;
//     position: fixed;
//     z-index: 1000;
//     left: 0;
//     top: 0;
//     width: 100%;
//     height: 100%;
//     overflow: auto;
//     background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
//     padding: 20px;
//   }
  
//   .notify_modal-content {
//     background-color: #fefefe;
//     margin: 5% auto;
//     border: 1px solid #888;
//     width: 60%;
//     max-width: 80%;
//     max-height: 80%;
//     overflow-y: auto;
//     position: relative;
//     border-radius: 10px;
//   }
  
//   .notify_close {
//     position: absolute;
//     top: 20px;
//     right: 20px;
//     cursor: pointer;
//     font-size: 20px;
//     color: #aaa;
//     font-weight: bold;
//     z-index: 1001; /* Ensure it stays above the modal content */
//   }
  
//   .notify_close:hover,
//   .notify_close:focus {
//     color: black;
//     text-decoration: none;
//   }
  
//   .notification-header {
//     position: sticky;
//     top: 0;
//     left: 0;
//     right: 0;
//     background-color: #fefefe;
//     z-index: 1000; /* Ensure it stays above the modal content */
//     padding: 10px 20px;
//     border-bottom: 1px solid #888;
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//   }
  
//   .notification-list {
//     list-style-type: none;
//     padding: 0;
//   }
  
//   .notification-item {
//     position: relative;
//     margin-bottom: 10px;
//     padding: 10px;
//     width: 100%;
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//   }
  
//   .notification-item p {
//     display: flex;
//     align-items: center;
//   }
  
//   .notification-item p span {
//     flex-grow: 1;
//     margin-right: 10px;
//   }
  
//   .time {
//     font-size: 12px;
//     color: #888;
//     position: absolute;
//     top: -1;
//     right: 0;
//   }
  
//   .station {
//     font-weight: bold;
//   }
  
//   .content {
//     flex: 1;
//     margin-right: 10px;
//   }
  
//   .notification-buttons {
//     display: flex;
//     align-items: center;
//   }
  
//   .notification-buttons button {
//     margin-left: 10px;
//   }
  
//   .approved {
//     background-color:rgb(43, 0, 255);
//     color: white;
//     border: none;
//     padding: 10px 20px;
//     cursor: pointer;
//     margin-top: 10px;
//     border-radius: 10px;
//     width: 100px;
//   }
  
//   .approved.approved-text {
//     background-color: green;
//   }
  
//   .approved:hover {
//     background: rgb(147, 164, 147);
//     color: black;
//   }
  
//   .delete-button {
//     background-color: transparent;
//     border: 1px solid red;
//     font-size: 18px;
//     color:red;
//     cursor: pointer;
//     margin-top: 6px;
//     padding: 0 5px;
//   }
  
//   .delete-button:hover {
//     color: darkred;
//   }
  
//   .approved-text {
//     border-radius: 10px;
//     background: green;
//     color: white;
//   }
  
//   .notification-group {
//     border: 1px solid #ccc;
//     padding: 10px;
//     margin-bottom: 10px;
//   }
  
//   .notification-group-header {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-bottom: 10px;
//   }
  
//   .notification-item .time {
//     flex: 0 0 180px;
//     margin-right: 10px;
//   }
  
//   .notification-item {
//     position: relative;
//   }
  
//   .time {
//     position: absolute;
//     top: 0;
//     right: 0;
//   }
  
//   .approved-text {
//     border-radius: 10px;
//     background: green;
//     color: white;
//   }
  


