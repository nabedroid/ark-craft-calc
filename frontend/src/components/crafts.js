import { Box, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';

/**
 * アイテム一覧を表示するコンポーネント
 * @param {array} crafts レシピ＋アイテムアイコンURLの一覧
 * @param {function(number, number)} onChangeQuantity 現状のレシピIDと入力された数のリスト[[recipe.id, quantity], [recipe.id, quantity], ...]
 * @param {function(number)} onChangeQuantity クリックされたクラフトID
 * @returns 
 */
const Crafts = ({ crafts, onChangeQuantity, onClickCraft }) => {
  return (
    <List sx={{maxHeight: '100%', overflow: 'auto'}}>
      {crafts.map(craft => {
        return (
          <ListItem key={craft.id} >
            <ListItemButton  onClick={ () => onClickCraft(craft.id) }>
                {/* アイコン */}
                <ListItemIcon>
                  {craft.item.icon_url === '' ?
                  <></> :
                  <Box
                    component='img'
                    sx={{ height: 32, width: 32, maxHeight: 32, maxWidth: 32 }}
                    // src={craft.output_item.icon_url}
                    src="logo192.png" />}
                </ListItemIcon>
                {/* 名前 */}
                <ListItemText primary={craft.recipe.name} />
              </ListItemButton>
              {/* 数量ボタン */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Button variant="outlined" size="small" onClick={() => onChangeQuantity(craft.id, craft.quantity - 10)}>-10</Button>
              <Button variant="outlined" size="small" onClick={() => onChangeQuantity(craft.id, craft.quantity - 1)}>-1</Button>
              <ListItemText primary={craft.quantity} sx={{ textAlign: "center", width: "40px" }} />
              <Button variant="outlined" size="small" onClick={() => onChangeQuantity(craft.id, craft.quantity + 1)}>+1</Button>
              <Button variant="outlined" size="small" onClick={() => onChangeQuantity(craft.id, craft.quantity + 10)}>+10</Button>
            </Box>
          </ListItem>
        );
      })}
    </List>
  );
}

export default Crafts;