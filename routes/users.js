const { User } = require("../db/models");
const { apiPort } = require("../config");
const {
  asyncHandler,
  handleValidationErrors,
  signUpValidation,
} = require("../utils");

const express = require("express");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

const router = express.Router();

router.use(cookieParser());

const csrfProtection = csrf({ cookie: true });
console.log("using users router");
const getUser = async (userId) => {
  const userData = await fetch(`http://localhost:${apiPort}/users/${userId}`);
  return await userData.json();
};

// User sign up form action
router.post(
  "/",
  // signUpValidation,
  // handleValidationErrors,
  async (req, res) => {
    console.log(req.body);
    // TODO save uploaded pictures to s3
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await User.create({
      username,
      hashedPassword,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    //Give User token
    const token = generateUserToken(user);
    localStorage.setItem("NOISEWAVE_ACCESS_TOKEN", token);

    res.status(200);
    res.redirect("/");
  }
);

// Renders a user edit form
router.get(
  "/:id(\\d+)/edit",
  csrfProtection,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await getUser(userId);
    res.render("user-edit", { user, csrfToken: req.csrfToken() });
  })
);

// User profile edit form action
router.put(
  "/:id(\\d+)",
  handleValidationErrors,
  csrfProtection,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await getUser(userId);
    const { username, password, email } = req.body;
    const hashedPassword = password
      ? await bcrypt.hash(password, 8)
      : user.hashedPassword;
    user.save({ username, hashedPassword, email });
    res.redirect(`/${username}`);
  })
);

router.delete(
  "/:id(\\d+)",
  asyncHandler(async (req, res) => {
    const user = await getUser(req.params.id);
    user.destroy();
    req.status(200);
  })
);

module.exports = router;
