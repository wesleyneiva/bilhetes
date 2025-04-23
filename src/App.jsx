import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NovoBilhete from './pages/NovoBilhete';
import Bilhetes from './pages/Bilhetes';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<NovoBilhete />} />
          <Route path="/bilhetes" element={<Bilhetes />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
