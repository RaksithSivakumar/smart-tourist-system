//1. Import Google Generative AI SDK and dotenv for environment variable support.
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from "dotenv";
import { NextRequest, NextResponse } from 'next/server';

//2. Initialize dotenv.
dotenv.config();

//3. Initialize Gemini AI client with error checking.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}
const genAI = new GoogleGenerativeAI(apiKey);

//4. Define enhanced response types for better TypeScript support.
interface FoodStore {
  name: string;
  address: string;
  specialty: string;
  priceRange: string;
  googleMapsUrl?: string;
  website?: string;
}

interface FoodStreet {
  name: string;
  description: string;
  popularDishes: string[];
  bestTimeToVisit: string;
  topStores: FoodStore[];
}

interface LocalRestriction {
  category: string;
  restriction: string;
  penalty: string;
}

interface EnhancedLocationResponse {
  coordinates: [number, number];
  title: string;
  country: string;
  city: string;
  famousFoodStreets: FoodStreet[];
  localRestrictions: LocalRestriction[];
  culturalTips: string[];
  currency: string;
  language: string;
}

//5. POST handler function for App Router.
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate request body
    if (!body || !body.value) {
      return NextResponse.json(
        { error: 'Request body must contain a "value" field.' },
        { status: 400 }
      );
    }

    //6. Get the generative model (using correct Gemini model).
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    //7. Create the enhanced prompt with comprehensive location and food information.
    const prompt = `You are an advanced location and food discovery service that returns comprehensive JSON responses about places.

IMPORTANT: You must return a JSON object with the following structure:

{
  "coordinates": [latitude, longitude],
  "title": "Location Name",
  "country": "Country Name",
  "city": "City Name",
  "famousFoodStreets": [
    {
      "name": "Street/Area Name",
      "description": "Brief description of the food scene",
      "popularDishes": ["dish1", "dish2", "dish3"],
      "bestTimeToVisit": "time recommendation",
      "topStores": [
        {
          "name": "Store/Restaurant Name",
          "address": "Full address",
          "specialty": "Main dish/cuisine",
          "priceRange": "Budget/Mid-range/Expensive",
          "googleMapsUrl": "https://maps.google.com search URL (if famous)",
          "website": "official website if available"
        }
      ]
    }
  ],
  "localRestrictions": [
    {
      "category": "Category (e.g., 'Littering', 'Public Behavior', 'Food Safety')",
      "restriction": "Specific rule (e.g., 'No plastic disposal in streets')",
      "penalty": "Consequence (e.g., 'Fine of $500')"
    }
  ],
  "culturalTips": [
    "Cultural dining etiquette tip 1",
    "Local food customs tip 2",
    "Social behavior tip 3"
  ],
  "currency": "Local currency",
  "language": "Primary language"
}

INSTRUCTIONS:
1. For coordinates: Use exact [latitude, longitude] format as numbers
2. For food streets: Include 2-4 famous food streets/areas with authentic local recommendations
3. For food stores: Include 3-5 real, well-known establishments per food street
4. For restrictions: Include important local laws/customs visitors should know
5. For cultural tips: Include dining etiquette and food-related cultural norms
6. Make Google Maps URLs in format: "https://maps.google.com/maps?q=[Store+Name]+[City]"
7. Only include websites for very famous establishments you're confident about

User request: ${body.value}

Return ONLY valid JSON, no other text, markdown, or formatting. Ensure all data is accurate and helpful for food tourists.`;

    //8. Generate content using Gemini.
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    //9. Extract content from the response.
    const responseText = response.text().trim();
    
    //10. Check if the content is valid JSON.
    if (responseText && (responseText[0] === '{' || responseText.startsWith('```json'))) {
      //11. Clean up response if it includes markdown formatting.
      let cleanedResponse = responseText;
      if (responseText.startsWith('```json')) {
        cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      
      try {
        //12. Parse the content to JSON.
        const json = JSON.parse(cleanedResponse);
        
        //13. Validate the enhanced JSON structure.
        if (json.coordinates && 
            json.title && 
            json.country &&
            json.city &&
            Array.isArray(json.coordinates) && 
            json.coordinates.length === 2 &&
            typeof json.coordinates[0] === 'number' &&
            typeof json.coordinates[1] === 'number' &&
            typeof json.title === 'string' &&
            typeof json.country === 'string' &&
            typeof json.city === 'string' &&
            Array.isArray(json.famousFoodStreets) &&
            Array.isArray(json.localRestrictions) &&
            Array.isArray(json.culturalTips)) {
          
          //14. Additional validation for food streets structure
          const validFoodStreets = json.famousFoodStreets.every((street: any) =>
            street.name && street.description && 
            Array.isArray(street.popularDishes) && 
            street.bestTimeToVisit &&
            Array.isArray(street.topStores)
          );

          //15. Additional validation for restrictions structure  
          const validRestrictions = json.localRestrictions.every((restriction: any) =>
            restriction.category && restriction.restriction && restriction.penalty
          );

          if (validFoodStreets && validRestrictions) {
            //16. Respond with a 200 status and parsed JSON.
            console.log('Successfully parsed enhanced location data:', json);
            return NextResponse.json(json as EnhancedLocationResponse);
          } else {
            console.log('Invalid food streets or restrictions structure');
            return NextResponse.json({ tryAgain: true });
          }
          
        } else {
          //17. Respond with tryAgain if JSON structure is invalid.
          console.log('Invalid enhanced JSON structure:', json);
          return NextResponse.json({ tryAgain: true });
        }
      } catch (parseError) {
        //18. Handle JSON parsing errors.
        console.error('JSON Parse Error:', parseError);
        return NextResponse.json({ tryAgain: true });
      }
    } else {
      //19. Respond with tryAgain if the content is not valid JSON.
      console.log('Response is not valid JSON format:', responseText);
      return NextResponse.json({ tryAgain: true });
    }
  } catch (error) {
    //20. Handle any errors by responding with a 500 status and the error.
    console.error('Gemini API Error:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'Failed to process request';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

//21. Helper function for web scraping food store information (optional enhancement)
async function scrapeStoreInfo(storeName: string, city: string) {
  try {
    // This would integrate with a web scraping service
    // Example implementation with a hypothetical scraping API
    const searchQuery = `${storeName} ${city} restaurant`;
    
    // You could integrate with services like:
    // - Google Places API
    // - Yelp API  
    // - Zomato API
    // - Custom web scraping service
    
    console.log(`Would scrape info for: ${searchQuery}`);
    
    return {
      website: null,
      rating: null,
      reviews: null,
      hours: null
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return null;
  }
}

//22. Optional: Handle other HTTP methods with proper error responses.
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to get location and food information.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to get location and food information.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to get location and food information.' },
    { status: 405 }
  );
}