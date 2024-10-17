/**
 * Author: Donavan Borges
 * CS 132 Spring 2024
 * Date: June 4, 2024
 * 
 * Sever-side Javascript for the movie recommendation app. It is an API created
 * to store movie reviews.
 * 
 *   \(G_G)/
 *      |
 *      |
 *     /\
 * I was approved for an extension by Professor Hovik.
 */

"use strict";

const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(express.static("public"));
app.use(cors());

const REVIEWS_FILE = path.join(__dirname, "reviews.json");

/**
 * Retrieves a list of movie titles that have reviews.
 */
app.get("/movies", async (req, res) => {
    try {
        const reviews = JSON.parse(await fs.readFile(REVIEWS_FILE, "utf8"));
        const movies = reviews.map(review => review.movie);
        const uniqueMovies = [...new Set(movies)];
        res.json(uniqueMovies);
    } catch (err) {
        res.status(500).send("Error reading from reviews file.");
    }
});

/**
 * Retrieves all reviews or in text format depending on the query parameter.
 */
app.get("/reviews", async (req, res) => {
    try {
        const format = req.query.format;
        const reviews = JSON.parse(await fs.readFile(REVIEWS_FILE, "utf8"));
        if (format === "text") {
            const textReviews = reviews.map(review => `${review.movie} - ${review.review} (Rating: ${review.rating}/5)`).join("\n");
            res.type("text").send(textReviews);
        } else {
            res.json(reviews);
        }
    } catch (err) {
        res.status(500).send("Error reading from reviews file.");
    }
});

/**
 * Submits a new review and adds it to the reviews file.
 */
app.post("/reviews", async (req, res) => {
    const { movie, review, rating } = req.body;
    if (!movie || !review || !rating) {
        res.status(400).send("Missing required fields: movie, review, and rating are required.");
        return;
    }
    try {
        const reviews = JSON.parse(await fs.readFile(REVIEWS_FILE, "utf8"));
        reviews.push({ movie, review, rating });
        await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
        res.send("Review added successfully.");
    } catch (err) {
        res.status(500).send("Error writing to reviews file.");
    }
});

// Helper function
/**
 * Initializes the reviews file if it does not exist.
 */
async function initializeReviewsFile() {
    try {
        await fs.access(REVIEWS_FILE);
    } catch (err) {
        if (err.code === "ENOENT") {
            await fs.writeFile(REVIEWS_FILE, JSON.stringify([]));
            console.log("Created a new reviews.json file.");
        } else {
            throw err;
        }
    }
}

initializeReviewsFile().catch(err => {
    console.error("Failed to initialize reviews file:", err);
    process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});