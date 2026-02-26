require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));

mongoose.set("strictQuery", true);

const startServer = async () => {
    try {
        if (process.env.MONGO_URI) {
            try {
                await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
                console.log("✅ MongoDB Connected Successfully");
            } catch (err) {
                console.warn("⚠️ Failed to connect to provided MongoDB URI, falling back to In-Memory MongoDB...");
                const mongoServer = await MongoMemoryServer.create();
                const mongoUri = mongoServer.getUri();
                await mongoose.connect(mongoUri);
                console.log("✅ In-Memory MongoDB Connected Successfully");
            }
        } else {
            const mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
            console.log("✅ In-Memory MongoDB Connected Successfully");
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("❌ Server Startup Failed:", error.message);
        process.exit(1);
    }
};

startServer();

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err.message);
    process.exit(1);
});
