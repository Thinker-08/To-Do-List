//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
app.set('view engine', 'ejs');
require("dotenv").config();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const database = process.env.database;
mongoose.connect(database);

const itemsSchema = {
  name:String
};
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list."
});
const item2 = new Item({
  name: "Hit the + button to add a new Item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defalutItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length==0)
    {
      Item.insertMany(defalutItems,function(err){
        if(err)
          console.log(err);
        else 
          console.log("Successfully entered in database!");
      });
    }
    res.render("list", {listTitle:"Today", newListItems: foundItems});
  })
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const ListName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(ListName=="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: ListName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ListName);
    })
  }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName=="Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully Removed");
        res.redirect("/");
      }
    })
  }
  else{
    List.findOneAndUpdate({name : listName},{$pull : {items: {_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName},function(err,found){
    if(!err)
    {
      if(!found){
        const list = new List({
          name: customListName,
          items:defalutItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle:found.name,newListItems:found.items});
      }
    }
  })
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000 || process.env.PORT, function() {
  console.log("Server started on port 3000");
});
