const Router = require("express");

const router = new Router();

router.get('/ping', ping)

function ping(req, res) {
    console.log("Starting command ping")
    res.send(
        {
            message: "OK"
        }
    )

}

module.exports = router