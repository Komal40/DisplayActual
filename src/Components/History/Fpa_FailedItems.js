import React, { startTransition, useEffect, useState } from "react";
import DashBoardAbove from "../DashboardR/DashBoardAbove";
import { json, useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardAbove from "../DashboardR/DashBoardAbove";
import * as XLSX from 'xlsx';


function Fpa_FailedItems() {

  const [parts, setParts] = useState([]);
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("Token"));
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
  const tokenExpired = useTokenExpirationCheck(token, navigate);


    const getParts = async (e) => {
        const link = process.env.REACT_APP_BASE_URL;
        const endPoint = "/floorincharge/get_parts";
        const fullLink = link + endPoint;
    
        try {
          const response = await fetch(fullLink, {
            method: "GET",
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
    
          if (response.ok) {
            const data = await response.json();
            console.log("param", data.data);
            setParts(data.data);
          } else {
            console.error("Failed to fetch parts");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };
    
      useEffect(() => {
        getParts();
      }, []);


      const [failedItems, setFailedItems]=useState([])
    const fetchFpaFailedItems = async (e) => {
    
        if(selectedPart==""){
            toast.error("Select Part No")
            return;
        }
        
          const formattedDate = `${selectedDate.getFullYear()}-${
            selectedDate.getMonth() + 1 < 10
              ? "0" + (selectedDate.getMonth() + 1)
              : selectedDate.getMonth() + 1
          }-${selectedDate.getDate()}`;
    
        const link = process.env.REACT_APP_BASE_URL;
        const endPoint = "/floorincharge/failed_items_data";
        const fullLink = link + endPoint;
    
        try {
          const params = new URLSearchParams();
          params.append("part_no", selectedPart);
          params.append("date", formattedDate);

    
          const response = await fetch(fullLink, {
            method: "POST",
            body: params,
            headers: {
              "Content-type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${token}`,
            },
          });
    
          if (response) {
            const data = await response.json();
            if (response.ok) {
              console.log(data)
            //   setFailedItems(data.reasons)
             // Sort data by station_id
        const sortedData = data.reasons.sort((a, b) =>
            a.station_id.localeCompare(b.station_id)
          );
          setFailedItems(sortedData);
                
            } else {
              toast.error(data.Message);
            }
          }
        } catch (error) {
          console.error("Error :", error);
        }
      };

  const [selectedDate, setSelectedDate] = useState(new Date());
      const handleDateChange = (date) => {
        setSelectedDate(date);
      };

      const [selectedPart, setSelectedPart]=useState("")
      const handlePartChange = (e) => {
        setSelectedPart(e)
        //   setSelectedProcesses(prevProcesses => ({ ...prevProcesses, [stationId]: "" })); // Reset corresponding process information
      };


       // Process data to merge rows by station_id
  const processedData = failedItems.reduce((acc, item) => {
    const existing = acc.find((entry) => entry.station_id === item.station_id);
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({ station_id: item.station_id, items: [item] });
    }
    return acc;
  }, []);      



  const exportToExcel = () => {
    const worksheetData = processedData.map(entry =>
      entry.items.map((item, index) => ({
        'Station ID': index === 0 ? item.station_id : '',
        'Item ID': item.item_id,
        'Part No': item.part_no,
        'Reason': item.reason,
        'Reason ID': item.reason_id
      }))
    ).flat();

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: false });

    // Calculate column widths
    const columnWidths = worksheetData.reduce((acc, row) => {
      Object.keys(row).forEach((key, idx) => {
        const value = row[key] ? row[key].toString() : '';
        const width = value.length;
        acc[idx] = acc[idx] > width ? acc[idx] : width;
      });
      return acc;
    }, []);

    worksheet['!cols'] = columnWidths.map(width => ({ wch: width }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Failed Items");
    XLSX.writeFile(workbook, "FpaFailedItems.xlsx");
  };

  
  return (
    <>
    <ToastContainer />
    <div>
      <DashboardAbove />
    </div>

    <div className="history__main">
    <div className="history__above_data">
    <div className="history_head">
        <div className="history__contain">
          <p>Select Date:</p>
          <DatePicker
            className="date_picker"
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
          />         
        </div>
      </div>


          <div className="task__qty">
          <div className="update_dropdown">
                                <select
                                  onChange={(e) =>
                                    handlePartChange(e.target.value)
                                  }
                                  
                                >
                                  <option value="">Select</option>
                                  {parts &&
                                    parts.map((data, idx) => (
                                      <option key={idx} value={data.part_no}>
                                        {data.part_no}
                                      </option>
                                    ))}
                                </select>
                              </div>

          </div>
          
      <div>
        <button className="task_assign_btn" onClick={fetchFpaFailedItems}>Fetch Data</button>
      </div>
    </div>



    <div className="history__table">

    <div className="history_station_table">
    
    {
        processedData && 
        processedData.length > 0 ? (
            <>
            <div style={{marginBottom:'1rem'}}>
            <button onClick={exportToExcel} className="task_assign_btn">
              Export to Excel
            </button>
          </div>

<table className="station-table">
              <thead>
                <tr>
                  <th>Station ID</th>
                  <th>Item ID</th>
                  <th>Part No</th>
                  <th>Reason</th>
                  <th>Reason ID</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((entry) =>
                  entry.items.map((item, index) => (
                    <tr key={`${item.station_id}-${item.item_id}`}>
                      {index === 0 && (
                        <td rowSpan={entry.items.length}>{item.station_id}</td>
                      )}
                      <td>{item.item_id}</td>
                      <td>{item.part_no}</td>
                      <td>{item.reason}</td>
                      <td>{item.reason_id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </>
        ):''
        
    }
   
    </div>
    </div>
    </div>
  </>
  )
}

export default Fpa_FailedItems
