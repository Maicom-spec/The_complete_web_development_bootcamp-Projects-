const express = require('express')
const mongoose = require('mongoose')
const ejs = require('ejs')

const port = 5000
const app = express()

app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

mongoose.connect("mongodb://localhost:27017/wikiDB", {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})

const articlesSchema = {
    title: String,
    content: String
}

const Article = mongoose.model('Article', articlesSchema)

// All articles 

app.route('/articles')
.get((req, res) => {
    Article.find({}, (err, results) => {
        if(!err){
            res.send(results)
        } else {
            res.send(err)
        }
    })
})
.post((req, res) => {
    const title = req.body.title
    const content = req.body.content
    
    const newArticle = new Article({
        title: title,
        content: content
    })

    newArticle.save(err => {
        if(err){
            res.send(err)
        } else{
            res.send("Succesfully added a new article")
        }
    })
})
.delete((req, res) => {
    Article.deleteMany(err => {
        if(!res){
            res.send(err)
        } else {
            res.send('Successfully deleted all articles')
        }
    })
})

// Specific articles 

app.route('/articles/:article')
.get((req, res) => {
    const title = req.params.article
    Article.findOne({title: title}, (err, results) => {
        if(!err && results){
            res.send(results)
        } else if(!err && !results){
            res.send(`Nenhum artigo encontrado pelo titulo: <strong>${title}<strong>`)
        } else {
            throw new Error
        }
    })
})
// atualiza um artigo
.put((req, res) => {
    const title = req.params.article
    Article.updateOne(
        {title: title},
        {title: req.body.title, content: req.body.content},
        err => {
            if (!err) {
                res.send("Successfully changed")
            } else {
                res.send("Houve o seguinte erro: " + err)
            }
        }
    )
})
// atualiza um tópico específico
.patch((req, res) => {
    Article.updateOne(
        {title: req.params.article},
        {$set: req.body},
        err => {
            if(!err){
                res.send("Successfully changed")
            } else {
                res.send(`There is an error ${err}`)
            }
        }
    )
})
//deleta um tópico específico
.delete((req, res) => {
    Article.deleteOne(
        {title: req.params.article},
        err => {
            if(!err){
                res.send("Successfully deleted")
            } else {
                res.send("There is an error " + err)
            }
        }
    )
})


app.listen(port, (req, res) => {
    console.log(`Server up and running on port ${port}`)
})