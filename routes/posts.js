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
router.get("/posts",async (req, res) => {
    
        
    if (req.cookies.email && req.cookies.name && req.cookies.picture){
        
        let email = req.cookies.email;
        let name = req.cookies.name;
        let picture = req.cookies.picture;
        let index = Number(req.query.index);
        
        if (Number.isNaN(index) || index < 0) {
            index = 0;
        }
        // let [ques] = await db.query("SELECT * FROM ques WHERE email = ? AND ansrText IS NULL;",[email]);
        let [posts] = await db.query("SELECT * FROM `posts` ORDER BY id DESC LIMIT 4 OFFSET ?;",[ Number( index || 0) * 4]);
        return res.render(
            "posts.ejs",
            {
                "email":email,
                "name":name,
                "picture":picture,
                "posts":posts,
                "index":index
            }
        );
    }else {
        let index = Number(req.query.index);
        if (Number.isNaN(index) || index < 0) {
            index = 0;
        }
        let [posts] = await db.query("SELECT * FROM `posts` ORDER BY id DESC OLIMIT 4 OFFSET ?;",[Number( index || 0)* 4],);
        return res.render(
            "postsNotLogged.ejs",
            {
                "posts":posts,
                "index":index
            }
        );

    }
});

router.get("/posts/:id",async (req, res) => {
    
    
    if (req.cookies.email && req.cookies.name && req.cookies.picture){
        let email = req.cookies.email;
        let name = req.cookies.name;
        let picture = req.cookies.picture;
        
        // let [ques] = await db.query("SELECT * FROM ques WHERE email = ? AND ansrText IS NULL;",[email]);
        let [posts] = await db.query("SELECT * FROM `posts` WHERE id = ?;",(req.params.id));
        if (posts[0]){
            return res.render(
                "onePost.ejs",
                {
                    "email":email,
                    "name":name,
                    "picture":picture,
                    "posts":posts[0]
                }
            );
        } else {
            return res.render(
                "erorr.ejs",
                {
                    "title":"404 ERORR",
                    "desc":"لا يوجد مقالة بهذا العنوان"
                }
            );
        }

    }else {
        let [posts] = await db.query("SELECT * FROM `posts` WHERE id = ?;",(req.params.id));

        if (posts[0]){
            return res.render(
                "onePost.ejs",
                {
                    "email":null,
                    "name":null,
                    "picture":null,
                    "posts":posts[0]
                }
            );
        } else {
            return res.render(
                "erorr.ejs",
                {
                    "title":"404 ERORR",
                    "desc":"لا يوجد مقالة بهذا العنوان"
                }
            );
        }

    }
});

router.get("/ques",async (req, res) => {
    
        
    if (req.cookies.email && req.cookies.name && req.cookies.picture){
        
        let email = req.cookies.email;
        let name = req.cookies.name;
        let picture = req.cookies.picture;
        
        let [ques] = await db.query("SELECT * FROM ques WHERE ansrText IS NOT NULL ORDER BY RAND();");
        return res.render(
            "allques.ejs",
            {
                "email":email,
                "name":name,
                "picture":picture,
                "ques":ques,
            }
        );
    }else {
        let [ques] = await db.query("SELECT * FROM ques WHERE ansrText IS NOT NULL ORDER BY RAND();");
        return res.render(
            "allquesNotLogged.ejs",
            {
                "ques":ques
            }
        );

    }
});





module.exports = router;

