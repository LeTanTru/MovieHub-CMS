export function formatMoney(
  value: string | number,
  suffix: string = ' ₫'
): string {
  if (value === null || value === undefined) return '';

  const num = Number(value);
  if (isNaN(num)) return '';

  return new Intl.NumberFormat('vi-VN').format(num) + suffix;
}

export function formatNumber(input: unknown, decimal = 2): string {
  const value = Number(input);

  if (isNaN(value)) {
    return '';
  }

  const fixed = value.toFixed(decimal);
  let [intPart, decimalPart] = fixed.split('.');

  if (!decimalPart || Number(decimalPart) === 0) {
    return intPart;
  }

  if (decimal === 1) {
    return (Math.round(value * 10) / 10).toString();
  }

  if (decimal === 2) {
    if (decimalPart[1] === '0') {
      return `${intPart}.${decimalPart[0]}`;
    }
    if (decimalPart[1] === '5') {
      return (Math.round(value * 10) / 10).toString();
    }
    return `${intPart}.${decimalPart}`;
  }

  return fixed;
}
