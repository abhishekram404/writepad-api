import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { customAlphabet } from "nanoid";
const generatePadCode = customAlphabet("abcdefghijklmnopqrstuvwxyz", 6);
const app = express();
const httpServer = createServer(app);
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const io = new Server(httpServer, {
  cors: {
    origin: isProduction
      ? "https://abhishekram-404-writepad.netlify.app"
      : "http://localhost:3000",
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true,
  },
});

const roomTexts = <{ [key: string]: string }>{};

io.on("connection", (socket) => {
  console.log("A new client connected");

  socket.on("join pad", (joinCode) => {
    for (let room in socket.rooms) {
      if (socket.id !== room) {
        socket.leave(room);
      }
    }

    let code = joinCode || generatePadCode();
    socket.join(code);
    socket.emit("pad joined", code);
    socket.emit("receive text update", roomTexts[code]);
    io.to(code).emit("new user", io.sockets.adapter.rooms.get(code)?.size);

    setInterval(() => {
      io.to(code).emit("new user", io.sockets.adapter.rooms.get(code)?.size);
    }, 5000);
  });

  socket.on("leave pad", (padCode) => {
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
      roomTexts[padCode] = text;
      socket.to(padCode).emit("receive text update", text);
    }
  );

  socket.on("disconnect", () => {
    console.log("A user left");
  });
});

app.get("/", (req, res) => {
  res.status(200).send("Writepad is up and running :) ");
});

const port = process.env.PORT || 4000;

httpServer.listen(port, () => console.log(`Server started on port ${port}`));
