const axios = require('axios');
let data = JSON.stringify({
  "doctor_id": 1,
  "date": "2024-10-16"
});

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://f726-185-209-113-87.ngrok-free.app/api/appointments',
  headers: { 
    'Content-Type': 'application/json'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log((response.data));
  const freeAppoinments = response.data
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
})
.catch((error) => {
  console.log(error);
});

