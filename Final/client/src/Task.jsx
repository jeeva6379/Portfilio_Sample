import StarRating from "./components/StarRating";

const Task = ({
  task,
  updateTaskRating,
  handleEditClick,
  selfAssessStatusChanged,
  selfAssessStatusOptions,
  handleDeleteTask,
  handleTaskFeedback,
}) => {
  return (
    <tr key={task._id}>
      <td>{task.name}</td>
      <td>{task.description}</td>
      <td>{task.startdate}</td>
      <td>{task.enddate}</td>
      <td>{task.totalduration} </td>
      
      {/* star rating component for displaying and updating task ratings
          Pass rating, taskID, and updateTaskRating function as props */}

      <td>
        <StarRating
          rating={task.employeeSelfAssessRating}
          taskID={task._id}
          updateTaskRating={updateTaskRating}
        />
      </td>

      <td>
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
        </select>
      </td>
      {/* buttons for editing, deleting, and providing feedback for the task */}
      <td>
        <button onClick={() => handleEditClick(task)}>Edit</button>{" "}
        <button onClick={() => handleDeleteTask(task._id)}>Delete</button>{" "}
        <button onClick={() => handleTaskFeedback(task)}>Feedback</button>
      </td>
    </tr>
  );
};

export default Task;
