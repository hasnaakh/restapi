const { Router } = require('express');
const controller = require('./controller');

const router = Router();

router.get("/", controller.getUsers);
router.post("/", controller.addUser);
router.get("/:UID", controller.getUserById);
router.put("/:UID", controller.updateUser);
router.delete("/:UID", controller.removeUser);

module.exports = router;