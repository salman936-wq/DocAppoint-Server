const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_DB_URI

const app = express();
const port = process.env.PORT;
const cors = require('cors');
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Server working');
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const db = client.db('DocAppoint')
    const doctorsCollection = db.collection("doctors")
    const doctorBookingCollections = db.collection("Bookings");

    app.get("/doctors", async (req, res) => {
      const doctorsData = await doctorsCollection.find().toArray();
      res.send(doctorsData)
    })

    app.get("/doctors/:id", async (req, res) => {
      const { id } = req.params;
      const singleDoctorsData = await doctorsCollection.findOne({ _id: new ObjectId(id) });
      res.send(singleDoctorsData);
    });

    app.get("/bookings/:id", async (req, res) => {
      const { id } = req.params;
      const bookingsByUser = await doctorBookingCollections
        .find({ userId: id })
        .toArray();
      res.json(bookingsByUser);
    });


    app.post("/bookings", async (req, res) => {
      try {
        const bookAppointmentDetails = req.body;
        const result = await doctorBookingCollections.insertOne(
          bookAppointmentDetails
        );
        res.send(result);

      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message
        });
      }
      console.log(req.body)
    });


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});