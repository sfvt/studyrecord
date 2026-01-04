const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs"); // 後で ejs を使う前提（HTMLテンプレ）

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
  console.log("http://localhost:3000/");
});
