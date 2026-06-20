const express = require('express')
const Confession = require('../models/Confession')

const router = express.Router()

const toPublicConfession = (confession) => ({
  id: confession._id,
  text: confession.text,
  votes: confession.votes,
  flags: confession.flags,
  createdAt: confession.createdAt,
})

router.get('/', async (req, res, next) => {
  try {
    const sort = req.query.sort === 'trending' ? { votes: -1, createdAt: -1 } : { createdAt: -1 }
    const confessions = await Confession.find().sort(sort).lean()
    res.json(confessions.map(toPublicConfession))
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : ''

    if (text.length < 2 || text.length > 500) {
      return res.status(400).json({ message: 'Confession text must be between 2 and 500 characters.' })
    }

    const confession = await Confession.create({ text })
    res.status(201).json(toPublicConfession(confession))
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/vote', async (req, res, next) => {
  try {
    const direction = req.body.direction === 'down' ? -1 : req.body.direction === 'up' ? 1 : 0

    if (!direction) {
      return res.status(400).json({ message: 'Direction must be "up" or "down".' })
    }

    const confession = await Confession.findByIdAndUpdate(
      req.params.id,
      { $inc: { votes: direction } },
      { new: true },
    )

    if (!confession) {
      return res.status(404).json({ message: 'Confession not found.' })
    }

    res.json(toPublicConfession(confession))
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/flag', async (req, res, next) => {
  try {
    const confession = await Confession.findByIdAndUpdate(
      req.params.id,
      { $inc: { flags: 1 } },
      { new: true },
    )

    if (!confession) {
      return res.status(404).json({ message: 'Confession not found.' })
    }

    res.json(toPublicConfession(confession))
  } catch (error) {
    next(error)
  }
})

router.get('/admin', async (req, res, next) => {
  try {
    const confessions = await Confession.find({ flags: { $gt: 0 } }).sort({ flags: -1, createdAt: -1 }).lean()
    res.json(confessions.map(toPublicConfession))
  } catch (error) {
    next(error)
  }
})

module.exports = router
