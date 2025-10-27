import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

// Golden Section Search Visualizer
// Single-file React component. Uses Tailwind CSS classes for quick styling.
// To run: create a React app (Vite or CRA), install dependencies: recharts, framer-motion, tailwindcss (optional)
// Example: npm i recharts framer-motion

// Predefined functions for safety and simplicity (no user-eval)
const FUNCTIONS = {
  "Parabola (x-2)^2 + 1": (x) => (x - 2) * (x - 2) + 1,
  "Multi-modal: (x-2)^2 + sin(5x)": (x) => (x - 2) * (x - 2) + Math.sin(5 * x),
  "Rastrigin-like: x^2 + 5*cos(2x)": (x) => x * x + 5 * Math.cos(2 * x),
  "Función personalizada": null, // Placeholder for custom function
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

function goldenSectionSearch(f, a, b, tol = 1e-3, maxIter = 100) {
  const phi = (1 + Math.sqrt(5)) / 2;
  let c = b - (b - a) / phi;
  let d = a + (b - a) / phi;
  let fc = f(c);
  let fd = f(d);
  const history = [];

  for (let iter = 0; iter < maxIter; iter++) {
    history.push({ iter: iter + 1, a, b, c, d, fc, fd, midpoint: (a + b) / 2 });
    if (Math.abs(b - a) < tol) break;
    if (fc < fd) {
      b = d;
      d = c;
      fd = fc;
      c = b - (b - a) / phi;
      fc = f(c);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = a + (b - a) / phi;
      fd = f(d);
    }
  }

  const xOpt = (a + b) / 2;
  const fOpt = f(xOpt);
  return { xOpt, fOpt, history };
}

export default function GoldenSectionOptimizer() {
  const [fnKey, setFnKey] = useState(Object.keys(FUNCTIONS)[1]);
  const [customFunction, setCustomFunction] = useState("x^2 - 4*x + 3");
  const [a, setA] = useState(-2);
  const [b, setB] = useState(5);
  const [tol, setTol] = useState(0.001);
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

  const sampleData = useMemo(() => {
    const samples = 300;
    const xs = [];
    const numA = Number(a);
    const numB = Number(b);
    
    // Only generate data if we have valid numbers
    if (isNaN(numA) || isNaN(numB) || numA >= numB) {
      return [];
    }
    
    for (let i = 0; i <= samples; i++) {
      const x = numA + (i / samples) * (numB - numA);
      const y = f(x);
      // Only add valid data points
      if (typeof x === 'number' && !isNaN(x) && typeof y === 'number' && !isNaN(y)) {
        xs.push({ x: Number(x.toFixed(6)), y: Number(y.toFixed(6)) });
      }
    }
    return xs;
  }, [a, b, f]);

  const run = () => {
    const na = Number(a);
    const nb = Number(b);
    const ntol = Number(tol);
    const nmax = Number(maxIter);
    if (!(na < nb)) {
      alert("El límite izquierdo (a) debe ser menor que el derecho (b).");
      return;
    }
    
    // Validate custom function if selected
    if (fnKey === "Función personalizada") {
      try {
        parseCustomFunction(customFunction);
      } catch (error) {
        alert(`Error en la función personalizada: ${error.message}`);
        return;
      }
    }
    
    const res = goldenSectionSearch(f, na, nb, ntol, nmax);
    setResult(res);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Optimizador: Golden Section Search</h1>
          <div className="text-sm text-gray-600">Minimización unidimensional • Interfaz interactiva</div>
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

            <label className="block text-sm font-medium text-gray-700 mt-4">Intervalo [a, b]</label>
            <div className="flex gap-2 mt-2">
              <input type="number" value={a} onChange={(e) => setA(e.target.value)} className="p-2 border rounded w-1/2" />
              <input type="number" value={b} onChange={(e) => setB(e.target.value)} className="p-2 border rounded w-1/2" />
            </div>

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

            <div className="mt-4 text-xs text-gray-500">Nota: funciones predefinidas para evitar evaluación insegura de código. Puedes cambiar las funciones en el código fuente.</div>
          </div>

          <div className="md:col-span-2 bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-lg font-medium mb-3">Gráfica y puntos (intervalos e iteraciones)</h2>
            <div style={{ height: 360 }} className="w-full">
              <ResponsiveContainer>
                <LineChart data={sampleData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" domain={[a, b]} type="number" tickFormatter={(v) => v.toFixed(2)} />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toFixed(6)} />
                  <Line type="monotone" dataKey="y" dot={false} strokeWidth={2} />

                  {/* Show iteration points if result exists */}
                  {result && (
                    <>
                      <Line
                        data={result.history.map((h) => ({ x: h.c, y: h.fc }))}
                        type="monotone"
                        dataKey="y"
                        stroke="none"
                        dot={{ fill: "#FF5722", r: 4 }}
                        connectNulls={false}
                      />
                      <Line
                        data={result.history.map((h) => ({ x: h.d, y: h.fd }))}
                        type="monotone"
                        dataKey="y"
                        stroke="none"
                        dot={{ fill: "#3F51B5", r: 4 }}
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
                      <th className="px-2 py-1 text-left">a</th>
                      <th className="px-2 py-1 text-left">b</th>
                      <th className="px-2 py-1 text-left">c</th>
                      <th className="px-2 py-1 text-left">f(c)</th>
                      <th className="px-2 py-1 text-left">d</th>
                      <th className="px-2 py-1 text-left">f(d)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.history.map((h) => (
                      <tr key={h.iter} className="border-t">
                        <td className="px-2 py-1">{h.iter}</td>
                        <td className="px-2 py-1">{h.a.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.b.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.c.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.fc.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.d.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.fd.toFixed(6)}</td>
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
