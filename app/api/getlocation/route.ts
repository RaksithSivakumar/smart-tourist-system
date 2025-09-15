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

CRITICAL COORDINATE ACCURACY REQUIREMENTS:
- You MUST provide highly accurate latitude and longitude coordinates with at least 4-6 decimal places
- Use precise city center coordinates or the most central/popular area of the requested location
- For cities: Use the main city center coordinates (e.g., city hall, main square, or downtown area)
- For neighborhoods/areas: Use the exact neighborhood center coordinates
- For landmarks: Use the precise landmark coordinates
- DOUBLE-CHECK coordinate accuracy - wrong coordinates will break the mapping functionality

EXAMPLES of ACCURATE coordinates:
- Tokyo, Japan: [35.6762, 139.6503] (Tokyo Station area)
- New York, USA: [40.7128, -74.0060] (Manhattan center)
- Paris, France: [48.8566, 2.3522] (Notre-Dame area)
- Mumbai, India: [19.0760, 72.8777] (South Mumbai)
- London, UK: [51.5074, -0.1278] (City of London)

IMPORTANT: You must return a JSON object with the following structure:

{
  "coordinates": [precise_latitude, precise_longitude],
  "title": "Exact Location Name",
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
          "address": "Full address with postal code",
          "specialty": "Main dish/cuisine",
          "priceRange": "Budget/Mid-range/Expensive",
          "googleMapsUrl": "https://maps.google.com/maps?q=[Store+Name]+[Full+Address]",
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
  "currency": "Local currency with symbol (e.g., 'Japanese Yen (¥)')",
  "language": "Primary language"
}

DETAILED INSTRUCTIONS:
1. COORDINATES: Use precise [latitude, longitude] with 4-6 decimal places - verify accuracy!
2. FOOD STREETS: Include 2-4 famous, real food streets/markets/areas with authentic recommendations
3. FOOD STORES: Include 3-5 real, well-known establishments per food street with accurate addresses
4. RESTRICTIONS: Include important local laws, customs, and regulations visitors should know
5. CULTURAL TIPS: Include specific dining etiquette, tipping customs, and food-related cultural norms
6. GOOGLE MAPS URLs: Format as "https://maps.google.com/maps?q=[Store+Name]+[Street+Address]+[City]"
7. WEBSITES: Only include for very famous establishments you're confident about
8. ADDRESSES: Include full addresses with street numbers, postal codes when possible
9. PRICE RANGES: Use realistic local pricing context (Budget = local cheap eats, Expensive = high-end dining)
10. ACCURACY: All information must be factually accurate and helpful for food tourists

COORDINATE VERIFICATION CHECKLIST:
- ✓ Are the coordinates in the correct city/country?
- ✓ Do they point to a central, accessible location?
- ✓ Are they precise enough (4+ decimal places)?
- ✓ Have you double-checked the latitude/longitude order?

User request: ${body.value}

Return ONLY valid JSON, no other text, markdown, or formatting. Ensure all coordinate and location data is highly accurate.`;

    console.log('Generated Prompt:', prompt);

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
          const validFoodStreets = json.famousFoodStreets.every((street: FoodStreet) =>
            street.name && street.description && 
            Array.isArray(street.popularDishes) && 
            street.bestTimeToVisit &&
            Array.isArray(street.topStores)
          );
          
          const validRestrictions = json.localRestrictions.every((restriction: LocalRestriction) =>
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