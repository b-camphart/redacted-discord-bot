const { Then } = require("@cucumber/cucumber");
const assert = require("assert");

Then("{string} should have received the {string} message", function (username, message) {
    const messages = this.messagesFor(username);
    // @ts-ignore
    assert.ok(messages.find((receivedMessage) => receivedMessage === message));
});
