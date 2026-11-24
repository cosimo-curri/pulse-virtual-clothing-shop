const express = require("express");
const router = express.Router();

const usersController = require("../../controllers/users");
const shopsController = require("../../controllers/shops");

router.use((req, res, next) => {
    if(req.user.role === "admin")
        next();
    else
        res.json({ message: "ONLY_ADMIN_API" });
});

router.get("/findUser/:value", usersController.findUser);
router.delete("/deleteUser", usersController.deleteUserMiddleware, shopsController.deleteShopFromUser);
router.post("/createShop", usersController.getUserByEmailMiddleware, shopsController.createShop);

module.exports = router;