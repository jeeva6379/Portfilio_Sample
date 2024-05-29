import { useEffect, useState } from "react"

// TaskForm component for creating and updating a task
const TaskForm = ({editTask, handleFormSubmit,nameRef,descriptionRef,startdateRef,enddateRef,durationRef}) => {
    
    // state variables for task details
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [startdate, setStartdate] = useState("")
    const [enddate, setEnddate] = useState("")
    const [totalduration, setTotalduration] = useState("")

    // populate form fields with editTask details
    useEffect(() => {
        setName(editTask.name)
        setDescription(editTask.description)
        setStartdate(editTask.startdate)
        setEnddate(editTask.enddate)
        setTotalduration(editTask.totalduration)
    }, [editTask]);


    return (
    <div>
    {/* Form for creating or updating a task */}
<div className="form-container">
      <h3 className="text-center">{Object.keys(editTask).length? 'Update Task' : 'Create a New Task'}</h3>
      <hr />
      <form className="goal-form">
        
        {/* Task name input field */}
        <div className="form-group">
          <label htmlFor="title">Task Name</label>
          <input ref={nameRef} type="text" id="title" placeholder="Enter the task name" defaultValue={name} />
        </div>
        
        {/* Task description input field */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input ref={descriptionRef} type="text" id="description" placeholder="Enter the description" defaultValue={description} />
        </div>
        
        {/* Task startdate input field */}
        <div className="form-group">
          <label htmlFor="start-date">Start Date</label>
          <input ref={startdateRef} type="date" id="start-date" placeholder="Start date" defaultValue={startdate} />
        </div>
        
        {/* Task enddate input field */}
        <div className="form-group">
          <label htmlFor="end-date">End Date</label>
          <input ref={enddateRef} type="date" id="end-date" placeholder="End date" defaultValue={enddate} />
        </div>
        
        {/* Task totalduration input field */}
        <div className="form-group">
          <label htmlFor="duration">Total Duration (days)</label>
          <input ref={durationRef} type="number" id="duration" placeholder="Total duration" defaultValue={totalduration} />
        </div>
        {/* button submitting for the form */}
        <button type="button" onClick={()=>{handleFormSubmit(editTask._id)}} className="btn btn-dark">{Object.keys(editTask).length? "Update Task" : 'Add Task'}</button>
      </form>
    </div>    </div>
  )
}

export default TaskForm



