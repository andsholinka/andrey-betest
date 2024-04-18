module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const auth = require('../middleware/auth');
    const router = require("express").Router();

    router.get("/:id", auth, users.getUserById);
    router.get("/account-number/:accountNumber", auth, users.getUserByAccountNumber);
    router.get("/identity-number/:identityNumber", auth, users.getUserByIdentityNumber);
    router.get("/", auth, users.getUsers);
    router.post("/", auth, users.createUser);
    router.put("/:id", auth, users.updateUser);
    router.delete("/:id", auth, users.deleteUser);
    router.post("/generate-token", users.generateToken);

    app.use('/api/users', router);
}