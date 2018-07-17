// Imports
const http = require('http')
const express = require('express')
const cors = require('cors')
const captionService = require('./services/captionService')
const moment = require('moment')

// Create app
const app = express()

// Middleware
app.use(cors())

// Load project configuration
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// Returns captions clustered by timestamp (one timestamp can have
// multiple possible captions) as JSON
app.get('/api/v1/captions', async (req, res) => {
  const { id, target } = req.query
  if (!id) {
    return res.status(422).json({ error: 'No video id was provided.' })
  }

  try {
    const unfilteredCaptions = await captionService.getCaptions(id)

    // Handle possible errors
    if (unfilteredCaptions.error) {
      const { error, status } = unfilteredCaptions
      return res.status(status).json({ error })
    }

    // Filter captions and sort them by timestamp
    const matchingCaptions = unfilteredCaptions.filter(({ captions }) => {
      for (let i = 0; i < captions.length; i++) {
        if (captions[i].trim().length === 0) {
          return false
        }
        if (captions[i].trim().toLowerCase().indexOf(target.trim().toLowerCase()) > -1) {
          return true
        }
      }
      
      return false
    }).sort((a, b) => {
      return moment(a.timestamp, 'hh:mm:ss.SSZ').valueOf() - moment(b.timestamp, 'hh:mm:ss.SSZ').valueOf()
    })

    return res.status(200).json(matchingCaptions)
  } catch (e) {
    console.error('error', e)
    return res.status(422).send({ error: 'Error fetching captions.' })
  }
})

// Initialize server
const PORT = process.env.PORT || 8080
const server = http.createServer(app)
server.listen(PORT, () => {
  console.log(`Listening port ${PORT}`)
})
