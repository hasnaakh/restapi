const { Router } = require('express');
const controller = require('./controllers/controller');

const router = Router();

router.get("/students", controller.getUsers);
router.get("/doctors", controller.getDoctors);
router.get("/courses", controller.getCourses);

//router.post("/", controller.addUser);
router.post("/addstudent", controller.addStudent);
router.post("/adddoctor", controller.addDoctor);
router.post("/addcourse", controller.addCourse);

router.get("/users/:UID", controller.getUserById);
router.get("/courses/:cid", controller.getCourseById);

//router.put("/:UID", controller.updateUser);
router.put("/students/:UID", controller.updateStudent);
router.put("/doctors/:UID", controller.updateDoctor);
router.put("/courses/:cid", controller.updateCourse);

router.delete("/students/:UID", controller.removeStudent);
router.delete("/doctors/:UID", controller.removeDoctor);
router.delete("/courses/:cid", controller.removeCourse);
//router.delete("/:UID", controller.removeUser);

module.exports = router;