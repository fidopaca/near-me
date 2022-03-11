const express = require("express");
const axios = require("axios");
const url = require("url");

const router = express.Router();

router.get("/:query", async (req, res, next) => {
  try {
    // add api ket and query strings to url
    const params = new URLSearchParams({
      access_token: process.env.API_KEY,
      ...url.parse(req.url, true).query,
    });

    const query = req.params.query;
    const results = await axios(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?${params}`);

    // format data to include city and state
    results.data.features.forEach((item) => {
      item.context.forEach((type) => {
        if (type.id.includes("place")) {
          item.city = item.text;
        }
        if (type.id.includes("region")) {
          item.state = item.text;
        }
      });
    });

    return res.status(200).json(results.data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
