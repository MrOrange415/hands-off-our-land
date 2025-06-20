export async function GET(request) {
  const { searchParams } = new URL(request.url);
  console.log(`searchParams ${searchParams}`);
  const address = searchParams.get('address');
  const zip = searchParams.get('zip');

  if (!address) {
    return new Response(JSON.stringify({ error: 'Missing address parameter' }), { status: 400 });
  }
  // console.log(`distrinct info address ${address}`)
  const url = `https://geocoding.geo.census.gov/geocoder/geographies/address?street=${encodeURIComponent(address)}&zip=${zip}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
  console.log(`url ${url}`);

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`data ${JSON.stringify(data, null, 2)}`)
    const geo = data.result.addressMatches?.[0]?.geographies;
    const congressional = geo?.["119th Congressional Districts"]?.[0];
    const state = geo?.States?.[0];

    if (!congressional || !state) {
      return new Response(JSON.stringify({ error: 'District info not found' }), { status: 404 });
    }

    const output = {
      district: congressional.NAME,
      state: state.NAME,
      stateCode: state.STUSAB,
      districtCode: congressional.CD119
    };
    
    return new Response(JSON.stringify(output), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to fetch district info' }), { status: 500 });
  }
} 