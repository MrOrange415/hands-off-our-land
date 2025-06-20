import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!lat || !lng || !apiKey) {
    return new Response(JSON.stringify({ error: 'Missing lat, lng, or API key' }), { status: 400 });
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&key=${apiKey}`
    );
    const data = await res.json();
    const results = data.results;
    if (!Array.isArray(results) || results.length === 0) {
      return new Response(JSON.stringify({ error: 'No address found' }), { status: 500 });
    }
    //   // console.log(`results ${JSON.stringify(results, null, 2)}`)
    //   // console.log(`results[0].formatted_address ${JSON.stringify(results[0].formatted_address)}`)
    const formatted_address = results[0].formatted_address;
    return new Response(JSON.stringify({ address: formatted_address }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: 'Failed to fetch address' }), { status: 500 });
  }
} 