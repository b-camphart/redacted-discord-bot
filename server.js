const express = require("express");

const app = express();
const port = 3000;

app.post("/git", require("./glitch/webhook").onWebhook);
