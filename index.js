const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_DB_URI

const app = express();
const port = process.env.PORT;
const cors = require('cors');
const { create } = require('node:domain');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
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

const JWKS = createRemoteJWKSet(
  new URL("http://localhost:3000/api/auth/jwks")
)

const veryToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) { return res.status(401).json({ message: "Unauthorized" }) }
  const token = authHeader.split(' ')[1];
  if (!token) { return res.status(401).json({ message: "Unauthorized" }) }



  try {
    const { payload } = await jwtVerify(token, JWKS)
    console.log(payload);
    next()
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" })
  }
}

async function run() {
  try {
    await client.connect();
    const db = client.db('DocAppoint')
    const doctorsCollection = db.collection("doctors")
    const doctorBookingCollections = db.collection("Bookings");
    const usersCollection = db.collection("user");


    app.get("/doctors", veryToken, async (req, res) => {
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
    });

    app.patch("/bookings/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updatedData = req.body;

        const result = await doctorBookingCollections.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        res.json(result);
      } catch (error) {
        console.error("PATCH /bookings/:id error:", error);
        res.status(500).json({ message: error.message });
      }
    });

    app.delete("/bookings/:id", async (req, res) => {
      try {
        const { id } = req.params;

        const result = await doctorBookingCollections.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Booking not found" });
        }

        res.json({ message: "Booking deleted successfully", result });
      } catch (error) {
        console.error("DELETE /bookings/:id error:", error);
        res.status(500).json({ message: error.message });
      }
    });


    app.patch("/user/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updatedData = req.body;

        if (!updatedData.password) {
          delete updatedData.password;
        }

        const result = await usersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User updated successfully", result });
      } catch (error) {
        console.error("PATCH /user/:id error:", error);
        res.status(500).json({ message: error.message });
      }
    });


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});