const config = require("../../config.json");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const axios = require("axios");
const { schedule } = require("node-cron");

async function getAppointments(hours) { // универсальный (параметр 24/2 часа)
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 7);

  let nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getHours() + hours);

  const appointmentsToCall = await prisma.schedule.findMany({
    where: {
      time_from: {
        gte: currentDate,
        lte: nextDate,
      },
    },
    include: {
      patient: true,
      doctor: true,
    },
  });
  return appointmentsToCall;
}

class Caller {
  async call() {
    let appointments = await getAppointments();
    if (appointments.length > 0) {
      let callData = [];

      for (const item of appointments) {
        callData.push({
          phone: item.patient.phone,
          data: JSON.stringify({
            patient_name: item.patient.name,
            time_start: item.time_from
              .toISOString()
              .split("T")[1]
              .split(":")
              .slice(0, 2)
              .join(":"),
            doctor_name: item.doctor.name,
            calling_id: "24 часа",
            schedule_id: item.id
          }),
        });
      }

      let data = {
        api_key: config.apiKey,
        project_id: config.projectId,
        data: JSON.stringify(callData),
      };

      let apiConfig = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://go.robotmia.ru/api/calltask/bulk",
        headers: {
          "Content-Type": "application/json",
          Cookie: "__ddg1_=Dovj6Ivppfchx147xyEF",
        },
        data: data,
      };

      axios
        .request(apiConfig)
        .then((response) => {
          console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
          console.log(error);
        });
      console.log("Получение: ", data);
    }
  }
}

module.exports = new Caller();
