"use client";

import { HomeIcon, LayoutDashboard, Plus, Trash2, ArrowRight } from "lucide-react";
import Popup from "@/components/popup";
import { store } from "@/store";
import { useSnapshot } from "valtio";
import Link from "next/link";

export default function Home() {
  const snap = useSnapshot(store);

  const removeUniversity = (index) => {
    store.universityList = store.universityList.filter((_, i) => i !== index);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="w-72 min-w-72 bg-indigo-500 text-white h-full overflow-y-auto shadow-lg">
        <div className="px-6 font-bold text-xl border-b border-slate-700 h-16 flex items-center">Мониторинг</div>
        <div className="p-6">
          <Link className="flex gap-5 text-lg font-semibold flex mb-5" href={"/"}>
            <HomeIcon />
            Главная
          </Link>
          <Link className="flex gap-5 text-lg font-semibold flex" href="/analytics">
            <LayoutDashboard />
            Аналитика
          </Link>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
        {/* Navbar */}
        <div className="bg-white border-b border-gray-200 h-16 min-h-16 w-full flex-shrink-0 flex items-center px-8 shadow-sm">
          <h2 className="text-lg font-medium text-gray-700">Панель управления</h2>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header section */}
            <div className="mb-8 pt-20">
              <div className="flex-col justify-between items-start">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                    Сравнительный анализ университетов
                  </h1>
                  <p className="text-gray-500 mt-2 text-lg">
                    - На главной странице добавьте университеты для сравнения, выбрав год и ID учебного заведения из списка или вручную.
                    <br />
                    - После добавления перейдите на страницу «Аналитика» – система автоматически загрузит все показатели из HTML-отчётов мониторинга.
                    <br />
                    - Вы увидите общую информацию, основные показатели, графики и таблицы по каждому университету – для наглядности данные выделены разными цветами.
                    <br />
                    - Чтобы сохранить результат в PDF или распечатать, нажмите красную кнопку «Печать / PDF» в правом верхнем углу – откроется окно печати браузера, где можно выбрать «Сохранить как PDF».
                  </p>
                </div>
                {/* Show button only if there is at least one university */}

              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8" />

            {/* Grid of university cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Popup />

              {snap.universityList.map((u, idx) => (
                <div
                  key={u.addedAt || idx}
                  className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 flex flex-col h-64"
                >
                  <button
                    onClick={() => removeUniversity(idx)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600 z-10"
                    aria-label="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="p-5 flex flex-col justify-between h-full">
                    <div className="text-base font-semibold text-gray-800 line-clamp-6">
                      {u.universityName}
                    </div>
                    <div className="space-y-1 pt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Регион:</span> {u.regionName || "—"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Год:</span> {u.year || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {snap.universityList.length < 3 &&
                [...Array(3 - snap.universityList.length)].map((_, idx) => (
                  <div
                    key={`placeholder-${idx}`}
                    className="bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center h-64 opacity-60"
                  >
                    <Plus size={32} className="text-gray-400" />
                    <div className="pt-2 text-sm text-gray-400">Свободно</div>
                  </div>
                ))}
            </div>
            <div className="pt-10">
              {snap.universityList.length > 0 && (
                <Link href="/analytics">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md">
                    Перейти в аналитику
                    <ArrowRight size={18} />
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
