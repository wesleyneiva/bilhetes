import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { PlusCircle } from 'lucide-react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Ativa os plugins do dayjs
dayjs.extend(utc)
dayjs.extend(timezone)

const NovoBilhete = () => {
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    responsavel: 'Erik',
    tipo: 'software',
    status: 'aberto',
  })

  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    
  const now = new Date();
  const offset = -3 * 60; // -3 horas em minutos
  const localDate = new Date(now.getTime() + offset * 60 * 1000);
  
    
    const bilheteComHorario = {
      ...form,
      criadoem: localDate.toISOString() 
    }
  
    const { data, error } = await supabase.from('bilhetes').insert([bilheteComHorario])
    
    setLoading(false)
  
    if (error) {
      setErrorMessage(error.message)
      console.error("Erro ao salvar bilhete:", error)
    } else {
      console.log("Bilhete inserido:", data)
      setShowModal(true)
      setForm({
        titulo: '',
        descricao: '',
        responsavel: 'Erik',
        tipo: 'software',
        status: 'aberto',
      }) // Reset do formulário
    }
  }

  const ButtonGroup = ({ name, options }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(opt => (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300 }}
          type="button"
          key={opt}
          className={`px-4 py-2 rounded-md border cursor-pointer transition ${
            form[name] === opt
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-gray-400 text-gray-600 hover:border-blue-500 hover:text-blue-500'
          }`}
          onClick={() => setForm({ ...form, [name]: opt })}
        >
          {opt}
        </motion.button>
      ))}
    </div>
  )

  return (
    <div className="relative">
      {showModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
        >
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg text-center w-96"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-blue-600">Bilhete Criado!</h2>
            <p className="text-gray-700 mt-2">Seu bilhete foi aberto com sucesso.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(false)}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md"
            >
              OK
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
        >
          <motion.div
            className="bg-red-600 text-white p-6 rounded-lg shadow-lg text-center w-96"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold">Erro!</h2>
            <p className="text-white mt-2">{errorMessage}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setErrorMessage(null)}
              className="mt-4 bg-red-700 text-white py-2 px-4 rounded-md"
            >
              Fechar
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg"
      >
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold text-black mb-6">
          <PlusCircle className="w-5 h-8 text-black" />
          Novo Bilhete
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="titulo"
            placeholder="Título"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            required
          />
          <textarea
            name="descricao"
            placeholder="Descrição"
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />
          <div>
            <label className="font-semibold text-gray-700">Responsável:</label>
            <ButtonGroup name="responsavel" options={['Erik', 'Wesley', 'Wilson']} />
          </div>
          <div>
            <label className="font-semibold text-gray-700">Tipo:</label>
            <ButtonGroup name="tipo" options={['software', 'hardware', 'ajuda/duvida']} />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition cursor-pointer"
          >
            {loading ? 'Carregando...' : 'Enviar'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

export default NovoBilhete
