const express = require("express");
const cors = require("cors");

const port = process.env.PORT || 5000;
const app = express();

//middle ware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Welcome to impel tourism server");
});

app.listen(port, () => {
    console.log("Listening to port ", port);
})