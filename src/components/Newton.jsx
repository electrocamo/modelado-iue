import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

// Predefined functions for safety and simplicity
const FUNCTIONS = {
  "Parabola (x-2)^2 + 1": (x) => (x - 2) * (x - 2) + 1,
  "Multi-modal: (x-2)^2 + sin(5x)": (x) => (x - 2) * (x - 2) + Math.sin(5 * x),
  "Rastrigin-like: x^2 + 5*cos(2x)": (x) => x * x + 5 * Math.cos(2 * x),
  "Función personalizada": null, // Placeholder for custom function
};

// Derivative functions (hardcoded for safety)
const DERIVATIVES = {
  "Parabola (x-2)^2 + 1": (x) => 2 * (x - 2),
  "Multi-modal: (x-2)^2 + sin(5x)": (x) => 2 * (x - 2) + 5 * Math.cos(5 * x),
  "Rastrigin-like: x^2 + 5*cos(2x)": (x) => 2 * x - 10 * Math.sin(2 * x),
  "Función personalizada": null, // Placeholder for custom derivative
};

// Second derivative functions
const SECOND_DERIVATIVES = {
  "Parabola (x-2)^2 + 1": (x) => 2,
  "Multi-modal: (x-2)^2 + sin(5x)": (x) => 2 - 25 * Math.sin(5 * x),
  "Rastrigin-like: x^2 + 5*cos(2x)": (x) => 2 - 20 * Math.cos(2 * x),
  "Función personalizada": null, // Placeholder for custom second derivative
};

// Safe function parser that only allows basic mathematical operations
function parseCustomFunction(funcString) {
  try {
    // Remove whitespace
    funcString = funcString.trim();
    
    // Basic validation - only allow safe characters
    const allowedChars = /^[x0-9+\-*/().\s,^sin|cos|tan|log|exp|sqrt|abs|pow|min|max]+$/;
    if (!allowedChars.test(funcString)) {
      throw new Error("Función contiene caracteres no permitidos");
    }
    
    // Replace common mathematical functions and operators
    let processedFunc = funcString
      .replace(/\^/g, '**') // Convert ^ to ** for exponentiation
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/pow\(/g, 'Math.pow(')
      .replace(/min\(/g, 'Math.min(')
      .replace(/max\(/g, 'Math.max(');
    
    // Create function
    const func = new Function('x', `return ${processedFunc}`);
    
    // Test the function with a sample value
    func(1);
    
    return func;
  } catch (error) {
    throw new Error(`Error en la función: ${error.message}`);
  }
}

function newtonMethod(f, df, d2f, x0, tol = 1e-6, maxIter = 100) {
  const history = [];
  let x = x0;
  
  for (let iter = 0; iter < maxIter; iter++) {
    const fx = f(x);
    const dfx = df(x);
    const d2fx = d2f(x);
    
    history.push({
      iter: iter + 1,
      x,
      fx,
      dfx,
      d2fx,
      step: dfx / d2fx
    });
    
    if (Math.abs(dfx) < tol) break;
    
    if (Math.abs(d2fx) < 1e-12) {
      alert("La segunda derivada es muy pequeña. El método de Newton puede no converger.");
      break;
    }
    
    const step = dfx / d2fx;
    x = x - step;
  }

  const fOpt = f(x);
  return { xOpt: x, fOpt, history };
}

export default function NewtonOptimizer() {
  const [fnKey, setFnKey] = useState(Object.keys(FUNCTIONS)[1]);
  const [customFunction, setCustomFunction] = useState("x^2 - 4*x + 3");
  const [x0, setX0] = useState(0);
  const [tol, setTol] = useState(0.000001);
  const [maxIter, setMaxIter] = useState(60);
  const [result, setResult] = useState(null);

  const f = useMemo(() => {
    if (fnKey === "Función personalizada") {
      try {
        return parseCustomFunction(customFunction);
      } catch (error) {
        // Return a default function if parsing fails
        return (x) => x * x;
      }
    }
    return FUNCTIONS[fnKey];
  }, [fnKey, customFunction]);
  const df = useMemo(() => {
    if (fnKey === "Función personalizada") {
      // For custom functions, we'll use a simple numerical derivative approximation
      return (x) => {
        const h = 1e-6;
        return (f(x + h) - f(x - h)) / (2 * h);
      };
    }
    return DERIVATIVES[fnKey];
  }, [fnKey, f]);

  const d2f = useMemo(() => {
    if (fnKey === "Función personalizada") {
      // For custom functions, we'll use a simple numerical second derivative approximation
      return (x) => {
        const h = 1e-6;
        return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
      };
    }
    return SECOND_DERIVATIVES[fnKey];
  }, [fnKey, f]);

  const sampleData = useMemo(() => {
    const samples = 300;
    const xs = [];
    const range = 6; // Show range around x0
    for (let i = 0; i <= samples; i++) {
      const x = x0 - range/2 + (i / samples) * range;
      xs.push({ x: Number(x.toFixed(6)), y: f(x) });
    }
    return xs;
  }, [x0, f]);

  const derivativeData = useMemo(() => {
    const samples = 300;
    const xs = [];
    const range = 6;
    for (let i = 0; i <= samples; i++) {
      const x = x0 - range/2 + (i / samples) * range;
      xs.push({ x: Number(x.toFixed(6)), y: df(x) });
    }
    return xs;
  }, [x0, df]);

  const run = () => {
    const nx0 = Number(x0);
    const ntol = Number(tol);
    const nmax = Number(maxIter);
    
    // Validate custom function if selected
    if (fnKey === "Función personalizada") {
      try {
        parseCustomFunction(customFunction);
      } catch (error) {
        alert(`Error en la función personalizada: ${error.message}`);
        return;
      }
    }
    
    const res = newtonMethod(f, df, d2f, nx0, ntol, nmax);
    setResult(res);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Optimizador: Newton Unidimensional</h1>
          <div className="text-sm text-gray-600">Minimización unidimensional • Método de Newton</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 bg-white p-4 rounded-2xl shadow-sm">
            <label className="block text-sm font-medium text-gray-700">Función</label>
            <select value={fnKey} onChange={(e) => setFnKey(e.target.value)} className="mt-2 w-full p-2 border rounded">
              {Object.keys(FUNCTIONS).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>

            {fnKey === "Función personalizada" && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700">Ingresa tu función (usa 'x' como variable)</label>
                <input 
                  type="text" 
                  value={customFunction} 
                  onChange={(e) => setCustomFunction(e.target.value)}
                  placeholder="Ej: x^2 - 4*x + 3"
                  className="mt-1 w-full p-2 border rounded text-sm"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Funciones disponibles: sin, cos, tan, log, exp, sqrt, abs, pow, min, max
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Operadores: +, -, *, /, ^ (potencia), paréntesis ()
                </div>
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700 mt-4">Punto inicial (x₀)</label>
            <input type="number" step="any" value={x0} onChange={(e) => setX0(e.target.value)} className="mt-2 p-2 border rounded w-full" />

            <label className="block text-sm font-medium text-gray-700 mt-4">Tolerancia</label>
            <input type="number" step="any" value={tol} onChange={(e) => setTol(e.target.value)} className="mt-2 p-2 border rounded w-full" />

            <label className="block text-sm font-medium text-gray-700 mt-4">Máx Iteraciones</label>
            <input type="number" value={maxIter} onChange={(e) => setMaxIter(e.target.value)} className="mt-2 p-2 border rounded w-full" />

            <button onClick={run} className="mt-4 w-full bg-indigo-600 text-white p-2 rounded-2xl hover:bg-indigo-700">Ejecutar</button>

            {result && (
              <div className="mt-4 text-sm bg-gray-50 p-3 rounded">
                <div><strong>x*:</strong> {result.xOpt.toFixed(6)}</div>
                <div><strong>f(x*):</strong> {result.fOpt.toFixed(6)}</div>
                <div><strong>Iteraciones:</strong> {result.history.length}</div>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">Método de Newton: utiliza la primera y segunda derivada para encontrar el mínimo. Convergencia cuadrática.</div>
          </div>

          <div className="md:col-span-2 bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-lg font-medium mb-3">Gráfica de la función y su derivada</h2>
            <div style={{ height: 360 }} className="w-full">
              <ResponsiveContainer>
                <LineChart data={sampleData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" type="number" tickFormatter={(v) => v.toFixed(2)} />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toFixed(6)} />
                  <Line type="monotone" dataKey="y" dot={false} strokeWidth={2} stroke="#8884d8" />

                  {/* Derivative line */}
                  <Line 
                    data={derivativeData} 
                    type="monotone" 
                    dataKey="y" 
                    dot={false} 
                    strokeWidth={2} 
                    stroke="#82ca9d" 
                    strokeDasharray="5 5"
                  />

                  {result && (
                    <>
                      <Line
                        data={result.history.map((h) => ({ x: h.x, y: h.fx }))}
                        type="monotone"
                        dataKey="y"
                        stroke="none"
                        dot={{ fill: "#FF5722", r: 4 }}
                        connectNulls={false}
                      />
                      <Line
                        data={[{ x: result.xOpt, y: result.fOpt }]}
                        type="monotone"
                        dataKey="y"
                        stroke="none"
                        dot={{ fill: "#FF0000", stroke: "#FFFFFF", strokeWidth: 3, r: 8 }}
                        connectNulls={false}
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {result ? (
              <div className="mt-4 overflow-auto max-h-60">
                <table className="w-full text-sm table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 text-left">Iter</th>
                      <th className="px-2 py-1 text-left">x</th>
                      <th className="px-2 py-1 text-left">f(x)</th>
                      <th className="px-2 py-1 text-left">f'(x)</th>
                      <th className="px-2 py-1 text-left">f''(x)</th>
                      <th className="px-2 py-1 text-left">Paso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.history.map((h) => (
                      <tr key={h.iter} className="border-t">
                        <td className="px-2 py-1">{h.iter}</td>
                        <td className="px-2 py-1">{h.x.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.fx.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.dfx.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.d2fx.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.step.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4 text-sm text-gray-500">Ejecuta la optimización para ver la progresión iterativa aquí.</div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
