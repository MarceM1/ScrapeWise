"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/product.models";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

export const scrapeAndStoreProduct = async (productUrl: string) => {
  if (!productUrl) return;

  try {
    connectToDB();

    const scrapedProduct = await scrapeAmazonProduct(productUrl);

    if (!scrapedProduct) return;

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatePriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatePriceHistory,
        lowestPrice: getLowestPrice(updatePriceHistory),
        highestPrice: getHighestPrice(updatePriceHistory),
        averagePrice: getAveragePrice(updatePriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      {
        url: scrapedProduct.url,
      },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failde to create/update product: ${error.message}`);
  }
};

export const getProductById = async (productId: string) => {
  try {
    connectToDB();

    const product = await Product.findOne({ _id: productId });

    if (!product) return null;

    return product;
  } catch (error) {
    console.log("error in getProductById", error);
  }
};

export const getAllProducts = async () => {
  try {
    connectToDB();

    const products = await Product.find();

    return products;
  } catch (error) {
    console.log("error in getAllProducts", error);
  }
};

export const getSimilarProducts = async (productId: string) => {
  try {
    connectToDB();

    const currentProduct = await Product.findById(productId);

    if (!currentProduct) return null;

    const similarproducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarproducts;
  } catch (error) {
    console.log("error in getSimilarProduct", error);
  }
};

export const addUserEmailToProduct = async (
  productId: string,
  userEmail: string
) => {
  try {
    const product = await Product.findById(productId);

    if (!product) return;

    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    );

    if (!userExists) {
      product.users.push({ email: userEmail });
      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log("error in addUserEmailToProduct: ", error);
  }
};
