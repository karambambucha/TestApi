const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes/routes.js");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.json());
app.use("/api", router);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
