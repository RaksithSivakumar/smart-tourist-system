export async function getCityFromCoords(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || "Unknown";
  } catch (err) {
    console.error(err);
    return "Unknown";
  }
}
