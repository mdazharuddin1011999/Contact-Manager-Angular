const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
dotenv.config();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/profiles", express.static(path.join(__dirname, 'profiles')));

const client = new MongoClient(process.env.DB_CONN, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let database;

app.get('/api/contacts', (req, res)=>{
    const contactsCollection = database.collection('contacts');
    contactsCollection.find({}).toArray().then(docs=>{
        return res.json(docs);
    });
})

app.post('/api/contacts', (req, res)=>{
    const user = req.body;
    const contactsCollection = database.collection('contacts');
    contactsCollection.insertOne(user, (err, result)=>{
        if(err){
            return res.status(500).json({ error: 'Error inserting new contact' });
        }

        const newContact = result.ops[0];
        return res.status(201).json(newContact);
    });
});

app.get('*', (req, res)=>{
    return res.sendFile(path.join(__dirname, 'public/index.html'));
});

client.connect().then(db=>{
    app.listen(3000, ()=>{
        database = client.db("angular-auth");
        console.log("Listening on port 3000 ...");
    })
});