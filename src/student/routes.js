const { Router } = require('express');
const controller = require('./controllers/controller');

const router = Router();

router.get("/students", controller.getUsers);
router.get("/doctors", controller.getDoctors);

//router.post("/", controller.addUser);
router.post("/addstudent", controller.addStudent);
router.post("/adddoctor", controller.addDoctor);

router.get("/users/:UID", controller.getUserById);

//router.put("/:UID", controller.updateUser);
router.put("/students/:UID", controller.updateStudent);
router.put("/doctors/:UID", controller.updateDoctor);

router.delete("/students/:UID", controller.removeStudent);
router.delete("/doctors/:UID", controller.removeDoctor);
//router.delete("/:UID", controller.removeUser);

module.exports = router;