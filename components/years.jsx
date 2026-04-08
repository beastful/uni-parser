"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

export default function YearSelect({ onSelect, defaultYear = 2025 }) {
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const years = [];
  for (let y = 2015; y <= 2025; y++) {
    years.push(y);
  }

  const handleSelect = (year) => {
    setSelectedYear(year);
    if (onSelect) onSelect(year);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-blue-500" />
        <span className="text-sm font-medium text-gray-700">Выберите год</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleSelect(year)}
            className={`
              py-2.5 px-3 rounded-lg font-medium transition-all duration-200
              ${
                selectedYear === year
                  ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }
            `}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}
