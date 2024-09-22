const { Router } = require('express');
const controller = require('./controllers/controller');
const officehourscontroller = require('./controllers/officehourscontroller');
const db = require('../../db'); 


const router = Router();
const multer = require('multer');
const { sendNotification, getnots, getNotificationsByUser, markAllAsRead ,deleteNotification} = require('./controllers/notiController');


const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type. Only image files are allowed.'), false); // Reject the file
  }
};

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
const upload = multer({ storage, fileFilter, });

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


router.get('/check-email', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await db.query("SELECT u FROM users u WHERE u.email = $1", [email]);

    if (result.rows.length > 0) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
//module.exports = upload;