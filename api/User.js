const express = require("express");
const router = express.Router();
const brcypt = require("bcrypt");

const User = require("../models/User");

router.post("/signup", (req, res) => {
  let { name, email, password, dateOfBirth } = req.body;
  name = name.trim();
  email = email.trim();
  password = password.trim();
  dateOfBirth = dateOfBirth.trim();

  if (name == "" || email == "" || password == "" || dateOfBirth == "") {
    res.json({
      status: "FAILED",
      message: "Empty Input fields",
    });
  } else if (!/^[a-zA-Z ]*$/.test(name)) {
    res.json({
      status: "FAILED",
      message: "Invalid name entered",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid Email entered",
    });
  } else if (!new Date(dateOfBirth).getTime()) {
    res.json({
      status: "FAILED",
      message: "Invalid DOB entered",
    });
  } else if (password.length < 8) {
    res.json({
      status: "FAILED",
      message: "Password too short!",
    });
  } else {
    User.find({ email })
      .then((result) => {
        if (result.length) {
          res.json({
            status: "FAILED",
            message: "User with provided email already exists",
          });
        } else {
          const saltRounds = 10;
          brcypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                name,
                email,
                password: hashedPassword,
                dateOfBirth,
              });
              newUser
                .save()
                .then((result) => {
                  res.json({
                    status: "SUCCESS",
                    message: "SignUp Successful!",
                    data: result,
                  });
                })
                .catch((err) => {
                  res.send({
                    status: "FAILED",
                    message: "An error occurred while saving user account",
                  });
                });
            })
            .catch((err) => {
              res.send({
                status: "FAILED",
                message: "An error occurred while hashing password",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occurred while checking for existing user!",
        });
      });
  }
});

router.post("/signin", (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email == "" || password == "") {
    res.send({
      status: "FAILED",
      message: "Empty Input Fields!",
    });
  } else {
    User.find({ email })
      .then((data) => {
        if (data) {
          const hashedPassword = data[0].password;
          brcypt
            .compare(password, hashedPassword)
            .then((result) => {
              if (result) {
                res.json({
                  status: "SUCCESS",
                  message: "SignIn Successful",
                  data: data,
                });
              } else {
                res.send({
                  status: "FAILED",
                  message: "Invalid Password",
                });
              }
            })
            .catch(() => {
              res.send({
                status: "FAILED",
                message: "An error occurred while checking password",
              });
            });
        } else {
          res.send({
            status: "FAILED",
            message: "Invalid Credentials!",
          });
        }
      })
      .catch(() => {
        res.send({
          status: "FAILED",
          message: "An error occurred while checking for existing user",
        });
      });
  }
});

module.exports = router;
