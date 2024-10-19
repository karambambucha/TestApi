const axios = require("axios");
let data = JSON.stringify({
  doctor_id: 1,
  date: "2024-10-16",
});

let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: `${process.env.NGROK_URL}/api/appointments`,
  headers: {
    "Content-Type": "application/json",
  },
  data: data,
};

axios
  .request(config)
  .then((response) => {
    //console.log(response.data);
    const freeAppoinments = response.data;
    
    let time_start = freeAppoinments[0].time_from;
    let intervals = [];
    let time_end = freeAppoinments[0].time_to;
    for (let i = 1; i < freeAppoinments.length; i++) {
      if (freeAppoinments[i].time_from == time_end) {
        time_end = freeAppoinments[i].time_to;
      } else {
        if (intervals.length < 3)
          intervals.push({ start: time_start, end: time_end });
        time_start = freeAppoinments[i].time_from;
        time_end = freeAppoinments[i].time_to;
      }
    }
    if (intervals.length < 3)
      intervals.push({ start: time_start, end: time_end });
    console.log(intervals);
  })
  .catch((error) => {
    console.log(error);
  });
