import { getBaseUrl } from '@/lib/getBaseUrl';

// Types for the legislator data
interface Term {
  type: 'sen' | 'rep';
  state: string;
  district?: number;
  start: string;
  end: string;
  party?: string;
  url?: string;
  office?: string;
  phone?: string;
  contact_form?: string;
  [key: string]: unknown;
}

interface Legislator {
  id: Record<string, unknown>;
  name: { first: string; last: string; [key: string]: unknown };
  bio: Record<string, unknown>;
  terms: Term[];
  [key: string]: unknown;
}

function getCurrentTerm(legislator: Legislator): Term | undefined {
  return Array.isArray(legislator.terms)
    ? legislator.terms.reduce((latest: Term | undefined, term: Term) => {
        return !latest || new Date(term.start) > new Date(latest.start) ? term : latest;
      }, undefined)
    : undefined;
}

function simplifyRep(rep: Legislator) {
  const term = getCurrentTerm(rep);
  return {
    name: `${rep.name.first} ${rep.name.last}`,
    district: `${term?.state}-${term?.district}`,
    party: term?.party,
    phone: term?.phone || term?.phone,
    office: term?.office,
    website: term?.url,
    contact_form: term?.contact_form || null,
  };
}

function simplifySen(sen: Legislator) {
  const term = getCurrentTerm(sen);
  return {
    name: `${sen.name.first} ${sen.name.last}`,
    party: term?.party,
    phone: term?.phone || term?.phone,
    office: term?.office,
    website: term?.url,
    contact_form: term?.contact_form || null,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');

  if (!zip) {
    return new Response(JSON.stringify({ error: 'Missing zip parameter' }), { status: 400 });
  }

  const baseUrl = getBaseUrl();

  // Step 1: Lookup coordinates from zip
  let coords;
  try {
    const lookupRes = await fetch(`${baseUrl}/api/lookup?zip=${encodeURIComponent(zip)}`);
    if (!lookupRes.ok) throw new Error('Failed to lookup coordinates');
    coords = await lookupRes.json();
    if (!coords.lat || !coords.lng) throw new Error('Coordinates not found');
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to get coordinates from zip' }), { status: 500 });
  }

  // Step 2: Get address from coordinates
  let address;
  try {
    const url = `${baseUrl}/api/reverse-geocode?lat=${encodeURIComponent(coords.lat)}&lng=${encodeURIComponent(coords.lng)}`;
    const addressRes = await fetch(url);
    if (!addressRes.ok) throw new Error('Failed to get address');
    address = await addressRes.json();
    if (!address.address) throw new Error('Address not found');
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to get address from coordinates' }), { status: 500 });
  }

  // Step 3: Get district info from address and zip
  let districtInfo;
  try {
    const url = `${baseUrl}/api/district-info?address=${encodeURIComponent(address.address)}&zip=${encodeURIComponent(zip)}`;
    console.log(`url ${url}`);
    const districtRes = await fetch(url);
    if (!districtRes.ok) throw new Error('Failed to get district info');
    districtInfo = await districtRes.json();
    console.log(`districtInfo ${districtInfo}`);
    if (!districtInfo.stateCode || !districtInfo.districtCode) throw new Error('District info not found');
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to get district info from address' }), { status: 500 });
  }

  // Step 4: Get legislators from stateCode and districtCode
  let legislators;
  try {
    const legislatorsRes = await fetch(`${baseUrl}/api/get-legislators?stateCode=${encodeURIComponent(districtInfo.stateCode)}&districtCode=${encodeURIComponent(districtInfo.districtCode)}`);
    if (!legislatorsRes.ok) throw new Error('Failed to get legislators');
    legislators = await legislatorsRes.json();
    if (!legislators.representatives || !legislators.senators) throw new Error('Legislators not found');
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to get legislators from district info' }), { status: 500 });
  }

  const representatives = legislators.representatives || [];
  const senators = legislators.senators || [];

  return new Response(
    JSON.stringify({
      representative: representatives[0] ? simplifyRep(representatives[0]) : null,
      senators: senators.map(simplifySen)
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
} 