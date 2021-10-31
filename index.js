const express = require("express");
const cors = require("cors");
const { MongoClient } = require('mongodb');
const ObjectID = require("mongodb").ObjectId;

const app = express();

require('dotenv').config();
//middle ware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.egzwo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("impel-tourism");
        const destinationCollection = database.collection('destinations');
        const reviewsCollection = database.collection('reviews');
        const orderCollection = database.collection('orders');

        //GET DESTINATIONS
        app.get('/destinations', async (req, res) => {
            const cursor = destinationCollection.find({});
            const destinations = await cursor.toArray();
            res.json(destinations);
        })

        //GET Destination by id
        app.get('/destinations/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await destinationCollection.findOne(query);
            res.json(result);
        })

        //Get Reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
        })

        //Get All Orders
        app.get('/allorders', async (req, res) => {
            const options = {
                projection: { _id: 0, order: 1, name: 1, status: 1 }
            };
            const query = {};
            const cursor = orderCollection.find(query, options);
            const allorderObject = await cursor.toArray();

            let allorders = [];

            for (let i = 0; i < allorderObject.length; i++) {

                const query = { _id: ObjectID(allorderObject[i].order) };
                const result = await destinationCollection.findOne(query);
                result.orderedBy = allorderObject[i].name;
                result.status = allorderObject[i].status;
                allorders.push(result);
            }
            res.json(allorders);

        })

        //Post Orders
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
            console.log(order, result);
        })

        //get MY orders by Post
        app.post('/myorders', async (req, res) => {
            const email = req.body.email;
            const options = {
                projection: { _id: 0, order: 1 }
            }
            const query = { email: { $in: [email] } };
            const cursor = orderCollection.find(query, options);
            const ordersObject = await cursor.toArray();
            // console.log(ordersObject);
            const orderKeys = ordersObject.map(od => ObjectID(od.order)); //getting all the order id of the provided email
            //finding destinations by ids
            const queryDestinations = { _id: { $in: [...orderKeys] } };
            const cursor2 = destinationCollection.find(queryDestinations);
            const result = await cursor2.toArray();
            // console.log(result)
            res.json(result);
        })

        //UPdate status
        app.put('/allorders', async (req, res) => {
            const order = req.body;

            const filter = { name: order.orderedBy, order: order._id } //filter by the name of the person and order id
            const updateDoc = {
                $set: {
                    status: "Approved"
                },
            };

            const result = await orderCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        //Delete Status
        app.delete('/allorders', async (req, res) => {
            const orderId = req.query.id;
            const customerName = req.query.customerName;
            const query = { name: customerName, order: orderId } //filter by the name of the person and order id
            const result = await orderCollection.deleteOne(query);
            console.log(result);
            res.json(result);
        })

        //Add New Service
        app.post('/adddestinations', async (req, res) => {
            const newDestination = req.body;
            const result = await destinationCollection.insertOne(newDestination);
            console.log(result);
            res.json(result);
        })

    }
    finally {

    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Welcome to impel tourism server");
});

app.listen(port, () => {
    console.log("Listening to port ", port);
})