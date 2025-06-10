import { NextResponse } from "next/server";
import { z } from "zod";
import { ErrorValidation, handleError } from "../lib/errors";
import { scrapeAllProducts } from "./scrapeProducts";

const requestSchema = z.object({
  productPageUrl: z.string().url(),
  productCardSelector: z.string(),
  productNameSelector: z.string(),
  productRatingSelector: z.string(),
  totalRatingsSelector: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      throw new ErrorValidation("Invalid request data");
    }
    const {
      productPageUrl,
      productCardSelector,
      productNameSelector,
      productRatingSelector,
      totalRatingsSelector,
    } = body;

    const scrapedData = await scrapeAllProducts({
      pageUrl: productPageUrl,
      productCardSelector,
      productNameSelector,
      productRatingSelector,
      totalRatingsSelector,
    });

    return NextResponse.json(scrapedData, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
