require("dotenv").config();

const express = require("express");
const server = new express();

const userRouter = require("./services/users");
const catRouter = require("./services/cats");
const { errorHandler } = require("./utils");
server.use(express.json());

server.get("/test", (req, res) => {
  res.status(200).send({ message: "Test success" });
});

server.use("/users", userRouter);
server.use("/cats", catRouter);

server.use(errorHandler);
module.exports = server;
