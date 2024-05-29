import { useEffect, useState } from "react"

const TaskForm = ({editTask, handleFormSubmit,nameRef,descriptionRef,startdateRef,enddateRef,durationRef}) => {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [startdate, setStartdate] = useState("")
    const [enddate, setEnddate] = useState("")
    const [totalduration, setTotalduration] = useState("")

    useEffect(() => {
        setName(editTask.name)
        setDescription(editTask.description)
        setStartdate(editTask.startdate)
        setEnddate(editTask.enddate)
        setTotalduration(editTask.totalduration)
    }, [editTask]);


    return (
    <div>

<div className="form-container">
      <h3 className="text-center">{Object.keys(editTask).length? 'Update Task' : 'Create a New Task'}</h3>
      <hr />
      <form className="goal-form">
        <div className="form-group">
          <label htmlFor="title">Task Name</label>
          <input ref={nameRef} type="text" id="title" placeholder="Enter the task name" defaultValue={name} />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input ref={descriptionRef} type="text" id="description" placeholder="Enter the description" defaultValue={description} />
        </div>
        <div className="form-group">
          <label htmlFor="start-date">Start Date</label>
          <input ref={startdateRef} type="date" id="start-date" placeholder="Start date" defaultValue={startdate} />
        </div>
        <div className="form-group">
          <label htmlFor="end-date">End Date</label>
          <input ref={enddateRef} type="date" id="end-date" placeholder="End date" defaultValue={enddate} />
        </div>
        <div className="form-group">
          <label htmlFor="duration">Total Duration (days)</label>
          <input ref={durationRef} type="number" id="duration" placeholder="Total duration" defaultValue={totalduration} />
        </div>
        <button type="button" onClick={()=>{handleFormSubmit(editTask._id)}} className="btn btn-dark">{Object.keys(editTask).length? "Update Task" : 'Add Task'}</button>
      </form>
    </div>    </div>
  )
}

export default TaskForm



