import { Box, Chip, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { FixedSizeList } from 'react-window';
import React from 'react';

const renderRow = ({ index, style, data }) => {
  const item = data.items[index];
  return (
    <ListItem
      key={item.id}
      style={style}
      onClick={(event) => {
        // イベントの伝播を止める
        event.stopPropagation();
        // 登録された処理を行う
        data.onClick(item.id);
      }}>
      <ListItemButton>
        <ListItemIcon>
          {item.icon_url === '' ?
            <></> :
            <Box
              component='img'
              sx={{
                height: 32,
                width: 32,
                maxHeight: 32,
                maxWidth: 32,
              }}
              // src={item.icon_url}
              src="logo192.png"
            />
          }
        </ListItemIcon>
        <Chip label={item.category} size='small' />
        <ListItemText primary={item.name} />
      </ListItemButton>
    </ListItem>
  );
};

/**
 * アイテム一覧を表示するコンポーネント
 * @param {array} items アイテム一覧
 * @param {function(number)} onClick クリックされたアイテムのID
 * @returns 
 */
const Items = ({ items, onClick, height=1800, itemSize=36 }) => {
  const itemArray = Array.from(items.values());
  return (
      <FixedSizeList
        height={height}
        width='100%'
        itemSize={itemSize}
        itemCount={items.size}
        itemData={{items: itemArray, onClick: onClick}}
        overscanCount={5} >
        {renderRow}
      </FixedSizeList>  
  );
}

export default Items;