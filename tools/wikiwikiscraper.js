const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// 素材の英語名から日本語名の変換テーブル
const en2jp = require('./en2jp');

// 必要なデータを抽出
const items = [];
const recipes = [];
const recipeMaterials = [];
const materialSet = new Set();

// trタグ内のtdからアイコンURLを取得する
const getIconUrlDefault = ($, tr, index) => $(tr).find(`td:nth-child(${index}) img`).attr('src');
// trタグ内のtdから名称を取得する
const getNameDefault = ($, tr, index) => $(tr).find(`td:nth-child(${index})`).text().replaceAll('\n', '').replaceAll('?', '').trim();
// trタグ内のtdから[素材名, 数]を取得する
const getMaterialsDefault = ($, tr, index) => {
  if (index === -1) return [];
  const text = $(tr).find(`td:nth-child(${index})`).text().replaceAll('\n', '').trim();
  const materials = [];
  Array.from(text.matchAll(/(.+?) *x *([0-9]+)/g)).forEach(match => {
    const name = match[1].replaceAll('?', '').trim();
    if (isNaN(parseInt(match[2]))) {
      throw new Error(`素材名「${match[1]}」の素材数「${match[2]}」は数値変換出来ません。`);
    }
    materials.push([
      en2jp[name] || name,
      parseInt(match[2], 10),
    ]);
  });
  return materials;
};

const scrapePage = async ({url, category, subCategory, getIndexes, getIconUrl=getIconUrlDefault, getName=getNameDefault, getMaterials=getMaterialsDefault}) => {
  try {
    // ページのHTMLを取得
    const { data } = await axios.get(url, {headers: {'Accept-Language': 'ja'}});
    // HTMLを解析
    const $ = cheerio.load(data);

    $('table').each((index, table) => {
      // 各要素の列番号を取得
      const indexes = getIndexes($, table);
      // 対象外のテーブルの場合はスキップ
      if (indexes === undefined) return;
      // テーブルの行ごとに必要情報を拾っていく
      $(table).find(`tbody tr`).each((index, tr) => {
        // ID
        const itemId = items.length + 1;
        // アイコンのURL
        const itemIconUrl = getIconUrl($, tr, indexes[0]);
        // 名称
        const itemName = getName($, tr, indexes[1]);
        // アイテム一覧に追加（ID, 名称, カテゴリ, サブカテゴリ）
        items.push([itemId, en2jp[itemName] || itemName, category, subCategory, itemIconUrl]);
        // 製作に必要な素材
        const itemMaterials = getMaterials($, tr, indexes[2]);
        if (itemMaterials.length > 0) {
          // 作成可能なアイテムの場合
          // レシピ一覧に追加（ID, 名称, 作成結果アイテム, 作成数）
          const recipeId = recipes.length + 1;
          const recipeName = itemName + `_${recipes.filter(recipe => recipe[2] === itemName).length + 1}`;
          recipes.push([recipeId, recipeName, itemId, 1]);
          // 材料一覧に追加（ID, レシピID, 材料名, 材料数）
          itemMaterials.forEach(([materialName, quantity]) => {
            const recipeMaterialId = recipeMaterials.length + 1;
            recipeMaterials.push([recipeMaterialId, recipeId, materialName, quantity]);
            materialSet.add(materialName)
          });
        }
      });
    });
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
};

const csvWriter = ({ path, data }) => {
  const csvString = data.map(row => row.map(element => typeof element === 'string' ? `"${element}"` : element).join(',')).join('\n');
  fs.writeFileSync(path, csvString);
};

const scrapePageData = [
  {
    category: '武器',
    subCategory: 'マップ共通',
    url: 'https://wikiwiki.jp/arkse/%E6%AD%A6%E5%99%A8',    
    getIndexes: ($, table) => [1, 2, 5],
    getMaterials: ($, tr, index) => {
      const text = $(tr).find(`td:nth-child(${index})`).text().replaceAll('\n', '').trim();
      const materials = [];
      Array.from(text.matchAll(/(.+?) *x *([0-9]+)/g)).forEach(match => {
        const name = match[1].replaceAll('?', '').trim();
        materials.push([
          name === 'キチン/ケラチン' ? 'キチン' : name,
          parseInt(match[2], 10)]);
      });
      return materials;
    },
  }, {
    category: '武器',
    subCategory: 'DLC',
    url: 'https://wikiwiki.jp/arkse/%E6%AD%A6%E5%99%A8%EF%BC%88DLC%EF%BC%89',    
    getIndexes: ($, table) => [1, 2, 5],
  }, {
    category: '武器',
    subCategory: 'Primitive+',
    url: 'https://wikiwiki.jp/arkse/%E6%AD%A6%E5%99%A8%28Primitive%2B%29',
    getIndexes: ($, table) => [1, 3, 6],
    getMaterials: ($, tr, index) => {
      const text = $(tr).find(`td:nth-child(${index})`).text().replaceAll('\n', '').trim();
      const materials = [];
      Array.from(text.matchAll(/([0-9]+) × ([^0-9]+)/g)).forEach(match => {
        const name = match[2].replaceAll('?', '').trim();
        const quantity = parseInt(match[1], 10);
        materials.push([en2jp[name] || name, quantity]);
      });
      return materials;
    }
  }, {
    category: '防具',
    subCategory: '',
    url: 'https://wikiwiki.jp/arkse/%E9%98%B2%E5%85%B7',
    getIndexes: ($, table) => {
      const th = $(table).find('thead tr th:nth-child(1)').text().trim();
      if (th !== 'ｱｲｺﾝ') return undefined;
      return [1, 2, 5];
    },
    getMaterials: ($, tr, index) => {
      const materials = [];
      $(tr).find(`td:nth-child(${index}) a`).each((_, a) => {
        const name = $(a).find('img').attr('title'); // imgのtitleから名称を取得
        const quantity = parseInt($(a)[0].nextSibling.nodeValue.replaceAll('x', '').trim(), 10); // aタグの次のテキストノードから数を取得
        materials.push([name, quantity]);
      });
      return materials;
    },
  }, {
    category: 'サドル',
    subCategory: 'マップ共通',
    url: 'https://wikiwiki.jp/arkse/%E3%82%B5%E3%83%89%E3%83%AB',
    getIndexes: ($, table) => {
      return $(table).find('thead tr th:nth-child(1)').text().trim() === 'ｱｲｺﾝ' ? [1, 2, 6] : undefined;
    },
    getMaterials: ($, tr, index) => {
      const text = $(tr).find(`td:nth-child(${index})`).text().replaceAll('\n', '').trim();
      const materials = [];
      Array.from(text.matchAll(/(.+?) *x *([0-9]+)/g)).forEach(match => {
        const name = match[1].replaceAll('?', '').trim();
        materials.push([
          name === 'キチン/ケラチン' ? 'キチン' : name,
          parseInt(match[2], 10)]);
      });
      return materials;
    },
  }, {
    category: 'サドル',
    subCategory: 'DLC',
    url: 'https://wikiwiki.jp/arkse/%E3%82%B5%E3%83%89%E3%83%AB%28DLC%29',
    getIndexes: ($, table) => {
      return $(table).find('thead tr th:nth-child(1)').text().trim() === 'ｱｲｺﾝ' ? [1, 2, 6] : undefined;
    },
  }, {
    category: '道具',
    subCategory: 'マップ共通',
    url: 'https://wikiwiki.jp/arkse/%E9%81%93%E5%85%B7',
    getIndexes: ($, table) => [1, 2, 5],
  }, {
    category: '道具',
    subCategory: 'DLC',
    url: 'https://wikiwiki.jp/arkse/%E9%81%93%E5%85%B7%28DLC%29',
    getIndexes: ($, table) => [1, 3, 6],
  }, {
    category: '道具',
    subCategory: 'Primitive+',
    url: 'https://wikiwiki.jp/arkse/%E9%81%93%E5%85%B7%28Primitive%2B%29',
    getIndexes: ($, table) => [1, 3, 6],
  }, {
    category: '建築',
    subCategory: 'マップ共通',
    url: 'https://wikiwiki.jp/arkse/%E5%BB%BA%E7%AF%89',
    getIndexes: ($, table) => {
      // テーブルヘッダーの3番目を取得し、日本語が含まれているか判定
      const th3 = $(table).find('th:nth-child(3)');
      if (th3.length === 0) return undefined;
      if (th3.text().trim() === '日本語') {
        return [1, 3, 6];
      }
      return [1, 2, 5];
    }
  }, {
    category: '建築',
    subCategory: 'DLC',
    url: 'https://wikiwiki.jp/arkse/%E5%BB%BA%E7%AF%89%28DLC%29',
    getIndexes: ($, table) => {
      // テーブルヘッダーの3番目を取得し、日本語が含まれているか判定
      const th3 = $(table).find('th:nth-child(3)');
      if (th3.length === 0) return undefined;
      if (th3.text().trim() === '日本語') {
        return [1, 3, 6];
      }
      return [1, 2, 5];
    }
  }, {
    category: '建築',
    subCategory: 'Primitive+',
    url: 'https://wikiwiki.jp/arkse/%E5%BB%BA%E7%AF%89%28Primitive%2B%29',
    getIndexes: ($, table) => [1, 3, 6],
    getName: ($, tr, index) => {
      const name = $(tr).find('td:nth-child(3)').text().replaceAll('?', '').trim();
      return name === '' ? $(tr).find('td:nth-child(2)').text().replaceAll('?', '').trim() : name;
    },
    getMaterials: ($, tr, index) => {
      const text = $(tr).find(`td:nth-child(${index})`).text().replaceAll('\n', '').trim();
      const materials = [];
      Array.from(text.matchAll(/([0-9]+) *× *([^0-9]+)/g)).forEach(match => {
        const name = match[2].replaceAll('?', '').trim();
        const quantity = parseInt(match[1], 10);
        materials.push([en2jp[name] || name, quantity]);
      });
      return materials;
    }
  }, {
    category: '素材',
    subCategory: 'マップ共通',
    url: 'https://wikiwiki.jp/arkse/%E7%B4%A0%E6%9D%90',
    getIndexes: ($, table) => [1, 2, -1],
  }, {
    category: '素材',
    subCategory: 'DLC',
    url: 'https://wikiwiki.jp/arkse/%E7%B4%A0%E6%9D%90%28DLC%29',
    getIndexes: ($, table) => {
      const th8 = $(table).find('thead tr th:nth-child(8)');
      if (th8.length > 0 && th8.text().trim() === '素材') {
        return [1, 2, 8];
      }
      return [1, 2, -1];
    }
  }, {
    category: '素材',
    subCategory: 'Primitive+',
    url: 'https://wikiwiki.jp/arkse/%E7%B4%A0%E6%9D%90%28Primitive%2B%29',
    getIndexes: ($, table) => {
      const th6 = $(table).find('thead tr th:nth-child(6)');
      if (th6.length > 0 && th6.text().trim() === '素材') {
        return [1, 3, 6];
      }
      return [1, 3, -1];
    },
    getMaterials: ($, tr, index) => {
      const text = $(tr).find(`td:nth-child(${index})`).text().replaceAll('\n', '').trim();
      const materials = [];
      Array.from(text.matchAll(/([0-9]+) *× *([^0-9]+)/g)).forEach(match => {
        // 種 or 生の脂肪の書き方は後者のみ採用するので前半は消す
        if (match[2] === '種or') return;
        const name = match[2].replaceAll(/\(.+\)/g, '').replaceAll('?', '').trim();
        const quantity = parseInt(match[1], 10);
        materials.push([en2jp[name] || name, quantity]);
      });
      return materials;
    },
  }, {
    category: '食料',
    subCategory: 'マップ共通',
    url: 'https://wikiwiki.jp/arkse/%E9%A3%9F%E6%96%99',
    getIndexes: ($, table) => [1, 2, -1]
  }, {
    category: '食料',
    subCategory: 'Primitive+',
    url: 'https://wikiwiki.jp/arkse/%E9%A3%9F%E6%96%99%28Primitive%2B%29',
    getIndexes: ($, table) => [1, 3, -1]
  },
];

(async () => {
  for (const [i, { category, subCategory, url, getIndexes, getName, getMaterials }] of scrapePageData.entries()) {
    const params = {category: category, subCategory: subCategory, url: url, getIndexes: getIndexes};
    if (getName !== undefined) params.getName = getName;
    if (getMaterials !== undefined) params.getMaterials = getMaterials;
    await scrapePage(params);
  }
  // 足りないものを手動で追加
  items.push([items.length + 1, 'シェル・フラグメント', '素材', 'DLC', 'https://ark.fandom.com/ja/wiki/%E3%82%B7%E3%82%A7%E3%83%AB%E3%83%BB%E3%83%95%E3%83%A9%E3%82%B0%E3%83%A1%E3%83%B3%E3%83%88_(Genesis:_Part_1)#/media/%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB:Shell_Fragment_(Genesis_Part_1).png']);
  items.push([items.length + 1, 'アマルガサウルスの棘', '素材', 'DLC', 'https://ark.fandom.com/ja/wiki/%E3%82%A2%E3%83%9E%E3%83%AB%E3%82%AC%E3%82%B5%E3%82%A6%E3%83%AB%E3%82%B9%E3%81%AE%E6%A3%98_(Lost_Island)#/media/%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB:Amargasaurus_Spike_(Lost_Island).png']);
  items.push([items.length + 1, '炭', '素材', 'Primitive+', 'https://ark.fandom.com/wiki/Carbon_(Primitive_Plus)#/media/File:Carbon_(Primitive_Plus).png']);
  items.push([items.length + 1, '濃縮されたガス', '素材', 'DLC', 'https://ark.fandom.com/ja/wiki/%E6%BF%83%E7%B8%AE%E3%81%95%E3%82%8C%E3%81%9F%E3%82%AC%E3%82%B9_(Extinction)#/media/%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB:Condensed_Gas_(Extinction).png']);
  items.push([items.length + 1, '新鮮な薪', '素材', 'Primitive+', 'https://ark.fandom.com/ja/wiki/%E6%96%B0%E9%AE%AE%E3%81%AA%E8%96%AA_(Primitive_Plus)#/media/%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB:Fresh_Firewood_(Primitive_Plus).png']);
  items.push([items.length + 1, '鋼のインゴット', '素材', 'Primitive+', 'https://ark.fandom.com/ja/wiki/%E3%82%B9%E3%83%81%E3%83%BC%E3%83%AB%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B4%E3%83%83%E3%83%88_(Primitive_Plus)#/media/%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB:Steel_Ingot_(Primitive_Plus).png']);
  // 素材のアイテム名をアイテムIDに変換する
  recipeMaterials.forEach(recipeMaterial => {
    const item = items.find(item => item[1] === recipeMaterial[2]);
    if (item === undefined) {
      console.error('素材名=>アイテムIDの変換に失敗しました', recipeMaterial);
    } else {
      recipeMaterial[2] = item[0];
    }
  });
  
  csvWriter({path: '../db/items.csv', data: items});
  csvWriter({path: '../db/recipes.csv', data: recipes});
  csvWriter({path: '../db/materials.csv', data: recipeMaterials});
  console.log(materialSet);
})();
