import React, { Suspense } from "react";
import ConvertClient from "./convert-client";
import "./convert.css";
import type { ConvertPageProps } from "./convert.types";

const Convert = ({}: ConvertPageProps) => {
  return (
    <Suspense
      fallback={
        <div className="convert mx-auto px-4 py-10 text-center text-neutral-500">
          Cargando…
        </div>
      }
    >
      <ConvertClient />
    </Suspense>
  );
};

export default Convert;
