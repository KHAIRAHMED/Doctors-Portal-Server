const express = require('express')
var cors = require('cors')
const fs = require('fs-extra')
var bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
require('dotenv').config()

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://doctorPortal:${process.env.DB_PASS}@cluster0.0j5gi.mongodb.net/doctorsPortalProject?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static("doctors"))
app.use(fileUpload())
const port = process.env.PORT || 5000

app.get('/', (req, res) => {
  res.send('Hello World!')
})




client.connect(err => {
  const appointmentCollection = client.db("doctorsPortalProject").collection("doctorsAppointment");
  const doctorsCollection = client.db("doctorsPortalProject").collection("doctors");
  // post appointment 

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body
    appointmentCollection.insertOne(appointment)
      .then(result => {
        res.send(result)
      })
  })
  // get appointment
  app.get("/appointments", (req, res) => {
    const email = req.query.email;
    appointmentCollection.find({ email: email })
      .toArray((err, documents) => {
        res.send(documents)
      })

  })


  // get appointment data specific by date 
  app.post("/appointmentByDate", (req, res) => {
    const selectedDate = req.body.selectedDate
    const email = req.body.email
    doctorsCollection.find({ email: email })
      .toArray((err, doctorsInfo) => {
        const filter = { date: selectedDate }
        if (doctorsInfo.length === 0) {
          filter.email = email
        }
        appointmentCollection.find(filter)
          .toArray((err, documents) => {
            res.send(documents)
          })
      })


  })


  // add a doctor 
  app.post("/addDoctor", (req, res) => {
    const file = req.files.file
    const name = req.body.name
    const email = req.body.email
    const qualification = req.body.Qualification
    const appointmentTime = req.body.appointmentTime
    const phone = req.body.phone
    const serviceName = req.body.serviceName


    //  for save image in locally by express 

    // const filePath = `${__dirname}/doctors/${file.name}`
    // file.mv(filePath, err=>{
    //   if(err){
    //    res.status(500).send({msg:"Failed To Upload"})
    //   }
    //   else{
    //     res.send({name : file.name , path : `/${file.name}`})
    //   }

    // })

    // const newImg = fs.readFileSync(filePath);
    const newImg = file.data;
    console.log(newImg)
    const encImg = newImg.toString("base64");
    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64")
    }
    doctorsCollection.insertOne({ name, email, phone, qualification, appointmentTime, serviceName, image })
      .then(result => {
        res.send(result.insertedId)
        // fs.remove(filePath , error=>{
        //   if(error){
        //     res.status(500).send({msg:"Failed To Remove"})
        //     console.log(error)
        //   }
        //   res.send(result.insertedId)
        //   console.log(result)
        // })
      })
  })


  // get a doctor info 

  app.get("/doctors", (req, res) => {
    doctorsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  // get data data from email 
  app.post("/isDoctor", (req, res) => {
    const email = req.body.email
    doctorsCollection.find({ email: email })
      .toArray((err, doc) => {
        res.send(doc)
      })
  })

});


app.listen(port)