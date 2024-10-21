const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const config = require("../../config.json");

class scheduleController {
  async addAppointment(req, res, next) {
    try {
      const body = req.body;

      if (!req) return res.sendStatus(400);

      const date = new Date(body.time_from);
      const hour = date.getUTCHours();
      const minute = date.getMinutes();

      const startHour = config.startHour;
      const endHour = config.endHour;
      const duration = config.duration;

      const slot = await prisma.schedule.findFirst({
        where: {
          time_from: date,
        },
      });

      console.log(slot);

      if (
        hour < startHour ||
        hour > endHour ||
        (minute != 0 && minute != duration)
      )
        throw "Неверный слот!";
      if (+date < Date.parse(new Date().toUTCString())) throw "Время прошло!";

      const date_end = new Date(date);
      date_end.setTime(date_end.getTime() + 30 * 60_000);

      const appointment = await prisma.schedule.create({
        data: {
          doctor_id: body.doctor_id,
          time_from: date,
          time_to: date_end,
          patient_id: body.patient_id,
          is_free: false,
          type: body.type,
        },
      });

      res.json(appointment);
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }

  async markNotified(req, res, next) {
    try {
      const slot = await prisma.schedule.update({
        where: {
          id: req.body.id
        },
        data: {
          is_notified: true
        }
      });
      res.json(slot);
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }
}

module.exports = new scheduleController();
