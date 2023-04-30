const cmd = require("node-cmd");
const crypto = require("crypto");
const bodyParser = require("body-parser");

exports.onWebhook = (req, res) => {
    // @ts-ignore
    let hmac = crypto.createHmac("sha1", process.env.SECRET);
    let sig = `sha1=${hmac.update(JSON.stringify(req.body)).digest("hex")}`;

    if (
        req.headers["x-github-event"] === "push" &&
        sig === req.headers["x-hub-signature"]
    ) {
        cmd.run("chmod 777 ./pull_code.sh");

        cmd.get("./git.sh", (err, data) => {
            if (data) {
                console.log(data);
            }
            if (err) {
                console.log(err);
            }
        });

        cmd.run("refresh");
    }

    return res.sendStatus(200);
};
