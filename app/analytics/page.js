"use client";

import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { store } from "@/store";
import { parseFullUniversityData } from "@/lib/parseFullUniversityData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

  const handlePrint = () => {
    window.print();
  };

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

  const getShortLabel = (index) => `ВУЗ ${index + 1}`;
  const fullNames = universitiesData.map(uni => uni.name);
  const barColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe", "#00c49f", "#ffbb28", "#dc3912", "#990099"];

  const renderComparisonSection = (title, getMetricsMap) => {
    const allMetricNames = new Set();
    universitiesData.forEach(uni => {
      const metrics = getMetricsMap(uni);
      Object.keys(metrics).forEach(name => allMetricNames.add(name));
    });
    const metricNames = Array.from(allMetricNames).sort();

    if (metricNames.length === 0) return null;

    const chartData = metricNames.map(metric => {
      const dataPoint = { metric };
      universitiesData.forEach((uni, idx) => {
        const metrics = getMetricsMap(uni);
        const item = metrics[metric];
        let numValue = null;
        if (item && item.value) {
          const cleaned = item.value.toString().replace(/[^\d.,-]/g, '').replace(',', '.');
          const parsed = parseFloat(cleaned);
          if (!isNaN(parsed)) numValue = parsed;
        }
        dataPoint[getShortLabel(idx)] = numValue;
      });
      return dataPoint;
    });

    const CustomTick = ({ x, y, payload }) => {
      const fullName = payload.value;
      const truncated = fullName.length > 28 ? fullName.slice(0, 25) + '...' : fullName;
      return (
        <g transform={`translate(${x},${y})`}>
          <text
            x={0}
            y={0}
            dy={16}
            textAnchor="end"
            fill="#666"
            fontSize={11}
            transform="rotate(-30)"
          >
            {truncated}
          </text>
        </g>
      );
    };

    return (
      <div className="mb-16">
        <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2">{title}</h2>

        <div className="mb-10 p-4 bg-white rounded-lg shadow">
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" tick={<CustomTick />} interval={0} height={80} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  const idx = parseInt(name.replace('ВУЗ ', '')) - 1;
                  const fullName = fullNames[idx] || name;
                  return [`${value !== null ? value : '—'}`, fullName];
                }}
                labelFormatter={(label) => `Показатель: ${label}`}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => {
                  const idx = parseInt(value.replace('ВУЗ ', '')) - 1;
                  const full = fullNames[idx] || value;
                  return `${value} — ${full.length > 30 ? full.slice(0, 27) + '...' : full}`;
                }}
              />
              {universitiesData.map((_, idx) => (
                <Bar
                  key={idx}
                  dataKey={getShortLabel(idx)}
                  fill={barColors[idx % barColors.length]}
                  name={getShortLabel(idx)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border" border="1">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Показатель</th>
                {universitiesData.map((uni, idx) => (
                  <th key={idx} className="border p-2 text-left min-w-[200px]">
                    {uni.name.length > 40 ? uni.name.slice(0, 37) + "..." : uni.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metricNames.map(metric => (
                <tr key={metric} className="hover:bg-gray-50">
                  <td className="border p-2 font-medium">{metric}</td>
                  {universitiesData.map((uni, idx) => {
                    const metrics = getMetricsMap(uni);
                    const item = metrics[metric];
                    let display = "—";
                    if (item) {
                      display = item.value;
                      if (item.unit && item.unit !== "-" && item.unit !== "") display += ` ${item.unit}`;
                    }
                    return (
                      <td key={idx} className="border p-2">{display}</td>
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
    <>
      {/* Print button (always visible) */}
      <div className="sticky top-4 z-10 flex justify-end px-6 pt-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Печать / PDF
        </button>
      </div>

      {/* Main content wrapper */}
      <div className="p-6 px-60 max-w-full mx-auto bg-white">
        <h1 className="text-3xl font-bold mb-2">Сравнительный анализ университетов</h1>
        <p className="text-gray-500 mb-6">Полное сравнение всех показателей</p>

        {/* General Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2">Общая информация</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border" border="1">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Параметр</th>
                  {universitiesData.map((uni, idx) => (
                    <th key={idx} className="border p-2">{uni.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {universitiesData.length > 0 && Object.keys(universitiesData[0].generalInfo).map(param => (
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
        {renderComparisonSection("Основные показатели эффективности (пороговые значения)", (uni) => {
          const simplified = {};
          for (let [key, val] of Object.entries(uni.mainIndicators)) {
            simplified[key] = { value: val.value, unit: "" };
          }
          return simplified;
        })}

        {/* Dynamic sections */}
        {universitiesData.length > 0 && Object.keys(universitiesData[0].sections).map(sectionName => (
          renderComparisonSection(sectionName, (uni) => uni.sections[sectionName] || {})
        ))}

        {/* Additional characteristics */}
        {renderComparisonSection("Дополнительные характеристики", (uni) => uni.additional)}

        {/* Regional role */}
        {universitiesData.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2">Роль в регионе (распределение по УГНС)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border" border="1">
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
        )}

        <p className="text-sm text-gray-400 mt-8">* Данные извлечены из HTML-страниц мониторинга. Некоторые значения могут отсутствовать.</p>
      </div>
    </>
  );
}
