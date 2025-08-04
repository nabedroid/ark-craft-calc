import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useState } from 'react';

/**
 * カテゴリを表示するコンポーネント
 * @param {function(string)} onChange クリックされたカテゴリ名
 * @returns 
 */
const ItemCategories = ({ onChangeItemCategory }) => {

  const [selectedCategory, setSelectedCategory] = useState('');

  return (
    <ToggleButtonGroup
      value={selectedCategory}
      exclusive
      size='small'
      onChange={(event, value) => {
        if (value !== null) {
          setSelectedCategory(value);
          onChangeItemCategory(value);
        }
      }}
    >
      <ToggleButton value=''>全て</ToggleButton>
      <ToggleButton value='武器'>武器</ToggleButton>
      <ToggleButton value='防具'>防具</ToggleButton>
      <ToggleButton value='サドル'>サドル</ToggleButton>
      <ToggleButton value='道具'>道具</ToggleButton>
      <ToggleButton value='建築'>建築</ToggleButton>
      <ToggleButton value='素材'>素材</ToggleButton>
      <ToggleButton value='食料'>食料</ToggleButton>
    </ToggleButtonGroup>
  );
}

export default ItemCategories;