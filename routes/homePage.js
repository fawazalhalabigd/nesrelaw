const express = require('express');
const router = express.Router();
// const Product = require('../models/Posts.js');
const cookieParser = require("cookie-parser");

const mysql = require("mysql2/promise");
require("dotenv").config();
const db = mysql.createPool({
      host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0

});


router.get("/ads/link",async (req, res) => {
    return res.redirect("https://buffetaccommodating.com/hkx8axvb8?key=baa4055c16c279de5b592d63225c45a2");
})
router.get("",async (req, res) => {
    // //-----------------------------------------------------------------------------------------------------------------------------------------------
    // // just in debug mode 
    // res.cookie("email", "fawazalhalabigd@gmail.com", { maxAge: 1000*60*60*24*365*10, httpOnly: false, path: "/" });
    // res.cookie("name", "Fawaz Alhalabi", { maxAge: 1000*60*60*24*365*10, httpOnly: false, path: "/" });
    // res.cookie("picture", "picture", { maxAge: 1000*60*60*24*365*10, httpOnly: false, path: "/" });
    // // just in debug mode 
    // //-----------------------------------------------------------------------------------------------------------------------------------------------
    
    let [posts] = await db.query("SELECT * FROM `posts` ORDER BY RAND() LIMIT 3;",);

        
    if (req.cookies.email && req.cookies.name && req.cookies.picture){
        
        let email = req.cookies.email;
        let name = req.cookies.name;
        let picture = req.cookies.picture;

        return res.render(
            "homePage",
            {
                "email":email,
                "name":name,
                "picture":picture,
                "posts":posts
            }
        );
    }else {
        return res.render(
            "homePageNotloged",
            {
                "email":"null",
                "name":"null",
                "picture":"null",
                "posts":posts
            }
        );

    }
});


router.post("",async (req, res) => {
    
        
    let [posts] = await db.query("SELECT * FROM `posts` ORDER BY RAND() LIMIT 3;",);

    if (req.cookies.email && req.cookies.name && req.cookies.picture){
        
        let email = req.cookies.email;
        let name = req.cookies.name;
        let picture = req.cookies.picture;

        return res.render(
            "homePage",
            {
                "email":email,
                "name":name,
                "picture":picture,
                "posts":posts
            }
        );
    }else {
        return res.render(
            "homePageNotloged",
            {
                "email":"null",
                "name":"null",
                "picture":"null",
                "posts":posts
            }
        );

    }
});



module.exports = router;

