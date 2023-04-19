require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mainRouter = require("./routes/index");
const { PORT } = require("./constants/constants");
const { MONGO_URI } = require("./constants/constants");
const bodyParser = require("body-parser");
const app = express();
const app2 = express();
const http = require("http");
const chatServer = http.createServer(app2);
const { Server } = require("socket.io");
const io = new Server(chatServer);
const jwt = require("jsonwebtoken");
const chatController = require("./controllers/Chats");
const { Socket } = require("dgram");
// const MessageModel = require("../models/Messages");

// connect to mongodb
mongoose
  .connect(MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // user: 'Zalo',
    // pass: 'ZaloAdminPassword',
    // dbName: 'Zalo',
    // useFindAndModify: false
  })
  .then((res) => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });

// use middleware to parse body req to json

// use middleware to enable cors
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);
// route middleware
app.use("/", mainRouter);

app.get("/settings", function (req, res) {
  res.send("Settings Page");
});

app.listen(PORT, () => {
  console.log("server start - " + PORT);
});

var socketIds = {};
var mapSocketIds = {};

// Socket.io chat realtime
io.on("connection", (socket) => {
  // MessageModel.find().then(result => {
  //     socket.emit('output-messages', result)
  // })
  // console.log('a user connected: ', socket.id);
  console.log(1111, 'socket.id', socket.id);
  if (socket.handshake.headers.token) {
    try {
      decoded = jwt.verify(
        socket.handshake.headers.token,
        process.env.JWT_SECRET
      );
      if (socketIds[decoded.id] && socketIds[decoded.id].length > 0) {
        socketIds[decoded.id].push(socket.id);
      } else {
        socketIds[decoded.id] = [];
        socketIds[decoded.id].push(socket.id);
      }
      mapSocketIds[socket.id] = decoded.id;
      console.log(
        "a user connected, account devices: " + socketIds[decoded.id]
      );
    } catch (e) {
      console.log("Invalid token");
    }
  }
  // socket.emit('message', 'Hello world');
  socket.on("disconnect", () => {
    let userId = mapSocketIds[socket.id];
    if (socketIds[userId]) {
      for (let i = 0; i < socketIds[userId].length; i++) {
        if (socketIds[userId][i] == socket.id) {
          socketIds[userId].splice(i, 1);
        }
      }
    }

    // console.log(socketIds[userId])
  });
  socket.on("chatmessage", async (msg) => {
    console.log(msg)
    console.log(msg.token)
    if (msg.token && msg.receiverId) {
      try {
        decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
        console.log({decoded})
        msg.senderId = decoded.id;
        delete msg.token;
        msg.time = new Date();
        data = await chatController.saveMessage(msg);
        if (data !== null) {
          msg.chatId = data.chatId;
          msg._id = data.msgId;
          if (socketIds[msg.senderId]) {
            for (let i = 0; i < socketIds[msg.senderId].length; i++) {
              io.to(socketIds[msg.senderId][i]).emit("message", msg);
            }
          }
          if (socketIds[msg.receiverId]) {
            for (let i = 0; i < socketIds[msg.receiverId].length; i++) {
              io.to(socketIds[msg.receiverId][i]).emit("message", msg);
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  });

  socket.on("blockers", async (msg) => {
    // console.log(msg.token)
    if (msg.token && msg.receiverId) {
      try {
        decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
        msg.senderId = decoded.id;
        delete msg.token;
        if (msg.type == "block") {
          msg.data = await chatController.blockChat(msg);
        } else {
          msg.data = await chatController.unBlockChat(msg);
        }

        delete msg.chatId;
        if (msg.data !== null) {
          if (socketIds[msg.senderId]) {
            for (let i = 0; i < socketIds[msg.senderId].length; i++) {
              io.to(socketIds[msg.senderId][i]).emit("blockers", msg);
            }
          }
          if (socketIds[msg.receiverId]) {
            for (let i = 0; i < socketIds[msg.receiverId].length; i++) {
              io.to(socketIds[msg.receiverId][i]).emit("blockers", msg);
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  });

  socket.on("recallmessage", async (msg) => {
    // console.log(msg.token)
    if (msg.token && msg.receiverId) {
      try {
        decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
        msg.senderId = decoded.id;
        delete msg.token;
        msg.data = await chatController.recallMessage(msg);

        delete msg.chatId;
        if (msg.data !== null) {
          if (socketIds[msg.senderId]) {
            for (let i = 0; i < socketIds[msg.senderId].length; i++) {
              io.to(socketIds[msg.senderId][i]).emit("recallmessage", msg);
            }
          }
          if (socketIds[msg.receiverId]) {
            for (let i = 0; i < socketIds[msg.receiverId].length; i++) {
              io.to(socketIds[msg.receiverId][i]).emit("recallmessage", msg);
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  });

  socket.on("seenMessage", async (msg) => {
    console.log('token', msg.token)
    if (msg.token && msg.chatId) {
      try {
        decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
        console.log({decoded})
        msg.userId = decoded.id;
        delete msg.token;
        await chatController.seenMessage(msg);
      } catch (e) {
        console.log(e);
      }
    }
  });
});

chatServer.listen(3000, () => {
  console.log("server chat start - " + 3000);
});
