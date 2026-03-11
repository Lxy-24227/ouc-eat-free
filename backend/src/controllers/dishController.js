const dishService = require('../services/dishService');

exports.getRandomDish = async (req, res) => {
  try {
    const { restaurantId, floor, minScore } = req.query;
    const dishes = await dishService.findByConditions(restaurantId, floor, minScore);
    if (dishes.length === 0) {
      return res.status(404).json({ code: 404, message: '没有符合条件的菜品' });
    }
    const selected = dishService.selectWeightedRandom(dishes);
    res.json({ code: 200, message: 'success', data: selected });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
};

exports.getRanking = async (req, res) => {
  try {
    const { type = 'red', restaurantId, floor, startDate, endDate, page = 1, pageSize = 10 } = req.query;
    const result = await dishService.getRanking(type, restaurantId, floor, startDate, endDate, parseInt(page, 10), parseInt(pageSize, 10));
    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
};

exports.getDishById = async (req, res) => {
  try {
    const dish = await dishService.getDishById(req.params.id);
    if (!dish) {
      return res.status(404).json({ code: 404, message: '菜品不存在' });
    }
    res.json({ code: 200, message: 'success', data: dish });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
};

exports.createDish = async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const canteen = String(req.body?.canteen || '').trim();
  const rawPrice = req.body?.price;
  const price = rawPrice === '' || rawPrice == null ? null : Number(rawPrice);

  if (!name || !canteen) {
    return res.status(400).json({ code: 400, message: '菜品名称和食堂不能为空' });
  }

  if (price == null || Number.isNaN(price) || price < 0) {
    return res.status(400).json({ code: 400, message: '价格必须为大于等于 0 的数字' });
  }

  try {
    // 最小改动：仅补全创建菜品接口，写入 dishes.json 以修复排行榜不更新
    const created = await dishService.createDish({ name, canteen, price });
    res.json({ code: 200, message: '菜品创建成功', data: created });
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    res.status(status).json({ code: status, message: error.message || '创建失败' });
  }
};