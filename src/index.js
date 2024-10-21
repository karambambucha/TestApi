const express = require("express");
const cron = require('node-cron');
const bodyParser = require("body-parser");
const router = require("./routes/routes.js");
const caller = require("./caller/caller.js");
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

cron.schedule('* * * * *', () => {
  //caller.call()

});