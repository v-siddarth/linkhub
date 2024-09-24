import express from "express";
import { connectDB } from "./dbConnect.js";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
const port = 3000;
const app = express();
app.use(cors());
app.use(express.json());

// connectDB();
const newspapers = [
  {
    name: "cityam",
    address: "https://www.xerve.in/prices/s-mobiles",
    base: "", // If needed, add base URL here
  },
];

const articles = [];

newspapers.forEach((newspaper) => {
  axios
    .get(newspaper.address)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      // Target the div with class containing "_list--view"
      $("div._list--view").each(function () {
        // Find the anchor tag within the div
        const anchor = $(this).find("a");

        // Extract title and URL
        let title = anchor.text().trim();

        // Clean up the title to remove \n and excessive whitespace
        title = title.replace(/\s+/g, " ").trim();

        // Extract all spans with the class 'compgrid' within this block
        let priceDetails = [];
        $(this)
          .find("span.compgrid")
          .each(function () {
            let priceText = $(this).text().trim();

            // Remove newline characters and excessive spaces from the price text
            priceText = priceText.replace(/\s+/g, " ").trim();

            priceDetails.push(priceText);
          });

        const jiomartPrice = priceDetails[0] || null; // Extract Jiomart price
        const amazonPrice = priceDetails[1] || null; // Extract Amazon price
        const flipkartPrice = priceDetails[2] || null; // Extract Flipkart price

        const url = anchor.attr("href");

        // Push the result to the articles array
        articles.push({
          title,
          url: newspaper.base + url, // Combine with base URL if necessary
          source: newspaper.name,
          jiomartPrice,
          amazonPrice,
          flipkartPrice,
        });
      });

      // Output the articles array
      // console.log(articles);
    })
    .catch((error) => {
      console.error(`Error fetching ${newspaper.name}:`, error);
    });
});

app.get("/", (req, res) => {
  res.json("Welcome to my Climate Change News API");
});

app.get("/prices", (req, res) => {
  res.json(articles);
});
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
