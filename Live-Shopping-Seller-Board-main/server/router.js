const express = require("express");
const app = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get("/", (req, res) => {
  res.send({ response: "Server is up and running." }).status(200);
});

module.exports = app;