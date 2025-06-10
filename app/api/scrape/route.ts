import { NextResponse } from "next/server";
import { z } from "zod";
import { ErrorValidation, handleError } from "../lib/errors";
import { scrapeAllProducts } from "./scrapeProducts";

const requestSchema = z.object({
  productPageUrl: z.string().url(),
  productRatingSelector: z.string(),
  totalRatingsSelector: z.string(),
  productCardSelector: z.string(),
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
      productRatingSelector,
      totalRatingsSelector,
      productCardSelector,
    } = body;

    const scrapedData = await scrapeAllProducts({
      pageUrl: productPageUrl,
      productCardSelector,
      productRatingSelector,
      totalRatingsSelector,
    });

    return NextResponse.json(scrapedData, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
