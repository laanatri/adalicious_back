const express = require('express')
const router = express.Router()
const db = require('../db')

router.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM meals;")
        res.status(200).send(result.rows)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

module.exports = router;