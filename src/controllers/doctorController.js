const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const config = require("../../config.json");

class doctorController {
  async getDoctor(req, res, next) {
    try {
      if (!req) return res.sendStatus(400);
      console.log(req.params.name);
      const doctor = await prisma.doctor.findFirst({
        where: {
          name: {
            equals: req.params.name,
          },
        },
      });

      res.json(doctor);
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }
  async getAppointments(req, res, next) {
    try {
      if (!req) return res.sendStatus(400);
      const body = req.body;
      //генерация расписания
      let appointments = [];

      const startHour = config.startHour;
      const endHour = config.endHour;
      const duration = config.duration;

      const [year, month, day] = body.date.split("-");

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minutes = 0; minutes < 60; minutes += duration) {
          const startTime = new Date(
            Date.UTC(year, month - 1, day, hour, minutes)
          );

          //time[1]-1 потому что почему-то выводится на месяц больше: time[1]=10 => startTime.month = 11
          const endTime = new Date(startTime.getTime() + duration * 60000);

          appointments.push({
            time_from: startTime,
            time_to: endTime,
          });
        }
      }

      //получение занятых слотов
      const busyAppoinments = await prisma.schedule.findMany({
        select: {
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

      const busySet = new Set(
        busyAppoinments.map(
          (e) => e.time_from.getTime() + "-" + e.time_to.getTime()
        )
      );

      const freeAppoinments = appointments.filter(
        (e) => !busySet.has(e.time_from.getTime() + "-" + e.time_to.getTime())
      );
      let time_start = freeAppoinments[0].time_from;
      let time_end = freeAppoinments[0].time_to;

      for (let i = 1; i < freeAppoinments.length; i++) {
        if (freeAppoinments[i].time_from == time_end)
          time_end = freeAppoinments[i].time_to;
        else 
        {
          time_start = freeAppoinments[i].time_from
          time_end = freeAppoinments[i].time_end
        };
      }
      console.log(time_start, time_end);
      res.json(freeAppoinments);
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }
}

module.exports = new doctorController();
