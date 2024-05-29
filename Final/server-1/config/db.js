const mongoose = require('mongoose');

const connectDB = ()=>{
// Connect to MongoDB
const mongoUri = process.env.MONGO_URL;
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((error) => console.error('Failed to connect to MongoDB', error));
}


module.exports = connectDB;