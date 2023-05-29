const express = require("express");
const expressSession = require("express-session");

const expressApp = express();
expressApp.use(
	expressSession({
		secret: "testing secret",
		resave: false,
		saveUninitialized: true,
	})
);
expressApp.use(
	express.json({
		type: ["application/json", "text/plain"],
	})
);

exports.expressApp = expressApp;
