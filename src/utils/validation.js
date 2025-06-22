// src/utils/Validation.js
export function isValidIsraeliID(id) {
  if (!id || id.length !== 9 || isNaN(id)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(id[i]);
    if (i % 2 === 1) { // ספרות במקומות הזוגיים (אינדקס אי-זוגי)
      digit *= 2;
      if (digit > 9) {
        digit = digit % 10 + Math.floor(digit / 10);
      }
    }
    sum += digit;
  }

  return sum % 10 === 0;
}