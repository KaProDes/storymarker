const fs = require("fs")
const express = require("express");
const mongoose = require("mongoose");
const Article = require("./models/article");
const User = require("./models/user");
const marked = require('marked')
const articlesRouter = require("./routes/articles.js");
const adminRouter = require("./routes/admin.js");
const methodOverride = require("method-override");
const app = express();
require("dotenv").config();
const { auth, requiresAuth } = require("express-openid-connect");

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  secret: process.env.SECRET,
};

app.use(auth(config));

mongoose.connect(
  process.env.URI,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  }
);

app.use(express.static(__dirname + "/public",{maxage: 86400000}));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));

// all /articles routes will be handled by articlesRouter module from /routes/articles.js
app.use("/articles", articlesRouter);
app.use("/admin", adminRouter);

app.get("/", async (req, res) => {
  let users = await User.find();
  let adminList = users
    .map((user) => {
      if (user.role == "admin") {
        return user.email;
      }
    })
    .filter((notUndefined) => notUndefined !== undefined);
  let userList = users
    .map((user) => {
      if (user.role == "user") {
        return user.email;
      }
    })
    .filter((notUndefined) => notUndefined !== undefined);
  if (req.oidc.isAuthenticated()) {
    let articles = await Article.find().sort({
      createdAt: "desc",
    });
    const metadataManager = await Article.findOne({slug : 'metadata-manager'});
    res.render("articles/index.ejs", {
      articles: articles,
      user: req.oidc.user,
      adminList: adminList,
      userList : userList,
      metadataManager : metadataManager
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/profile", requiresAuth(), async (req, res) => {
  if (req.oidc.user) {
    let users = await User.find();
    let adminList = users
      .map((user) => {
        if (user.role == "admin") {
          return user.email;
        }
      })
      .filter((notUndefined) => notUndefined !== undefined);
    let userList = users
    .map((user) => {
      if (user.role == "user") {
        return user.email;
      }
    })
    .filter((notUndefined) => notUndefined !== undefined);
    res.render("articles/profile.ejs", {
      user: req.oidc.user,
      isAdmin: adminList.includes(req.oidc.user.email.toLowerCase()),
      isUser : userList.includes(req.oidc.user.email.toLowerCase())
    });
    res.send(JSON.stringify(req.oidc.user));
  } else {
    res.status(404).render("articles/404.ejs");
  }
});

app.get("/profilejson", requiresAuth(), (req, res) => {
  if (req.oidc.user) {
    res.send(JSON.stringify(req.oidc.user));
  } else {
    res.status(404).render("articles/404.ejs");
  }
});

app.get("/admins", async (req, res) => {
  let users = await User.find();
  let adminList = users
    .map((user) => {
      if (user.role == "admin") {
        return user.email;
      }
    })
    .filter((notUndefined) => notUndefined !== undefined);
  res.send(JSON.stringify(adminList));
});

//Markdown Render
app.get ('/docs',requiresAuth(), function (req, res) {

  var data = fs.readFileSync('./views/docs/docs.md', 'utf8');
  res.render ('docs/docs.ejs',{user : req.oidc.user, docBody : marked(data)});
});

app.get("*", (req, res) => {
  res.status(404).render("articles/404.ejs");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});
