const express = require("express");
const { connectDB } = require("./app/config/db");

const routes = require("./app/routes");
const app = express();

app.use(express.json());


app.use("/api", routes);
const PORT = 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();