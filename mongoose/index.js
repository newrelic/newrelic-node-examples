const express = require("express");
const connectDB  = require("./config/db");
const ArticleRouter = require("./routes/ArticleRouter");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", ArticleRouter);

connectDB();

app.get("/", (request, response) => {
  response.send({ message: "Hello from an Express API!" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
