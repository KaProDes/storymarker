const express = require('express')
const Article = require('../models/article.js')
const User = require('../models/user.js')
const router = express.Router()
const { auth, requiresAuth } = require("express-openid-connect");
const Request = require('../models/request')



router.get("/",async (req,res)=>{
    if(req.oidc.isAuthenticated()){
        let users = await User.find()
        let adminList = users
        .map((user) => {
          if (user.role == "admin") {
            return user.email;
          }
        })
        .filter((notUndefined) => notUndefined !== undefined);
        res.render("admin/index.ejs",{ users: users, adminList : adminList, user : req.oidc.user })
    }
    else{
        res.redirect("/login")
    }
})

router.get("/users",async (req,res)=>{
    let users = await User.find()
    res.json(users)
})

router.get("/add",requiresAuth(),async (req,res)=>{
    let users = await User.find()
    let adminList = users
    .map((user) => {
      if (user.role == "admin") {
        return user.email;
      }
    })
    .filter((notUndefined) => notUndefined !== undefined);
    if(adminList.includes(req.oidc.user.email))
        res.render("admin/add.ejs",{user:req.oidc.user})
    else
        res.redirect("./")
})

router.post("/",async (req,res)=>{
    const user = new User({
        email : req.body.email,
        role : req.body.inlineRadioOptions
    })
    try{
        await user.save()
        res.redirect("./")
    }
    catch(e){
        console.log(e)
    }
    finally{
        res.redirect("./")
    }
})

router.post("/add/:email/:role/:id",async (req,res)=>{
    const user = new User({
        email : req.params.email,
        role : req.params.role
    })
    try{
        await user.save()
        try{
            await Request.findByIdAndDelete(req.params.id)
            res.redirect("/admin")
        }
        catch(e){
            console.log(e)
        }
        res.redirect("/admin")
    }
    catch(e){
        console.log(e)
    }
    finally{
        res.redirect("./")
    }
})

router.post("/submitrequest",async (req,res)=>{
    const request = new Request({
        email : req.body.email,
        role : req.body.inlineRadioOptions
    })
    console.log(req.body.email, req.body.inlineRadioOptions)
    try{
        await request.save()
        res.redirect("./")
    }
    catch(e){
        console.log(e)
    }
    finally{
        res.redirect("./")
    }
})

router.delete("/:id",async (req,res)=>{
    try{
        await User.findByIdAndDelete(req.params.id)
        res.redirect("./")
    }
    catch(e){
        console.log(e)
    }
    finally{
        res.redirect("./")
    }
})

router.delete("/request/:id",async (req,res)=>{
    try{
        await Request.findByIdAndDelete(req.params.id)
        res.redirect("/admin/request")
    }
    catch(e){
        console.log(e)
    }
    finally{
        res.redirect("/admin/request")
    }
})

router.get("/request", requiresAuth() ,async (req,res)=>{
    let users = await User.find()
    let requests = await Request.find()
    let adminList = users
    .map((user) => {
      if (user.role == "admin") {
        return user.email;
      }
    })
    .filter((notUndefined) => notUndefined !== undefined);
    res.render("admin/request.ejs",{adminList : adminList, user : req.oidc.user, requests : requests})
})

router.get("/profile", requiresAuth(), async (req, res) => {
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
      res.render("admin/profile.ejs", {
        user: req.oidc.user,
        isAdmin: adminList.includes(req.oidc.user.email.toLowerCase()),
        isUser : userList.includes(req.oidc.user.email.toLowerCase())
      });
    } else {
      res.status(404).render("articles/404.ejs");
    }
});


module.exports = router