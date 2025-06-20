import React from 'react';
import { getSenatorsByState, getRepresentativeByStateAndDistrict } from '@/lib/getLegislators';

export default function TestPage() {
  const senators = getSenatorsByState('CA').slice(0, 2);
  const representative = getRepresentativeByStateAndDistrict('CA', 11);

  return (
    <main style={{ padding: 24 }}>
      <h1>California District 11 Legislators</h1>
      <section>
        <h2>Senators</h2>
        <ul>
          {senators.map((senator) => (
            <li key={senator.id.bioguide}>
              {senator.name.official_full}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Representative</h2>
        {representative ? (
          <div>{representative.name.official_full}</div>
        ) : (
          <div>No representative found for District 11.</div>
        )}
      </section>
    </main>
  );
} 