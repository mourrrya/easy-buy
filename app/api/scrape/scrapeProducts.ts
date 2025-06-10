import puppeteer, { Browser, Page } from "puppeteer";
import { logger } from "../lib/logger";

// Interfaces for input and output
interface ScrapeAllProductsInput {
  pageUrl: string;
  productCardSelector: string;
  productRatingSelector: string;
  totalRatingsSelector: string;
}

interface ScrapedProductCardDetails {
  productRating: string | null;
  totalRatings: string | null;
}

// Helper: Launch Puppeteer browser
const launchBrowser = async (): Promise<Browser> => {
  return puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
};

// Helper: Set up page with random user agent and viewport
const setupPage = async (browser: Browser): Promise<Page> => {
  const page = await browser.newPage();
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
  ];
  await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
  await page.setViewport({ width: 1366, height: 800 });
  return page;
};

// Helper: Navigate to URL with error handling
const navigateToUrl = async (page: Page, url: string) => {
  try {
    await page.goto(url);
    logger.info(`Navigated to URL: ${url}`);
  } catch (error) {
    logger.error(`Error navigating to URL "${url}":`, error);
    throw new Error(`Failed to navigate to URL: ${url}`);
  }
};

// Helper: Scrape product card details
const scrapeProductCards = async (
  page: Page,
  productCardSelector: string,
  productRatingSelector: string,
  totalRatingsSelector: string
): Promise<ScrapedProductCardDetails[]> => {
  logger.debug(`Waiting for selector: ${productCardSelector}`);
  await page.waitForSelector(productCardSelector, { visible: true, timeout: 15000 });
  logger.debug(`Selector ${productCardSelector} is visible. Starting evaluation.`);
  
  const productCards = await page.$$eval(
    productCardSelector,
    (cards, ratingSelector, totalRatSelector) => {
      return cards.map((card) => {
        const ratingElement = card.querySelector(ratingSelector);
        const totalRatingsElement = card.querySelector(totalRatSelector);
        const productRating = ratingElement ? ratingElement.textContent?.trim() || null : null;
        const totalRatings = totalRatingsElement ? totalRatingsElement.textContent?.trim() || null : null;
        return { productRating, totalRatings };
      });
    },
    productRatingSelector,
    totalRatingsSelector
  );

  logger.debug(`Scraped ${productCards.length} product cards.`);
  return productCards;
};

// Main function: scrape all products
export const scrapeAllProducts = async ({
  pageUrl,
  productCardSelector,
  productRatingSelector,
  totalRatingsSelector,
}: ScrapeAllProductsInput): Promise<ScrapedProductCardDetails[]> => {
  let browser: Browser | undefined;
  try {
    logger.info(`Starting scraping for URL: ${pageUrl}`);
    browser = await launchBrowser();
    const page = await setupPage(browser);

    await navigateToUrl(page, pageUrl);

    const productsData = await scrapeProductCards(
      page,
      productCardSelector,
      productRatingSelector,
      totalRatingsSelector
    );

    await browser.close();
    logger.info(`Browser closed after scraping.`);

    if (productsData.length === 0) {
      logger.warn(
        `No products found matching selector "${productCardSelector}" on page: ${pageUrl}`
      );
    }

    return productsData;
  } catch (error) {
    if (browser) await browser.close();
    logger.error("Error during scraping all products:", error);
    throw new Error(
      `Scraping all products failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
