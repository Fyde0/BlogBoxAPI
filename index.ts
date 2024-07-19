import express from "express"
import mongoose from "mongoose";

import postRoutes from "./routes/post"
import userRoutes from "./routes/user"
import config from "./config"

const app = express()
const PORT = config.port

// TODO Log request

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// TODO API rules

// Routes
app.use("/posts", postRoutes)
app.use("/users", userRoutes)
app.use((req, res, next) => {
    res.status(404).json(new Error('Not found'))
})

mongoose.connect(config.mongoose.url, config.mongoose.options)
    .then(res => {
        console.log("Connected to MongoDB.")
        app.listen(PORT, () => {
            console.log("Listening on port " + PORT + "...")
        }).on("error", (error) => {
            console.error(error)
            throw new Error(error.message)
        })
    })
    .catch(error => {
        console.error("Error connecting to MongoDB.")
    })
