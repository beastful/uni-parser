"use client";

import { Plus, X, ChevronLeft, ChevronRight, Check, Calendar, MapPin, Building2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RegionSelect from "./regions";
import UniversitySelect from "./universities";
import YearSelect from "./years";
import { store } from "@/store";

export default function Popup() {
  // Selected values
  const [year, setYear] = useState("2016");
  const [regionType, setRegionType] = useState("2");
  const [regionID, setRegionID] = useState("10301");
  const [regionName, setRegionName] = useState("");
  const [universityID, setUniversityID] = useState("");
  const [universityName, setUniversityName] = useState("");

  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState("year");

  const steps = ["year", "region", "university"];
  const stepIndex = steps.indexOf(currentStep);
  const isLastStep = stepIndex === steps.length - 1;

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const changeStep = (newStep) => {
    const oldIndex = steps.indexOf(currentStep);
    const newIndex = steps.indexOf(newStep);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setCurrentStep(newStep);
  };

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      changeStep(steps[stepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      changeStep(steps[stepIndex - 1]);
    }
  };

  const resetStepper = () => {
    setYear("2016");
    setRegionType("2");
    setRegionID("10301");
    setRegionName("");
    setUniversityID("");
    setUniversityName("");
    setCurrentStep("year");
  };

  const getRegionDisplay = () => {
    if (regionName) return regionName;
    if (regionID && regionType) return `ID: ${regionID}`;
    return "не выбран";
  };

  const getUniversityDisplay = () => {
    if (universityName) return universityName;
    if (universityID) return `ID: ${universityID}`;
    return "не выбран";
  };

  const handleAddToCompare = () => {
    if (!universityID) return;

    const newItem = {
      year,
      regionType,
      regionID,
      regionName,
      universityID,
      universityName,
      addedAt: Date.now(),
    };

    store.universityList.push(newItem);
    resetStepper();
    setOpen(false);
  };

  return (
    <>
      {/* Trigger Card */}
      <div
        onClick={() => setOpen(true)}
        className="hover:bg-gray-50 transition-all w-full h-64 bg-gray-100 border border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer"
      >
        <div className="flex flex-col items-center">
          <Plus size={30} />
          <div className="pt-5 font-semibold text-gray-400">Добавить университет</div>
        </div>
      </div>

      {/* Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-[90%] max-w-2xl p-6 relative"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              {/* Stepper Header */}
              <div className="flex items-center justify-between mb-6 px-4">
                {steps.map((step, idx) => {
                  const isActive = currentStep === step;
                  const isCompleted = stepIndex > idx;

                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => changeStep(step)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-blue-600 text-white ring-4 ring-blue-200"
                            : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                        }`}
                      >
                        {isCompleted ? <Check size={18} /> : idx + 1}
                      </button>
                      <span className="text-xs mt-2 text-gray-500 capitalize">
                        {step === "year" ? "Год" : step === "region" ? "Регион" : "Университет"}
                      </span>
                      {idx < 2 && (
                        <div className="h-0.5 w-full bg-gray-200 mt-4">
                          <div
                            className="h-0.5 bg-blue-500 transition-all duration-300"
                            style={{ width: isCompleted ? "100%" : "0%" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Summary of selected values - professional column layout */}
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Выбранные параметры
                </h3>
                <div className="space-y-3">
                  {/* Year */}
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs text-gray-500 block">Год</span>
                      <span className="text-sm font-medium text-gray-800 break-words">
                        {year || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Region */}
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs text-gray-500 block">Регион</span>
                      <span className="text-sm font-medium text-gray-800 break-words">
                        {getRegionDisplay()}
                      </span>
                    </div>
                  </div>

                  {/* University */}
                  <div className="flex items-start gap-3">
                    <Building2 size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs text-gray-500 block">Университет</span>
                      <span className="text-sm font-medium text-gray-800 break-words line-clamp-2">
  {getUniversityDisplay()}
</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Animated Content */}
              <div className="relative overflow-hidden min-h-[400px]">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0"
                  >
                    <div className="px-2 text-gray-600 h-full">
                      {currentStep === "year" && (
                        <div>
                          <YearSelect
                            onSelect={(year) => setYear(year)}
                            defaultYear={parseInt(year)}
                          />
                        </div>
                      )}
                      {currentStep === "region" && (
                        <RegionSelect
                          year={year}
                          onSelect={(type, id, name) => {
                            console.log("Type and id", type, id);
                            setRegionType(type);
                            setRegionID(id);
                            if (name) setRegionName(name);
                          }}
                        />
                      )}
                      {currentStep === "university" && (
                        <UniversitySelect
                          year={year}
                          type={regionType}
                          regionID={regionID}
                          onSelect={(universityId, name) => {
                            console.log("Selected university ID:", universityId);
                            setUniversityID(universityId);
                            if (name) setUniversityName(name);
                          }}
                        />
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-4 border-t">
                <button
                  onClick={handleBack}
                  className={`px-5 py-2 rounded-lg flex items-center gap-2 transition ${
                    stepIndex === 0 ? "invisible" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft size={18} /> Назад
                </button>

                {!isLastStep ? (
                  <button
                    onClick={handleNext}
                    className="px-5 py-2 rounded-lg flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Далее <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCompare}
                    disabled={!universityID}
                    className="px-5 py-2 rounded-lg flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check size={18} /> Добавить в список для сравнения
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}