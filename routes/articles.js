const express = require('express')
const Article = require('../models/article.js')
const User = require('../models/user.js')
const router = express.Router()
const { auth, requiresAuth } = require("express-openid-connect");

//everything here is going to be relative to /articles

//New articles route to render out the form @/articles/new
router.get('/new',requiresAuth(),async(req,res)=>{
    try{
        let users = await User.find()
        let adminList = users.map(user=>{
            if(user.role=="admin"){
                return (user.email)
            }    
        }).filter(notUndefined => notUndefined !== undefined)
        if(adminList.includes(req.oidc.user.email.toLowerCase())){
            res.render('articles/new',{article:new Article(), user: req.oidc.user})
        }
        else{
            res.redirect("/")
        }
    }
    catch(e){
        res.redirect("/")
    }
    res.redirect("/")
})

router.get('/edit/:id',requiresAuth(),async (req,res)=>{
    try{
        let users = await User.find()
        let adminList = users.map(user=>{
            if(user.role=="admin"){
                return (user.email)
            }    
        }).filter(notUndefined => notUndefined !== undefined)
        if(adminList.includes(req.oidc.user.email.toLowerCase())){
            const article = await Article.findById(req.params.id)
            res.render('articles/edit',{article:article, user : req.oidc.user})
        }
        else{
            res.redirect("/")
        }
    }
    catch(e){
        res.redirect("/")
    }
})


router.get("/:slug",requiresAuth(),async (req,res)=>{
    const article = await Article.findOne({slug : req.params.slug});
    if(article == null) {res.redirect("/")}
    let users = await User.find()
    let adminList = users.map(user=>{
        if(user.role=="admin"){
            return (user.email)
        }    
    }).filter(notUndefined => notUndefined !== undefined)
    let userList = users
    .map((user) => {
      if (user.role == "user") {
        return user.email;
      }
    })
    .filter((notUndefined) => notUndefined !== undefined);
    res.render("articles/show",{article : article, user : req.oidc.user, adminList : adminList, userList : userList})
})

//Post Route to submit i.e POST the Article @articles

router.post('/',requiresAuth(),async (req,res,next)=>{
    req.article = new Article()
    next()
}, saveArticleAndRedirect('new'))

router.put("/:id",async (req,res,next)=>{
    req.article = await Article.findById(req.params.id)
    next()
},saveArticleAndRedirect('edit'))

function saveArticleAndRedirect(path){
    
    return async (req,res) =>{
        let article = req.article
        article.title = req.body.title
        article.desc = req.body.desc
        article.markdown = req.body.markdown
        if(path == 'new'){
            article.authors = req.oidc.user.email+"/"
        }
        else{
            authorsList = article.authors.split("/")
            if(!((authorsList).includes(req.oidc.user.email))){
                article.authors += req.oidc.user.email+"/"
            }    
        }
        try{
            article = await article.save()
            res.redirect(`/articles/${article.slug}`)
        }catch(e){
            res.render(`articles/${path}`,{article:article})
        }
    }
}


router.delete('/:id',requiresAuth(),async (req,res) => {
    let users = await User.find()
    let adminList = users.map(user=>{
        if(user.role=="admin"){
            return (user.email)
        }    
    }).filter(notUndefined => notUndefined !== undefined)
    if(adminList.includes(req.oidc.user.email.toLowerCase())){
        await Article.findByIdAndDelete(req.params.id)
    }
    res.redirect("/")
})


module.exports = router