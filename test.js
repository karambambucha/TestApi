const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const config = require("./config.json");
const axios = require("axios");
const { schedule } = require("node-cron");
const e = require("express");

async function collectAppointments(hours) {
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

  console.log("collectAppointments: Время с ", currentDate, nextDate);
  //если есть в Task есть schedule.id и calltype_id, то не брать
  const appointmentsToCall = await prisma.schedule.findMany({
    where: {
      time_from: {
        gte: currentDate,
        lte: nextDate,
      },
      Tasks: {
        every: {
          calltype_id: {
            not: callTypes[callTypeIndex].id,
          },
          schedule_id: {
            not: schedule.id,
          },
        },
      },
    },
    include: {
      patient: true,
      doctor: true,
      Tasks: true,
    },
  });

  console.log("collectAppointments: Куда звонить:", appointmentsToCall);

  //записать в tasks (phone, JSON data(patient name, doctor name, time), schedule_id, calltype_id, status_id = 1)
  for (appointment of appointmentsToCall) {
    const data = JSON.stringify({
      patient_name: appointment.patient.name,
      doctor_name: appointment.doctor.name,
      time_start: appointment.time_from
        .toISOString()
        .split("T")[1]
        .split(":")
        .slice(0, 2)
        .join(":"),
    });
    console.log(data);
    const task = await prisma.tasks.create({
      data: {
        status_id: 1,
        phone: appointment.patient.phone,
        info: data,
        calltype_id: callTypes[callTypeIndex].id,
        schedule_id: appointment.id,
      },
    });
  }
  return appointmentsToCall;
}

async function caller() {
  const tasks = await prisma.tasks.findMany({
    where: {
      status_id: {
        equals: 1,
      },
    },
  });
  console.log("caller():length of tasks[] ", tasks.length);
  console.log("caller(): tasks[]", tasks);

  if (tasks.length > 0) {
    let callInfo = [];
    for (const t of tasks) {
      callInfo.push({
        phone: t.phone,
        data: t.info,
      });
    }
    console.log("caller(): callInfo: ", callInfo);

    const data = {
      api_key: config.apiKey,
      project_id: config.projectId,
      data: JSON.stringify(callInfo),
    };
    console.log("caller(): data for api: ", data);

    const configuration = {
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

    axios
      .request(configuration)
      .then((response) => {
        const calltaskBulkResponse = response.data;
        console.log("calltask/bulk response: ", JSON.stringify(response.data));
        let callTaskIds = [];
        Object.keys(calltaskBulkResponse).forEach((key) => {
          const data = calltaskBulkResponse[key].data;
          if (data != null) callTaskIds.push(data.call_task_id);
        });

        for (let i = 0; i < tasks.length; i++) {
          tasks[i].call_task_id = callTaskIds[i];
        }
        console.log(tasks);
        for (const task of tasks) {
          const t = prisma.tasks
            .update({
              where: {
                id: task.id,
              },
              data: {
                status_id: 2,
              },
            })
            .then(() => console.log("!"));
          const c = prisma.calls
            .create({
              data: {
                calltask_id: task.call_task_id,
                task_id: task.id,
              },
            })
            .then(() => console.log("!"));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

async function watchdog() {
  const startedTasks = await prisma.tasks.findMany({
    where: {
      status_id: {
        equals: 2,
      },
    },
    include: {
      Calls: true,
    },
  });

  let callTaskIds = [];
  for (const task of startedTasks) {
    callTaskIds.push(task.Calls[0].calltask_id);
  }
  console.log("watchdog(): callTaskIds: ", callTaskIds);

  const data = JSON.stringify({
    project_id: config.projectId,
    api_key: config.apiKey,
    call_task_ids: callTaskIds,
  });

  const configuration = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://go.robotmia.ru/api/calltask/result-bulk",
    headers: {
      "Content-Type": "application/json",
      Cookie:
        "__ddg10_=1729600235; __ddg1_=Dovj6Ivppfchx147xyEF; __ddg8_=4NwHjRMGYhcxP4HH; __ddg9_=212.20.43.195",
    },
    data: data,
  };

  axios
    .request(configuration)
    .then((response) => {
      const rawData = response.data.data;
      console.log("data from calltask/result-bulk: ", JSON.stringify(rawData));
      let dataArray = [];
      Object.keys(rawData).forEach((key) => {
        const data = rawData[key];
        if (data != null) {
          let title = "Не определено";
          if (data.goals.length > 0) title = data.goals[0].title;
          dataArray.push({
            result: data,
            calltask_id: parseInt(key),
            status: title,
          });
        }
      });
      console.log("watchdog(): assorted data: ", dataArray);

      for (const data of dataArray) {
        const c = prisma.calls
          .update({
            where: {
              calltask_id: data.calltask_id,
            },
            data: {
              call_result: data.result,
              call_status: data.status,
              task: {
                update: {
                  status_id: 3,
                },
              },
            },
            include: { task: true },
          })
          .then(() => console.log("!"));
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

//collectAppointments(24);
//caller();
//watchdog();
let currentDate = new Date();
currentDate.setHours(currentDate.getHours() + 7);
let time_from = new Date("2024-10-24T08:00:00.000Z");
const time_start =
  (currentDate.toISOString().split("T")[0] === time_from.toISOString().split("T")[0]
    ? "сегодня "
    : "завтра ") +
  time_from.toISOString().split("T")[1].split(":").slice(0, 2).join(":");

console.log(time_start)