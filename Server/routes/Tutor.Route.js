const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const nodemailer = require("nodemailer");

//model import
const { TutorModel } = require("../models/Tutor.model");

//middleware import
const { isAdminAuthenticated } = require("../middlewares/authenticate");

//get all tutor data
router.get("/all", async (req, res) => {
  try {
    const tutors = await TutorModel.find();
    res.send({ message: "All tutor data", tutors });
  } catch (error) {
    res.status(400).send({ message: "Something went wrong" });
  }
});

//register new tutor
router.post("/register", isAdminAuthenticated, async (req, res) => {
  const { name, email, password, subject } = req.body.data;

  try {
    // ✅ Check if tutor already exists
    const existingTutor = await TutorModel.findOne({ email });

    if (existingTutor) {
      return res.status(400).send({ msg: "User already registered" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      +process.env.Salt_rounds
    );

    // ✅ Create new tutor
    const tutor = new TutorModel({
      name,
      email,
      subject,
      password: hashedPassword,
    });

    await tutor.save();

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
      subject: "Tutor Account Created",
      text: `Welcome to LMS!

Your Tutor account has been created successfully.

Email: ${email}
Subject: ${subject}
Password: ${password}

Please change your password after login.
`,
    };

    // ✅ Send email
    await transporter.sendMail(mailOptions);

    // ✅ Send only ONE response
    res.status(201).send({
      msg: "Tutor Registered Successfully & Email Sent",
      tutor,
    });

  } catch (error) {
    console.log("TUTOR REGISTER ERROR:", error);
    res.status(500).send({ msg: "Tutor Registration Failed" });
  }
});

//tutor login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const tutor = await TutorModel.find({ email });
    if (tutor.length > 0) {
      if (tutor[0].access == "false") {
        return res.send({ message: "Access Denied" });
      }
      bcrypt.compare(password, tutor[0].password, (err, results) => {
        if (results) {
          let token = jwt.sign(
            { email, name: tutor[0].name },
            process.env.secret_key,
            { expiresIn: "7d" }
          );
          res.send({
            message: "Login Successful",
            user: tutor[0],
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

//edit tutor
router.patch("/:tutorId", isAdminAuthenticated, async (req, res) => {
  const { tutorId } = req.params;
  const payload = req.body.data;
  try {
    const tutor = await TutorModel.findByIdAndUpdate({ _id: tutorId }, payload);
    const updatedTutor = await TutorModel.find({ _id: tutorId });
    res.status(200).send({ msg: "Updated Tutor", tutor: updatedTutor[0] });
  } catch (error) {
    res.status(404).send({ msg: "Error" });
  }
});

//delete tutor
router.delete("/:tutorId", async (req, res) => {
  const { tutorId } = req.params;
  try {
    const tutor = await TutorModel.findByIdAndDelete({ _id: tutorId });
    res.status(200).send({ msg: "Deleted Tutor" });
  } catch (error) {
    res.status(404).send({ msg: "Error" });
  }
});

module.exports = router;
