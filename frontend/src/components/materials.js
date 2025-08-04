import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';

/**
 * アイテム一覧を表示するコンポーネント
 * @param {array} materials 素材一覧
 * @returns 
 */
const Materials = ({ materials }) => {
  return (
    <List sx={{maxHeight: '100%', overflow: 'auto'}}>
      {materials.map(material => {
        return (
          <ListItem key={material.id}>
            <ListItemIcon>
              {material.icon_url === '' ?
                <></> :
                <Box
                  component='img'
                  sx={{
                    height: 32,
                    width: 32,
                    maxHeight: 32,
                    maxWidth: 32,
                  }}
                  // src={material.icon_url}
                  src="logo192.png"
                />
              }
            </ListItemIcon>
            <ListItemText primary={material.name} sx={{flex: 4}}/>
            <ListItemText primary={material.quantity} sx={{flex: 1}}/>
          </ListItem>
        );
      })}
    </List>
  );
}

export default Materials;