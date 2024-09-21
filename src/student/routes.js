const { Router } = require('express');
const controller = require('./controllers/controller');
const officehourscontroller = require('./controllers/officehourscontroller');


const router = Router();
const multer = require('multer');
const { sendNotification, getnots, getNotificationsByUser, markAllAsRead ,deleteNotification} = require('./controllers/notiController');

// Set up storage configuration (optional customization)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the folder where you want to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); 
  }
});

// Initialize multer with storage configuration
const upload = multer({ storage });

const notiController =require('./controllers/notiController');

router.get("/students", controller.getUsers);
router.get("/doctors/:did", controller.getDoctorDetailsById);
router.get("/doctors", controller.getDoctorDetails);
router.get("/courses", controller.getCourses);
router.get("/course/:cid", controller.getCourseById);
//router.post("/", controller.addUser);
router.post("/addstudent", controller.addStudent);
router.post("/adddoctor", upload.single('photo'), controller.addDoctor);
router.post("/addcourse", controller.addCourse);
 router.get("/users/:UID", controller.getUserById);
router.get("/coursess/:cid", controller.getCoursesById);
router.get('/getdid', controller.getdid);
router.get("/doctorss/:did", controller.getDoctorCourById);

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
router.delete('/notification/:NID', deleteNotification); 


//office hours

router.get('/officehours/:did', officehourscontroller.getOfficeHours);
router.post('/addofficehour', officehourscontroller.addOfficeHour);
router.delete('/officehour/:id', officehourscontroller.deleteOfficeHour);

//contact 
router.post('/submit-contact',notiController.submitContactForm); 
router.get('/contacts',notiController.getcontacts); 
router.delete('/contacts/:cid',notiController.deleteContact);

module.exports = router;