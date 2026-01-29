"use client";

import { useEffect, useState } from "react";

export default function BarFill({ percentage }: { percentage: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), 400);
    return () => clearTimeout(t);
  }, [percentage]);

  return (
    <div className="w-full h-[30px] border-2 border-black mt-3">
      <div
        className="h-full bg-black transition-all duration-1000 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
