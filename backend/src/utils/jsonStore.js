const fs = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');

function cloneDefault(defaultValue) {
  return JSON.parse(JSON.stringify(defaultValue));
}

function getFilePath(fileName) {
  return path.join(dataDir, fileName);
}

async function ensureJsonFile(fileName, defaultValue) {
  await fs.mkdir(dataDir, { recursive: true });
  const filePath = getFilePath(fileName);
  try {
    await fs.access(filePath);
  } catch (_) {
    await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
  }
  return filePath;
}

async function readJson(fileName, defaultValue = []) {
  const filePath = await ensureJsonFile(fileName, defaultValue);
  const content = await fs.readFile(filePath, 'utf8');
  if (!content.trim()) {
    return cloneDefault(defaultValue);
  }

  try {
    return JSON.parse(content);
  } catch (_) {
    const fallback = cloneDefault(defaultValue);
    await writeJson(fileName, fallback);
    return fallback;
  }
}

async function writeJson(fileName, value) {
  const filePath = await ensureJsonFile(fileName, value);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function getNextId(list = []) {
  return list.reduce((maxId, item) => Math.max(maxId, Number(item?.id) || 0), 0) + 1;
}

function formatDate(date = new Date()) {
  return new Date(date).toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' });
}

module.exports = {
  readJson,
  writeJson,
  getNextId,
  formatDate,
  dataDir
};
