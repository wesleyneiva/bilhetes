import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import dayjs from "dayjs";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const grupos = [
  "software",
  "hardware",
  "ajuda/duvida",
  "suprimentos",
  "busca de imagens",
  "redes",
];
const tipos = [
  "preventiva",
  "corretiva",
  "configuração",
  "suporte usuario",
  "suprimento",
  "CFTV",
];

const coresGrupos = {
  software: "#3b82f6",
  hardware: "#f59e0b",
  "ajuda/duvida": "#8b5cf6",
  suprimentos: "#10b981",
  "busca de imagens": "#ef4444",
  redes: "#7c3aed",
};

const coresTipos = {
  preventiva: "#3b82f6",
  corretiva: "#f59e0b",
  configuração: "#8b5cf6",
  "suporte usuario": "#10b981",
  suprimento: "#ef4444",
  CFTV: "#7c3aed",
};

const Dashboard = () => {
  const [bilhetes, setBilhetes] = useState([]);
  const [anoSelecionado, setAnoSelecionado] = useState(
    new Date().getFullYear()
  );

  useEffect(() => {
    fetchBilhetes();
  }, []);

  const fetchBilhetes = async () => {
    const { data } = await supabase.from("bilhetes").select("*");
    setBilhetes(data || []);
  };

  const bilhetesFiltrados = bilhetes.filter(
    (b) => dayjs(b.criadoem).year() === Number(anoSelecionado)
  );

  const total = bilhetesFiltrados.length;

  // Estatísticas por grupo
  const porGrupo = grupos.map((grupo) => {
    const count = bilhetesFiltrados.filter((b) => b.grupo === grupo).length;
    return {
      grupo,
      count,
      porcentagem: total ? ((count / total) * 100).toFixed(1) : 0,
    };
  });

  // Estatísticas por tipo
  const porTipo = tipos.map((tipo) => {
    const count = bilhetesFiltrados.filter((b) => b.tipo === tipo).length;
    return {
      tipo,
      count,
      porcentagem: total ? ((count / total) * 100).toFixed(1) : 0,
    };
  });

  // Bilhetes por mês por grupo
  const bilhetesPorMesPorGrupo = () => {
    const resultado = grupos.map((grupo) => ({
      grupo,
      dados: Array(12).fill(0),
    }));

    bilhetesFiltrados.forEach((b) => {
      const mes = dayjs(b.criadoem).month();
      const grupoIndex = grupos.indexOf(b.grupo);
      if (grupoIndex !== -1) {
        resultado[grupoIndex].dados[mes]++;
      }
    });

    return resultado;
  };

  // Bilhetes por mês por tipo
  const bilhetesPorMesPorTipo = () => {
    const resultado = tipos.map((tipo) => ({
      tipo,
      dados: Array(12).fill(0),
    }));

    bilhetesFiltrados.forEach((b) => {
      const mes = dayjs(b.criadoem).month();
      const tipoIndex = tipos.indexOf(b.tipo);
      if (tipoIndex !== -1) {
        resultado[tipoIndex].dados[mes]++;
      }
    });

    return resultado;
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(bilhetesFiltrados);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    download(url, `bilhetes_${anoSelecionado}.csv`);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(bilhetesFiltrados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bilhetes");
    XLSX.writeFile(workbook, `bilhetes_${anoSelecionado}.xlsx`);
  };

  const download = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const anosDisponiveis = Array.from(
    new Set(bilhetes.map((b) => dayjs(b.criadoem).year()))
  ).sort();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="mb-4">
        <label className="mr-2 font-medium">Selecionar ano:</label>
        <select
          value={anoSelecionado}
          onChange={(e) => setAnoSelecionado(Number(e.target.value))}
          className="border rounded px-3 py-1"
        >
          {anosDisponiveis.map((ano) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>
      </div>

      {/* Cards por Grupo */}
      <h2 className="text-xl font-semibold mb-4">Por Grupo</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {porGrupo.map((item, index) => (
          <motion.div
            key={item.grupo}
            className="p-4 border rounded-lg shadow bg-white cursor-default"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            }}
            style={{ borderLeft: `5px solid ${coresGrupos[item.grupo]}` }}
          >
            <h3 className="text-lg font-semibold capitalize">{item.grupo}</h3>
            <p className="text-3xl font-bold">{item.count}</p>
            <p className="text-sm text-gray-500">
              {item.porcentagem}% do total
            </p>
          </motion.div>
        ))}
      </div>

      {/* Cards por Tipo */}
      <h2 className="text-xl font-semibold mb-4">Por Tipo</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {porTipo.map((item, index) => (
          <motion.div
            key={item.tipo}
            className="p-4 border rounded-lg shadow bg-white cursor-default"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            }}
            style={{ borderLeft: `5px solid ${coresTipos[item.tipo]}` }}
          >
            <h3 className="text-lg font-semibold capitalize">{item.tipo}</h3>
            <p className="text-3xl font-bold">{item.count}</p>
            <p className="text-sm text-gray-500">
              {item.porcentagem}% do total
            </p>
          </motion.div>
        ))}
      </div>

      {/* Gráfico de barras por grupo */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Total por grupo</h2>
        <div className="h-[150px]">
          <Bar
            data={{
              labels: porGrupo.map((p) => p.grupo),
              datasets: [
                {
                  label: "Total",
                  data: porGrupo.map((p) => p.count),
                  backgroundColor: grupos.map((g) => coresGrupos[g]),
                  borderRadius: 8,
                  barThickness: 40,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  ticks: { beginAtZero: true, color: "#4b5563" },
                  grid: { display: false },
                },
                x: {
                  ticks: { color: "#4b5563", font: { weight: "bold" } },
                  grid: { display: false },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Gráfico de barras por tipo */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Total por tipo</h2>
        <div className="h-[150px]">
          <Bar
            data={{
              labels: porTipo.map((p) => p.tipo),
              datasets: [
                {
                  label: "Total",
                  data: porTipo.map((p) => p.count),
                  backgroundColor: tipos.map((t) => coresTipos[t]),
                  borderRadius: 8,
                  barThickness: 40,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  ticks: { beginAtZero: true, color: "#4b5563" },
                  grid: { display: false },
                },
                x: {
                  ticks: { color: "#4b5563", font: { weight: "bold" } },
                  grid: { display: false },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Evolução mensal por grupo */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          Evolução mensal por grupo
        </h2>
        <div className="h-[200px]">
          <Line
            data={{
              labels: [
                "Jan",
                "Fev",
                "Mar",
                "Abr",
                "Mai",
                "Jun",
                "Jul",
                "Ago",
                "Set",
                "Out",
                "Nov",
                "Dez",
              ],
              datasets: bilhetesPorMesPorGrupo().map(({ grupo, dados }) => ({
                label: grupo,
                data: dados,
                borderColor: coresGrupos[grupo],
                backgroundColor: `${coresGrupos[grupo]}33`,
                fill: false,
                tension: 0.3,
              })),
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  labels: { color: "#4b5563" },
                },
              },
              scales: {
                y: {
                  ticks: { color: "#4b5563" },
                  grid: { display: false },
                },
                x: {
                  ticks: { color: "#4b5563" },
                  grid: { display: false },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Evolução mensal por tipo */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Evolução mensal por tipo</h2>
        <div className="h-[200px]">
          <Line
            data={{
              labels: [
                "Jan",
                "Fev",
                "Mar",
                "Abr",
                "Mai",
                "Jun",
                "Jul",
                "Ago",
                "Set",
                "Out",
                "Nov",
                "Dez",
              ],
              datasets: bilhetesPorMesPorTipo().map(({ tipo, dados }) => ({
                label: tipo,
                data: dados,
                borderColor: coresTipos[tipo],
                backgroundColor: `${coresTipos[tipo]}33`,
                fill: false,
                tension: 0.3,
              })),
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  labels: { color: "#4b5563" },
                },
              },
              scales: {
                y: {
                  ticks: { color: "#4b5563" },
                  grid: { display: false },
                },
                x: {
                  ticks: { color: "#4b5563" },
                  grid: { display: false },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Relatório */}
      <div className="mb-6 bg-gray-50 p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">
          Relatório {anoSelecionado}
        </h2>
        <p className="mb-2">
          Total de bilhetes registrados: <strong>{total}</strong>
        </p>

        <h3 className="font-medium mt-4 mb-2">Por Grupo</h3>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          {porGrupo.map((item) => (
            <li key={item.grupo}>
              <strong>{item.grupo}</strong>: {item.count} bilhete(s) (
              {item.porcentagem}%)
            </li>
          ))}
        </ul>

        <h3 className="font-medium mt-4 mb-2">Por Tipo</h3>
        <ul className="list-disc list-inside text-gray-700">
          {porTipo.map((item) => (
            <li key={item.tipo}>
              <strong>{item.tipo}</strong>: {item.count} bilhete(s) (
              {item.porcentagem}%)
            </li>
          ))}
        </ul>

        {/* Tabela por Grupo */}
        <h3 className="font-medium mt-6 mb-2">Detalhamento por Grupo</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg overflow-hidden shadow-sm mt-2">
            <thead className="bg-blue-300 text-gray-700">
              <tr>
                <th className="px-3 py-2 border text-left">Grupo</th>
                {[
                  "Jan",
                  "Fev",
                  "Mar",
                  "Abr",
                  "Mai",
                  "Jun",
                  "Jul",
                  "Ago",
                  "Set",
                  "Out",
                  "Nov",
                  "Dez",
                ].map((mes) => (
                  <th key={mes} className="px-3 py-2 border text-center">
                    {mes}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bilhetesPorMesPorGrupo().map(({ grupo, dados }, rowIndex) => (
                <motion.tr
                  key={grupo}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  className="hover:bg-blue-50 transition duration-200"
                >
                  <td className="px-3 py-2 border font-medium text-gray-700">
                    {grupo}
                  </td>
                  {dados.map((qtd, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-3 py-2 border text-center text-gray-600"
                    >
                      {qtd}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabela por Tipo */}
        <h3 className="font-medium mt-6 mb-2">Detalhamento por Tipo</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg overflow-hidden shadow-sm mt-2">
            <thead className="bg-blue-300 text-gray-700">
              <tr>
                <th className="px-3 py-2 border text-left">Tipo</th>
                {[
                  "Jan",
                  "Fev",
                  "Mar",
                  "Abr",
                  "Mai",
                  "Jun",
                  "Jul",
                  "Ago",
                  "Set",
                  "Out",
                  "Nov",
                  "Dez",
                ].map((mes) => (
                  <th key={mes} className="px-3 py-2 border text-center">
                    {mes}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bilhetesPorMesPorTipo().map(({ tipo, dados }, rowIndex) => (
                <motion.tr
                  key={tipo}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  className="hover:bg-blue-50 transition duration-200"
                >
                  <td className="px-3 py-2 border font-medium text-gray-700">
                    {tipo}
                  </td>
                  {dados.map((qtd, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-3 py-2 border text-center text-gray-600"
                    >
                      {qtd}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Dados atualizados em:{" "}
          <strong>{dayjs().format("DD/MM/YYYY HH:mm")}</strong>
        </p>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleExportCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
        >
          Exportar CSV
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer"
        >
          Exportar Excel
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
