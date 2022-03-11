require("dotenv").config();
const express = require("express");
const cors = require("cors");
const searchRouter = require("./routes/search");

const PORT = process.env.PORT || 3000;

// create express app
const app = express();

// enable cors
app.use(cors());

// routes
app.use("/api/search", searchRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(`${__dirname}/public`));
}

// listen server
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
