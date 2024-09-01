const { Router } = require('express');
const controller = require('./controller');

const router = Router();

router.get("/", controller.getUsers);
router.get("/doctors", controller.getDoctors);
//router.post("/", controller.addUser);
router.post("/students", controller.addStudent);
router.post("/doctors", controller.addDoctor);
router.get("/:UID", controller.getUserById);
router.put("/:UID", controller.updateUser);
router.delete("/:UID", controller.removeUser);

module.exports = router;