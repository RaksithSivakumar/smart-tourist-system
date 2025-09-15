import { NextRequest, NextResponse } from "next/server";
import Tourist from "@/lib/models/User";
import connectDB from "@/lib/mongodb";
import { getCityFromCoords } from "@/lib/geocode";

export async function POST(req: NextRequest) {
  try {
    const { touristId, lat, lng } = await req.json();
    if (!touristId || lat === undefined || lng === undefined)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await connectDB();

    const tourist = await Tourist.findById(touristId);
    if (!tourist) return NextResponse.json({ error: "Tourist not found" }, { status: 404 });

    const city = await getCityFromCoords(lat, lng);

    const location = {
      lat,
      lng,
      city,
      updatedAt: new Date(),
    };

    if (!tourist.tourist) {
      return NextResponse.json({ error: "Not a tourist user" }, { status: 400 });
    }

    // Corrected assignment
    tourist.tourist.lastLocation = location;
    tourist.tourist.locationHistory.push(location);

    await tourist.save();

    return NextResponse.json({ success: true, location });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
