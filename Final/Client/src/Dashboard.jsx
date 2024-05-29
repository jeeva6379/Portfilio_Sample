import { useState, useRef } from "react";
import { useEffect } from "react";

import { Link } from "react-router-dom";
import axios from "axios";

import "./Dashboard.css";

const Dashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [filterSubmittedSheets, setFilterSubmittedSheets] = useState(false);
  const [showCreateNewGoalSheet, setShowCreateNewGoalSheet] = useState(false);
  const [allGoalSheets, setAllGoalSheets] = useState([]);
  const [filteredGoalSheets, setFilteredGoalSheets] = useState([]);
  
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const queryParam = params.get("q");
 
  useEffect(() => {
    if (queryParam === "submitted-goal-sheets") {
      setFilterSubmittedSheets(true);
      setShowCreateNewGoalSheet(false);
    } else if (queryParam === "create-goal-sheet") {
      setShowCreateNewGoalSheet(true);
      setFilterSubmittedSheets(false);
    }
  }, [queryParam]);


  const titleRef = useRef("");
  const descRef = useRef("");

  // Get item from local storage
  const userRole = localStorage.getItem("user_role");

  const createNewGoalSheet = async () => {
    if (titleRef.current.value === "")
      return console.error("Name field is empty");
    if (descRef.current.value === "")
      return console.error("Description field is empty");
    try {
      const formData = new FormData();
      formData.append("title", titleRef.current.value);
      formData.append("description", descRef.current.value);

      // Send a POST request to the server to create a new goal sheet
      const response = await axios.post(
        `${API_URL}/api/goal-sheets`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      getAllGoalSheets();
      window.location.href = `/goal-sheet/${response.data.id}`;
    } catch (error) {
      // Log any errors that occurred during the fetch request
      console.error("Error:", error);
    }
  };

  const getAllGoalSheets = async () => {
    try {
      // Send a POST request to the server to create a new goal sheet
      const response = await axios.get(`${API_URL}/api/all-goal-sheets`, {
        headers: { "Content-Type": "application/json" },
      });
      const sheets = response.data;
      setAllGoalSheets(sheets); 
    } catch (error) {
      // Log any errors that occurred during the fetch request
      console.error("Error:", error);
    }
  };

  useEffect(  () => {
    getAllGoalSheets();
  }, []);


  useEffect(() => {
    if (filterSubmittedSheets) {
      const filteredSheets = allGoalSheets.filter((sheet) => sheet.sheetSubmitted);
      setFilteredGoalSheets(filteredSheets);
    }
  }, [filterSubmittedSheets, allGoalSheets]);

  const handleDeleteGoalSheet = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/delete-goal-sheet/${id}`, {
        headers: { "Content-Type": "application/json" },
      });
      getAllGoalSheets();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <hr />
      {userRole === "Employee" && (
        <button
          onClick={() => {
            setShowCreateNewGoalSheet(true);
          }}
        >
          create new goal sheet
        </button>
      )}
      {userRole === "HR" && (
        <button onClick={() => (window.location.href = "createnewuser")}>
          Create New User
        </button>
      )}

      {showCreateNewGoalSheet && (
        <div className="p-2">
          <div className="text-center p-3">Create New Goal Sheet</div>
          <div className="p-2">
            <input ref={titleRef} type="text" placeholder="Goal Sheet Title" />
          </div>
          <div className="p-2">
            <input ref={descRef} type="text" placeholder="Description" />
          </div>
          <div className="p-2 text-center">
            <button onClick={createNewGoalSheet} className="btn btn-primary">
              Submit
            </button>
          </div>
          <hr />
        </div>
      )}
      <div className="mt-4">
        <h4>{filterSubmittedSheets && "Submitted"} Goal Sheets</h4>
        <div className="mt-4" style={{ overflowX: "auto" }}>
          { filterSubmittedSheets && (filteredGoalSheets.length > 0 ? (
            <table className="table ">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Tasks</th>
                  <th>Status</th>
                  <th>Reporting manager status</th>
                  {userRole === "Employee" && ( <th>Actions</th> )}
                </tr>
              </thead>
              <tbody>
                {filteredGoalSheets.map((sheet) => (
                  <tr key={sheet._id}>
                    <td>{sheet.title}</td>
                    <td>{sheet.description}</td>
                    <td>{sheet.tasks.length}</td>

                 
                    {userRole === "Employee" && sheet.sheetSubmitted && (
                      <td>Submitted</td>
                    )}
                    <td>{sheet.sheetStatus}</td>

                    {userRole === "Employee" && (
                   <>
                     <td >
                     <div className="d-flex">
                        <Link to={`/goal-sheet/${sheet._id}`}>
                          <button style={{minWidth:'80px'}}  className="btn  btn-sm rounded-pill btn-success me-2 mb-2"   >Edit</button>
                          <button  style={{minWidth:'80px'}} className="btn  btn-sm rounded-pill btn-outline-success mb-2"     onClick={() => handleDeleteGoalSheet(sheet._id)} > Delete </button>
                        </Link>
                     </div> 
                      </td>
  
                         
                   </>
                        
                    )}
                    {userRole !== "Employee" && (
                      <td>
                        {" "}
                        <Link to={`/goal-sheet/${sheet._id}`}>
                          <button style={{minWidth:'80px'}} className="btn  btn-sm rounded-pill btn-outline-success mb-2"> View</button>
                        </Link>
                      </td>
                    )}
                  </tr>
                 ))} 
                 </tbody></table>
                )
                : (
                  <div className="text-center opacity-50">
                    You have no goal sheets to display.
                  </div>
                ))}
                { !filterSubmittedSheets && (allGoalSheets.length > 0 ? (
                <table className="table ">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Tasks</th>
                  <th>Status</th>
                  <th>Reporting Manager status</th>
                  {userRole === "Employee" && ( <th>Actions</th> )}
                </tr>
              </thead>
              <tbody> {allGoalSheets.map((sheet) => (
                  <tr key={sheet._id}>
                    <td>{sheet.title}</td>
                    <td>{sheet.description}</td>
                    <td>{sheet.tasks.length}</td>

              
                    {userRole === "Employee" && sheet.sheetSubmitted && (
                      <td>Submitted</td>
                    )}
                    <td>{sheet.sheetStatus}</td>

                    {userRole === "Employee" && (
                      <td>
                        <Link to={`/goal-sheet/${sheet._id}`}>
                          <button style={{minWidth:'80px'}}  className="btn  btn-sm rounded-pill btn-success me-2 mb-2" >Edit</button>
                          <button  style={{minWidth:'80px'}} className="btn  btn-sm rounded-pill btn-outline-success mb-2" onClick={() => handleDeleteGoalSheet(sheet._id)} > Delete </button>

                        </Link>
                        
                    
                    
                      </td>
                    )}
                    {userRole !== "Employee" && (
                      <td>
                        {" "}
                        <Link to={`/goal-sheet/${sheet._id}`}>
                          <button style={{minWidth:'80px'}} className="btn  btn-sm rounded-pill btn-outline-success mb-2">View</button>
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center opacity-50">
              You have no goal sheets to display.
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
