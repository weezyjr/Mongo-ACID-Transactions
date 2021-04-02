require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT;
const MONGO_URI = constructMongoURI();
const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

function constructMongoURI() {
  let uri = `${process.env.DB_PORTCOL}://`;
  if (process.env.DB_USER_NAME && process.env.DB_PASSWORD) {
    uri += `${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@`;
  }
  uri += `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}/`;
  if (process.env.DB_REPLICA_SET) {
    uri += `?replicaSet=${process.env.DB_REPLICA_SET}`;
  }
  return uri;
}

function connectToMongo() {
  try {
    client.connect();
    client.db(process.env.DB_NAME).command({ ping: 1 });
    console.log(`connected to mongo on ${MONGO_URI}`);
  } catch (err) {
    client.close();
  }
}

async function createDocuments(session) {
  const pizzaCollection = client.db(process.env.DB_NAME).collection("pizza");
  const drinksCollection = client.db(process.env.DB_NAME).collection("drinks");

  const pizzaDocument = {
    name: "Neapolitan pizza",
    shape: "round",
    toppings: ["San Marzano tomatoes", "mozzarella di bufala cheese"],
  };

  const drinksDocument = {
    name: "pepsi",
  };

  const pizzaResult = await pizzaCollection.insertOne(pizzaDocument, { session });
  // uncomment to test the roll back
  // throw new Error('roll-back');
  const drinksResult = await drinksCollection.insertOne(drinksDocument, { session });

  return [pizzaResult, drinksResult];
}

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
  connectToMongo();
});

app.post("/transaction", async (req, res) => {
  const session = client.startSession();
  try {
    session.startTransaction();

    await createDocuments(session);

    await session.commitTransaction();

    res
      .json({
        message: "Transaction done successfully",
      })
      .status(200);
  } catch (err) {
    await session.abortTransaction();
    res.json(err).status(500);
  } finally {
    session.endSession();
  }
});
