const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class usersController {
  async registerPatient(req, res, next) {
    try {
      const body = req.body;
      if (!req) return res.sendStatus(400);
      const user = await prisma.patient.create({
        data: {
          phone: body.phone,
          name: body.name,
          email: body.email,
          gender: body.gender,
        },
      });
      res.json(user);
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }
  async getPatientByPhone(req, res, next) {
    try {
      if (!req) return res.sendStatus(400);
      const user = await prisma.patient.findFirst({
        where: {
          phone: {
            equals: req.params.phone,
          },
        },
      });
      res.json(user);
    } catch (error) {
      console.log(err);
      res.json(err);
    }
  }
}

module.exports = new usersController();
