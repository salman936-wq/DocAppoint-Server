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
  res.send('Server working properly');
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});