import legislatorsRaw from '@/data/legislators-current.json';

// Types for the legislator data
interface Legislator {
  id: Record<string, any>;
  name: Record<string, any>;
  bio: Record<string, any>;
  terms: Term[];
  [key: string]: any;
}

interface Term {
  type: 'sen' | 'rep';
  state: string;
  district?: number;
  start: string;
  end: string;
  [key: string]: any;
}

const legislators: any[] = legislatorsRaw as any[];

function isLegislator(obj: any): obj is Legislator {
  return Array.isArray(obj.terms);
}

// Helper to get the current term (the one with the latest start date)
function getCurrentTerm(legislator: Legislator): Term | undefined {
  return legislator.terms.reduce((latest, term) => {
    return !latest || new Date(term.start) > new Date(latest.start) ? term : latest;
  }, undefined as Term | undefined);
}

// Get all senators for a given state
export function getSenatorsByState(state: string): Legislator[] {
  return legislators.filter(isLegislator).filter((legislator) => {
    const term = getCurrentTerm(legislator);
    return term && term.type === 'sen' && term.state === state;
  });
}

// Get a representative for a given state and district
export function getRepresentativeByStateAndDistrict(state: string, district: string | number): Legislator | undefined {
  return legislators.filter(isLegislator).find((legislator) => {
    const term = getCurrentTerm(legislator);
    return (
      term &&
      term.type === 'rep' &&
      term.state === state &&
      String(term.district) === String(district)
    );
  });
} 