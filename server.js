const express = require("express");
const app = express();
require('dotenv').config();
const httpServer = require("http").createServer(app);

// socket.io server instance i.e io;
const io = require("socket.io")(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    // credentials: true,
  },
});

// socket middlewares
io.use((socket, next) => {
  try {
    let { token } = socket.handshake.auth;
    if(!token){
      next(new Error('Unauthorized, you dont have access'));
    }else{
      next();
    }
  } catch (error) {
    next(error && error.message ? error.message : 'Token is absent');
  }
})

io.engine.on("initial_headers", (headers, req) => {
  headers["test"] = "123";
  headers["set-cookie"] = "mycookie=456";
});

io.engine.on("connection_error", (err) => {
  console.error(err.message)
})

io.on("connection", (socket) => {
  // returns all client connections with particular domain connected with socket server.
  // const count = io.of("/").sockets.size;
  // console.log(count)
  socket.join('room1');
  console.log(socket.rooms)
  console.log("client connected");
  socket.on("data", (data) => {
    console.log(data);
    io.emit("response", { message: "data collected" });
  });

  // called prior to data listener
  socket.onAny((evName, ...args) => {
    console.log(evName, args);
  })
});

io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});

httpServer.listen(process.env.PORT, () => {
  console.log(
    `server is listening on port ${process.env.PORT}`
  );
});
