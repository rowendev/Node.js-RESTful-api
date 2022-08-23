const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Student = require("./modules/student");
const methodOverride = require("method-override");

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

mongoose
.connect("mongodb://localhost:27017/studentDB", {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to mongoDB.");
}).catch(e => {
    console.log("monogoDB connection failed.");
    console.log(e);
});

// all students 頁面
app.get("/students", async (req, res) => {
    try {
        let data = await Student.find();
        res.send(data);
    } catch {
        res.send({message:"Error with finding data."});
    }    
});

// student 個人頁面
app.get("/students/:id", async (req, res) => {
    let {id} = req.params;
    try {
        let data = await Student.findOne({id});
        if( data == null) {
            res.send("Cannot find data");
            res.status(404);
        } else {
            res.send(data);
        }
    } catch (e) {
        res.send("Error.")
        console.log(e);
    }
    
});

//把資料放進 mongoDB
app.post("/students", (req, res) => {
    let  {id, name, age, merit, other} = req.body;
    let newStudent = new Student({
        id, 
        name, 
        age, 
        scholarship:{
            merit, 
            other
        }
    });
    newStudent.save().then(() => {
        res.send({message: "Successfully add a new student."})
    }).catch(e => {
        res.status(404);
        res.send(e);
    })
    
});

// update student data (put)
app.put("/students/:id", async (req, res) => {
    let {id, name, age, merit, other} = req.body;
    try {
        let d = await Student.findOneAndUpdate({id}, {
            id,
            name,
            age,
            scholarship: {
                merit,
                other,
            }
        }, {
            new: true,
            runValidators: true,
            overwrite: true,
        });
        res.send("Successful update the data.");
    } catch {
        res.send("Error with updating data.");
        res.status(404);
    }   
});

class newData {
    constructor() {}
    setProperty(key, value) {
        if (key !== "merit" && key !== "other"){
            this[key] = value;
        } else {
            this[`scholarship.${key}`] = value;
        }
    }
}

// update student data (patch)
app.patch("/students/:id", async (req, res) => {
    let {id} = req.params;
    let  {name, age, merit, other} = req.body;
    let newObj = new newData();
    for( let property in req.body){
        newObj.setProperty(property, req.body[property]);
    };
    // console.log(newObj);
    try {
        let d = await Student.findOneAndUpdate({id}, newObj, {
            new: true,
            runValidators: true,
        });
        // console.log(d);
        res.send("Successfully update the data of id:" +id);
    } catch(e) {
        res.status(404);
        res.send(e);
    }
});

// delete student data
app.delete("/students/:id", (req, res) => {
    let {id} = req.params;
    Student.deleteOne({id}).then((msg) => {
        console.log("student id:" + id + " has been deleted");
        res.send("student id:" + id + " has been deleted");
    }).catch((e) => {
        res.send("Delete failed.")
        console.log(e);
    });
});

app.get("/*", (req, res) => {
    res.status(404);
    res.send("404 Not Found.")
})

app.listen(3000, () => {
    console.log("Server is running on port 3000.");
});