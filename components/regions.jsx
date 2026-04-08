"use client";

import { useEffect, useState } from "react";
import { ChevronRight, MapPin, Building2 } from "lucide-react";

export default function RegionSelect({ year, onSelect }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/monitoring/index.html_m=vpo&year=${year}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const table = doc.getElementById("tregion");
        if (!table) throw new Error("Table #tregion not found");

        const links = Array.from(table.querySelectorAll("a")).filter((a) => {
          const href = a.getAttribute("href") || "";
          return href.includes("type=") && href.includes("id=");
        });

        const items = links.map((a) => {
          const href = a.getAttribute("href");
          const typeMatch = href.match(/type=(\d+)/);
          const idMatch = href.match(/id=(\d+)/);
          return {
            type: typeMatch ? typeMatch[1] : null,
            id: idMatch ? idMatch[1] : null,
            name: a.textContent.trim(),
          };
        }).filter(item => item.type !== null && item.id !== null);

        const grouped = [];
        let currentParent = null;

        items.forEach((item) => {
          if (item.type === "1") {
            currentParent = { ...item, children: [] };
            grouped.push(currentParent);
          } else if (item.type === "2" && currentParent) {
            currentParent.children.push(item);
          } else {
            if (!currentParent) {
              grouped.push({ ...item, children: [] });
            } else {
              currentParent.children.push(item);
            }
          }
        });

        setGroups(grouped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  const handleClick = (type, id, name) => {
    if (onSelect) onSelect(type, id, name);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Загрузка регионов...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg">
        ❌ Ошибка: {error}
      </div>
    );
  }

  return (
    <div className="h-[100%] overflow-y-scroll pr-2 custom-scrollbar pb-10">
      <div className="space-y-3">
        {groups.map((group) => (
          <div
            key={`${group.type}-${group.id}`}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            {/* Parent Region Header */}
            <div
              onClick={() => handleClick(group.type, group.id, group.name)}
              className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:from-gray-100 hover:to-gray-50 transition-all group"
            >
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-blue-500" />
                <span className="font-semibold text-gray-800">{group.name}</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Children Areas */}
            {group.children.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 bg-gray-50/50 border-t border-gray-100">
                {group.children.map((child) => (
                  <div
                    key={`${child.type}-${child.id}`}
                    onClick={() => handleClick(child.type, child.id, child.name)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 shadow-sm"
                  >
                    <Building2 size={14} className="text-gray-400" />
                    <span className="truncate">{child.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom scrollbar styles (add to global CSS or use Tailwind plugin) */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}
