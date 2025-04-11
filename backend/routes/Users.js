const express = require('express')
const router = express.Router()

const { registerUser, loginUser, gettingApplications, creatingUser} = require('../controllers/usersController')

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getApplication", gettingApplications);
router.post("/creatingUser", creatingUser);

module.exports = router;