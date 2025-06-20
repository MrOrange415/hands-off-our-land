import legislators from '@/data/legislators-current.json';
import { NextRequest } from 'next/server';

// Types for the legislator data
interface Legislator {
  id: Record<string, unknown>;
  name: Record<string, unknown>;
  bio: Record<string, unknown>;
  terms: Term[];
  [key: string]: unknown;
}

interface Term {
  type: 'sen' | 'rep';
  state: string;
  district?: number;
  start: string;
  end: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // console.log(`searchParams ${searchParams}`);
  const stateCode = searchParams.get('stateCode');
  const districtCode = searchParams.get('districtCode');

  if (!stateCode || !districtCode) {
    return new Response(JSON.stringify({ error: 'Missing stateCode or districtCode' }), { status: 400 });
  }

  // Helper to get the current term
  function getCurrentTerm(legislator: Legislator): Term | undefined {
    return Array.isArray(legislator.terms)
      ? legislator.terms.reduce((latest: Term | undefined, term: Term) => {
          return !latest || new Date(term.start) > new Date(latest.start) ? term : latest;
        }, undefined)
      : undefined;
  }

  // Find representatives
  const representatives = (legislators as Legislator[]).filter((legislator) => {
    const term = getCurrentTerm(legislator);
    return (
      term &&
      term.type === 'rep' &&
      term.state === stateCode &&
      String(term.district).padStart(2, '0') === String(districtCode).padStart(2, '0')
    );
  });

  // Find senators
  const senators = (legislators as Legislator[]).filter((legislator) => {
    const term = getCurrentTerm(legislator);
    return term && term.type === 'sen' && term.state === stateCode;
  });

  return new Response(
    JSON.stringify({ representatives, senators }),
    { headers: { 'Content-Type': 'application/json' } }
  );
} 