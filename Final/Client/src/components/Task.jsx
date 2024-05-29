import StarRating from "./StarRating";

import './Task.css'

const Task = ({
  task,
  updateTaskRating,
  handleEditClick,
  selfAssessStatusChanged,
  selfAssessStatusOptions,
  handleDeleteTask,
  handleTaskFeedback,
}) => {
  const user_role = localStorage.getItem("user_role");

  return (
    <tr key={task._id}>
      <td>{task.name}</td>
      <td>{task.description}</td>
      <td>{task.startdate}</td>
      <td>{task.enddate}</td>
      <td>{task.totalduration} </td>
      <td>
        <StarRating
          rating={task.employeeSelfAssessRating}
          elementId={task._id}
          editable={user_role === "Employee"}
          updateRating={user_role === "Employee" && updateTaskRating}
        />
      </td>
      <td>
        <StarRating
          rating={task.reportingManagerAssessment}
          elementId={task._id}
          editable={user_role === "Reporting Manager"}
          updateRating={user_role === "Reporting Manager" && updateTaskRating}
        />
       {task.Feedback && (<div className="feedback-container"><span className="feedback-link">Feedback</span><div className="feedback small"><div><strong>Feedback</strong></div>{task.Feedback}</div></div>)}
      </td>
      <td>
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
        {user_role === "Employee" ? (
          <>
            <button onClick={() => handleEditClick(task)}>Edit</button> &nbsp;
            <button onClick={() => handleDeleteTask(task._id)}>Delete</button>
          </>
        ) : (
          <button onClick={() => handleTaskFeedback(task)}>Feedback</button>
        )}
      </td>
    </tr>
  );
};

export default Task;
