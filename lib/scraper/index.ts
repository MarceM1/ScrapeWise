// "use server";

import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../utils";

export const scrapeAmazonProduct = async (url: string) => {
  if (!url) return;

  //BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 33335;
  const session_id = (1000000 * Math.random()) | 0;
  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };
  try {
    //Fetch the product page
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    //Extract the product title

    const title = $("#productTitle").text().trim();

    const currency = extractCurrency($(".a-price-symbol"));
    const currentPrice = extractPrice(
      $("span[data-a-color=price] span.a-offscreen").first(),
      $(".priceToPay span.a-price-whole").first(),
      $(".a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base")
    );
    const originalPrice = extractPrice(
      $("span[data-a-strike=true] span.a-offscreen").first()
    );
    const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");

    const outOfStock =
      $("#availability span").text().trim().toLowerCase() ===
      "currently unavailable";

    const productImages =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      " {}";

    const description = extractDescription($);

    const imageUrls = Object.keys(JSON.parse(productImages));

    //Construct data object with scraped information
    //Complete the scrape to category,reviewsCount,stars
    const data = {
      url,
      currency: currency || "$",
      image: imageUrls[0],
      title,
      description,
      originalPrice: Number(originalPrice) || Number(currentPrice),
      currentPrice: Number(currentPrice) || Number(originalPrice),
      priceHistory: [],
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(originalPrice) || Number(currentPrice),
      discountRate: Number(discountRate),
      category: "category",
      reviewsCount: 97,
      stars: 4.4,
      isOutOfStock: outOfStock,
    };

    return data;
  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`);
  }
};
