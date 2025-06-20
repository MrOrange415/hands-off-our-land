"use client";
import ResultsClient from "./ResultsClient";
import { Suspense } from "react";

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsClient />
    </Suspense>
  );
} 