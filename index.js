const express = require("express");
const bodyParser= require('body-parser')
require("./DataBase/db");
const  userModel  = require("./DataBase/UserSchema");
const postRouter= require('./Routers/router')
const cors= require('cors')

// db.cases.createIndex({ title: "text" });

const app = express();
// app.use(cors({origin:'http://localhost:5173'}))
app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", function (request, response) {
  response.send("hi there");
});

app.use("/api/post", postRouter)

app.listen(3000, function (request, response) {
  console.log("port 3000 is open");
});
