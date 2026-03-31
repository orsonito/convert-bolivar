import React, { Suspense } from "react";
import CopClient from "./cop-client";

const CopPage = () => {
  return (
    <Suspense
      fallback={
        <div className="mx-auto px-4 py-10 text-center text-neutral-500">
          Cargando…
        </div>
      }
    >
      <CopClient />
    </Suspense>
  );
};

export default CopPage;
