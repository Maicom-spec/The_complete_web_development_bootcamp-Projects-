const express = require("express");
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.MONGOURL, {useNewUrlParser: true, useUnifiedTopology: true})

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Walk"
})

const item2 = new Item({
  name: "Read 10 pages of a book"
})

const item3 = new Item({
  name: "Listen to 1 podcast"
})

var defaultItems = [item1, item2, item3]


const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {
    
  if(Item.length === 0){

    Item.insertMany(defaultItems, err => {
      if(err){
        console.log(err)
      } else{
        console.log("Items adicionados com sucesso")
      }
    })
  }

  Item.find({}, (err, foundItems) => {

      if(err){
        console.log("Ocorreu o erro: " + err)
      }

      res.render("list", {listTitle: "Today", newListItems: foundItems});

  })


});

app.get("/:customListName", (req, res) => {

  const customListName = _.capitalize(req.params.customListName)

  List.findOne({name: customListName}, (err, foundList) => {
    if(!err){
      if(!foundList){

        const list = new List({
          name: customListName,
          items: defaultItems
        })

        list.save()

        res.redirect("/" + customListName)
      } else{
        //Show existing List
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name: itemName
  })

  console.log(listName)

  if(listName === "Today"){
    console.log("Estou no today")
    item.save()
    res.redirect("/")
  }else{
    List.findOne({name: listName}, function(err, foundList) {
      console.log("Estou no outro")
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)
    })
  }

});

app.post("/delete", (req, res) => {

  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItemId, err => {
      if(err) {
        console.log("Houve um erro: " + err)
      } else{
        console.log("Tarefa marcada excluida com sucesso")
        res.redirect("/")
      }
    })
  }else{
    List.findOneAndUpdate(
      {name: listName}, 
      {$pull: {items: {_id: checkedItemId  }}},
      (err, foundList) => {
        if(err){
          console.log("Houve um erro: " + err)
        }else{
          res.redirect("/" + listName)
        }
      }
      )
  }

})


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT
if(port == null || port == ""){
  port = 3000
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
