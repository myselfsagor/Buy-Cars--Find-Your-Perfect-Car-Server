// require necessary methods
const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const port = process.env.PORT || 5000;

// ----Midleware start----------
app.use(cors());
app.use(express.json());
//-----Midleware end------------

// database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.igq8i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ============ working area start here ===========================
async function run() {
  try {
    await client.connect();
    const database = client.db("allCars");
    const CarCollection = database.collection("carsList");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    const reviewCollection = database.collection("reviews");

    // POST services in database
    app.post("/addProduct", async (req, res) => {
      const car = req.body;
      const result = await CarCollection.insertOne(car);
      res.json(result);
    });

    // GET services from database and send client site
    app.get("/allCars", async (req, res) => {
      const result = await CarCollection.find({}).toArray();
      res.json(result);
    });
    // Get single products
    app.get("/allCars/:id", async (req, res) => {
      const result = await CarCollection.findOne({
        _id: ObjectId(req.params.id),
      });
      res.json(result);
    });
    // POST Orders in DB from client site
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.json(result);
    });

    // GET Orders from database and send to the client site
    app.get("/orders", async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.json(result);
    });

    // cancel order
    app.delete("/deleteOrder/:id", async (req, res) => {
      ordersCollection
        .deleteOne({ _id: ObjectId(req.params.id) })
        .then((result) => {
          res.json(result);
        });
    });
    // add user information in database
    app.post("/addUserInfo", async (req, res) => {
      console.log("req.body");
      const result = await usersCollection.insertOne(req.body);
      res.json(result);
    });

    // make as admin

    app.put("/makeAdmin", async (req, res) => {
      const query = { email: req.body.email };
      const result = await usersCollection.find(query).toArray();
      if (result) {
        const documents = await usersCollection.updateOne(query, {
          $set: { role: "admin" },
        });
      } else {
        const role = "admin";
        const result3 = await usersCollection.insertOne(req.body.email, {
          role: role,
        });
      }
    });

    // check admin role
    app.get("/checkAdmin/:email", async (req, res) => {
      const result = await usersCollection
        .find({ email: req.params.email })
        .toArray();
      res.json(result);
    });

    // update status

    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateStatus = {
        $set: {
          status: "Shipped",
        },
      };
      const result = await ordersCollection.updateOne(query, updateStatus);
      res.json(result);
    });

    // delet order
    app.delete("/deleteProduct/:id", async (req, res) => {
      CarCollection.deleteOne({ _id: ObjectId(req.params.id) }).then(
        (result) => {
          res.json(result);
        }
      );
    });

    // add review

    app.post("/addReview", async (req, res) => {
      const result = await reviewCollection.insertOne(req.body);
      res.send(result);
    });

    // get review

    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// ============ working area end here =============================

// testing server site
app.get("/", (req, res) => {
  res.send("Server Is Running");
});

app.listen(port, () => {
  console.log(`App Server listening at http://localhost:${port}`);
});
