const express = require("express");
const router = express.Router();
const authenticateToken = require("../utils/authenticateToken");

const fileRouter = require("./tokenApi_routes/fileRouter");
const adminRouter = require("./tokenApi_routes/adminRouter");
const usersRouter = require("./tokenApi_routes/usersRouter");

router.use(authenticateToken);
router.use("/file", fileRouter);
router.use("/admin", adminRouter);
router.use("/users", usersRouter);

module.exports = router;
