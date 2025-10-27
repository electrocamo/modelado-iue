import React, { useState } from "react";
import { motion } from "framer-motion";
import GoldenSectionOptimizer from "./GoldenSection";
import FibonacciOptimizer from "./Fibonacci";
import SequentialOptimizer from "./SequentialSearch";
import DichotomousOptimizer from "./DichotomousSearch";
import BisectionOptimizer from "./Bisection";
import NewtonOptimizer from "./Newton";

const OPTIMIZATION_METHODS = {
  "Sección Aurea": GoldenSectionOptimizer,
  "Fibonacci": FibonacciOptimizer,
  "Búsqueda secuencial": SequentialOptimizer,
  "Búsqueda dicotómica": DichotomousOptimizer,
  "Bisección": BisectionOptimizer,
  "Newton unidimensional": NewtonOptimizer,
};

export default function OptimizationMethodSelector() {
  const [selectedMethod, setSelectedMethod] = useState("Sección Aurea");

  const SelectedComponent = OPTIMIZATION_METHODS[selectedMethod];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with method selector */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Optimizador Unidimensional</h1>
              <p className="text-sm text-gray-600 mt-1">Selecciona un método de optimización para minimizar funciones</p>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Método:</label>
              <select 
                value={selectedMethod} 
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.keys(OPTIMIZATION_METHODS).map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Method description */}
      <div className="bg-indigo-50 border-b">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="text-sm text-indigo-800">
            <strong>Método seleccionado:</strong> {selectedMethod} - 
            {selectedMethod === "Sección Aurea" && " Utiliza la proporción áurea para dividir el intervalo de búsqueda de manera óptima."}
            {selectedMethod === "Fibonacci" && " Emplea la secuencia de Fibonacci para determinar los puntos de evaluación de manera eficiente."}
            {selectedMethod === "Búsqueda secuencial" && " Evalúa la función en puntos equidistantes para encontrar el mínimo mediante búsqueda exhaustiva."}
            {selectedMethod === "Búsqueda dicotómica" && " Divide el intervalo en dos partes iguales y evalúa puntos cercanos al centro."}
            {selectedMethod === "Bisección" && " Encuentra la raíz de la derivada (punto crítico) dividiendo el intervalo por la mitad."}
            {selectedMethod === "Newton unidimensional" && " Utiliza la primera y segunda derivada para encontrar el mínimo con convergencia cuadrática."}
          </div>
          
          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              <span className="text-indigo-700"><strong>Punto mínimo encontrado</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-indigo-700">Puntos de evaluación</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-indigo-700">Puntos auxiliares</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected optimization component */}
      <motion.div
        key={selectedMethod}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SelectedComponent />
      </motion.div>
    </div>
  );
}
