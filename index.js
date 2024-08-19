require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const { shops } = require("./src/config");
// const { syncAllProductsBetweenShops } = require("./src/sync");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Setup a cron job to run sync every hour
cron.schedule("0 * * * *", async () => {

    // await syncAllProductsBetweenShops(shop1, shop2);
    console.log("Cron job: All products synced successfully.");

});

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
