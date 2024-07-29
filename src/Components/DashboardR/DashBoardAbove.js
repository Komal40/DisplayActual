import React, { useState, useEffect, useRef } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import "./DashboardAbove.css";
// import beep from '../../../src/beep.mp3'
import beep from "../../beep.mp3";
import { io as socketIOClient } from "socket.io-client";

const DashboardAbove = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
  const prevNotificationsRef = useRef(notifications);

  // const [approvedNotifications, setApprovedNotifications] = useState(() => {
  // Initialize from localStorage if available, otherwise, use an empty array
  //   const storedApprovedNotifications = localStorage.getItem("approvedNotifications");
  //   return storedApprovedNotifications ? JSON.parse(storedApprovedNotifications) : [];
  // });
  const userData = JSON.parse(localStorage.getItem("Login"));
  const token = JSON.parse(localStorage.getItem("Token"));

  // beep sound
  const beepSound = useRef(null);
  useEffect(() => {
    // Initialize beep sound
    beepSound.current = new Audio(beep); // Replace with your beep sound path
  }, []);

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

  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const fetchNotifications = async () => {
    setShowModal(true);
    setHasNewNotifications(false);
  };

  
  // websocket
  useEffect(() => {
    const link = "ws://192.168.1.2:5000";
    const socket = socketIOClient(link, {
      transports: ["websocket"],
      withCredentials: true,
    });

    // Send messages after the socket connection is established
    socket.on("connect", () => {
      console.log("WebSocket connected");
      socket.emit("get_floor_csp_notification_filter", floor_no);
    });

    socket.on("filter_floor_csp_notification", (data) => {
      console.log("Received update from WebSocket:", data);
      //  setNotifications(data.floor_csp_notification_data)
      //  setHasNewNotifications(true);

      // Check if the length of notifications increased
      if (
        data.floor_csp_notification_data.length >
        prevNotificationsRef.current.length
      ) {
        setHasNewNotifications(true);
        // playBeepSound();
      }

      // Update notifications
      setNotifications(data.floor_csp_notification_data);
      prevNotificationsRef.current = data.floor_csp_notification_data;
    });
    return () => {
      socket.disconnect(); // Cleanup on component unmount
    };
  }, []);

  const playBeepSound = () => {
    if (beepSound.current) {
      beepSound.current.play();
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
        const updatedNotifications = notifications.filter(
          (notification) => notification.notification_id !== id
        );
        setNotifications(updatedNotifications);
        // toast.success("Notification deleted successfully");
      } else {
        console.error("Failed to delete notification", response.status);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // useEffect(() => {

  //   localStorage.setItem("approvedNotifications", JSON.stringify(approvedNotifications));
  // }, [approvedNotifications]);

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
          notification.notification_id === id
            ? { ...notification, approved: true }
            : notification
        );
        setNotifications(updatedNotifications);
        // setApprovedNotifications([...approvedNotifications, id]);
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

  // const groupNotificationsByStation = () => {
  //   return notifications.reduce((acc, notification) => {
  //     if (!acc[notification.station_id]) {
  //       acc[notification.station_id] = [];
  //     }
  //     acc[notification.station_id].push(notification);
  //     return acc;
  //   }, {});
  // };

  const groupNotificationsByStation = () => {
    // Sort notifications by date and time
    const sortedNotifications = [...notifications].sort((a, b) => {
      const dateA = new Date(`${a.created_date} ${a.created_time}`);
      const dateB = new Date(`${b.created_date} ${b.created_time}`);
      return dateB - dateA; // Newest first
    });

    // Group notifications by station
    return sortedNotifications.reduce((acc, notification) => {
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
            Name: &nbsp;
            <h4>
              {userData ? `${userData.fName} ${userData.lName}` : "Loading..."}
            </h4>
          </p>
        </div>
        <div>
          <p className="dashboard_content">
            User Id:&nbsp; <h4>{userData ? userData.employee_id : ""}</h4>
          </p>
        </div>
        <div className="date_time">
          <p className="dashboard_content" >{formattedDateTime()}</p>
        </div>
        <div className="dashboard_content">
          <div
            className="notification-bell-container"
            onClick={fetchNotifications}
          >
            <IoNotificationsOutline className="notify_bell" />
            {hasNewNotifications && <span className="red-dot"></span>}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="notify_modal" onClick={handleModalClick}>
          <div className="notify_modal-content">
            <div className="notification-header">
              <h2>Notifications</h2>
              <span
                className="notify_close"
                onClick={() => setShowModal(false)}
              >
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
                    // .reverse() // Reverse the array
                    .map((notification, index) => (
                      <div
                        key={notification.notification_id}
                        className="notification-item"
                      >
                        <p className="time">{`${notification.created_time} on ${notification.created_date}`}</p>
                        <p className="content">{`${notification.csp_id}. ${notification.csp_name}`}</p>
                        <div className="notification-buttons">
                          <button
                            className={`approved ${
                              notification.approved_status
                                ? "approved-text"
                                : ""
                            }`}
                            onClick={() =>
                              handleApprovedNotification(
                                notification.notification_id
                              )
                            }
                            // disabled={approvedNotifications.includes(notification.notification_id)}
                          >
                            {/* {approvedNotifications.includes(notification.notification_id) ? "Approved" : "Approve"} */}
                            {notification.approved_status
                              ? "Approved"
                              : "Approve"}
                          </button>
                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDeleteNotification(
                                notification.notification_id
                              )
                            }
                          >
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
