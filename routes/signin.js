require("dotenv").config();
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const cookieParser = require("cookie-parser");
const DiscordStrategy = require("passport-discord").Strategy;

const mysql = require("mysql2/promise");
const express = require("express");
const router = express.Router();

// ---- MySQL connection ----
const db = mysql.createPool({
    host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0

});

// ---- Serialize & Deserialize ----
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

/* ---------------------------------------------------
   HELPER FUNCTION TO SAVE OR UPDATE USER
--------------------------------------------------- */
async function saveOrUpdateUser(email, name, picture) {
  // إدراج أو تحديث البيانات إذا كان البريد موجود

    
  // res.cookie("picture", picture, {
  //     maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
  //     secure: false,   // true if your site is HTTPS
  //     httpOnly: false, // false so JS can read it
  //     path: "/"
  // });
  // res.cookie("name", name, {
  //     maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
  //     secure: false,   // true if your site is HTTPS
  //     httpOnly: false, // false so JS can read it
  //     path: "/"
  // });

  // res.cookie("email", email, {
  //     maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
  //     secure: false,   // true if your site is HTTPS
  //     httpOnly: false, // false so JS can read it
  //     path: "/"
  // });

  await db.query(
    `INSERT INTO users (email, name, picture)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       picture = VALUES(picture)`,
    [email, name, picture]
  );
}

/* ---------------------------------------------------
   GOOGLE STRATEGY
--------------------------------------------------- */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const verified = profile._json?.email_verified;
        const name = profile.displayName;
        const picture = profile.photos?.[0]?.value;

        if (!email || !verified) return done(null, false);

        await saveOrUpdateUser(email, name, picture);

        done(null, { email, name, picture });
      } catch (err) {
        done(err);
      }
    }
  )
);

/* ---------------------------------------------------
   GITHUB STRATEGY
--------------------------------------------------- */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value || `${profile.username}@github.com`;
        const name = profile.displayName || profile.username;
        const picture = profile.photos?.[0]?.value;

        await saveOrUpdateUser(email, name, picture);

        done(null, { email, name, picture });
      } catch (err) {
        done(err);
      }
    }
  )
);

/* ---------------------------------------------------
   DISCORD STRATEGY
--------------------------------------------------- */
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: ["identify", "email", "avatar"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.email;
        const name = profile.username;
        const picture = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : null;

        if (!email) return done(null, false);

        await saveOrUpdateUser(email, name, picture);

        done(null, { email, name, picture });
      } catch (err) {
        done(err);
      }
    }
  )
);

/* ---------------------------------------------------
   SERIALIZE & DESERIALIZE
--------------------------------------------------- */
passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});
/* ---------------------------------------------------
   ROUTES
--------------------------------------------------- */

router.get("/login", (req, res) => {
  res.render("signin.ejs");
});

/* --- Google --- */
router.get("/auth/google", passport.authenticate("google", {
  scope: ["email", "profile"],
}));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    
    const { email, name, picture } = req.user;

    // Set cookies here
    res.cookie("email", email, { maxAge: 1000*60*60*24*365*10, httpOnly: false, path: "/" });
    res.cookie("name", name, { maxAge: 1000*60*60*24*365*10, httpOnly: false, path: "/" });
    res.cookie("picture", picture, { maxAge: 1000*60*60*24*365*10, httpOnly: false, path: "/" });

    res.redirect("/");
  }

);

/* --- GitHub --- */
router.get("/auth/github", passport.authenticate("github", {
  scope: ["user:email"],
}));

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    
    const { email, name, picture } = req.user;

    // Set cookies here
    res.cookie("email", email, { maxAge: 1000*60*60*24*365*10, httpOnly: false, path: "/" });
    res.cookie("name", name, { maxAge: 1000*60*60*24*365*10, httpOnly: false, path: "/" });
    res.cookie("picture", picture, { maxAge: 1000*60*60*24*365*10, httpOnly: false, path: "/" });

    res.redirect("/");
  }
);
/* --- discord --- */

// Discord OAuth
router.get("/auth/discord", passport.authenticate("discord"));

router.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/login" }),
  (req, res) => {
    
    const { email, name, picture } = req.user;

    // Set cookies here
    res.cookie("email", email, { maxAge: 1000*60*60*24*365*10, httpOnly: false, path: "/" });
    res.cookie("name", name, { maxAge: 1000*60*60*24*365*10, httpOnly: false, path: "/" });
    res.cookie("picture", picture, { maxAge: 1000*60*60*24*365*10, httpOnly: false, path: "/" });

    res.redirect("/");
  }
);
/* ---------------------------------------------------
   BASIC EMAIL LOGIN (same as your code)
--------------------------------------------------- */
router.post("/login-email", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.send("❌ Email required.");
  if (!email.includes("@")) return res.send("❌ Invalid email.");

  try {
    await db.query(
      "INSERT IGNORE INTO users (email) VALUES (?)",
      [email]
    );
    res.send(`✅ Email ${email} saved to MySQL!`);
  } catch (err) {
    console.error(err);
    res.send("❌ Something went wrong.");
  }
});

module.exports = router;
