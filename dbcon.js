require("dotenv").config();
const { MongoClient } = require("mongodb");

// read from .env
const uri = process.env.MONGODB_URL;
const dbName = process.env.MONGO_DB;
const collName = process.env.MONGO_COLLECTION;

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db(dbName);
    const collection = db.collection(collName);

    // Insert sample data (if empty, it will create db+collection)
    await collection.insertOne({ user: "John Doe", credit: 500 });

    // Show collections
    const collections = await db.collections();
    console.log("Collections in", dbName, ":", collections.map(c => c.collectionName));

    // Show documents in your collection
    const docs = await collection.find().toArray();
    console.log("Documents in", collName, ":", docs);
  } catch (err) {
    console.error("❌ Connection failed:", err);
  } finally {
    await client.close();
  }
}

run();
