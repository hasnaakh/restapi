const { Router } = require('express');
const controller = require('./controllers/controller');

const router = Router();
const multer = require('multer');
const { sendNotification, getnots, getNotificationsByUser, markAllAsRead ,deleteNotification} = require('./controllers/notiController');

// Set up storage configuration (optional customization)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the folder where you want to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Customize the file name
  }
});

// Initialize multer with storage configuration
const upload = multer({ storage });



router.get("/students", controller.getUsers);
//router.get("/doctors", controller.getDoctors);
router.get("/doctors", controller.getDoctorDetails);
router.get("/courses", controller.getCourses);

//router.post("/", controller.addUser);
router.post("/addstudent", controller.addStudent);
router.post("/adddoctor", upload.single('photo'), controller.addDoctor);
router.post("/addcourse", controller.addCourse);

router.get("/users/:UID", controller.getUserById);
router.get("/courses/:cid", controller.getCourseById);

//router.put("/:UID", controller.updateUser);
router.put("/students/:UID", controller.updateStudent);
router.put("/doctors/:UID", upload.single('photo'),controller.updateDoctor);
router.put("/courses/:cid", controller.updateCourse);

router.delete("/students/:UID", controller.removeStudent);
router.delete("/doctors/:UID", controller.removeDoctor);
router.delete("/courses/:cid", controller.removeCourse);
//router.delete("/:UID", controller.removeUser);

router.get('/schedules', controller.getSchedules);
router.post('/schedules', controller.addSchedule);
router.delete("/schedule/:sid", controller.removeSchedule);

//notification  
router.post('/sendnotification', sendNotification); 
router.get('/notifications',getnots); 
router.get('/usernotifications',getNotificationsByUser); 
router.put('/notifications/markAllAsRead', markAllAsRead); 
router.delete('/notification/:NID', deleteNotification); // New route for deleting a notification


module.exports = router;