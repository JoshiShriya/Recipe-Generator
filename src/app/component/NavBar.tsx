import React from 'react';

interface NavBarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'generate', label: 'Recipes' },
    { id: 'saved', label: 'Favourites' },
  ];

  return (
    <nav className="w-full bg-indigo-950 bg-opacity-70 backdrop-blur-md shadow-lg p-4 flex justify-between items-center fixed top-0 left-0 z-50 rounded-b-xl">
      <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-blue-300">
        Ingreedy
      </div>
      <div className="flex space-x-2 sm:space-x-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`px-3 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              currentPage === item.id
                ? 'bg-purple-700 text-white'
                : 'text-gray-300 hover:text-white hover:bg-purple-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div> 
    </nav>
  );
};

export default NavBar;