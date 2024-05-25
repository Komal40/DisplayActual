import React, { useState, useEffect } from "react";
import "./DeleteFloor.css";
import DashBoardAbove from "../DashboardR/DashBoardAbove";
import { useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DeleteFloor() {
  const navigate = useNavigate();

  const [selectedPartNo, setSelectedPartNo] = useState("");
  const [selectedProcessNo, setSelectedProcessNo] = useState("");
  const [paramNo, setParamNo] = useState("");
  const [parts, setParts] = useState([]);
  const [processName, setProcessName] = useState([]);
  const [parameters, setParameters] = useState([]);
  const token = JSON.parse(localStorage.getItem("Token"));
  const [constVal, setConstVal] = useState({});
  const tokenExpired = useTokenExpirationCheck(token, navigate);

  const handlePartChange = (e) => {
    const selectedPartNo = e.target.value;
    setSelectedPartNo(selectedPartNo);
  };

  const handleProcessChange = (e) => {
    const val = e.target.value;
    setSelectedProcessNo(val);
  };

  const handleParamNo = (e) => {
    const val = e.target.value;
    setParamNo(val);
    console.log("val", val);
    // USL LSL A2 D2
    const getconstvalue = async (val) => {
      // e.preventDefault();
      const link = process.env.REACT_APP_BASE_URL;
      const endPoint = "/floorincharge/get_readings_values_of_param";
      const fullLink = link + endPoint;

      try {
        const params = new URLSearchParams();
        params.append("parameter_no", val);

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
          setConstVal(data.Datas);
        } else {
          console.error("Failed to fetch parts", response.error);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    getconstvalue(val);
  };

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

  const getProcesses = async (e) => {
    // e.preventDefault();
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/get_processes";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("part_no", selectedPartNo);

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

        setProcessName(data.data);
        console.log("object processName", processName);
      } else {
        console.error("Failed to fetch parts", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (selectedPartNo) {
      getProcesses(selectedPartNo);
    }
  }, [selectedPartNo]);

  useEffect(() => {
    if (selectedProcessNo) {
      getParameterNo();
    }
  }, [selectedProcessNo]);

  const getParameterNo = async (e) => {
    // e.preventDefault();
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/get_parameter";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("part_no", selectedPartNo);
      params.append("process_no", selectedProcessNo);

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
        setParameters(data.data);
        // const availableParameters = data.data.filter(
        //   (param) => param.readings_is_available
        // );
        // setParameters(availableParameters);
        console.log("object processName", processName);
      } else {
        console.error("Failed to fetch parts", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };


  const handleDeletePartNo = async (part) => {
    
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/delete_part";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("part_no", part);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response) {
        const data=await response.json()
        if(response.ok){
            toast.success(`Part ${part} Deleted Successfully`)
            setSelectedPartNo("")
        }
       else {
        toast.error(data.Message);
      }
    }
 } catch (error) {
      console.error("Error :", error);
    }
  };

  const handleDeleteProcessNo = async (process) => {   
    
    if(!process){
        toast.error("No Process Found");
        return;
    }
    
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/delete_processes";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("process_no", process);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response) {
        const data=await response.json()
        if(response.ok){
            toast.success(`Process ${process} Deleted Successfully`)
            setSelectedProcessNo("")            
        }
       else {
        toast.error(data.Message);
      }
    }
 } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteParameterNo = async (para) => {
    
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/delete_parameter";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("parameter_no", para);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response) {
        const data=await response.json()
        if(response.ok){
            toast.success(`Parameter ${para} Deleted Successfully`)
            setParamNo("")
        }
       else {
        toast.error(data.Message);
      }
    }
 } catch (error) {
      console.error("Error :", error);
    }
  };

  return (
    <>
    <ToastContainer/>
      <div>
        <DashBoardAbove />
      </div>

      <div className="delete_floor_container">
        <div>
          <div className="delete_head">
            <div>
            <div className="delete_drop_head">
            <p>Select Part:</p>
            <div className="update_dropdown">
              <select onChange={handlePartChange}>
                <option>Select</option>
                {parts &&
                  parts.map((part, index) => (
                    <option key={index} value={part.part_no}>
                      {part.part_no}
                    </option>
                  ))}
              </select>
            </div>
            </div>
            
            <div className="dlt_part_data">
            <div>Delete Part:</div>
            <div>{selectedPartNo}</div>
            <div>
              <button className="task_assign_btn" onClick={(e)=>handleDeletePartNo(selectedPartNo)}>Delete</button>
            </div>
            </div>
            </div>
          </div>

          <div className="delete_head">
            <div className="delete_drop_head">
            <p>Select Process:</p>
            <div className="update_dropdown">
              <select onChange={handleProcessChange}>
                <option>Select</option>
                {processName &&
                  processName.map((part, index) => (
                    <option key={index} value={part.process_no}>
                      {part.process_no}
                    </option>
                  ))}
              </select>
            </div>
            </div>

            <div className="dlt_part_data">
            <div>Delete Process:</div>
            <div>{selectedProcessNo}</div>
            <div>
              <button className="task_assign_btn" onClick={(e)=>handleDeleteProcessNo(selectedProcessNo)}>Delete</button>
            </div>
            </div>
            
          </div>

          <div className="delete_head">
            <div className="delete_drop_head">
            <p>Parameter No:</p>
            <div className="update_dropdown">
              <select onChange={handleParamNo}>
                <option>Select</option>
                {parameters &&
                  parameters.map((part, index) => (
                    <option key={index} value={part.parameter_no}>
                      {part.parameter_no}
                    </option>
                  ))}
              </select>
            </div>
            </div>
            <div className="dlt_part_data">
            <div>Delete Parameter No:</div>
            <div>{paramNo}</div>
            <div>
              <button className="task_assign_btn" onClick={(e)=>handleDeleteParameterNo(paramNo)}>Delete</button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
