"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const nanoid_1 = require("nanoid");
const generatePadCode = (0, nanoid_1.customAlphabet)(
  "abcdefghijklmnopqrstuvwxyz",
  6
);
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === "production";
(0, cors_1.default)({
  origin: isProduction
    ? "https://abhishekram-404-writepad.netlify.app"
    : "http://localhost:3000",
});
const io = new socket_io_1.Server(httpServer, {
  cors: {
    origin: isProduction
      ? "https://abhishekram-404-writepad.netlify.app"
      : "http://localhost:3000",
  },
});
io.on("connection", (socket) => {
  socket.on("join pad", (joinCode) => {
    var _a;
    for (let room in socket.rooms) {
      if (socket.id !== room) {
        socket.leave(room);
      }
    }
    let code = joinCode || generatePadCode();
    socket.join(code);
    socket.emit("pad joined", code);
    io.to(code).emit(
      "new user",
      (_a = io.sockets.adapter.rooms.get(code)) === null || _a === void 0
        ? void 0
        : _a.size
    );
    setInterval(() => {
      var _a;
      io.to(code).emit(
        "new user",
        (_a = io.sockets.adapter.rooms.get(code)) === null || _a === void 0
          ? void 0
          : _a.size
      );
    }, 5000);
  });
  socket.on("leave pad", (padCode) => {
    var _a;
    socket.leave(padCode);
    socket.emit("pad left", padCode);
    io.to(padCode).emit(
      "new user",
      (_a = io.sockets.adapter.rooms.get(padCode)) === null || _a === void 0
        ? void 0
        : _a.size
    );
  });
  socket.on("send text update", ({ padCode, text }) => {
    socket.to(padCode).emit("receive text update", text);
  });
  socket.on("disconnect", () => {
    console.log("A user left");
  });
});
httpServer.listen(4000);
