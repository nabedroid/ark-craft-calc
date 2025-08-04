import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid2,
  TextField,
} from "@mui/material";
import axios from 'axios';
import Items from './components/items';
import Crafts from './components/crafts';
import Materials from './components/materials';
import ItemCategories from './components/itemcategories.js';

function App() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState(new Map());
  const [recipes, setRecipes] = useState(new Map());
  const [recipeMaterials, setRecipeMaterials] = useState(new Map());
  // 製作するアイテム、必要素材及び数、作成数を管理する
  const [crafts, setCrafts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState(null);

  // 初回のみバックエンドからデータを取得する
  useEffect(() => {
    // useEffectでasync awaitするとエラーになるので非同期関数内で実行
    const fetchData = async() => {
      try {
        // バックエンドからアイテム一覧、レシピ、素材を取得
        const itemResponse = await axios.get("/api/items");
        const recipeResponse = await axios.get("/api/recipes");
        const materialsResponse = await axios.get("/api/recipe_materials");
        // ItemIDをItemに変換するマップ
        setItems(new Map(itemResponse.data.map(item => [item.id, item])));
        // ItemIDを[Recipe]に変換するマップ
        setRecipes(recipeResponse.data.reduce((recipeMap, recipe) => {
          if (recipeMap.has(recipe.output_item_id)) {
            recipeMap.get(recipe.output_item_id).push(recipe);
          } else {
            recipeMap.set(recipe.output_item_id, [recipe]);
          }
          return recipeMap;
        }, new Map()));
        // RecipeIDを[Material]に変換するマップ
        setRecipeMaterials(materialsResponse.data.reduce((materialMap, material) => {
          if (materialMap.has(material.recipe_id)) {
            materialMap.get(material.recipe_id).push(material);
          } else {
            materialMap.set(material.recipe_id, [material]);
          }
          return materialMap;
        }, new Map()));
      } catch (err) {
        setError(err.message || "データの取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    const newFilteredItems = new Map();
    for (const item of items.values()) {
      if (item.name.includes(nameFilter) && (categoryFilter === '' || item.category === categoryFilter)) {
        newFilteredItems.set(item.id, item);
      }
    }
    return newFilteredItems;
  }, [items, nameFilter, categoryFilter]);

  const addItemToCrafts = (itemId) => {
    setCrafts((prev) => {
      // すでにリストにあるか確認
      const existingItem = prev.find((craft) => craft.item.id === itemId);
      if (existingItem) {
        // 既存アイテムの場合は無視
        return prev;
      } else {
        // 新規アイテムを追加
        const item = items.get(itemId);
        const itemRecipes = recipes.get(itemId) || [];
        const addCrafts = itemRecipes.map(recipe => {
          return {
            id: recipe.id,
            item: { ...item },
            recipe: { ...recipe },
            materials: recipeMaterials.get(recipe.id),
            quantity: 0,
          }});
        return [...prev, ...addCrafts];
      }
    });
  };

  const removeCraft = (craftId) => {
    setCrafts((prev) => prev.filter(craft => craft.id !== craftId ));
  }

  // 数量が変更されたら当該クラフトの数量を更新
  const updateQuantity = (craftId, quantity) => {
    // 当該クラフトの数量のみを更新
    const newCrafts = crafts.map((craft) => craft.id === craftId
      ? { ...craft, quantity: Math.max(0, quantity) }
      : craft
    );
    setCrafts(newCrafts);
  };

  // クラフトが更新されたら素材一覧も更新
  const updateMaterials = useEffect(() => {
    const newMaterials = [];
    crafts.forEach(craft => {
      // 作成数が0のクラフトは飛ばす
      if (craft.quantity === 0) return;
      // クラフトに必要な素材を計算する
      craft.materials.forEach(craftMaterial => {
        const existingMaterial = newMaterials.find(material => material.id === craftMaterial.item_id);
        if (existingMaterial) {
          // 登録済みなら加算する
          existingMaterial.quantity = existingMaterial.quantity + craftMaterial.quantity * craft.quantity;
        } else {
          const item = items.get(craftMaterial.item_id);
          newMaterials.push({ ...item, quantity: craftMaterial.quantity * craft.quantity });
        }
      });
    });
    setMaterials(newMaterials);
  }, [crafts])

  return (
    <Container maxWidth={false}>
      <Grid2 container spacing={2} marginTop={2}>
        {/* アイテム一覧 */}
        <Grid2 container size={4} direction='column' sx={{maxHeight: '90vh'}}>
          <Grid2>
            <TextField 
              label='名称フィルター'
              variant='outlined'
              fullWidth
              size='small'
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </Grid2>
          <Grid2>
            <ItemCategories onChangeItemCategory={ (category) => setCategoryFilter(category) } />
          </Grid2>
          <Grid2>
            <Items items={filteredItems} height={700} onClick={addItemToCrafts}/>
          </Grid2>
        </Grid2>
        {/* アイテム製作数一覧 */}
        <Grid2 size={4} maxHeight='90vh'>
          <Crafts
             crafts={crafts}
             onChangeQuantity={updateQuantity}
             onClickCraft={removeCraft} />
        </Grid2>
        <Grid2 size={4} maxHeight='90vh'>
          <Materials materials={materials} />
        </Grid2>
      </Grid2>
    </Container>
  );
}

export default App;
