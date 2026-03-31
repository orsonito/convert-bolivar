import React, { Suspense } from "react";
import P2pClient from "./p2p-client";
import "./p2p.css";
import type { P2pPageProps } from "./p2p.types";

const P2p = ({}: P2pPageProps) => {
  return (
    <Suspense
      fallback={
        <div className="p2p mx-auto px-4 py-10 text-center text-neutral-500">
          Cargando…
        </div>
      }
    >
      <P2pClient />
    </Suspense>
  );
};

export default P2p;
