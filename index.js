const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const { MongoClient, ServerApiVersion } = require('mongodb');
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


    app.get("/doctors", async (req, res) => {
      const doctorsData = await doctorsCollection.find().toArray();
      res.send(doctorsData)
    })

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});