import express from "express";
import Mongoose from "mongoose";
import * as http from "http";
import * as path from "path";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import apiErrorHandler from '../helper/apiErrorHandler';
const app = new express();
const server = http.createServer(app);
const root = path.normalize(`${__dirname}/../..`);
import socket from 'socket.io';
const cron = require('node-cron');
import cronForUserList from "../helper/util";
cron.schedule('0 0 * * *', cronForUserList.sendUserListToAdmin);
import WebSocket from 'websocket';

const WebSocketServer = WebSocket.server;
const WebSocketClient = WebSocket.client;
const client = new WebSocketClient();
const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
  maxReceivedFrameSize: 64 * 1024 * 1024,   // 64MiB
  maxReceivedMessageSize: 64 * 1024 * 1024, // 64MiB
  fragmentOutgoingMessages: false,
  keepalive: false,
  disableNagleAlgorithm: false
}); 
const io = socket(server);


class ExpressServer {
  constructor() {
    app.use(express.json({ limit: '1000mb' }));

    app.use(express.urlencoded({ extended: true, limit: '1000mb' }))

    app.use(morgan('dev'))

    app.use(
      cors({
        allowedHeaders: ["Content-Type", "token", "authorization"],
        exposedHeaders: ["token", "authorization"],
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
      })
    );
  } 
  router(routes) {
    routes(app);
    return this;
  }

  configureSwagger(swaggerDefinition) {
    const options = {
      // swaggerOptions : { authAction :{JWT :{name:"JWT", schema :{ type:"apiKey", in:"header", name:"Authorization", description:""}, value:"Bearer <JWT>"}}},
      swaggerDefinition,
      apis: [
        path.resolve(`${root}/server/api/v1/controllers/**/*.js`),
        path.resolve(`${root}/api.yaml`),
      ],
    };

    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerJSDoc(options))
    );
    return this;
  }

  handleError() {
    app.use(apiErrorHandler);

    return this;
  }

  configureDb(dbUrl) {
    return new Promise((resolve, reject) => {
      Mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }, (err) => {
        if (err) {
          console.log(`Error in mongodb connection ${err.message}`);
          return reject(err);
        }
        console.log("Mongodb connection established");
        return resolve(this);
      });
    });
  }

  // })

  listen(port) {
    server.listen(port, () => {
      console.log(`secure app is listening @port ${port}`, new Date().toLocaleString());
    });
    return app;
  }
}

var userCount = 0,
  users = {},
  keys = {},
  sockets = {},
  onlineUsers = [];
io.sockets.on("connection", (socket) => {
  userCount++;
  console.log("my socket id is >>>>>", socket.id, userCount);


  //************************ online user************** */

  function OnlineUser(data, socketId) {
    console.log("231=========>", data)
    console.log("232=========>", data.userId)
    return new Promise(async (resolve, reject) => {
      try {
        var userResult = await userModel.findOne({ _id: data.userId });
        if (onlineUsers.length > 0) {
          let check = onlineUsers.findIndex((x) => x.userId === data.userId);
          console.log("check=====264====", check);
          if (check >= 0) {
            console.log("previous record", onlineUsers[check]);
            data.status = "ONLINE";
            data.socketId = socketId;
            data.userName = userResult.userName;
            data.firstName = userResult.firstName;
            data.lastName = userResult.lastName;
            data.profilePic = userResult.profilePic;
            onlineUsers[check] = data;
          } else {
            console.log("new record", check, data);
            data.status = "ONLINE";
            data.socketId = socketId;
            data.userName = userResult.userName,
            data.firstName = userResult.firstName;
            data.lastName = userResult.lastName;
            data.profilePic = userResult.profilePic;
            onlineUsers.push(data);
            console.log("after insert record", onlineUsers);
          }
          resolve();
        } else {
          var userResult = await userModel.findOne({ _id: data.userId });
          let newUser = {
            userId: data.userId,
            status: "ONLINE",
            socketId: socketId,
            userName: userResult.userName,
            firstName: userResult.firstName,
            lastName: userResult.lastName,
            profilePic: userResult.profilePic,
          };
          console.log("data", data);
          console.log(" new userId===>", data, newUser);
          onlineUsers.push(newUser);

          resolve();
        }
      } catch (error) {
        console.log("Line no 290===>>", error)
        throw error;
      }
    });
  }
})



export default ExpressServer;
function originIsAllowed(origin) {
  return true;
}



