import { MongoClient } from "mongodb"

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://argha15000_db_user:bOnzST0rnookdlhD@cluster0.xxbxeue.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const options = {}

let client
let clientPromise

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
