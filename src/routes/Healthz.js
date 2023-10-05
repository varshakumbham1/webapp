const express = require('express');
const router = express.Router();
const sequelize = require('../database/index')

router.get('/', async (req, res) => {
    try {
        res.set('Cache-Control', 'no-cache');
        if (Object.keys(req.body).length > 0) {
            res.status(400).send();
        }
        if (Object.keys(req.query).length > 0) {
            res.status(400).send();
        } else {
            await sequelize.authenticate();
            res.status(200).send();
        }a
    } catch (error) {
        res.status(503).send();
    }
});

router.all('/', async(req, res) => {
    return res.status(405).send();
} )

module.exports = router;
