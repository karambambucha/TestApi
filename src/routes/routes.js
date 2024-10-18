const Router = require("express");
const router = new Router();
const usersController = require("../controllers/usersController")
const scheduleController = require("../controllers/scheduleController")
const doctorController = require("../controllers/doctorController")

router.get("/ping", ping);
router.post("/patient", usersController.registerPatient);
router.get("/patient/:phone", usersController.getPatientByPhone)
router.post("/appointment", scheduleController.addAppointment)
router.get("/appointments", doctorController.getAppointments)
router.get("/doctor/:name", doctorController.getDoctor)
function ping(req, res) {
  console.log("Starting command ping");
  res.send({
    message: "OK",
  });
}

module.exports = router;