const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class scheduleController {
  async addAppointment(req, res, next) {
    try {
      const body = req.body;

      if (!req) return res.sendStatus(400);

      const timeSlot = await prisma.schedule.findMany({
        where: {
          id: body.schedule_id,
        },
      });

      const slot = timeSlot[0];
      console.log(slot);

      if (!slot || slot.doctor_id != body.doctor_id) throw "Не найден слот!"

      if (!slot.is_free) throw "Слот занят!"
    
      if (!slot.time_to > new Date()) throw "Время прошло!"

      const appointment = await prisma.schedule.update({
        where: {
          id: body.schedule_id,
        },
        data: {
          patient_id: body.patient_id,
          is_free: false,
        },
      });

      res.json(appointment);
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }
}

module.exports = new scheduleController();
