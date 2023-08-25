const express = require('express');
const { JsonWebTokenError } = require('jsonwebtoken');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const secretkey = "Loke945409king"

// create different secretKey and middlewares for user signup and authentication

const generateJWT = (user) => {
  const payload = { username : user.username}
  return jwt.sign(payload,secretkey, {expiresIn : '1h'})
}

const authencticateJWT = (req,res,next) => {
  const authHeader = req.headers.authorization

  if(authHeader){
    const token = authHeader.split(' ')[1]
    jwt.verify(token, secretkey, (err,user) => {
      if(err){
        return res.sendStatus(403)
      }
      req.user = user
      next()
    })
  } else {
    res.sendStatus(401)
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
    const token = generateJWT(admin)
    res.json({message: 'Admin created successfully', token})
  }

});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
  const { username, password } = req.headers;
  const admin = ADMINS.find(a => a.username === username && a.password === password)
  if(admin){
    const token = generateJWT(admin)
    res.json({message: 'logged in successfully', token})
  } else {
    res.status(403).json({message : 'Authentication failed'})
  }
});

app.post('/admin/courses', authencticateJWT, (req, res) => {
  // logic to create a course
  const course = req.body
  course.id =  COURSES.length + 1
  COURSES.push(course)
  // COURSES.push({...course, id: COURSES.length + 1})
  res.json({ message:'course created successfully', courseId: course.id })
});

app.put('/admin/courses/:courseId', authencticateJWT, (req, res) => {
  // logic to edit a course
  const courseId = parseInt(req.params.courseId)
  const cousreIndex = COURSES.findIndex(c => c.id === courseId)

  if(cousreIndex > -1){
    const updatedCourse = {...COURSES[cousreIndex], ...req.body}
    COURSES[cousreIndex] = updatedCourse

    res.json({message : 'course updated successfully'})
  } else {
    res.Status(404).json({message : 'Course not found'})
  }
});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
});

app.post('/users/login', (req, res) => {
  // logic to log in user
});

app.get('/users/courses', (req, res) => {
  // logic to list all courses
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
