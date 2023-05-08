const { setWorldConstructor, Before } = require("@cucumber/cucumber");
const { TestContext } = require("../fixtures/TestContext");

setWorldConstructor(TestContext);
