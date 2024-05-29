const mongoose = require("mongoose");

// function to connect to mongodb
const connectDB = () => {
  // mongodb connection URI
  const mongoUri = process.env.MONGO_URL;

  // connect to mongodb using Mongoose
  mongoose
    .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((error) => console.error("Failed to connect to MongoDB", error));
};

module.exports = connectDB; // export the connectDB function
