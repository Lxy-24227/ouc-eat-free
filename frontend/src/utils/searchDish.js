/**
 * 菜品搜索工具函数
 * 支持模糊匹配、不区分大小写、不区分全半角
 */

/**
 * 将字符串标准化用于搜索比较
 * - 转小写
 * - 全角转半角（如 Ａ→A、１→1）
 */
export function normalizeForSearch(str) {
  if (str == null || str === '') return '';
  return String(str)
    .toLowerCase()
    .replace(/[\uff01-\uff5e]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    );
}

/**
 * 模糊匹配：菜品名称是否包含关键词
 * @param {string} name - 菜品名称
 * @param {string} keyword - 搜索关键词
 * @returns {boolean}
 */
export function matchDishName(name, keyword) {
  if (!keyword.trim()) return false;
  const normName = normalizeForSearch(name);
  const normKw = normalizeForSearch(keyword.trim());
  return normName.includes(normKw);
}

/**
 * 搜索菜品列表，返回匹配结果（最多 maxResults 条）
 * @param {string} keyword - 搜索关键词
 * @param {Array} dishList - 菜品列表，每项需有 id、name、averageScore 等字段
 * @param {number} maxResults - 最大返回条数，默认 10
 * @returns {Array}
 */
export function searchDish(keyword, dishList, maxResults = 10) {
  if (!keyword || !keyword.trim()) return [];
  const kw = keyword.trim();
  const normKw = normalizeForSearch(kw);
  const results = [];
  for (const dish of dishList) {
    const name = dish.name ?? '';
    if (normalizeForSearch(name).includes(normKw)) {
      results.push(dish);
      if (results.length >= maxResults) break;
    }
  }
  return results;
}

/**
 * 将菜品名称按匹配关键词拆分为高亮片段，用于渲染
 * @param {string} name - 菜品名称
 * @param {string} keyword - 搜索关键词
 * @returns {Array<{text: string, match: boolean}>}
 */
export function getHighlightedParts(name, keyword) {
  if (!name || !keyword || !keyword.trim()) {
    return [{ text: name || '', match: false }];
  }
  const normName = normalizeForSearch(name);
  const normKw = normalizeForSearch(keyword.trim());
  const idx = normName.indexOf(normKw);
  if (idx === -1) return [{ text: name, match: false }];

  // 匹配部分在原文中的长度与标准化关键词长度一致（全角/半角 1:1 对应）
  const matchLen = normKw.length;
  return [
    { text: name.slice(0, idx), match: false },
    { text: name.slice(idx, idx + matchLen), match: true },
    { text: name.slice(idx + matchLen), match: false },
  ].filter((p) => p.text !== '');
}
