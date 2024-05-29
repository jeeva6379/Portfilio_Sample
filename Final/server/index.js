const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");

// load environment variables from .env file
require("dotenv").config();

// JSON Web Token library for authentication
const jwt = require("jsonwebtoken");

// database connection
const connectDB = require("./config/db");
connectDB();

// mongoose models
const GoalSheet = require("./models/goalSheetSchema");
const UserData = require("./models/userSchema");

// middleware for token authentication
const TokenAuthentication = require("./middleware/TokenAuthentication");

// middleware to restrict access to employees only
const EmployeeOnlyAccess = require("./middleware/EmployeeOnlyAccess");

// initialize express app
const app = express();

// Middleware setup
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse url-encoded bodies
app.use(cors()); // enable cross-origin resource sharing (cors)

// route for create a new user
app.post("/api/create-newuser",TokenAuthentication,
  // add middleware to check if authorized to create new user

  async (req, res) => {
    const { username, email, password, role } = req.body;

    // check if all required fields are provided
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // generate a salt & hash the password with the salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const newUser = new UserData({
        username,
        email,
        password: hashedPassword,
        role,
      });

      // save the new user to the database
      await newUser.save();

      // Return 201 status for successful creation
      res.status(201).json({
        message: "User created successfully",
        userData: {
          user_id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
    // return error message if user creation fails
    res.status(400).json({ message: "Error creating user", error });
    }
  }
);

// route for get all users
app.get("/api/users", TokenAuthentication, async (req, res) => {
  try {

    // fetch all users from the database
    const users = await UserData.find({}, 'username email role'); 
    
    //retrun to the list of users
    res.status(200).json(users);
  } catch (error) {
    
    //error message if fetching user fails
    res.status(500).json({ message: "Error fetching users", error });
  }
});

// route to update a user's information by ID
app.put('/api/update-user/:id', async (req, res) => {
  try {
    // extract user ID from request parameters
    const userId = req.params.id;

    // extract updated user information from request body
    const { username, email, role } = req.body;

    //update the user by id
    const updatedUser = await UserData.findByIdAndUpdate(userId, { username, email, role }, { new: true });
        
    // return the updated user object
    res.status(200).json(updatedUser);
  } catch (error) {
        //error message if updating user fails
    res.status(400).json({ message: 'Error updating user', error });
  }
});

// route to delete a user's information by ID
app.delete('/api/delete-user/:id',  async (req, res) => {
  try {
    // extract user ID from request parameters
    const userId = req.params.id;
        // find the user by ID and delete
    await UserData.findByIdAndDelete(userId);
    // return success full after delete
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
        //error message if delete user fails
        res.status(400).json({ message: 'Error deleting user', error });
  }
});


// route for user login
  app.post("/api/login", async (req, res) => {
      
    // extract email and password from request body
    const { email, password } = req.body;

    try {
      // Check if user exists
      const user = await UserData.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

          // Compare hashed password stored in the database
      const isValidPassword = await bcrypt.compare(password, user.password);

          //password is invalid, return unauthorized status
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

    // generate JWT token for user authentication
    const token = jwt.sign({ userId: user._id }, process.env.SECRETKEY, {
        expiresIn: "1h",
      });
    
      // Return successfully generated token
      res.status(200).json({ message: "Logged in successfully", token });
    } catch (error) {
          // Log errors during login process
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

// Get logged in user info
app.get("/api/user-info", TokenAuthentication, async (req, res) => {
    // respond with user from the token
  res.status(200).json({ user: req.user });
});

//route for fetch all goal sheets for authentication user
app.get("/api/all-goal-sheets", TokenAuthentication, async (req, res) => {
    
  // extract user ID from the authenticated user's data
  const user_id = req.user._id;

  try {
      //all goal sheets with the user ID
    const goalSheets = await GoalSheet.find({ employee_id: user_id });
 
    // if no goal sheets are found
    if (!goalSheets)
      return res.status(404).json({ message: "Goal sheet not found" });

    // respond with the goal sheets
    res.status(200).json(goalSheets);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch goal sheet", error });
  }
});

// route to create a new goal sheet
app.post(
  "/api/goal-sheets",
  TokenAuthentication,
  EmployeeOnlyAccess,
  async (req, res) => {
        // extract title and description from the request body
    const { title, description } = req.body;
    const user_id = req.user._id;

    //create new goal sheet to the data
    const newGoalSheet = new GoalSheet({
      title,
      description,
      employee_id: user_id,
    });

    try {
      // save the goal sheet to database
      const savedGoalSheet = await newGoalSheet.save();

      // ID of the newly created goal sheet
      res.status(201).json({ id: savedGoalSheet._id });
    } catch (error) {
      res.status(500).json({ message: "Failed to create goal sheet", error });
    }
  }
);

// Get a goal sheet by ID
app.get("/api/goal-sheet/:id", TokenAuthentication, async (req, res) => {
      // extract user ID from request parameters
  const { id } = req.params;
    
  // user ID and role from authenticated user's data
  const user_id = req.user._id;
  const user_role = req.user.role;

  try {
    // goal sheet by ID database
    const goalSheet = await GoalSheet.findById(id);
    if (!goalSheet)
      return res.status(404).json({ message: "Goal sheet not found" });

    // check if the authenticated user has permission to access the goal sheet
    if (
      user_role !== "HR" &&
      user_role !== "Reporting Manager" &&
      goalSheet.employee_id != user_id
    )
      return res.status(403).json({
        error:
          "Access Denied: You do not have permission to access this resource",
      });
//respond with goal sheet data
    res.status(200).json(goalSheet);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goal sheet", error });
  }
});







// route to Submit a goal sheet by ID

app.post(
  "/api/goal-sheet-submit/:id",
  TokenAuthentication,
  async (req, res) => {
    //check params id and extract authentication user to submit the sheet 
    const { id } = req.params;
    const user_id = req.user._id;
    const user_role = req.user.role;

    try {
      
      // goal sheet by ID database
      const goalSheet = await GoalSheet.findById(id);
      if (!goalSheet)
        return res.status(404).json({ message: "Goal sheet not found" });

      // check if the authenticated user has permission to access the goal sheet
      if (user_role === "Employee") {
        if (goalSheet.employee_id != user_id)
          return res
            .status(403)
            .json({
              error:
                "Access Denied: You do not have permission to access this resource",
            });
        goalSheet.sheetSubmitted = true;
      } else if (user_role === "Reporting Manager") {
        const reportingManagerAssessStatus =
          req.body.reportingManagerAssessStatus;
        goalSheet.sheetStatus = reportingManagerAssessStatus;
      }

      //submit the sheet in database
      await goalSheet.save();
      //respond with send success message
      res.status(200).json({ message: "Goal sheet submitted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit goal sheet", error });
    }
  }
);

// route to add a new task to a goal sheet by ID
app.post(
  "/api/new-task/:id",
  TokenAuthentication,
  EmployeeOnlyAccess,
  async (req, res) => {
          // extract task details from request body
    const { id } = req.params;
    const { name, description, startdate, enddate, totalduration } = req.body;

    try {
          //goal sheet by ID in the database
      const goalSheet = await GoalSheet.findById(id);
      if (!goalSheet) {
        return res.status(404).json({ message: "Goal sheet not found" });
      }

    // create a new task object
      const newTask = {
        name,
        description,
        startdate,
        enddate,
        totalduration,
      };

      // Add the new task to the goal sheet's tasks array
      goalSheet.tasks.push(newTask);

      // Save the updated goal sheet
      await goalSheet.save();

          // respond with success message 
      res.status(200).json({ message: "Task added successfully", goalSheet });
    } catch (error) {
      res.status(500).json({ message: "Failed to add task", error });
    }
  }
);

// route to update assessment rating of a task by ID
app.post(
  "/api/task/update/assessment-rating/:id",
  TokenAuthentication,
  async (req, res) => {
    const { id } = req.params;
    const { task_id, rating } = req.body;

    const role = req.user.role;
  // check if task ID and rating are provided
    if (!task_id) return res.status(400).json({ message: "Task ID missing" });
    if (!rating) return res.status(400).json({ message: "Rating missing" });

    try {
      // find the goal sheet by ID in the database
      const goalSheet = await GoalSheet.findById(id);
      if (!goalSheet)
        return res.status(404).json({ message: "invalid sheet id" });

      // find the task by ID in the goal sheet's tasks array
      const task = goalSheet.tasks.id(task_id);
      if (!task) return res.status(404).json({ message: "Invalid task id" });

          // Update the rating based on user role
      if (role === "Employee") {
        task.employeeSelfAssessRating = rating;
      } else if (role === "Reporting Manager") {
        task.reportingManagerAssessment = rating;
      }
      
      // Save the updated goal sheet
      await goalSheet.save();

      // respond with success message
      res.status(200).json({ message: "Rating updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update rating", error });
    }
  }
);
// route to get self-assessment status options
app.get(
  "/self-assess-status",
  TokenAuthentication,
  EmployeeOnlyAccess,
  (req, res) => {
    res.json(require("./config/taskStatus"));
  }
);

// route to get reporting-manager self-assessment status options

app.get("/reporting-manager-assess-status", TokenAuthentication, (req, res) => {
  res.json(require("./config/goalSheetStatus"));
});


// Route to update task status

  app.post(
    "/api/update-task-status/:id",
    TokenAuthentication,
    EmployeeOnlyAccess,
    async (req, res) => {
      const { id } = req.params;
      const { taskID, status } = req.body;

      // check if task ID and status are provided
      if (!taskID) return res.status(400).json({ message: "Task ID missing" });
      if (!status) return res.status(400).json({ message: "Rating missing" });

      try {
            // Find the goal sheet by ID
        const goalSheet = await GoalSheet.findById(id);
        if (!goalSheet)
          return res.status(404).json({ message: "invalid sheet id" });
    
        // find the task by ID within the goal sheet
        const task = goalSheet.tasks.id(taskID);
        if (!task) return res.status(404).json({ message: "Invalid task id" });

        // update the task status
        task.status = status;
        await goalSheet.save();

        //respond with successfully updated
        res.status(200).json({ message: "Status updated successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update status", error });
      }
    }
  );

// Route to update task details
app.post(
  "/api/update-task/:id",
  TokenAuthentication,
  EmployeeOnlyAccess,
  async (req, res) => {
    const { id } = req.params;
    const { task_id, name, description, startdate, enddate, totalduration } =
      req.body;

    // check if all required fields are provided
    if (!task_id) return res.status(400).json({ message: "task ID missing" });
    if (!name) return res.status(400).json({ message: "name missing" });
    if (!description)
      return res.status(400).json({ message: "description missing" });
    if (!startdate)
      return res.status(400).json({ message: "startdate missing" });
    if (!enddate) return res.status(400).json({ message: "enddate missing" });
    if (!totalduration)
      return res.status(400).json({ message: "totalduration missing" });

    try {
      // find the goal sheet by ID
      const goalSheet = await GoalSheet.findById(id);
      if (!goalSheet)
        return res.status(404).json({ message: "invalid sheet id" });

      // find the task by ID goal sheet
      const task = goalSheet.tasks.id(task_id);
      if (!task) return res.status(404).json({ message: "Invalid task id" });

      // update task details
      task.name = name;
      task.description = description;
      task.startdate = startdate;
      task.enddate = enddate;
      task.totalduration = totalduration;
      await goalSheet.save();

      // respond with success message
      res.status(200).json({ message: "task updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update task", error });
    }
  }
);
// route to delete a task

app.delete(
  "/api/delete-task/:id",
  TokenAuthentication,
  EmployeeOnlyAccess,
  async (req, res) => {
    const { id } = req.params;
    const { taskID } = req.body;
    // route to delete a task
    if (!taskID) return res.status(400).json({ message: "task ID missing" });

    try {
      // find the goal sheet by ID
      const goalSheet = await GoalSheet.findById(id);
      if (!goalSheet)
        return res.status(404).json({ message: "invalid sheet id" });

    //find the task by ID goal sheet
      const task = goalSheet.tasks.id(taskID);
      if (!task) return res.status(404).json({ message: "Invalid task id" });

      // remove the task from the goal sheet
      task.remove();
      await goalSheet.save();
    
      // respond with success message
      res.status(200).json({ message: "task deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete task", error });
    }
  }
);

// route to delete a goal sheet
app.delete(
  "/api/delete-goal-sheet/:id",
  TokenAuthentication,
  EmployeeOnlyAccess,
  async (req, res) => {
    const id = req.params.id;
    // console.log("Sheet_id", id);

    try {
      // Find and delete the goal sheet by its ID
      const deletedGoalSheet = await GoalSheet.findByIdAndDelete(id);

      if (deletedGoalSheet) {
        res.status(200).json({ message: "Goal sheet deleted successfully." });
      } else {
        res.status(404).json({ error: "Goal sheet not found." });
      }
    } catch (error) {
      // handle deletion process;
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

// route to submit feedback for a task
app.post('/api/submit-feedback', TokenAuthentication, async (req, res) => {
  const {id, taskId, feedback } = req.body;

    // check if task ID and feedback are provided
  if (!taskId || !feedback) {
    return res.status(400).json({ message: 'Task ID and feedback are required' });
  }

  try {

    // find the goal sheet by ID
    const goalSheet = await GoalSheet.findById(id);
    if (!goalSheet)
      return res.status(404).json({ message: "invalid sheet id" });

        // find the task by ID within the goal sheet
    const task = goalSheet.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: "Invalid task id" });
        
    // update the task's feedback and save 
    task.Feedback=feedback
    await goalSheet.save();
    
    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 2222;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
