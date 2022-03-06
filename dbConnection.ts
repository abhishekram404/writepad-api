import mongoose from "mongoose";

mongoose.connect(
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/writepad",
  (err) => {
    if (err) {
      return console.log(err.message);
    }

    console.log("Connected to DB");
  }
);
