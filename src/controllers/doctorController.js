const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class doctorController {
    async getAppointments(req, res, next) {
        try {
          if (!req) return res.sendStatus(400);
          const body = req.body;

          const user = await prisma.schedule.findMany({
            where: {
              is_free: {
                equals: true,
              },
              doctor_id:{
                equals: body.doctor_id
              },
              time_from: {
                lte: new Date(body.date + " 23:59:59").toISOString(),
                gte: new Date(body.date).toISOString()
              }
            },
          });
          res.json(user);
        } catch (err) {
          console.log(err);
          res.json(err);
        }
      }
}

module.exports = new doctorController()