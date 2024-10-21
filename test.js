const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const config = require("./config.json");
const axios = require("axios");
const { schedule } = require("node-cron");

async function getAppointmentsIn24Hours() {
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 7);

  let nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + 1);

  const appointmentsToCall = await prisma.schedule.findMany({
    where: {
      is_notified: false,
      time_from: {
        lte: nextDate,
      },
    },
    include: {
      patient: true,
      doctor: true,
    },
  });

  console.log(appointmentsToCall);

  if (appointmentsToCall.length > 0) {
    let callData = [];

    for (const item of appointmentsToCall) {
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
          calling_in: "24 часа",
          schedule_id: item.id
        }),
      });
    }

    let data = {
      api_key: config.apiKey,
      project_id: config.projectId,
      data: JSON.stringify(callData),
    };
    console.log(data);
    let configuration = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://go.robotmia.ru/api/calltask/bulk",
      headers: {
        "Content-Type": "application/json",
        Cookie:
          "__ddg10_=1729506008; __ddg1_=Dovj6Ivppfchx147xyEF; __ddg8_=xeTOvn1qbYNmfbOq; __ddg9_=185.209.113.87",
      },
      data: data,
    };

    // axios
    //   .request(configuration)
    //   .then((response) => {
    //     console.log(JSON.stringify(response.data));
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  }
}

getAppointmentsIn24Hours();
