/**
 * 
 */
function weightedRandom(items, weightFn) {
    if (!items.length) return null;
    const weights = items.map(weightFn);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) return items[i];
    }
    return items[items.length - 1];
}

module.exports = { weightedRandom };
