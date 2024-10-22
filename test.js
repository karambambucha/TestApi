const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const config = require("./config.json");
const axios = require("axios");
const { schedule } = require("node-cron");

async function getAppointments(hours) {
  // универсальный (параметр 24/2/?? часа), забирает данные, по которым звонков ещё не было по данному типу

  //получение calltypes, обр. сортировка по часам 
  const callTypes = await prisma.callType.findMany({});
  callTypes.sort((a, b) => b.hours_before_call - a.hours_before_call);
  console.log(callTypes);

  //находится индекс текущего calltype
  let callTypeIndex = callTypes.findIndex((o) => o.hours_before_call === hours);

  //находится следующий calltype
  let nextCallType = callTypes[callTypeIndex + 1];

  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 7);
  
  let nextDate = new Date(currentDate);
  nextDate.setHours(nextDate.getHours() + hours);

  //если есть следующий calltype, убираем его из диапазона (допустим сейчас 24 часа, тогда убираются звонки, которые попадаются за 2 часа до приема)
  
  if (nextCallType)
    currentDate.setHours(
      currentDate.getHours() + nextCallType.hours_before_call
    );

  console.log("getAppointments: Время с ", currentDate, nextDate);

  const appointmentsToCall = await prisma.schedule.findMany({
    where: {
      time_from: {
        gte: currentDate,
        lte: nextDate,
      },
      Calls: {
        every: {
          calltype_id: {
            not: callTypes[callTypeIndex].id,
          },
        },
      },
    },
    include: {
      patient: true,
      doctor: true,
      Calls: true,
    },
  });

  console.log("getAppointments: Куда звонить:", appointmentsToCall);
  return appointmentsToCall;
}

async function callClients(appointmentsToCall) {
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
          schedule_id: item.id,
        }),
      });
    }

    let data = {
      api_key: config.apiKey,
      project_id: config.projectId,
      data: JSON.stringify(callData),
    };
    console.log("Данные для апи мии:", data);
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
    //      response.data.
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  }
}

//getAppointmentsIn24Hours();

getAppointments(2);
