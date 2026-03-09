/**
 * 节流函数：在时间间隔内多次调用只执行第一次
 * @param {Function} fn - 要执行的函数
 * @param {number} interval - 间隔毫秒数
 * @returns {Function}
 */
export function throttle(fn, interval) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}
