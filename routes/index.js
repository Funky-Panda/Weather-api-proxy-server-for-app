const url = require('url')
const express = require('express')
const router = express.Router()
const needle = require('needle')
const apicache = require('apicache')
const { stat } = require('fs')

// Env vars
const API_BASE_URL = process.env.API_BASE_URL
const API_KEY_NAME = process.env.API_KEY_NAME
const API_KEY_VALUE = process.env.API_KEY_VALUE

// Init cache
let cache = apicache.middleware

router.get('/', cache('2 minutes'), async (req, res, next) => {
  try {
    const params = new URLSearchParams({
      [API_KEY_NAME]: API_KEY_VALUE,
      ...url.parse(req.url, true).query,
    })

    const units = params.get('units') // Default to metric if units parameter is not provided
    params.delete('units') // Remove the units parameter from the query string

    const apiRes = await needle('get', `${API_BASE_URL}?${params.toString()}&units=${units}`)
    const data = apiRes.body
    // Log the request to the public API
    if (process.env.NODE_ENV !== 'production') {
      console.log(`REQUEST: ${API_BASE_URL}?${params.toString()}&units=${units}`)
    }
    console.log(data["cod"])
    if (data["cod"] == 200){
      res.status(200).json(data)
    } else if (data["cod"] == 404) {
      res.status(404).send("City Not Found")
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

module.exports = router