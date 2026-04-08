"use client";

import { useEffect, useState } from "react";
import { Building2, Loader2 } from "lucide-react";

export default function UniversitySelect({ year, type, regionID, onSelect }) {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!year || !type || !regionID) {
      setUniversities([]);
      return;
    }

    const fetchUniversities = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `/monitoring/iam/${year}/_vpo/material.php_type=${type}&id=${regionID}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const instCells = doc.querySelectorAll("td.inst");
        const items = [];

        instCells.forEach((cell) => {
          const link = cell.querySelector("a");
          if (!link) return;
          const href = link.getAttribute("href") || "";
          const idMatch = href.match(/id=(\d+)/);
          if (!idMatch) return;
          items.push({
            id: idMatch[1],
            name: link.textContent.trim(),
          });
        });

        setUniversities(items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, [year, type, regionID]);

  if (!year || !type || !regionID) {
    return <div className="text-center py-8 text-gray-400">Выберите регион, чтобы увидеть университеты</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
        <span className="ml-2 text-gray-500">Загрузка университетов...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">❌ Ошибка: {error}</div>;
  }

  if (universities.length === 0) {
    return <div className="text-center py-8 text-gray-500">🏫 Нет университетов в этом регионе</div>;
  }

  return (
    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      <div className="space-y-2">
        {universities.map((uni) => (
          <div
            key={uni.id}
            onClick={() => onSelect(uni.id, uni.name)}   // ✅ pass both id and name
            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-150"
          >
            <Building2 className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-800 text-sm leading-relaxed">{uni.name}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
      `}</style>
    </div>
  );
}
