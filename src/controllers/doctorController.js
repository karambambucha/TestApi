const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class doctorController {
  async getAppointments(req, res, next) {
    try {
      if (!req) return res.sendStatus(400);
      const body = req.body;
      //генерация расписания
      let appointments = [];
      const startHour = 8;
      const endHour = 20;
      const duration = 30;

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minutes = 0; minutes < 60; minutes += duration) {
          const startTime = new Date(body.date);
          startTime.setHours(hour, minutes);

          const endTime = new Date(startTime);
          endTime.setMinutes(startTime.getMinutes() + duration);

          appointments.push({
            doctor_id: body.doctor_id,
            time_from: startTime,
            time_to: endTime,
          });
        }
      }
      //получение занятых слотов
      const busyAppoinments = await prisma.schedule.findMany({
        select: {
          doctor_id: true,
          time_from: true,
          time_to: true,
        },
        where: {
          is_free: {
            equals: false,
          },
          doctor_id: {
            equals: body.doctor_id,
          },
        },
      });
      //поиск и удаление пересечении занятых временных слотах во всех слотах
      const s = new Set(busyAppoinments.map((e) => JSON.stringify(e)));
      const freeAppoinments = appointments.filter(
        (e) => !s.has(JSON.stringify(e))
      );

      console.log(freeAppoinments);
      res.json(freeAppoinments);
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }
}

module.exports = new doctorController();
