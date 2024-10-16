const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function getUser() {
  const user = await prisma.patient.findUnique({
    where: {
      email: "email@email.com",
    },
  });
  console.log(user);
}

