const mongoose = require('mongoose')
const marked = require('marked')
const slugify = require('slugify')
const createDomPurify = require('dompurify')
const {JSDOM} = require('jsdom')
const { sanitize } = require('dompurify')
const dompurify = createDomPurify (new JSDOM().window)



const articleSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    desc : {
        type : String,
        required : true
    },
    markdown : {
        type : String,
        required : true
    },
    authors:{
        type : String,
        required : true,
        default : ""
    },
    createdAt : {
        type : Date,
        default : () => Date.now()
    },
    slug : {
        type : String,
        required : true,
        unique : true
    },
    sanitizedHtml : {
        type : String,
        required : true
    }
})

articleSchema.pre('validate',function(next){
    if(this.title){
        this.slug = slugify(this.title,{
            lower : true,
            strict : true
        })
    }

    if(this.markdown){
        this.sanitizedHtml = dompurify.sanitize(marked(this.markdown),
        { ADD_TAGS: ["iframe"], ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'] })
    }

    next()
})

module.exports = mongoose.model('Article', articleSchema)