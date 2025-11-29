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

router.get("/admin",async (req, res) => {
    
    let [ques] = await db.query(`
        SELECT * FROM ques;
    `);
    let superUsers = await db.query(`
        SELECT * FROM superUser;
    `);
    const rows = superUsers[0];
    const isSuper = rows.some(row => row.email.trim() === req.cookies.email);

    let [quesNotAnser] = await db.query("SELECT * FROM ques WHERE ansrText IS NULL;");
    let [users] = await db.query("SELECT * FROM users");
    if (isSuper){
        let email = req.cookies.email;
        let name = req.cookies.name;
        let picture = req.cookies.picture;

        return res.render(
            "admin.ejs",
            {
                "email":email,
                "name":name,
                "picture":picture,
                "quesNum":ques.length,
                "userNum":users.length,
                "quesNotAnserNum":quesNotAnser.length
            }
        );
    }else {

        return res.render(
            "erorr.ejs",
            {
                "title":"404 Erorr",
                "desc":"لا يوجد صفحة بهذا العنوان",
            }
        );

    }
});
router.get("/admin/allusers", async (req, res) => {

    // If no login cookie → instantly deny access
    if (!req.cookies.email) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }

    // Query super users table
    let [superUsers] = await db.query("SELECT * FROM superUser");

    // Check if cookie email exists inside superUser table
    const userEmail = req.cookies.email.trim();
    const isSuper = superUsers.some(row => row.email.trim() === userEmail);

    if (!isSuper) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }

    // Admin allowed → fetch all users
    let [users] = await db.query("SELECT * FROM users");

    return res.render("admin_allusers.ejs", {
        "email": userEmail,
        "name": req.cookies.name,
        "picture": req.cookies.picture,
        "users": users
    });
});
router.get("/admin/new/post", async (req, res) => {

    // If no login cookie → instantly deny access
    if (!req.cookies.email) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }

    // Query super users table
    let [superUsers] = await db.query("SELECT * FROM superUser");

    // Check if cookie email exists inside superUser table
    const userEmail = req.cookies.email.trim();
    const isSuper = superUsers.some(row => row.email.trim() === userEmail);

    if (!isSuper) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }

    // Admin allowed → fetch all users
    let [users] = await db.query("SELECT * FROM users");

    return res.render("admin_newpost.ejs", {
        "email": userEmail,
        "name": req.cookies.name,
        "picture": req.cookies.picture,
        "users": users
    });
});

router.post("/admin/new/post", async (req, res) => {

    console.log(req.body);
    // If no login cookie → instantly deny access
    if (!req.cookies.email) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }

    // Query super users table
    let [superUsers] = await db.query("SELECT * FROM superUser");

    // Check if cookie email exists inside superUser table
    const userEmail = req.cookies.email.trim();
    const isSuper = superUsers.some(row => row.email.trim() === userEmail);

    if (!isSuper) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }
    const { title, text } = await req.body;
    await db.query("INSERT INTO posts (title, text) VALUES (?, ?)", [title, text]);
    return res.redirect("/admin/new/post");

});
router.get("/admin/del/post", async (req, res) => {

    // If no login cookie → instantly deny access
    if (!req.cookies.email) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }

    // Query super users table
    let [superUsers] = await db.query("SELECT * FROM superUser");

    // Check if cookie email exists inside superUser table
    const userEmail = req.cookies.email.trim();
    const isSuper = superUsers.some(row => row.email.trim() === userEmail);

    if (!isSuper) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }

    // Admin allowed → fetch all users
    let [posts] = await db.query("SELECT * FROM posts");

    return res.render("admin_delpost.ejs", {
        "email": userEmail,
        "name": req.cookies.name,
        "picture": req.cookies.picture,
        "posts": posts
    });
});
router.get("/admin/del/post/:id", async (req, res) => {

    // If no login cookie → instantly deny access
    if (!req.cookies.email) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }

    // Query super users table
    let [superUsers] = await db.query("SELECT * FROM superUser");

    // Check if cookie email exists inside superUser table
    const userEmail = req.cookies.email.trim();
    const isSuper = superUsers.some(row => row.email.trim() === userEmail);

    if (!isSuper) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }

    const postId = req.params.id;
    await db.query("DELETE FROM posts WHERE id = ?", [postId]);
    res.redirect("/admin/del/post/");

});

router.get("/admin/question/no_anser", async (req, res) => {

    // If no login cookie → instantly deny access
    if (!req.cookies.email) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }

    // Query super users table
    let [superUsers] = await db.query("SELECT * FROM superUser");

    // Check if cookie email exists inside superUser table
    const userEmail = req.cookies.email.trim();
    const isSuper = superUsers.some(row => row.email.trim() === userEmail);

    if (!isSuper) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }
    let [ques] = await db.query("SELECT * FROM ques WHERE ansrText IS NULL;");

    return res.render("admin_quesansr.ejs",{
        
        "email": userEmail,
        "name": req.cookies.name,
        "picture": req.cookies.picture,
        "ques":ques
    });

});


router.get("/admin/question/no_anser/:id", async (req, res) => {

    // If no login cookie → instantly deny access
    if (!req.cookies.email) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }

    // Query super users table
    let [superUsers] = await db.query("SELECT * FROM superUser");

    // Check if cookie email exists inside superUser table
    const userEmail = req.cookies.email.trim();
    const isSuper = superUsers.some(row => row.email.trim() === userEmail);

    if (!isSuper) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }
    let [ques] = await db.query("SELECT * FROM ques WHERE ansrText IS NULL AND 	id = ?;",[req.params.id]);

    return res.render("admin_addansr.ejs",{
        
        "email": userEmail,
        "name": req.cookies.name,
        "picture": req.cookies.picture,
        "ques":ques[0]
    });

});


router.post("/admin/question/no_anser/:id", async (req, res) => {

    // If no login cookie → instantly deny access
    if (!req.cookies.email) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }

    // Query super users table
    let [superUsers] = await db.query("SELECT * FROM superUser");

    // Check if cookie email exists inside superUser table
    const userEmail = req.cookies.email.trim();
    const isSuper = superUsers.some(row => row.email.trim() === userEmail);

    if (!isSuper) {
        return res.render("erorr.ejs", {
            title: "404 Error",
            desc: "لا يوجد صفحة بهذا العنوان",
        });
    }
    await db.query("UPDATE ques SET ansrText = ? WHERE id = ?;",[req.body.ansrText,req.params.id]);

    return res.redirect("/admin/question/no_anser");

});
module.exports = router;

