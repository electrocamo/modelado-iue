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

function fibonacciSearch(f, a, b, n = 20) {
  // Generate Fibonacci sequence
  const fib = [1, 1];
  for (let i = 2; i <= n; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
  }

  let x1 = a + (fib[n - 2] / fib[n]) * (b - a);
  let x2 = a + (fib[n - 1] / fib[n]) * (b - a);
  let f1 = f(x1);
  let f2 = f(x2);
  
  const history = [];
  let k = n;

  for (let iter = 0; iter < n - 1; iter++) {
    history.push({ 
      iter: iter + 1, 
      a, 
      b, 
      x1, 
      x2, 
      f1, 
      f2, 
      fib_k: fib[k],
      midpoint: (a + b) / 2 
    });

    if (f1 < f2) {
      b = x2;
      x2 = x1;
      f2 = f1;
      k = k - 1;
      x1 = a + (fib[k - 2] / fib[k]) * (b - a);
      f1 = f(x1);
    } else {
      a = x1;
      x1 = x2;
      f1 = f2;
      k = k - 1;
      x2 = a + (fib[k - 1] / fib[k]) * (b - a);
      f2 = f(x2);
    }
  }

  const xOpt = (a + b) / 2;
  const fOpt = f(xOpt);
  return { xOpt, fOpt, history };
}

export default function FibonacciOptimizer() {
  const [fnKey, setFnKey] = useState(Object.keys(FUNCTIONS)[1]);
  const [customFunction, setCustomFunction] = useState("x^2 - 4*x + 3");
  const [a, setA] = useState(-2);
  const [b, setB] = useState(5);
  const [n, setN] = useState(20);
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
    const nn = Number(n);
    if (!(na < nb)) {
      alert("El límite izquierdo (a) debe ser menor que el derecho (b).");
      return;
    }
    if (nn < 2) {
      alert("El número de iteraciones debe ser al menos 2.");
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
    
    const res = fibonacciSearch(f, na, nb, nn);
    setResult(res);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Optimizador: Fibonacci</h1>
          <div className="text-sm text-gray-600">Minimización unidimensional • Método Fibonacci</div>
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

            <label className="block text-sm font-medium text-gray-700 mt-4">Número de iteraciones</label>
            <input type="number" value={n} onChange={(e) => setN(e.target.value)} className="mt-2 p-2 border rounded w-full" />

            <button onClick={run} className="mt-4 w-full bg-indigo-600 text-white p-2 rounded-2xl hover:bg-indigo-700">Ejecutar</button>

            {result && (
              <div className="mt-4 text-sm bg-gray-50 p-3 rounded">
                <div><strong>x*:</strong> {result.xOpt.toFixed(6)}</div>
                <div><strong>f(x*):</strong> {result.fOpt.toFixed(6)}</div>
                <div><strong>Iteraciones:</strong> {result.history.length}</div>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">Método Fibonacci: utiliza la secuencia de Fibonacci para determinar los puntos de evaluación.</div>
          </div>

          <div className="md:col-span-2 bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-lg font-medium mb-3">Gráfica y puntos de evaluación</h2>
            <div style={{ height: 360 }} className="w-full">
              <ResponsiveContainer>
                <LineChart data={sampleData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" domain={[a, b]} type="number" tickFormatter={(v) => v.toFixed(2)} />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toFixed(6)} />
                  <Line type="monotone" dataKey="y" dot={false} strokeWidth={2} />

                  {result && (
                    <>
                      <Line
                        data={result.history.map((h) => ({ x: h.x1, y: h.f1 }))}
                        type="monotone"
                        dataKey="y"
                        stroke="none"
                        dot={{ fill: "#FF5722", r: 4 }}
                        connectNulls={false}
                      />
                      <Line
                        data={result.history.map((h) => ({ x: h.x2, y: h.f2 }))}
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
                      <th className="px-2 py-1 text-left">x1</th>
                      <th className="px-2 py-1 text-left">f(x1)</th>
                      <th className="px-2 py-1 text-left">x2</th>
                      <th className="px-2 py-1 text-left">f(x2)</th>
                      <th className="px-2 py-1 text-left">Fib(k)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.history.map((h) => (
                      <tr key={h.iter} className="border-t">
                        <td className="px-2 py-1">{h.iter}</td>
                        <td className="px-2 py-1">{h.a.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.b.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.x1.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.f1.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.x2.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.f2.toFixed(6)}</td>
                        <td className="px-2 py-1">{h.fib_k}</td>
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
