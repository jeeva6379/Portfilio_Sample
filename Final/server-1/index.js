const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");

require("dotenv").config();
const jwt = require("jsonwebtoken");
// const uniqid = require("uniqid");

const connectDB = require("./config/db");
connectDB();
const GoalSheet = require("./models/goalSheetSchema");
const UserData = require("./models/userSchema");
const TokenAuthentication = require("./middleware/TokenAuthentication");
const EmployeeOnlyAccess = require("./middleware/EmployeeOnlyAccess");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// const unique_id = uniqid();
// console.log("unique_id", unique_id);

app.post("/api/create-newuser",TokenAuthentication,
  // add middleware to check if authorized to create new user

  async (req, res) => {
    const { username, email, password, role } = req.body;

    // Check if all required fields are provided
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Generate a salt & hash the password with the salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const newUser = new UserData({
        username,
        email,
        // password,
        password: hashedPassword,
        role,
      });

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
      // Return 400 status for bad request or validation errors
      res.status(400).json({ message: "Error creating user", error });
    }
  }
);


// Route to get all users
app.get("/api/users", TokenAuthentication, async (req, res) => {
  try {
    const users = await UserData.find({}, 'username email role'); 
    
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
});

// Update user
app.put('/api/update-user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, role } = req.body;
    const updatedUser = await UserData.findByIdAndUpdate(userId, { username, email, role }, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user', error });
  }
});

// Delete user
app.delete('/api/delete-user/:id',  async (req, res) => {
  try {
    const userId = req.params.id;
    await UserData.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting user', error });
  }
});


// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await UserData.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.SECRETKEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Logged in successfully", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get logged in user info
app.get("/api/user-info", TokenAuthentication, async (req, res) => {
  res.status(200).json({ user: req.user });
});

app.get("/api/all-goal-sheets", TokenAuthentication, async (req, res) => {
  const user_id = req.user._id;

  try {
    const goalSheets = await GoalSheet.find({ employee_id: user_id });

    if (!goalSheets)
      return res.status(404).json({ message: "Goal sheet not found" });
    res.status(200).json(goalSheets);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch goal sheet", error });
  }
});

// Create a new goal sheet
app.post(
  "/api/goal-sheets",
  TokenAuthentication,
  EmployeeOnlyAccess,
  async (req, res) => {
    const { title, description } = req.body;
    const user_id = req.user._id;

    const newGoalSheet = new GoalSheet({
      title,
      description,
      employee_id: user_id,
    });

    try {
      const savedGoalSheet = await newGoalSheet.save();
      // const newuser = new UserData({ unique_id });
      // await newuser.save();

      res.status(201).json({ id: savedGoalSheet._id });
    } catch (error) {
      res.status(500).json({ message: "Failed to create goal sheet", error });
    }
  }
);

// Get a goal sheet by ID
app.get("/api/goal-sheet/:id", TokenAuthentication, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id;
  const user_role = req.user.role;

  try {
    const goalSheet = await GoalSheet.findById(id);
    if (!goalSheet)
      return res.status(404).json({ message: "Goal sheet not found" });

    if (
      user_role !== "HR" &&
      user_role !== "Reporting Manager" &&
      goalSheet.employee_id != user_id
    )
      return res.status(403).json({
        error:
          "Access Denied: You do not have permission to access this resource",
      });

    res.status(200).json(goalSheet);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goal sheet", error });
  }
});
// Submit a goal sheet by ID
app.post(
  "/api/goal-sheet-submit/:id",
  TokenAuthentication,
  async (req, res) => {
    const { id } = req.params;
    const user_id = req.user._id;
    const user_role = req.user.role;

    try {
      const goalSheet = await GoalSheet.findById(id);
      if (!goalSheet)
        return res.status(404).json({ message: "Goal sheet not found" });

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
      await goalSheet.save();

      res.status(200).json({ message: "Goal sheet submitted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit goal sheet", error });
    }
  }
);

app.post(
  "/api/new-task/:id",
  TokenAuthentication,
  EmployeeOnlyAccess,
  async (req, res) => {
    const { id } = req.params;
    const { name, description, startdate, enddate, totalduration } = req.body;

    try {
      const goalSheet = await GoalSheet.findById(id);
      if (!goalSheet) {
        return res.status(404).json({ message: "Goal sheet not found" });
      }

      const newTask = {
        name,
        description,
        startdate,
        enddate,
        totalduration,
      };
      // console.log(newTask);

      goalSheet.tasks.push(newTask);
      await goalSheet.save();

      res.status(200).json({ message: "Task added successfully", goalSheet });
    } catch (error) {
      res.status(500).json({ message: "Failed to add task", error });
    }
  }
);

app.post(
  "/api/task/update/assessment-rating/:id",
  TokenAuthentication,
  async (req, res) => {
    const { id } = req.params;
    const { task_id, rating } = req.body;

    const role = req.user.role;

    if (!task_id) return res.status(400).json({ message: "Task ID missing" });
    if (!rating) return res.status(400).json({ message: "Rating missing" });

    try {
      const goalSheet = await GoalSheet.findById(id);
      if (!goalSheet)
        return res.status(404).json({ message: "invalid sheet id" });

      const task = goalSheet.tasks.id(task_id);
      if (!task) return res.status(404).json({ message: "Invalid task id" });

      if (role === "Employee") {
        task.employeeSelfAssessRating = rating;
      } else if (role === "Reporting Manager") {
        task.reportingManagerAssessment = rating;
      }
      await goalSheet.save();

      res.status(200).json({ message: "Rating updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update rating", error });
    }
  }
);

app.get(
  "/self-assess-status",
  TokenAuthentication,
  EmployeeOnlyAccess,
  (req, res) => {
    res.json(require("./config/taskStatus"));
  }
);
app.get("/reporting-manager-assess-status", TokenAuthentication, (req, res) => {
  res.json(require("./config/goalSheetStatus"));
});

app.post(
  "/api/update-task-status/:id",
  TokenAuthentication,
  EmployeeOnlyAccess,
  async (req, res) => {
    const { id } = req.params;
    const { taskID, status } = req.body;

    if (!taskID) return res.status(400).json({ message: "Task ID missing" });
    if (!status) return res.status(400).json({ message: "Rating missing" });

    try {
      const goalSheet = await GoalSheet.findById(id);
      if (!goalSheet)
        return res.status(404).json({ message: "invalid sheet id" });

      const task = goalSheet.tasks.id(taskID);
      if (!task) return res.status(404).json({ message: "Invalid task id" });

      task.status = status;
      await goalSheet.save();

      res.status(200).json({ message: "Status updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update status", error });
    }
  }
);

app.post(
  "/api/update-task/:id",
  TokenAuthentication,
  EmployeeOnlyAccess,
  async (req, res) => {
    const { id } = req.params;
    const { task_id, name, description, startdate, enddate, totalduration } =
      req.body;

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
      const goalSheet = await GoalSheet.findById(id);
      if (!goalSheet)
        return res.status(404).json({ message: "invalid sheet id" });

      const task = goalSheet.tasks.id(task_id);
      if (!task) return res.status(404).json({ message: "Invalid task id" });

      task.name = name;
      task.description = description;
      task.startdate = startdate;
      task.enddate = enddate;
      task.totalduration = totalduration;
      await goalSheet.save();

      res.status(200).json({ message: "task updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update task", error });
    }
  }
);

app.delete(
  "/api/delete-task/:id",
  TokenAuthentication,
  EmployeeOnlyAccess,
  async (req, res) => {
    const { id } = req.params;
    const { taskID } = req.body;

    if (!taskID) return res.status(400).json({ message: "task ID missing" });

    try {
      const goalSheet = await GoalSheet.findById(id);
      if (!goalSheet)
        return res.status(404).json({ message: "invalid sheet id" });

      const task = goalSheet.tasks.id(taskID);
      if (!task) return res.status(404).json({ message: "Invalid task id" });

      task.remove();
      await goalSheet.save();

      res.status(200).json({ message: "task deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete task", error });
    }
  }
);

// DELETE endpoint to delete a goal sheet
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
      // Handle any errors that occur during the deletion process;
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);


app.post('/api/submit-feedback', TokenAuthentication, async (req, res) => {
  const {id, taskId, feedback } = req.body;

  if (!taskId || !feedback) {
    return res.status(400).json({ message: 'Task ID and feedback are required' });
  }

  try {
    const goalSheet = await GoalSheet.findById(id);
    if (!goalSheet)
      return res.status(404).json({ message: "invalid sheet id" });

    const task = goalSheet.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: "Invalid task id" });
    
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
