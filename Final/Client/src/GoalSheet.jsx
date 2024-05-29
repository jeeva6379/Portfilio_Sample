import { useEffect, useRef, useState } from "react";

import axios from "axios";
import { useParams } from "react-router-dom";
import TaskForm from "./components/TaskForm";
import Task from "./components/Task";

import "./GoalSheet.css";

const GoalSheet = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [allTask, setAllTask] = useState([]);
  const [editTask, setEditTask] = useState({});
  const [selfAssessStatusOptions, setSelfAssessStatusOptions] = useState([]);
  const [reportingManagerAssessStatusOptions, setReportingManagerAssessStatusOptions] = useState([]);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [currentTask, setCurrentTask] = useState("");
  const [user, setUser] = useState('');
  const reportingManagerAssessStatusRef = useRef("");
const [reportingManagerAssessStatus, setReportingManagerAssessStatus] = useState("")

  const nameRef = useRef("");
  const descriptionRef = useRef("");
  const startdateRef = useRef("");
  const enddateRef = useRef("");
  const durationRef = useRef("");

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/goal-sheet/${id}`);
      setTitle(response.data.title);
      setDesc(response.data.description);
      setAllTask(response.data.tasks);
      setReportingManagerAssessStatus(response.data.sheetStatus)

      const user_role = localStorage.getItem("user_role")
      if (user_role === "Employee") {
        const response2 = await axios.get(`${API_URL}/self-assess-status`);
        setSelfAssessStatusOptions(response2.data);
      }else if(user_role === "Reporting Manager") {
        const response3 = await axios.get(`${API_URL}/reporting-manager-assess-status`);
        setReportingManagerAssessStatusOptions(response3.data);
      }
    } catch (error) {
      console.error(error);
      window.location.href = "/dashboard";
    }
  };

  useEffect(() => {
    fetchData();
    setEditTask({});
    setShowTaskForm(false);
  }, [id]);

  const handleEditClick = (task) => {
    setShowTaskForm(true);
    setEditTask(task);
  };

  const updateTaskRating = async (taskID, rating) => {
    try {
      await axios.post(
        `${API_URL}/api/task/update/assessment-rating/${id}`,
        { task_id: taskID, rating },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      fetchData();
    } catch (error) {
      // Log the error
      console.error("Error:", error);
    }
  };

  const createNewTask = async () => {
    const formData = new FormData();
    formData.append("name", nameRef.current.value);
    formData.append("description", descriptionRef.current.value);
    formData.append("startdate", startdateRef.current.value);
    formData.append("enddate", enddateRef.current.value);
    formData.append("totalduration", durationRef.current.value);

    try {
      await axios.post(`${API_URL}/api/new-task/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      fetchData();
    } catch (error) {
      // Log the error
      console.error("Error:", error);

      // More detailed error logging
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        // Request was made but no response received
        console.error("Request data:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error message:", error.message);
      }
    }
  };

  const updateTask = async (taskID) => {
    const formData = new FormData();
    formData.append("task_id", taskID);
    formData.append("name", nameRef.current.value);
    formData.append("description", descriptionRef.current.value);
    formData.append("startdate", startdateRef.current.value);
    formData.append("enddate", enddateRef.current.value);
    formData.append("totalduration", durationRef.current.value);

    try {
      await axios.post(`${API_URL}/api/update-task/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      fetchData();
    } catch (error) {
      // Log the error
      console.error("Error:", error);
    }
  };

  const selfAssessStatusChanged = async (status, taskID) => {
    try {
      await axios.post(
        `${API_URL}/api/update-task-status/${id}`,
        { taskID, status },
        { headers: { "Content-Type": "application/json" } }
      );
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const addNewTaskClick = () => {
    setShowTaskForm(true);
    setEditTask({});
  };

  const handleTaskFeedback = (task) => {
    setCurrentTask(task);
    setIsFeedbackOpen(true);
    setFeedback(task.Feedback)
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleTaskFormSubmit = (taskID) => {
    Object.keys(editTask).length ? updateTask(taskID) : createNewTask();
  };

  const handleDeleteTask = async (taskID) => {
    try {
      await axios.delete(`${API_URL}/api/delete-task/${id}`, {
        data: { taskID },
        headers: { "Content-Type": "application/json" },
      });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/submit-feedback`, {id, taskId: currentTask._id, feedback: feedback }, { headers: { 'Content-Type': 'application/json' } });  
      
      
  
      if (response.status === 200) {
        setIsFeedbackOpen(false);
        setFeedback("");
        fetchData();

      } else {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };
  

  const user_role =localStorage.getItem("user_role", user);

  const submitGoalSheet = async () => {
    try {
      await axios.post(`${API_URL}/api/goal-sheet-submit/${id}`, {reportingManagerAssessStatus});     
      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <div>
      <div>Goal Sheet Title- {title}</div>
      <div className="mb-4">
        <small>Description- {desc}</small>
      </div>
      <button onClick={addNewTaskClick}>Add Task</button>
      {showTaskForm && (
        <div className="p-3">
          <TaskForm
            editTask={editTask}
            handleFormSubmit={handleTaskFormSubmit}
            nameRef={nameRef}
            descriptionRef={descriptionRef}
            startdateRef={startdateRef}
            enddateRef={enddateRef}
            durationRef={durationRef}
          />
        </div>
      )}

      <h4 className="mt-4 mb-4">All tasks</h4>
      
      {isFeedbackOpen && currentTask && (
        <div className="feedback-form">
          <h5>Provide Feedback for Task : {currentTask.name}</h5>
          <p>
            <strong>Description:</strong> {currentTask.description}
          </p>
          <p>
            <strong>Start Date:</strong> {currentTask.startdate}
          </p>
          <p>
            <strong>End Date:</strong> {currentTask.enddate}
          </p>
          <p>
            <strong>Total Duration:</strong> {currentTask.totalduration} days
          </p>

          <p>
            <strong>Status:</strong> {currentTask.status}
          </p>
    <div>
    <textarea rows={5} cols ={50} value={feedback} onChange={handleFeedbackChange}
            placeholder="Enter your feedback"
          />
          <div className="mt-2"><button onClick={() => setIsFeedbackOpen(false)}>Cancel</button> <button onClick={handleFeedbackSubmit}>Submit Feedback</button></div>
    </div>
        </div>
      )}

      <div className="mt-4" style={{overflowX: 'auto', overflowY: 'visible'}}>
      <table className="table">
        <thead>
          <tr key="">
            <th>Task Name</th>
            <th>Description</th>
            <th>Startdate</th>
            <th>Enddate</th>
            <th>Total-duration (days)</th>
            <th>Self-Assess Rating</th>
            <th>Reporting Manager Assessment</th>
            <th>Status</th>

            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allTask.map((task) => (
            <Task
              key={task._id}
              task={task}
              updateTaskRating={updateTaskRating}
              handleEditClick={handleEditClick}
              selfAssessStatusChanged={selfAssessStatusChanged}
              selfAssessStatusOptions={selfAssessStatusOptions}
              handleDeleteTask={handleDeleteTask}
              handleTaskFeedback={handleTaskFeedback}
            />
          ))}
        </tbody>
      </table>
      </div>

      <div className="text-center mt-5 mb-3">
      {user_role === 'Reporting Manager' && <select className="mx-4" style={{maxWidth: '250px'}} ref={reportingManagerAssessStatusRef} onChange={e => setReportingManagerAssessStatus(e.target.value)} value={reportingManagerAssessStatus}>
      {reportingManagerAssessStatusOptions.map((status, index) => (
            <option value={status} key={index}>
              {status}
            </option>
          ))}
      </select> }
     <button onClick={submitGoalSheet}>Submit</button></div>
    </div>
  );
};

export default GoalSheet;

// localhost:3000 //dashboard   -- display all goal sheets --- button [create new goal sheet]
// localhost:3000/login //login

// localhost:3000/create-goal-sheet //create new goal sheet (title, description, duration-?)
// localhost:3000/goal-sheet/[id] //goal sheet page --- add tasks - update tasks
