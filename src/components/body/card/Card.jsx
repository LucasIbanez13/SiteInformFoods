import React, { useState, useEffect } from 'react';

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

const Card = ({ filter }) => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      let url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${filter}`;

      if (filter === 'popular') {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood`; // Ajusta según el filtro que uses
      }

      console.log('Fetching URL:', url); // Añade esto para depurar

      try {
        const response = await fetch(url);
        const data = await response.json();

        console.log('API Response:', data); // Añade esto para depurar

        if (data.meals) {
          const translatedRecipes = await Promise.all(data.meals.map(async (recipe) => {
            const translatedName = await translateText(recipe.strMeal);
            const translatedCategory = await translateText(recipe.strCategory);
            return {
              ...recipe,
              strMeal: translatedName,
              strCategory: translatedCategory,
            };
          }));

          setRecipes(translatedRecipes || []);
        } else {
          setRecipes([]); // No hay resultados para mostrar
        }
      } catch (error) {
        setError('Error al obtener recetas: ' + error.message);
        console.error(error);
      }
    };

    fetchRecipes();
  }, [filter]);

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
      setError('Error al obtener detalles de la receta: ' + error.message);
      console.error(error);
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.isArray(recipes) && recipes.length > 0 ? (
        recipes.map((recipe) => (
          <div key={recipe.idMeal} className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col justify-between h-full">
            <img
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex-grow">
              <h2 className="text-lg font-semibold">{recipe.strMeal}</h2>
              <p className="text-sm text-gray-600">{recipe.strCategory}</p>
            </div>
            <div className="p-4">
              <button
                onClick={() => handleRecipeClick(recipe.idMeal)}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Ver receta
              </button>
            </div>
          </div>
        ))
      ) : (
        <p></p>
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
  );
};

export default Card;
