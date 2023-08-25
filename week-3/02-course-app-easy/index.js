const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req,res,next) => {
  const { username, password } = req.headers;
  const admin = ADMINS.find(a => a.username === username && a.password === password)
  if(admin){
    next()
  } else {
    res.status(403).json({message : 'Authentication failed'})
  }
}

const userAuthentication = (req,res,next) => {
  const {username, password} = req.headers;
  const user = USERS.find(u => u.username === username && u.password === password)
  if(user){
    req.user = user //  add user object to the reques,  If the user's credentials are correct, 
    // this line attaches the user object (authenticated user information) to the req object. 
    // This allows the user object to be accessible in subsequent middleware functions or route handlers.
    next()
  } else {
    res.status(403).send({message : 'login failed'})
  }
}

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body
  const existingAdmin = ADMINS.find(a => a.username === admin.username)
  if(existingAdmin){
    res.status(403).json({message: 'Admin already exists'})
  } else {
    ADMINS.push(admin);
    res.json({message: 'Admin created successfully'})
  }
});

app.post('/admin/login', adminAuthentication, (req, res) => {
  // logic to log in admin
  res.json({'message': "logged in successfully"})
});

app.post('/admin/courses', adminAuthentication, (req, res) => {
  // logic to create a course
  const course = req.body
  if(!course.title){
    return res.json(411).send({"message" : "Enter title "})
  }
  course.id = Date.now();  // timestamp as course id
  COURSES.push(course);
  res.json({"message" : "course added successfully", courseId:course.id});
});

app.put('/admin/courses/:courseId', adminAuthentication, (req, res) => {
  // logic to edit a course
  const courseId = Number(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId)
  if(course){
    Object.assign(course, req.body);
    res.json({"message" : "course updated successfully"})
  } else {
    res.status(404).send({'message' : 'course not found'})
  }
});

app.get('/admin/courses', adminAuthentication, (req, res) => {
  // logic to get all courses
  res.json({courses :  COURSES})
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const user = {...req.body, purchasedCourses:[]}  //The purchasedCourses array is created and initialized within the user object to keep track of the courses that a user has purchased
  // const user = {
  //   username: req.body.username,
  //   password: req.body.password,
  //   purchasedCourses: []
  // }

  USERS.push(user)
  res.json({"message" : "user created successfully"})

});

app.post('/users/login', userAuthentication, (req, res) => {
  // logic to log in user
  res.json({'message':'user logged in successfully'})
});

app.get('/users/courses', userAuthentication, (req, res) => {
  // logic to list all courses
  res.json({course : COURSES.filter(c => c.published)}) // The resulting JSON response will include only the courses that have published: true, 
  // meaning they are available for users to access. The .filter() method is used to filter out courses that are not published (published: false). 

  // alternate way of writing above logic in simple terms :-

  // let filterdCourses = []
  // for(let i=0; i<COURSES.length;i++){
  //   if(COURSES[i].published){
  //     filterdCourses.push(COURSES[i])
  //   }
  // }
  // res.json({courses : filterdCourses})

});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
  const courseId = Number(req.params.courseId)
  const course = COURSES.find(c => c.id === courseId && c.published)
  if(course){
    req.user.purchasedCourses.push(courseId)
    res.json({'message' : 'course purchased successfully'})
  } else {
    res.status(404).json({message : 'course not purchased '})
  }

}); 

app.get('/users/purchasedCourses', userAuthentication, (req, res) => {
  // logic to view purchased courses
  
  // const purchasedCourses = COURSES.filter(c => req.user.purchasedCourses.includes(c.id))
  // res.json({purchasedCourses})

  var purchasedCourseIds = req.user.purchasedCourses
  // Here we need to extract the complete course object from COURSES, which have id's which are present in req.user.purchasedCourses
  var purchasedCourses = []
  for(let i=0;i<COURSES.length;i++){
    if(purchasedCourseIds.indexOf(COURSES[i].id) != -1){
      purchasedCourses.push(COURSES[i])
    }
  }

  res.json({purchasedCourses})

});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
