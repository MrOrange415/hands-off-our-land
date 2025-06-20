import legislatorsRaw from '@/data/legislators-current.json';

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

const legislators = legislatorsRaw as unknown[];

function isLegislator(obj: unknown): obj is Legislator {
  return typeof obj === 'object' && obj !== null && Array.isArray((obj as Legislator).terms);
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