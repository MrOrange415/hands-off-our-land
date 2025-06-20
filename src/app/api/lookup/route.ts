import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!zip || !apiKey) {
    return new Response(JSON.stringify({ error: 'Missing zip or API key' }), { status: 500 });
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zip)}&key=${apiKey}`
    );
    const data = await res.json();
    const location = data.results?.[0]?.geometry?.location;
    if (!location) throw new Error('No location found');
    return new Response(JSON.stringify({ lat: location.lat, lng: location.lng }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: 'Failed to fetch coordinates' }), { status: 500 });
  }
} 