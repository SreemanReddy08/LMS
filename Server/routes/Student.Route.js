const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const nodemailer = require("nodemailer");

//model import
const { StudentModel } = require("../models/student.model");

//middleware import
const { isAuthenticated } = require("../middlewares/authenticate");

//gel all students data
router.get("/all", async (req, res) => {
  try {
    const students = await StudentModel.find();
    res.send({ message: "All students data", students });
  } catch (error) {
    res.status(400).send({ message: "Something went wrong" });
  }
});

// register new students
router.post("/register", isAuthenticated, async (req, res) => {
  const { name, email, password, class: studentClass } = req.body.data;

  try {
    // ✅ Check if student already exists
    const existingStudent = await StudentModel.findOne({ email });

    if (existingStudent) {
      return res.status(400).send({ msg: "User already registered" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      +process.env.Salt_rounds
    );

    // ✅ Create new student
    const student = new StudentModel({
      name,
      email,
      class: studentClass,
      password: hashedPassword,
    });

    await student.save();

    // ✅ Setup nodemailer using environment variables
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Student Account Created",
      text: `Welcome to LMS!

Your Student account has been created successfully.

Email: ${email}
Class: ${studentClass}
Password: ${password}

Please change your password after login.
`,
    };

    // ✅ Send email
    await transporter.sendMail(mailOptions);

    // ✅ Send ONE response only
    res.status(201).send({
      msg: "Student Registered Successfully & Email Sent",
      student,
    });

  } catch (error) {
    console.log("STUDENT REGISTER ERROR:", error);
    res.status(500).send({ msg: "Student Registration Failed" });
  }
});

//student login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await StudentModel.find({ email });
    if (student.length > 0) {
      if (student[0].access == "false") {
        return res.send({ message: "Access Denied" });
      }
      bcrypt.compare(password, student[0].password, (err, results) => {
        if (results) {
          let token = jwt.sign(
            { email, name: student[0].name },
            process.env.secret_key,
            { expiresIn: "7d" }
          );
          res.send({
            message: "Login Successful",
            user: student[0],
            token,
          });
        } else {
          res.status(201).send({ message: "Wrong credentials" });
        }
      });
    } else {
      res.send({ message: "Wrong credentials" });
    }
  } catch (error) {
    res.status(404).send({ message: "Error" });
  }
});

//edit student
router.patch("/:studentId", isAuthenticated, async (req, res) => {
  const { studentId } = req.params;
  const payload = req.body.data;
  try {
    const student = await StudentModel.findByIdAndUpdate(
      { _id: studentId },
      payload
    );
    const updatedStudent = await StudentModel.find({ _id: studentId });
    res
      .status(200)
      .send({ msg: "Updated Student", student: updatedStudent[0] });
  } catch (error) {
    res.status(404).send({ msg: "Error" });
  }
});

//delete student
router.delete("/:studentId", async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await StudentModel.findByIdAndDelete({ _id: studentId });
    res.status(200).send({ msg: "Deleted Student" });
  } catch (error) {
    res.status(400).send({ msg: "Error" });
  }
});

module.exports = router;
