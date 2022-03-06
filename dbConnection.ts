import mongoose from "mongoose";

mongoose.connect(
  process.env.MONGO_URI,
  (err) => {
    if (err) {
      return console.log(err.message);
    }

    console.log("Connected to DB");
  }
);
