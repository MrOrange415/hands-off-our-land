"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function ContactLinks({ phone, url }: { phone: string; url: string }) {
  // Helper to strip trailing slash
  function getContactUrl(url: string) {
    if (!url) return null;
    return url.replace(/\/$/, "") + "/contact";
  }
  const contactUrl = getContactUrl(url);

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-2">
      {phone && (
        <a
          href={`tel:${phone}`}
          className="text-blue-600 underline hover:text-blue-800 font-medium"
        >
          Call
        </a>
      )}
      {contactUrl && (
        <a
          href={contactUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800 font-medium"
        >
          Email
        </a>
      )}
    </div>
  );
}

function ScriptBox({ title, lastName, zip, role }: { title: string; lastName: string; zip: string; role: string }) {
  const script = `Hi, my name is [Your Name], and I'm a constituent from ZIP code ${zip}.

I'm calling to urge ${role} ${lastName} to oppose the proposed sell-off of our National Parks.

These public lands belong to all of us, and I believe they should be preserved — not handed over to private developers or interests.

Please stand up for our parks and protect them for future generations.

I'll be closely watching how you vote on this issue, and I'll remember it in future elections.

Thank you for your time.`;

  function handleCopy() {
    navigator.clipboard.writeText(script);
  }

  return (
    <div className="w-full max-w-md mt-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Script for {title} {lastName}</h3>
        <button
          onClick={handleCopy}
          className="ml-2 bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          Copy Script
        </button>
      </div>
      <pre className="font-mono text-base text-gray-800 whitespace-pre-wrap leading-relaxed break-words">
        {script}
      </pre>
    </div>
  );
}

function LegislatorBlock({ legislator, title, zip }: { legislator: { name: string; district?: string; party: string; phone?: string; website?: string } | null; title: string; zip: string }) {
  if (!legislator) return null;
  const splitName = legislator.name.split(' ');
  const lastName = splitName[splitName.length-1] || '';
  return (
    <div className="flex flex-col h-full flex-grow min-h-[500px] bg-white shadow-md hover:shadow-lg transition-shadow rounded-xl p-6 w-full max-w-md mx-auto relative justify-between">
      {/* Badge placeholder for future use */}
      <div className="absolute top-4 right-4">{/* Badge goes here */}</div>
      <div className="flex flex-col flex-grow justify-between h-full">
        <div>
          <div className="text-xl font-semibold text-gray-900 mb-1">{legislator.name}</div>
          <div className="text-gray-700 font-medium">{title}</div>
          {legislator.district && (
            <div className="text-gray-700">District: {legislator.district}</div>
          )}
          <div className="text-gray-700">Party: {legislator.party}</div>
        </div>
        <div className="mt-4">
          <ContactLinks phone={legislator.phone} url={legislator.website} />
        </div>
        <div className="mt-4">
          <ScriptBox
            title={title === "Representative" ? "Rep." : "Senator"}
            lastName={lastName}
            zip={zip}
            role={title === "Representative" ? "Rep." : "Senator"}
          />
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const zip = searchParams.get("zip") || "";
  const [data, setData] = useState<{ representative: { name: string; district?: string; party: string; phone?: string; website?: string } | null; senators: { name: string; district?: string; party: string; phone?: string; website?: string }[] } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!zip) return;
    setLoading(true);
    fetch(`/api/legislators?zip=${zip}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Couldn't find district info for this ZIP.");
        setLoading(false);
      });
  }, [zip]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-screen-xl mx-auto flex flex-col items-center gap-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2 text-center">Your Representatives</h1>
        {loading && <div className="text-lg text-gray-600">Loading...</div>}
        {error && (
          <div className="bg-red-100 text-red-700 rounded-lg p-4 text-center w-full max-w-md">
            Couldn't find district info for this ZIP.
          </div>
        )}
        {!loading && !error && data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full items-start">
              <LegislatorBlock legislator={data.representative} title="Representative" zip={zip} />
              {data.senators && data.senators.length > 0 && data.senators.map((sen: { name: string; district?: string; party: string; phone?: string; website?: string }, i: number) => (
                <LegislatorBlock key={i} legislator={sen} title="Senator" zip={zip} />
              ))}
            </div>
            <div className="mt-4 w-full max-w-md text-center">
              <div className="text-sm text-gray-400">
                <span role="img" aria-label="location">📍</span> <span className="font-semibold">Accuracy Note</span><br />
                This tool uses ZIP code to find your congressional district. This works in over 80% of cases, but because ZIP codes don't always align perfectly with political boundaries, your result may not be 100% accurate.<br /><br />
                Even in edge cases, you'll likely only be off by <span className="font-semibold">one district</span> &mdash; and congressional offices usually forward messages to the correct rep if needed. Your <span className="font-semibold">senators are always correct</span>, since they represent the whole state.<br /><br />
                <span role="img" aria-label="tools">🛠️</span> Full address lookup support coming soon for pinpoint accuracy.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 