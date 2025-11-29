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


router.get("/ask",async (req, res) => {
    
        
    if (req.cookies.email && req.cookies.name && req.cookies.picture){
        
        let email = req.cookies.email;
        let name = req.cookies.name;
        let picture = req.cookies.picture;

        let [ques] = await db.query("SELECT * FROM ques WHERE ansrText IS NULL AND email = ?;",[email]);
        if (ques.length < 5){
            
            return res.render(
                "userAskPage.ejs",
                {
                    "email":email,
                    "name":name,
                    "picture":picture,
                }
            );
        } else {
            
            return res.render(
                "erorr.ejs",
                {
                    "title":"لايمكنك طرح سؤال",
                    "desc":"لايمكنك طرح سؤال تجاوزت الحد المسموح به من الاسئلة يجب عليك ان تنتظر الى ان يتم الاجابة على اسئلتك السابقة او استخدام حساب اخر",
                }
            );
        }
    }else {
        return res.render(
            "erorr.ejs",
            {
                "title":"منع وصول",
                "desc":"لايمكنك ان تدخل الى هذه الصفحة لانك لم تسجل دخول في الموقع!",
            }
        );

    }
});


router.post("/ask",async (req, res) => {
    
    try{
    req.cookies.email == req.body.email

        await db.query(
            `
            INSERT INTO ques (email, quesText)
            VALUES (?, ?)
            `,[
                req.cookies.email,
                req.body.quesText
            ]
        );
    }catch (err){
        return res.render("erorr.ejs",
            {
                "title":"erorr",
                "desc":err
            }
        );
        console.log(err);
    }




    return res.redirect("/");
});



module.exports = router;

