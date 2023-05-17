// import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// dotenv.config();

const express = require("express");
const cors = require("cors");
// const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const stuffRoutes = require("./routes/stuff");
const userRoutes = require("./routes/user");
const path = require("path");

mongoose
   .connect(
      "mongodb+srv://clementtiberhgien:WihgYWM2tzz4KdtF@cluster0.u9fq24i.mongodb.net/?retryWrites=true&w=majority",
      { useNewUrlParser: true, useUnifiedTopology: true }
   )
   .then(() => console.log("Connexion à MongoDB réussie !"))
   .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
   res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
   );
   res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
   );
   next();
});

app.use("/api/books", stuffRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
