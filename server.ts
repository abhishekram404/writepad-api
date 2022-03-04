import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { customAlphabet } from "nanoid";
const generatePadCode = customAlphabet("abcdefghijklmnopqrstuvwxyz", 6);
const app = express();
const httpServer = createServer(app);
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
cors({
  origin: isProduction
    ? "https://abhishekram-404-writepad.netlify.app"
    : "http://localhost:3000",
});

const io = new Server(httpServer, {
  cors: {
    origin: isProduction
      ? "https://abhishekram-404-writepad.netlify.app"
      : "http://localhost:3000",
  },
});

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

  socket.on("send text update", ({ padCode, text }) => {
    console.log(text);
    socket.to(padCode).emit("receive text update", text);
  });

  socket.on("disconnect", () => {
    console.log("A user left");
  });
});

httpServer.listen(4000);
