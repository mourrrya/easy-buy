"use client";

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface ScrapeFormInputs {
  productPageUrl: string;
  productCardSelector: string;
  productNameSelector: string;
  productRatingSelector: string;
  totalRatingsSelector: string;
}

interface ScrapedProduct {
  title?: string;
  productRating: string | null;
  totalRatings: string | null;
  error?: string;
}

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScrapeFormInputs>();

  const [scrapedData, setScrapedData] = useState<ScrapedProduct[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<ScrapeFormInputs> = async (data) => {
    setIsLoading(true);
    setApiError(null);
    setScrapedData(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.details || "Failed to fetch data from API"
        );
      }

      if (Array.isArray(result)) {
        setScrapedData(result);
      } else if (result && Array.isArray(result.products)) {
        setScrapedData(result.products);
      } else if (result && result.message && Array.isArray(result.data)) {
        setScrapedData(result.data);
      } else {
        if (result.message && result.data && result.data.length === 0) {
          setScrapedData([]);
          setApiError(
            result.message || "No products found matching the criteria."
          );
        } else if (Array.isArray(result) && result.length === 0) {
          setScrapedData([]);
          setApiError("No products found matching the criteria.");
        } else {
          console.warn("Unexpected API response structure:", result);
          setApiError("Received unexpected data structure from API.");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError("An unknown error occurred.");
      }
      console.error("Scraping submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Scraper</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="productPageUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Product Page URL
          </label>
          <input
            id="productPageUrl"
            type="url"
            {...register("productPageUrl", {
              required: "Product Page URL is required",
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.productPageUrl && (
            <p className="mt-1 text-sm text-red-600">
              {errors.productPageUrl.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="productCardSelector"
            className="block text-sm font-medium text-gray-700"
          >
            Product Card CSS Selector
          </label>
          <input
            id="productCardSelector"
            {...register("productCardSelector", {
              required: "Product Card Selector is required",
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />{" "}
          {errors.productCardSelector && (
            <p className="mt-1 text-sm text-red-600">
              {errors.productCardSelector.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="productNameSelector"
            className="block text-sm font-medium text-gray-700"
          >
            Product Name CSS Selector (within card)
          </label>
          <input
            id="productNameSelector"
            {...register("productNameSelector", {
              required: "Product Name Selector is required",
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.productNameSelector && (
            <p className="mt-1 text-sm text-red-600">
              {errors.productNameSelector.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="productRatingSelector"
            className="block text-sm font-medium text-gray-700"
          >
            Product Rating CSS Selector (within card)
          </label>
          <input
            id="productRatingSelector"
            {...register("productRatingSelector", {
              required: "Product Rating Selector is required",
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.productRatingSelector && (
            <p className="mt-1 text-sm text-red-600">
              {errors.productRatingSelector.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="totalRatingsSelector"
            className="block text-sm font-medium text-gray-700"
          >
            Total Ratings CSS Selector (within card)
          </label>
          <input
            id="totalRatingsSelector"
            {...register("totalRatingsSelector", {
              required: "Total Ratings Selector is required",
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.totalRatingsSelector && (
            <p className="mt-1 text-sm text-red-600">
              {errors.totalRatingsSelector.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? "Scraping..." : "Scrape Products"}
        </button>
      </form>

      {isLoading && (
        <div className="mt-6 text-center">
          <p className="text-lg text-indigo-600">Loading data...</p>
        </div>
      )}

      {apiError && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{apiError}</p>
        </div>
      )}

      {scrapedData && !isLoading && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Scraped Results:</h2>
          {scrapedData.length === 0 && !apiError ? (
            <p>No products found or data extracted.</p>
          ) : scrapedData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {scrapedData[0]?.title !== undefined && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product Title
                      </th>
                    )}
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Rating
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total Ratings
                    </th>
                    {scrapedData[0]?.error !== undefined && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Extraction Error
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scrapedData.map((product, index) => (
                    <tr key={index}>
                      {product.title !== undefined && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.title || "N/A"}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.productRating || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.totalRatings || "N/A"}
                      </td>
                      {product.error !== undefined && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                          {product.error || ""}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !apiError && (
              <p>
                No data to display. The API might have returned an empty set or
                an unexpected response.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
