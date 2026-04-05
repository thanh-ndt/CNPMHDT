/**
 * Format a number to Vietnamese currency string.
 * @param {number} price
 * @returns {string} e.g. "29.500.000 VNĐ"
 */
export const priceFormatter = (price) => {
    if (price == null || isNaN(price)) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
};
