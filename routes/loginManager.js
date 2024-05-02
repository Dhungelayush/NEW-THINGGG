const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require("fs");

const filePath = path.join( "Server-data", "merchants.json");

router.post('/merchantRegister', (req, res) => {
  const { email } = req.body;
  const merchantsData = readMerchantsData();
  if (merchantsData.merchantEmails.includes(email)) {
    return res.status(400).json({ error: "Email already registered" });
  }
  merchantsData.merchantEmails.push(email);
  writeMerchantsData(merchantsData);
  res.json({ message: "Merchant registered successfully" });
});

function readMerchantsData() {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    return { merchantEmails: [] }; 
  }
}

function writeMerchantsData(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing JSON file:", error);
  }
}

router.get('/merchantEmail', (req, res) => {
  const merchantsData = readMerchantsData();
  res.json(merchantsData);
 
});

module.exports = router;
