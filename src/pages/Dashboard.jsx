import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const tipos = ['software', 'hardware', 'ajuda/duvida'];

const coresTipos = {
  software: '#3b82f6',
  hardware: '#f59e0b',
  'ajuda/duvida': '#10b981',
};

const Dashboard = () => {
  const [bilhetes, setBilhetes] = useState([]);

  useEffect(() => {
    fetchBilhetes();
  }, []);

  const fetchBilhetes = async () => {
    const { data } = await supabase.from('bilhetes').select('*');
    setBilhetes(data || []);
  };

  const total = bilhetes.length;

  const porTipo = tipos.map(tipo => {
    const count = bilhetes.filter(b => b.tipo === tipo).length;
    return {
      tipo,
      count,
      porcentagem: total ? ((count / total) * 100).toFixed(1) : 0,
    };
  });

  const bilhetesPorMesPorTipo = () => {
    const resultado = tipos.map(tipo => ({
      tipo,
      dados: Array(12).fill(0),
    }));

    bilhetes.forEach(b => {
      const mes = dayjs(b.criadoem).month();
      const tipoIndex = tipos.indexOf(b.tipo);
      if (tipoIndex !== -1) {
        resultado[tipoIndex].dados[mes]++;
      }
    });

    return resultado;
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(bilhetes);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    download(url, 'bilhetes.csv');
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(bilhetes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bilhetes');
    XLSX.writeFile(workbook, 'bilhetes.xlsx');
  };

  const download = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {porTipo.map((item, index) => (
          <motion.div
            key={item.tipo}
            className="p-4 border rounded-lg shadow bg-white cursor-default"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
          >
            <h3 className="text-lg font-semibold capitalize">{item.tipo}</h3>
            <p className="text-3xl font-bold">{item.count}</p>
            <p className="text-sm text-gray-500">{item.porcentagem}% do total</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Total por tipo</h2>
        <div className="h-[150px]">
          <Bar
            data={{
              labels: porTipo.map(p => p.tipo),
              datasets: [{
                label: 'Total',
                data: porTipo.map(p => p.count),
                backgroundColor: ['#3b82f6', '#f59e0b', '#8b5cf6'],
                borderRadius: 8,
                hoverBackgroundColor: ['#2563eb', '#d97706', '#7c3aed'],
                barThickness: 40,
              }],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  ticks: { beginAtZero: true, color: '#4b5563' },
                  grid: { display: false },
                },
                x: {
                  ticks: { color: '#4b5563', font: { weight: 'bold' } },
                  grid: { display: false },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Evolução mensal por tipo</h2>
        <div className="h-[200px]">
          <Line
            data={{
              labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
              datasets: bilhetesPorMesPorTipo().map(({ tipo, dados }) => ({
                label: tipo,
                data: dados,
                borderColor: coresTipos[tipo],
                backgroundColor: `${coresTipos[tipo]}33`,
                fill: true,
                tension: 0.3,
              })),
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: { color: '#4b5563' },
                },
              },
              scales: {
                y: {
                  ticks: { color: '#4b5563' },
                  grid: { display: false },
                },
                x: {
                  ticks: { color: '#4b5563' },
                  grid: { display: false },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="mb-6 bg-gray-50 p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Relatório</h2>
        <p className="mb-2">Total de bilhetes registrados: <strong>{total}</strong></p>
        <ul className="list-disc list-inside text-gray-700">
          {porTipo.map(item => (
            <li key={item.tipo}>
              <strong>{item.tipo}</strong>: {item.count} bilhete(s) ({item.porcentagem}%)
            </li>
          ))}
        </ul>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg overflow-hidden shadow-sm mt-2">
            <thead className="bg-blue-300 text-gray-700">
              <tr>
                <th className="px-3 py-2 border text-left">Tipo</th>
                {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map(mes => (
                  <th key={mes} className="px-3 py-2 border text-center">{mes}</th>
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
                  <td className="px-3 py-2 border font-medium text-gray-700">{tipo}</td>
                  {dados.map((qtd, colIndex) => (
                    <td key={colIndex} className="px-3 py-2 border text-center text-gray-600">{qtd}</td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Dados atualizados em: <strong>{dayjs().format('DD/MM/YYYY HH:mm')}</strong>
        </p>
      </div>

      <div className="flex gap-4 mt-6">
        <button onClick={handleExportCSV} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer">
          Exportar CSV
        </button>
        <button onClick={handleExportExcel} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer">
          Exportar Excel
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
