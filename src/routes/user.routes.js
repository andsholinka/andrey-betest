module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const router = require("express").Router();

    router.get("/:id", users.getUserById);
    router.get("/account-number/:accountNumber", users.getUserByAccountNumber);
    router.get("/identity-number/:identityNumber", users.getUserByIdentityNumber);
    router.get("/", users.getUsers);
    router.post("/", users.createUser);
    router.put("/:id", users.updateUser);
    router.delete("/:id", users.deleteUser);
    router.post("/generate-token", users.generateToken);

    app.use('/api/users', router);
}