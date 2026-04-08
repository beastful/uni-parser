"use client";

import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { store } from "@/store";
import { parseFullUniversityData } from "@/lib/parseFullUniversityData";

export default function ComparePage() {
  const snap = useSnapshot(store);
  const [universitiesData, setUniversitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (snap.universityList.length === 0) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = snap.universityList.map(async (uni) => {
          const url = `/monitoring/iam/${uni.year}/_vpo/inst.php_id=${uni.universityID}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Ошибка загрузки: ${uni.universityName}`);
          const html = await res.text();
          return parseFullUniversityData(html, uni);
        });
        const results = await Promise.all(promises);
        setUniversitiesData(results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [snap.universityList]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3">Загрузка данных университетов...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Ошибка: {error}</div>;
  }

  if (universitiesData.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Нет университетов для сравнения. Добавьте их на главной странице.
      </div>
    );
  }

  // Helper to render a comparison table for a given set of metrics
  const renderComparisonTable = (title, metricsMap) => {
    // metricsMap: { universityIndex: { metricName: { value, unit } } }
    // But easier: we have array of universities, each with a section object.
    // We'll extract all unique metric names from all universities for that section.
    const allMetricNames = new Set();
    universitiesData.forEach((uni, idx) => {
      const sectionData = metricsMap(uni);
      Object.keys(sectionData).forEach(name => allMetricNames.add(name));
    });
    const metricNames = Array.from(allMetricNames).sort();

    if (metricNames.length === 0) return null;

    return (
      <div className="mb-8 px-">
        <h2 className="text-xl font-bold mb-2 bg-gray-100 p-2">{title}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Показатель</th>
                {universitiesData.map((uni, idx) => (
                  <th key={idx} className="border p-2 text-left min-w-[200px]">
                    {uni.name.length > 40 ? uni.name.slice(0,37)+"..." : uni.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metricNames.map(metric => (
                <tr key={metric} className="hover:bg-gray-50">
                  <td className="border p-2 font-medium">{metric}</td>
                  {universitiesData.map((uni, idx) => {
                    const sectionData = metricsMap(uni);
                    const item = sectionData[metric];
                    let display = "—";
                    if (item) {
                      display = item.value;
                      if (item.unit && item.unit !== "-" && item.unit !== "") display += ` ${item.unit}`;
                    }
                    return (
                      <td key={idx} className="border p-2">
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 px-60 max-w-full mx-auto">
      <h1 className="text-3xl font-bold mb-2">Сравнительный анализ университетов</h1>
      <p className="text-gray-500 mb-6">Полное сравнение всех показателей</p>

      {/* General Information */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2 bg-gray-100 p-2">Общая информация</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Параметр</th>
                {universitiesData.map((uni, idx) => (
                  <th key={idx} className="border p-2">{uni.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(universitiesData[0].generalInfo).map(param => (
                <tr key={param} className="hover:bg-gray-50">
                  <td className="border p-2 font-medium">{param}</td>
                  {universitiesData.map((uni, idx) => (
                    <td key={idx} className="border p-2">{uni.generalInfo[param] || "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Indicators */}
      {renderComparisonTable("Основные показатели эффективности (пороговые значения)", (uni) => {
        const simplified = {};
        for (let [key, val] of Object.entries(uni.mainIndicators)) {
          simplified[key] = { value: val.value, unit: "" };
        }
        return simplified;
      })}

      {/* Dynamic sections (educational, research, etc.) */}
      {Object.keys(universitiesData[0].sections).map(sectionName => (
        renderComparisonTable(sectionName, (uni) => uni.sections[sectionName] || {})
      ))}

      {/* Additional characteristics */}
      {renderComparisonTable("Дополнительные характеристики", (uni) => uni.additional)}

      {/* Regional role (simplified) */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2 bg-gray-100 p-2">Роль в регионе (распределение по УГНС)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">УГН(С)</th>
                <th className="border p-2">Показатель</th>
                {universitiesData.map((uni, idx) => (
                  <th key={idx} className="border p-2">{uni.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {universitiesData[0].regionalRole.map((item, idx) => {
                const ugname = item.ugname;
                return (
                  <tr key={idx}>
                    <td rowSpan="3" className="border p-2 align-top">{ugname}</td>
                    <td className="border p-2">Приведенный контингент</td>
                    {universitiesData.map((uni, i) => {
                      const regItem = uni.regionalRole.find(r => r.ugname === ugname);
                      return <td key={i} className="border p-2">{regItem?.kont || "—"}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-8">* Данные извлечены из HTML-страниц мониторинга. Некоторые значения могут отсутствовать.</p>
    </div>
  );
}
