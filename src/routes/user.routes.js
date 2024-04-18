module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const router = require("express").Router();

    router.get("/:id", users.getUserById);
    router.get("/accountNumber/:accountNumber", users.getUserByAccountNumber);
    router.get("/identityNumber/:identityNumber", users.getUserByIdentityNumber);
    router.get("/", users.getUsers);
    router.post("/", users.createUser);
    router.put("/:id", users.updateUser);
    router.delete("/:id", users.deleteUser);

    app.use('/api/users', router);
}