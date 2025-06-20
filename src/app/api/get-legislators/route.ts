import legislators from '@/data/legislators-current.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // console.log(`searchParams ${searchParams}`);
  const stateCode = searchParams.get('stateCode');
  const districtCode = searchParams.get('districtCode');

  if (!stateCode || !districtCode) {
    return new Response(JSON.stringify({ error: 'Missing stateCode or districtCode' }), { status: 400 });
  }

  // Helper to get the current term
  function getCurrentTerm(legislator: any) {
    return Array.isArray(legislator.terms)
      ? legislator.terms.reduce((latest: any, term: any) => {
          return !latest || new Date(term.start) > new Date(latest.start) ? term : latest;
        }, undefined)
      : undefined;
  }

  // Find representatives
  const representatives = legislators.filter((legislator) => {
    const term = getCurrentTerm(legislator);
    return (
      term &&
      term.type === 'rep' &&
      term.state === stateCode &&
      String(term.district).padStart(2, '0') === String(districtCode).padStart(2, '0')
    );
  });

  // Find senators
  const senators = legislators.filter((legislator) => {
    const term = getCurrentTerm(legislator);
    return term && term.type === 'sen' && term.state === stateCode;
  });

  return new Response(
    JSON.stringify({ representatives, senators }),
    { headers: { 'Content-Type': 'application/json' } }
  );
} 