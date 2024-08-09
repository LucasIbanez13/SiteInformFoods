import React from 'react';

const Nav = ({ onNavClick, searchQuery, setSearchQuery, handleSearch }) => {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
    onNavClick('search');
  };

  return (
    <nav className="text-black bg-gray-100">
      <div className="container mx-auto px-6 py-3 flex flex-col items-center">
        <div className="flex space-x-8 mb-4">
          <a href="#" onClick={() => onNavClick('all')} className="hover:text-gray-600 text-lg font-semibold">Inicio</a>
          <a href="#" onClick={() => onNavClick('popular')} className="hover:text-gray-600 text-lg font-semibold">Popular</a>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center w-full max-w-md">
          <input
            type="text"
            placeholder="Buscar Recetas"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
          />
          <button type="submit" className="hidden">Buscar</button>
        </form>
      </div>
    </nav>
  );
};

export default Nav;
