const mongoose = require("mongoose");

function connectDB() {
    const url = "mongodb://127.0.0.1/mongoose";
  
    try {
      mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
    const dbConnection = mongoose.connection;
    dbConnection.once("open", (_) => {
      console.log(`Database connected: ${url}`);
    });
  
    dbConnection.on("error", (err) => {
      console.error(`connection error: ${err}`);
    });
    return;
  }
  

module.exports = connectDB 
   