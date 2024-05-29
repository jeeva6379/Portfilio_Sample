import StarRating from "./StarRating";

import './Task.css'

//Task component to display task details
const Task = ({
  task, //task object containing task details
  updateTaskRating, //function updating task rating
  handleEditClick, // function to handle edit button click 
  selfAssessStatusChanged, //function to handle status change for self assessment 
  selfAssessStatusOptions,//option for self assessment status
  handleDeleteTask, //function to handle delete button click for a task
  handleTaskFeedback, // function to handle providing feedback for a task
}) => {

  //get the users role from local storage
  const user_role = localStorage.getItem("user_role");




  
  return (

    // Display task details in table cells 
    <tr key={task._id}>
      <td>{task.name}</td>
      <td>{task.description}</td>
      <td>{task.startdate}</td>
      <td>{task.enddate}</td>
      <td>{task.totalduration} </td>

      {/*display starrating component for employee self-assessment */}
      <td>
        <StarRating
          rating={task.employeeSelfAssessRating}
          elementId={task._id}
          editable={user_role === "Employee"} // only editable by employees
          updateRating={user_role === "Employee" && updateTaskRating}// allow updating rating if user is an employee
        />
      </td>

      {/*display starrating component for reporting manager self-assessment */}
      <td>
        <StarRating
          rating={task.reportingManagerAssessment}
          elementId={task._id}
          editable={user_role === "Reporting Manager"} // only editable by reporting manager
          updateRating={user_role === "Reporting Manager" && updateTaskRating} // allow updating rating if user is an reporting manager
        />
      {/*display task feedback if available */}

       {task.Feedback && (<div className="feedback-container"><span className="feedback-link">Feedback</span><div className="feedback small"><div><strong>Feedback</strong></div>{task.Feedback}</div></div>)}
      </td>
      <td>
     
      {/* display task status dropdown for non-employees */}
      {user_role !== "Employee" ? task.status :
        <select
          value={task.status}
          onChange={(e) => {
            selfAssessStatusChanged(e.target.value, task._id);
          }}
        >
          {selfAssessStatusOptions.map((status, index) => (
            <option value={status} key={index}>
              {status}
            </option>
          ))}
        </select>}
      </td>
      <td>

        {/* display edit and delete buttons based on user role */}
        {user_role === "Employee" ? (
        // display edit and delete buttons for employees
          <>
            <button onClick={() => handleEditClick(task)}>Edit</button> &nbsp;
            <button onClick={() => handleDeleteTask(task._id)}>Delete</button>
          </>
        ) : (
          
         // display feedback button for non-employees
          <button onClick={() => handleTaskFeedback(task)}>Feedback</button>
        )}
      </td>
    </tr>
  );
};

export default Task;
