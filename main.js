require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mysql = require("mysql2/promise");

const cookieParser = require("cookie-parser");
const path = require('path');
const data = require('./db.js');

const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
// ---- Session middleware ----
app.use(
  session({
    secret: "keyboard cat", // use a strong secret in production
    resave: false,
    saveUninitialized: false,
  })
);

// ---- Passport setup ----
app.use(passport.initialize());
app.use(passport.session());


// Use cookie-parser
app.use(cookieParser());

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// محرك العرض (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes Define
// app.use('/api/photos', require('./routes/photoApi.js'));
app.use('/', require('./routes/signin.js'));
app.use('/', require('./routes/homePage.js'));
app.use('/', require('./routes/userAsk.js'));
app.use('/', require('./routes/admin.js'));
app.use('/', require('./routes/profile.js'));
app.use('/', require('./routes/posts.js'));
app.use('/', require('./routes/photoApi.js'));
// app.use('/product', require('./routes/productPage.js'));
// app.use('/api', require('./routes/appApi.js'));

// app.use((req, res, next) => {
//   res.status(404).render("404")
// });

// google-site-verification=06mhtTRlL-cfkAxrOy3f_Nze3embvf8ZQjS4h-jqQVw

const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');


// Your website pages
const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.8 },
  { url: '/contact', changefreq: 'monthly', priority: 0.8 },
  { url: '/contact', changefreq: 'monthly', priority: 0.8 },
  // Add your legal articles here
  { url: '/articles/register-company', changefreq: 'weekly', priority: 0.9 },
  { url: '/articles/real-estate-law', changefreq: 'weekly', priority: 0.9 },
];

app.get('/sitemap.xml', async (req, res) => {
  try {
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');

    const smStream = new SitemapStream({ hostname: 'https://nesrenlaw.com/' });
    const pipeline = smStream.pipe(createGzip());

    links.forEach(link => smStream.write(link));
    smStream.end();

    const sitemap = await streamToPromise(pipeline);
    res.send(sitemap);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});


app.use((req, res) => {
    res.status(404).render(
        "erorr.ejs",
        {
            "title":"404 Erorr",
            "desc":"لا يوجد صفحة بهذا العنوان",
        }
    );
});

app.listen(PORT, async () => {
    await data.first();
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    // require("./db")
});