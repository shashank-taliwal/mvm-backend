const express = require("express");
const app = express();
require("./userDetail");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwt_secret = "qwertypoiu12324345";
const port = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());
const MongoURL = "mongodb+srv://anurag:Anurag%408546@cluster0.ywvo22p.mongodb.net/?retryWrites=true&w=majority";
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(MongoURL, {
    useNewUrlParser: true,
}).then(() => { console.log("connected to DB"); })
    .catch((e) => console.log(e));
const user = mongoose.model("userInfo");

app.get("/", async (req, res) => {
    res.json({ status: 200, message: "Server up and running" });
})
app.post("/register", async (req, res) => {
    const { fname, lname, email, password } = req.body;
    const encryptPassword = await bcrypt.hash(password, 10);
    try {
        const oldUser = await user.findOne({ email });
        if (oldUser) {
            console.log("******");
            return res.send({ error: "User Exists" });
        }
        await user.create({
            fname,
            lname,
            email,
            password: encryptPassword,
        });
        console.log(fname);
        res.send({ status: "Ok" })

    } catch (error) {
        res.send({ status: "Error" })
    }
})
app.post("/login-user", async (req, res) => {
    const { email, password } = req.body;

    const new_user = await user.findOne({ email: email });
    // console.log(new_user.password);
    // console.log("new_user")
    // console.log(new_user);
    if (!new_user) {
        console.log("new_user")
        return res.json({ error: "User Not Found" });
    }


    console.log(password);
    console.log(new_user.password);
    let token;
    if (await bcrypt.compare(password, new_user.password)) {
        token = jwt.sign({ user: new_user }, jwt_secret);
        console.log(token);
    }

    if (token) {
        // means the login is successfull
        console.log("login successful")
        console.log(token);
        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
        res.json({ status: "ok", data: token });
    }
    else {
        res.json({ error: "error" });
    }

});



app.post("/nasaImg", async (req, res) => {
    const { token } = req.body;
    try {
        const user = jwt.verify(token, jwt_secret);
        const useremail = user.email;
        user.findOne({ email: useremail }).then((data) => {
            res.send({ status: "ok", data: data });
        })
    } catch (error) {
        res.send({ error: "error" });
    }
});

app.listen(port, () => {
    console.log("server Started");
})
