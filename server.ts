import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
const app = express();
const httpServer = createServer(app);
import dotenv from "dotenv";
import { generatePadCode } from "./utils/utils";
import Pad from "./models/PadModel";
import { debouncedSaveToDatabase } from "./utils/debouncedSaveToDatabase";
import cors from "cors";
dotenv.config();

app.use(
  cors({
    origin: process.env.CLIENT_URI,
  })
);
require("./dbConnection");

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URI,
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join pad", async (joinCode) => {
    for (let room in socket.rooms) {
      if (socket.id !== room) {
        socket.leave(room);
      }
    }

    let code: string = joinCode || generatePadCode();

    socket.join(code);
    const foundPad = await Pad.findOne({ padCode: code }).lean();
    socket.emit("pad joined", code);
    socket.emit("receive text update", foundPad?.text);
    io.to(code).emit("new user", io.sockets.adapter.rooms.get(code)?.size);

    setInterval(() => {
      io.to(code).emit("new user", io.sockets.adapter.rooms.get(code)?.size);
    }, 5000);
  });

  socket.on("leave pad", async (padCode) => {
    socket.leave(padCode);

    socket.emit("pad left", padCode);
    io.to(padCode).emit(
      "new user",
      io.sockets.adapter.rooms.get(padCode)?.size
    );
  });

  socket.on(
    "send text update",
    ({ padCode, text }: { padCode: string; text: string }) => {
      debouncedSaveToDatabase(padCode, text);
      // socket.broadcast.to(padCode).emit("receive text update", foundPad?.text);
    }
  );

  socket.on("disconnect", () => {
    console.log("A user left");
  });
});

const padStream = Pad.watch([], { fullDocument: "updateLookup" });

padStream.on("change", (next) => {
  if (next.operationType === "update") {
    io.sockets
      .in(next.fullDocument.padCode)
      .emit("receive text update", next.fullDocument.text);
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Writepad is up and running :) ");
});

const port = process.env.PORT || 4000;

httpServer.listen(port, () => console.log(`Server started on port ${port}`));
