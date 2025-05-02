import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { motion } from 'framer-motion'
import { CheckCircle, Loader, Archive } from 'lucide-react'

dayjs.extend(utc)
dayjs.extend(timezone)

const STATUS = ['aberto', 'em andamento', 'fechado']
const TIPO_CORES = {
  'software': 'bg-blue-400',
  'hardware': 'bg-yellow-400',
  'ajuda/duvida': 'bg-gray-400',
}

const STATUS_CORES = {
  'aberto': '#22c55e',
  'em andamento': '#f59e0b',
  'fechado': '#3b82f6',
}

const STATUS_ICONS = {
  'aberto': <CheckCircle className="w-5 h-5 mr-2" color={STATUS_CORES['aberto']} />,
  'em andamento': <Loader className="w-5 h-5 mr-2 animate-spin" color={STATUS_CORES['em andamento']} />,
  'fechado': <Archive className="w-5 h-5 mr-2" color={STATUS_CORES['fechado']} />,
}

const Bilhetes = () => {
  const [bilhetes, setBilhetes] = useState([])
  const [filtro, setFiltro] = useState({ titulo: '', tipo: '', status: '', dataInicio: '', dataFim: '' })
  const [editingDescricao, setEditingDescricao] = useState({})
  const [descricaoTemp, setDescricaoTemp] = useState({})

  useEffect(() => {
    buscarBilhetes()
  }, [])

  const buscarBilhetes = async () => {
    const { data } = await supabase
      .from('bilhetes')
      .select('*')
      .order('criadoem', { ascending: false })
    
    if (data) {
      setBilhetes(data)
    }
  }

  const handleFiltro = (e) => {
    const { name, value } = e.target
    setFiltro(prev => ({ ...prev, [name]: value }))
  }

  const limparFiltros = () => {
    setFiltro({ titulo: '', tipo: '', status: '', dataInicio: '', dataFim: '' })
  }

  const filtrar = (bilhete) => {
    const tituloOK = bilhete.titulo.toLowerCase().includes(filtro.titulo.toLowerCase())
    const tipoOK = filtro.tipo ? bilhete.tipo === filtro.tipo : true
    const statusOK = filtro.status ? bilhete.status === filtro.status : true

    const criadoem = dayjs(bilhete.criadoem)
    const dataInicioOK = filtro.dataInicio ? criadoem.isAfter(dayjs(filtro.dataInicio).startOf('day').subtract(1, 'second')) : true
    const dataFimOK = filtro.dataFim ? criadoem.isBefore(dayjs(filtro.dataFim).endOf('day').add(1, 'second')) : true

    return tituloOK && tipoOK && statusOK && dataInicioOK && dataFimOK
  }

  const atualizarStatus = async (id, status) => {
    await supabase.from('bilhetes').update({ status }).eq('id', id)
    buscarBilhetes()
  }

  const salvarDescricao = async (id) => {
    const novaDescricao = descricaoTemp[id] || ''
    await supabase.from('bilhetes').update({ descricao: novaDescricao }).eq('id', id)
    setEditingDescricao(prev => ({ ...prev, [id]: false }))
    buscarBilhetes()
  }

  const cancelarEdicao = (id) => {
    setEditingDescricao(prev => ({ ...prev, [id]: false }))
    setDescricaoTemp(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  const Card = ({ b }) => {
    const textareaRef = useRef(null)

    useEffect(() => {
      if (editingDescricao[b.id] && textareaRef.current) {
        textareaRef.current.focus()
        const length = textareaRef.current.value.length
        textareaRef.current.setSelectionRange(length, length)
      }
    }, [editingDescricao[b.id]])

    return (
      <motion.div
        layout
        className="bg-white rounded-xl shadow-md p-4 mb-4 relative flex flex-col gap-2 border-l-[6px]"
        style={{ borderColor: STATUS_CORES[b.status] }}
        key={`card-${b.id}`}
      >
        <div className="flex justify-between items-center">
          <span className={`text-xs px-2 py-1 rounded ${TIPO_CORES[b.tipo]} text-white`}>
            {b.tipo}
          </span>
          <span className="text-sm text-gray-500">
            {dayjs(b.criadoem).utc().format('DD/MM/YYYY HH:mm')}
          </span>
        </div>
        <h3 className="font-bold text-lg text-blue-800">{b.titulo}</h3>

        {editingDescricao[b.id] ? (
          <div>
            <textarea
              ref={textareaRef}
              className="w-full border rounded-md p-2 text-sm"
              value={descricaoTemp[b.id] ?? b.descricao ?? ''}
              onChange={(e) =>
                setDescricaoTemp(prev => ({ ...prev, [b.id]: e.target.value }))
              }
            />
            <div className="flex gap-2 mt-2">
              <button
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 cursor-pointer"
                onClick={() => salvarDescricao(b.id)}
              >
                OK
              </button>
              <button
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 cursor-pointer"
                onClick={() => cancelarEdicao(b.id)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p
            className="text-gray-600 cursor-pointer"
            onClick={() => {
              setEditingDescricao(prev => ({ ...prev, [b.id]: true }))
              setDescricaoTemp(prev => ({ ...prev, [b.id]: b.descricao ?? '' }))
            }}
          >
            {b.descricao || <span className="italic text-gray-400">Sem descrição</span>}
          </p>
        )}

        <div className="flex gap-2 mt-2 flex-wrap">
          {STATUS.map(opt => (
            <motion.button
              key={opt}
              type="button"
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                borderColor: STATUS_CORES[b.status],
                color: b.status === opt ? STATUS_CORES[b.status] : '#6b7280',
                backgroundColor: b.status === opt ? `${STATUS_CORES[b.status]}20` : 'transparent'
              }}
              className={`px-3 py-1 rounded-md text-sm border ${
                b.status === opt ? 'font-semibold' : ''
              } cursor-pointer`}
              onClick={() => atualizarStatus(b.id, opt)}
            >
              {opt}
            </motion.button>
          ))}
        </div>

        <div className="text-right text-xs text-gray-400 mt-1">Responsável: {b.responsavel}</div>
      </motion.div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bilhetes</h1>

      <div className="flex gap-4 mb-6 flex-wrap items-end">
        <input
          type="text"
          name="titulo"
          placeholder="Filtrar por título"
          className="border p-2 rounded w-full sm:w-1/3"
          onChange={handleFiltro}
          value={filtro.titulo}
        />
        <select name="tipo" className="border p-2 rounded" onChange={handleFiltro} value={filtro.tipo}>
          <option value="">Tipo</option>
          <option value="software">Software</option>
          <option value="hardware">Hardware</option>
          <option value="ajuda/duvida">Ajuda/Dúvida</option>
        </select>
        <select name="status" className="border p-2 rounded" onChange={handleFiltro} value={filtro.status}>
          <option value="">Status</option>
          {STATUS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          name="dataInicio"
          className="border p-2 rounded"
          onChange={handleFiltro}
          value={filtro.dataInicio}
        />
        <input
          type="date"
          name="dataFim"
          className="border p-2 rounded"
          onChange={handleFiltro}
          value={filtro.dataFim}
        />

        <motion.button
          onClick={limparFiltros}
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 cursor-pointer"
        >
          Limpar filtros
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUS.map(status => (
          <div key={status}>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              {STATUS_ICONS[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
            </h2>
            {bilhetes
              .filter(b => b.status === status && filtrar(b))
              .map(b => (
                <Card key={b.id} b={b} />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Bilhetes
