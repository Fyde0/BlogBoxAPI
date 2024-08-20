import mongoose from "mongoose"

export async function connectToTestDB() {

    const mongodbTestingDb = process.env.MONGODB_URL_TESTING || process.env.MONGODB_URL

    if (!mongodbTestingDb) {
        throw new Error("Environment variable MONGODB_URL_TESTING or MONGODB_URL required.")
    }
    
    await mongoose.connect(mongodbTestingDb)
    console.log("Connected to MongoDB.")
}

export async function disconnectFromDB() {
    await mongoose.connection.close()
}