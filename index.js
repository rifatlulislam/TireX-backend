const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const ObjectId = require("mongodb").ObjectId;

// setting up middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.23ilw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("TuaBike");
    const bicycleCollection = database.collection("bicycles");
    const orderCollection = database.collection("orders");
    const userCollection = database.collection("users");
    const reviewCollection = database.collection("reviews");

    // get request cycles from home
    app.get("/bicycles", async (req, res) => {
      const result = await bicycleCollection.find({}).limit(6).toArray();

      res.json(result);
    });

    // get api for loading all cycles from server
    app.get("/allBicycles", async (req, res) => {
      const result = await bicycleCollection.find({}).toArray();
      res.json(result);
    });

    // get api for loading single bicyle
    app.get("/bicycles/:id", async (req, res) => {
      const cycle = req.params.id;
      const query = { _id: ObjectId(cycle) };
      const result = await bicycleCollection.findOne(query);
      res.json(result);
    });

    // post request for saving orders from users
    app.post("/orders", async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      res.json(result);
    });

    // post api for saving user info
    app.post("/users", async (req, res) => {
      const userInfo = req.body;
      const result = await userCollection.insertOne(userInfo);
      res.json(result);
    });

    // get api for loading user products
    app.get("/orders/:email", async (req, res) => {
      const user = req.params.email;
      const query = { userEmail: user };
      console.log(query);
      const result = await orderCollection.find(query).toArray();
      console.log(result);
      res.json(result);
    });

    // delete api for user to delete a product
    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
    // post api for storing reviews
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    // put request giving admin role to an existing user
    app.put("/users", async (req, res) => {
      const email = req.body.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // get api for checking if the user is admin or not
    app.get("/users/:email", async (req, res) => {
      const query = { email: req.params.email };
      const result = await userCollection.findOne(query);
      let isAdmin = false;
      if (result?.role === "admin") {
        isAdmin = true;
        res.json({ admin: isAdmin });
      } else {
        res.json({ admin: isAdmin });
      }
    });
    // post api for adding a cylcle by admin
    app.post("/addBicycle", async (req, res) => {
      const newBiycle = req.body;
      const result = await bicycleCollection.insertOne(newBiycle);
      res.json(result);
    });

    // get api for loading all orders in manage orders
    app.get("/allOrders", async (req, res) => {
      const orders = await orderCollection.find({}).toArray();
      res.json(orders);
    });

    //   put api for updating status
    app.put("/order/status", async (req, res) => {
      const id = req.body.id;
      //   console.log(req.body);
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: { status: req.body.orderStatus },
      };
      const result = await orderCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // delete api for deleting a an order by admin
    app.delete("/orders/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
    // delete api for admin to delete a cycle from collections
    app.delete("/bicycles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bicycleCollection.deleteOne(query);
      res.json(result);
    });
    // get api for loading reviews from client
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.json(result);
    });
  } finally {
    //  await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("TuaBike server is on");
});

app.listen(port, () => {
  console.log(`server running on port,${port}`);
});
