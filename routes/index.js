const { User, Song } = require('../db/models');
const { loggedInUser, requireAuth } = require('../auth');
const { asyncHandler } = require('../utils');

const express = require('express');
const csrf = require('csurf');

const router = express.Router();

const csrfProtection = csrf({cookie: true});

router.get('/', loggedInUser, (req, res) => {
    if(req.user) res.redirect('/explore');
    res.render('home');
});

router.get('/explore', loggedInUser, (req, res) => {
    // TODO: get all relevant songs from the API and send them to the view
    res.render('explore', {user: req.user});
})

router.get('/upload', requireAuth, (req, res) => {
    // res.render('upload', {csrfToken: req.csrfToken()})
    res.send('upload');
});

router.get('/search', (req, res) => {
    // const { search } = req.query;
    res.render('search-results', { search: req.query, test: "THIS IS A TEST" });
});

router.get('/:username', loggedInUser, asyncHandler(async (req, res) => {
    const {username} = req.params;
    const user = await User.findOne({include: ['Song', 'Like'], where: {username: username}})
    res.render('user-page', {user, currentUser: req.user});
}));

router.get('/:username(\\w+)/:song(\\w+)', loggedInUser, asyncHandler(async (req, res) => {
    const {song} = req.params;
    const songData = await Song.findOne({include: ['User', 'Like', 'Comment'], where: {title: song}});
    res.render('song-page', {songData, currentUser: req.user});
}));

module.exports = router