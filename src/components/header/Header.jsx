import React, { useState } from 'react';
import Nav from './nav/Nav';
import Card from '../body/card/Card'; // Asegúrate de que este sea el componente que maneja la visualización de recetas

const GOOGLE_TRANSLATE_API_KEY = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;

const translateText = async (text, targetLanguage = 'es') => {
  try {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Error en la traducción:', error);
    return text; // Devuelve el texto original si hay un error
  }
};

const Header = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleNavClick = (type) => {
    setFilter(type);
    if (type !== 'search') {
      setSearchQuery(''); // Limpiar la consulta de búsqueda al cambiar a otros filtros
      setSearchResults([]); // Limpiar resultados al cambiar de filtro
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`);
      const data = await response.json();

      console.log('API Response:', data); // Agrega esta línea para depurar la respuesta

      if (data && Array.isArray(data.meals)) {
        const translatedResults = await Promise.all(data.meals.map(async (meal) => {
          const translatedName = await translateText(meal.strMeal);
          return {
            ...meal,
            strMeal: translatedName,
          };
        }));

        setSearchResults(translatedResults || []);
      } else {
        setSearchResults([]); // No hay resultados para mostrar
      }
    } catch (error) {
      console.error('Error al buscar recetas:', error);
      setSearchResults([]); // Asegúrate de manejar la ausencia de resultados en caso de error
    }
  };

  const handleRecipeClick = async (recipeId) => {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
      const data = await response.json();
      const recipe = data.meals[0];

      const translatedRecipe = {
        ...recipe,
        strMeal: await translateText(recipe.strMeal),
        strCategory: await translateText(recipe.strCategory),
        strInstructions: await translateText(recipe.strInstructions || 'No hay instrucciones disponibles'),
        ingredients: Array.from({ length: 20 }).map((_, i) => ({
          ingredient: recipe[`strIngredient${i + 1}`],
          measure: recipe[`strMeasure${i + 1}`],
        })).filter(({ ingredient }) => ingredient), // Filtra ingredientes vacíos
      };

      setSelectedRecipe(translatedRecipe);
    } catch (error) {
      console.error('Error al obtener detalles de la receta:', error);
    }
  };

  return (
    <header className="flex flex-col items-center justify-center py-8 bg-gray-100">
      <a href="/">
        <h1 className="text-4xl font-normal cursor-pointer" onClick={() => setFilter('all')}>
        SiteInform Food
        </h1>
      </a>
      <Nav 
        onNavClick={handleNavClick} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        handleSearch={handleSearch} 
      />
      <div className="container mx-auto px-6 py-3">
        {filter === 'search' ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Recetas Encontradas</h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.map((recipe) => (
                  <div key={recipe.idMeal} className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <img
                      src={recipe.strMealThumb}
                      alt={recipe.strMeal}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{recipe.strMeal}</h3>
                      <button
                        onClick={() => handleRecipeClick(recipe.idMeal)}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2"
                      >
                        Ver receta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No se encontraron recetas para "{searchQuery}"</p>
            )}
          </div>
        ) : (
          <Card filter={filter} />
        )}

        {selectedRecipe && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-7/12 h-5/6 overflow-auto max-h-full relative">
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600"
              >
                x
              </button>
              <h2 className="text-2xl font-semibold mb-4">{selectedRecipe.strMeal}</h2>
              <p className="text-sm mb-4">{selectedRecipe.strCategory}</p>
              <img
                src={selectedRecipe.strMealThumb}
                alt={selectedRecipe.strMeal}
                className="w-full h-64 object-cover mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Instrucciones</h3>
              <p>{selectedRecipe.strInstructions}</p>
              <h3 className="text-xl font-semibold mb-2 mt-4">Ingredientes</h3>
              <ul>
                {selectedRecipe.ingredients.map((item, index) => (
                  <li key={index} className="text-sm">
                    {item.ingredient} - {item.measure}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
