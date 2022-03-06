import mongoose from "mongoose";

mongoose.connect(
  `mongodb+srv://writepadadmin:2P9t2LrzsdQamjmm@writepad.0eueb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  (err) => {
    if (err) {
      return console.log(err.message);
    }

    console.log("Connected to DB");
  }
);
