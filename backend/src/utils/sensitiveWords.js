/**
 * 
 */
const sensitiveList = ['傻逼', '混蛋', '垃圾', '操'];

function filterSensitive(text) {
    let filtered = text;
    sensitiveList.forEach(word => {
        const regex = new RegExp(word, 'g');
        filtered = filtered.replace(regex, '***');
    });
    return filtered;
}

module.exports = { filterSensitive };