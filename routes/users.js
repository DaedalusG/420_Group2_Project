const { User } = require('../db/models');
const { apiPort } = require('../config');
const { loggedInUser, requireAuth } = require('../auth');
const { asyncHandler, handleValidationErrors } = require('../utils');

const express = require('express');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

const router = express.Router();

router.use(cookieParser());

const csrfProtection = csrf({cookie: true});

const getUser = async userId => {
    // Change fetch url for heroku deployment
    const userData = await fetch(`http://localhost:${apiPort}/users/${userId}`);
    return await userData.json();
}

// User sign up form action
router.post('/', handleValidationErrors, asyncHandler(async (req, res) => {
    // TODO save uploaded pictures to s3
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    await User.create({ username, hashedPassword, email });
    res.status(200);
    res.redirect('/discover');
}));

// Renders a user edit form
router.get('/:id(\\d+)/edit', requireAuth, csrfProtection, asyncHandler(async (req, res) => {
    const userId = req.params.id;
    if(userId !== req.user.id) redirect('/');
    const user = await getUser(userId);
    res.render('user-edit', {user, csrfToken: req.csrfToken()});
}));

// User profile edit form action
router.put('/:id(\\d+)', requireAuth, handleValidationErrors, csrfProtection, asyncHandler(async (req, res) => {
    const userId = req.params.id;
    if(userId !== req.user.id) redirect('/');
    const user = await getUser(userId);
    const { username, password, email } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 8) : user.hashedPassword;
    user.save({ username, hashedPassword, email })
    res.redirect(`/${username}`);
}));

router.delete('/:id(\\d+)', requireAuth, asyncHandler(async (req, res) => {
    if(req.params.id !== req.user.id) redirect('/');
    const user = await getUser(req.params.id);
    user.destroy();
    req.status(200);
}))

module.exports = router;