import { Link, useLocation } from 'react-router-dom';
import { FiFilePlus, FiFileText, FiBarChart2 } from 'react-icons/fi';

const Navbar = () => {
  const { pathname } = useLocation();

  const navItem = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-white transition ${
        pathname === to ? 'bg-blue-400' : 'hover:bg-blue-400'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="bg-blue-500 p-4 flex items-center justify-between flex-wrap">
      <div className="flex gap-2">
        {navItem('/', 'Novo Bilhete', FiFilePlus)}
        {navItem('/bilhetes', 'Bilhetes', FiFileText)}
        {navItem('/dashboard', 'Dashboard', FiBarChart2)}
      </div>
      <a
        href="https://www.aabbportoalegre.com.br/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="./logo.png"
          alt="Logo"
          className="w-60 h-10 rounded-full object-cover"
        />
      </a>
    </nav>
  );
};

export default Navbar;
