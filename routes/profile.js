const express = require('express');
const router = express.Router();
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
router.get("/me",async (req, res) => {
    
        
    if (req.cookies.email && req.cookies.name && req.cookies.picture){
        
        let email = req.cookies.email;
        let name = req.cookies.name;
        let picture = req.cookies.picture;
            try {

        let [ques] = await db.query("SELECT * FROM ques WHERE email = ?;",[email]);
        return res.render(
            "profile.ejs",
            {
                "email":email,
                "name":name,
                "picture":picture,
                "ques":ques
            }
        );

        } catch (err) {
            console.error("DB error:", err);
            return res.status(500).send("Database error");
        }

    }else {
        return res.redirect("/login");

    }
});




module.exports = router;

