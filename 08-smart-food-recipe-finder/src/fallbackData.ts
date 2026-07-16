// ===== FALLBACK RECIPES & STATIC DATA =====
// Used when TheMealDB API is unavailable

import type { Recipe, CategoryItem, IngredientItem } from './types';

export const FALLBACK_RECIPES: Recipe[] = [
  {
    id: 'fb-1', name: 'Spaghetti Bolognese', category: 'Pasta', area: 'Italian',
    instructions: '1. Heat olive oil in a large pot over medium heat. Add chopped onions, carrots, and celery; cook until softened.\n2. Add minced garlic and cook 1 minute. Add ground beef; cook until browned.\n3. Pour in crushed tomatoes, tomato paste, and a splash of red wine. Season with salt, pepper, oregano, and basil.\n4. Simmer for at least 30 minutes, stirring occasionally.\n5. Cook spaghetti according to package directions. Drain and serve topped with the bolognese sauce.\n6. Garnish with freshly grated Parmesan cheese and basil leaves.',
    thumbnail: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=75', tags: ['Pasta', 'Italian', 'Beef'], youtube: 'https://www.youtube.com/watch?v=KVukPHOl61s',
    ingredients: [
      { ingredient: 'Spaghetti', measure: '400g' }, { ingredient: 'Ground Beef', measure: '500g' },
      { ingredient: 'Onion', measure: '1 large' }, { ingredient: 'Garlic', measure: '3 cloves' },
      { ingredient: 'Carrot', measure: '1' }, { ingredient: 'Celery', measure: '2 stalks' },
      { ingredient: 'Crushed Tomatoes', measure: '400g' }, { ingredient: 'Tomato Paste', measure: '2 tbsp' },
      { ingredient: 'Red Wine', measure: '100ml' }, { ingredient: 'Olive Oil', measure: '2 tbsp' },
      { ingredient: 'Parmesan', measure: 'To serve' }, { ingredient: 'Basil', measure: 'To garnish' },
    ],
  },
  {
    id: 'fb-2', name: 'Chicken Tikka Masala', category: 'Chicken', area: 'Indian',
    instructions: '1. Marinate chicken pieces in yogurt, lemon juice, and tikka spices for at least 2 hours.\n2. Thread chicken onto skewers and grill or bake until charred.\n3. In a large pan, sauté onions, garlic, and ginger in butter until golden.\n4. Add cumin, coriander, turmeric, garam masala, and chili powder; cook 2 minutes.\n5. Add crushed tomatoes and simmer for 15 minutes.\n6. Stir in heavy cream and the grilled chicken pieces.\n7. Simmer 10 minutes. Garnish with cilantro and serve with basmati rice or naan.',
    thumbnail: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg', tags: ['Curry', 'Indian', 'Spicy'], youtube: 'https://www.youtube.com/watch?v=HMfUsS9zeuw',
    ingredients: [
      { ingredient: 'Chicken Breast', measure: '500g' }, { ingredient: 'Yogurt', measure: '200ml' },
      { ingredient: 'Lemon Juice', measure: '2 tbsp' }, { ingredient: 'Onion', measure: '2' },
      { ingredient: 'Garlic', measure: '4 cloves' }, { ingredient: 'Ginger', measure: '2cm piece' },
      { ingredient: 'Crushed Tomatoes', measure: '400g' }, { ingredient: 'Heavy Cream', measure: '150ml' },
      { ingredient: 'Garam Masala', measure: '2 tsp' },
    ],
  },
  {
    id: 'fb-3', name: 'Classic Pancakes', category: 'Breakfast', area: 'American',
    instructions: '1. In a bowl, whisk together flour, sugar, baking powder, and salt.\n2. In another bowl, whisk milk, egg, melted butter, and vanilla.\n3. Pour wet ingredients into dry; stir until just combined (lumps are fine).\n4. Heat a non-stick pan over medium heat. Pour ¼ cup batter per pancake.\n5. Cook until bubbles form on surface, then flip and cook 1-2 minutes.\n6. Serve stacked with maple syrup, fresh berries, and a pat of butter.',
    thumbnail: 'https://www.themealdb.com/images/media/meals/rwuyqx1511383174.jpg', tags: ['Breakfast', 'Sweet', 'Quick'], youtube: 'https://www.youtube.com/watch?v=NCMKedZvnyI',
    ingredients: [
      { ingredient: 'All-Purpose Flour', measure: '200g' }, { ingredient: 'Sugar', measure: '2 tbsp' },
      { ingredient: 'Baking Powder', measure: '2 tsp' }, { ingredient: 'Salt', measure: '¼ tsp' },
      { ingredient: 'Milk', measure: '300ml' }, { ingredient: 'Egg', measure: '1' },
      { ingredient: 'Butter', measure: '3 tbsp melted' }, { ingredient: 'Vanilla Extract', measure: '1 tsp' },
      { ingredient: 'Maple Syrup', measure: 'To serve' }, { ingredient: 'Fresh Berries', measure: 'To serve' },
    ],
  },
  {
    id: 'fb-4', name: 'Greek Salad', category: 'Salad', area: 'Greek',
    instructions: '1. Cut tomatoes into wedges and cucumber into half-moons.\n2. Slice red onion thinly and combine with tomatoes and cucumber in a large bowl.\n3. Add Kalamata olives and capers.\n4. Drizzle generously with extra virgin olive oil and red wine vinegar.\n5. Season with dried oregano, salt, and pepper.\n6. Top with a thick slab of feta cheese and serve with crusty bread.',
    thumbnail: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=75', tags: ['Salad', 'Mediterranean', 'Vegetarian'], youtube: 'https://www.youtube.com/watch?v=kwq4vl610iY',
    ingredients: [
      { ingredient: 'Tomatoes', measure: '4 large' }, { ingredient: 'Cucumber', measure: '1' },
      { ingredient: 'Red Onion', measure: '1' }, { ingredient: 'Feta Cheese', measure: '200g' },
      { ingredient: 'Kalamata Olives', measure: '100g' }, { ingredient: 'Extra Virgin Olive Oil', measure: '3 tbsp' },
      { ingredient: 'Red Wine Vinegar', measure: '1 tbsp' }, { ingredient: 'Dried Oregano', measure: '1 tsp' },
    ],
  },
  {
    id: 'fb-5', name: 'Beef Stir Fry', category: 'Beef', area: 'Chinese',
    instructions: '1. Slice beef thinly against the grain. Marinate in soy sauce, cornstarch, and sesame oil for 15 minutes.\n2. Heat a wok over high heat. Add oil and stir-fry beef in batches until seared; set aside.\n3. In the same wok, stir-fry broccoli, bell peppers, and snap peas for 2-3 minutes.\n4. Add minced garlic and ginger; cook 30 seconds.\n5. Return beef to wok. Add stir-fry sauce (soy, oyster sauce, honey, cornstarch slurry).\n6. Toss until sauce thickens and coats everything. Serve over steamed rice.',
    thumbnail: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=75', tags: ['Stir Fry', 'Asian', 'Quick'], youtube: 'https://www.youtube.com/watch?v=cyS8ycmGs1U',
    ingredients: [
      { ingredient: 'Beef Sirloin', measure: '400g' }, { ingredient: 'Soy Sauce', measure: '3 tbsp' },
      { ingredient: 'Sesame Oil', measure: '1 tbsp' }, { ingredient: 'Broccoli', measure: '1 head' },
      { ingredient: 'Bell Pepper', measure: '1' }, { ingredient: 'Snap Peas', measure: '150g' },
      { ingredient: 'Garlic', measure: '3 cloves' }, { ingredient: 'Ginger', measure: '1 tbsp grated' },
      { ingredient: 'Oyster Sauce', measure: '2 tbsp' }, { ingredient: 'Honey', measure: '1 tbsp' },
    ],
  },
  {
    id: 'fb-6', name: 'Chocolate Lava Cake', category: 'Dessert', area: 'French',
    instructions: '1. Melt dark chocolate and butter together in a double boiler.\n2. Whisk eggs, egg yolks, and sugar until thick and pale.\n3. Fold melted chocolate into egg mixture.\n4. Sift in flour and fold gently until just combined.\n5. Grease ramekins and dust with cocoa powder. Divide batter among them.\n6. Bake at 200°C for exactly 12 minutes — edges should be set but center jiggly.\n7. Let cool 30 seconds, then invert onto plates. Serve with vanilla ice cream.',
    thumbnail: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=75', tags: ['Dessert', 'Chocolate', 'Baking'], youtube: 'https://www.youtube.com/watch?v=fvphpRBWAEk',
    ingredients: [
      { ingredient: 'Dark Chocolate', measure: '200g' }, { ingredient: 'Butter', measure: '120g' },
      { ingredient: 'Eggs', measure: '2' }, { ingredient: 'Egg Yolks', measure: '2' },
      { ingredient: 'Sugar', measure: '100g' }, { ingredient: 'All-Purpose Flour', measure: '40g' },
      { ingredient: 'Cocoa Powder', measure: 'For dusting' }, { ingredient: 'Vanilla Ice Cream', measure: 'To serve' },
    ],
  },
  {
    id: 'fb-7', name: 'Fish Tacos', category: 'Seafood', area: 'Mexican',
    instructions: '1. Season white fish fillets with cumin, chili powder, lime juice, and salt.\n2. Grill or pan-sear fish for 3-4 minutes per side until flaky; break into chunks.\n3. Warm corn tortillas on a dry skillet.\n4. Make slaw: toss shredded cabbage with lime juice, cilantro, and a pinch of salt.\n5. Assemble tacos: tortilla, fish, slaw, sliced avocado, and a drizzle of chipotle mayo.\n6. Serve with lime wedges.',
    thumbnail: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=75', tags: ['Seafood', 'Tacos', 'Mexican'], youtube: 'https://www.youtube.com/watch?v=CPFxcByLeYE',
    ingredients: [
      { ingredient: 'White Fish Fillets', measure: '400g' }, { ingredient: 'Corn Tortillas', measure: '8' },
      { ingredient: 'Cabbage', measure: '¼ head' }, { ingredient: 'Avocado', measure: '1' },
      { ingredient: 'Lime', measure: '2' }, { ingredient: 'Cumin', measure: '1 tsp' },
      { ingredient: 'Chili Powder', measure: '1 tsp' }, { ingredient: 'Chipotle Mayo', measure: 'To serve' },
      { ingredient: 'Cilantro', measure: 'To garnish' },
    ],
  },
  {
    id: 'fb-8', name: 'Mushroom Risotto', category: 'Vegetarian', area: 'Italian',
    instructions: '1. Heat vegetable stock in a saucepan; keep warm over low heat.\n2. In a large pan, sauté mixed mushrooms in butter until golden; set aside.\n3. In the same pan, cook diced onion in olive oil until translucent. Add minced garlic.\n4. Add Arborio rice and toast for 2 minutes, stirring constantly.\n5. Add a splash of white wine and stir until absorbed.\n6. Add warm stock one ladle at a time, stirring until absorbed before adding more. Repeat for 18-20 minutes.\n7. When rice is creamy and al dente, stir in mushrooms, Parmesan, and a knob of butter. Serve immediately.',
    thumbnail: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=75', tags: ['Risotto', 'Italian', 'Comfort Food'], youtube: 'https://www.youtube.com/watch?v=a0Q27_6l1bU',
    ingredients: [
      { ingredient: 'Arborio Rice', measure: '300g' }, { ingredient: 'Mixed Mushrooms', measure: '300g' },
      { ingredient: 'Vegetable Stock', measure: '1L' }, { ingredient: 'Onion', measure: '1' },
      { ingredient: 'Garlic', measure: '2 cloves' }, { ingredient: 'White Wine', measure: '100ml' },
      { ingredient: 'Parmesan', measure: '50g' }, { ingredient: 'Butter', measure: '30g' },
      { ingredient: 'Olive Oil', measure: '2 tbsp' },
    ],
  },
];

export const FALLBACK_CATEGORIES: CategoryItem[] = [
  { idCategory: '1', strCategory: 'Beef', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '2', strCategory: 'Chicken', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '3', strCategory: 'Dessert', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '4', strCategory: 'Pasta', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '5', strCategory: 'Seafood', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '6', strCategory: 'Vegetarian', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '7', strCategory: 'Breakfast', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '8', strCategory: 'Salad', strCategoryThumb: '', strCategoryDescription: '' },
];

export const FALLBACK_AREAS: string[] = [
  'American', 'British', 'Canadian', 'Chinese', 'French', 'Greek', 'Indian',
  'Italian', 'Japanese', 'Mexican', 'Thai', 'Turkish',
];

export const FALLBACK_INGREDIENTS: IngredientItem[] = [
  { idIngredient: '1', strIngredient: 'Chicken', strDescription: '', strType: null },
  { idIngredient: '2', strIngredient: 'Salmon', strDescription: '', strType: null },
  { idIngredient: '3', strIngredient: 'Beef', strDescription: '', strType: null },
  { idIngredient: '4', strIngredient: 'Tomatoes', strDescription: '', strType: null },
  { idIngredient: '5', strIngredient: 'Garlic', strDescription: '', strType: null },
  { idIngredient: '6', strIngredient: 'Onion', strDescription: '', strType: null },
  { idIngredient: '7', strIngredient: 'Pasta', strDescription: '', strType: null },
  { idIngredient: '8', strIngredient: 'Rice', strDescription: '', strType: null },
  { idIngredient: '9', strIngredient: 'Eggs', strDescription: '', strType: null },
  { idIngredient: '10', strIngredient: 'Butter', strDescription: '', strType: null },
];

export const NUTRITION_TIPS = [
  { id: 'nt-1', title: 'Balanced Plate', content: 'Fill half your plate with vegetables, one quarter with lean protein, and one quarter with whole grains for a balanced meal.' },
  { id: 'nt-2', title: 'Hydration First', content: 'Drink a glass of water 30 minutes before meals. Sometimes thirst is mistaken for hunger.' },
  { id: 'nt-3', title: 'Color Variety', content: 'Eat at least three different colors of fruits and vegetables each day for a diverse range of nutrients.' },
  { id: 'nt-4', title: 'Mindful Eating', content: 'Chew slowly and put your fork down between bites. It takes 20 minutes for your brain to register fullness.' },
  { id: 'nt-5', title: 'Healthy Swaps', content: 'Swap sour cream for Greek yogurt, white rice for quinoa, and sugary drinks for infused water.' },
  { id: 'nt-6', title: 'Meal Prep Sunday', content: 'Prepping ingredients on Sunday saves time and reduces the temptation to choose less healthy options during busy weekdays.' },
];