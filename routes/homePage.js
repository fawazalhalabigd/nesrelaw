const express = require('express');
const router = express.Router();
const db = require('../db');
// const Product = require('../models/Posts.js');
const cookieParser = require("cookie-parser");

router.get("",async (req, res) => {
    
        
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
            }
        );
    }else {
        return res.render(
            "homePageNotloged",
            {
                "email":"null",
                "name":"null",
                "picture":"null",
            }
        );

    }
});


router.post("",async (req, res) => {
    
        
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
            }
        );
    }else {
        return res.render(
            "homePageNotloged",
            {
                "email":"null",
                "name":"null",
                "picture":"null",
            }
        );

    }
});



module.exports = router;

