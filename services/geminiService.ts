import { GoogleGenAI, Type } from "@google/genai";

// This is a placeholder for the API key.
// In a real application, this should be handled securely and not hardcoded.
const API_KEY = process.env.API_KEY;

// FIX: Initialize ai only if API_KEY exists to avoid constructor errors.
let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("Gemini API key not found. Fare estimation will use mock data.");
}

interface FareEstimate {
  estimatedFare: number;
  reasoning: string;
}

export const getFareEstimate = async (
  pickup: string,
  dropoff: string,
  isShared: boolean
): Promise<FareEstimate> => {
  const currentHour = new Date().getHours();
  const isNightTime = currentHour >= 22 || currentHour < 6;

  // FIX: Check for the initialized 'ai' instance instead of just the key.
  if (!ai) {
    // Mock response if API key is not available
    const baseFare = Math.floor(Math.random() * 50) + 20;
    let fare = baseFare;
    let reasoning = "Mocked fare calculation based on random distance.";

    if (isNightTime) {
      fare = Math.round(fare * 1.05);
      reasoning += " 5% night-time surcharge applied.";
    }

    if (isShared) {
      fare = Math.round(fare * 0.85);
      reasoning += " 15% discount applied for shared ride.";
    }
    
    return {
      estimatedFare: fare,
      reasoning,
    };
  }

  const model = "gemini-2.5-flash";
  const prompt = `
    You are a fare calculator for a student-run taxi service at the University of Venda in Thohoyandou, Limpopo, South Africa.
    Your currency is South African Rand (ZAR).

    **Pricing Rules:**
    1.  **Base Fare:** ZAR 20.
    2.  **Rate per kilometer:** ZAR 5.
    3.  **Night Surcharge:** A 5% surcharge is applied to the total fare (after distance calculation) for trips during the night. Night time is from 22:00 to 06:00.
    4.  **Shared Ride Discount:** A 15% discount is applied to the final fare if the ride is shared. Apply this discount *after* any night surcharge.

    **Trip Details:**
    -   **Pickup:** "${pickup}"
    -   **Dropoff:** "${dropoff}"
    -   **Current Time:** ${currentHour}:00 (24-hour format)
    -   **Is Shared Ride:** ${isShared ? 'Yes' : 'No'}

    **Your Task:**
    1.  Estimate a plausible distance in kilometers between the pickup and dropoff locations.
    2.  Calculate the fare based on distance (Base Fare + Distance * Rate per km).
    3.  If the current time is during the night, apply the 5% surcharge.
    4.  If the ride is shared, apply the 15% discount to the total.
    5.  Provide the final estimated fare and clear reasoning for the calculation, mentioning the estimated distance, base fare, and any surcharges or discounts applied.

    Do NOT include the currency symbol in the estimatedFare JSON value.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedFare: {
              type: Type.NUMBER,
              description: "The calculated fare in ZAR, as a number, including any surcharges or discounts.",
            },
            reasoning: {
              type: Type.STRING,
              description: "A brief explanation of how the fare was calculated (distance, base fare, time surcharge, shared discount, etc.)."
            },
          },
          required: ["estimatedFare", "reasoning"],
        }
      }
    });

    const resultText = response.text.trim();
    // The Gemini model now handles the full calculation, including the shared discount.
    // This ensures the returned 'reasoning' is consistent with the final 'estimatedFare'.
    const parsedResult: FareEstimate = JSON.parse(resultText);

    return parsedResult;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fallback to mock data on API error
    const baseFare = Math.floor(Math.random() * 50) + 30;
    let fare = baseFare;
    let reasoning = "Could not connect to the smart fare estimator. This is a fallback estimate.";
    
    if (isNightTime) {
      fare = Math.round(fare * 1.05);
      reasoning += " 5% night-time surcharge may apply.";
    }

    if (isShared) {
      fare = Math.round(fare * 0.85);
      reasoning += " 15% shared ride discount may apply.";
    }

    return {
      estimatedFare: fare,
      reasoning,
    };
  }
};