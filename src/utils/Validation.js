// utils/idValidation.js

/**
 * Checks if a given ID number is a valid Israeli ID according to the official algorithm.
 * @param {string | number} id - The ID number to validate.
 * @returns {boolean} - True if the ID is valid, false otherwise.
 */
export const isValidIsraeliID = (id) => {
    id = String(id).trim(); // Ensure it's a string and trim whitespace
    if (id.length > 9 || id.length < 5 || isNaN(id)) {
        // ID must be between 5 and 9 digits and numeric
        return false;
    }

    // Pad with leading zeros if less than 9 digits (e.g., 1234567 becomes 001234567)
    id = id.length < 9 ? ("00000000" + id).slice(-9) : id;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        let digit = parseInt(id.charAt(i), 10);
        // Multiply by 1 for even positions (0, 2, 4, ...) and 2 for odd positions (1, 3, 5, ...)
        let weight = (i % 2 === 0) ? 1 : 2;
        let res = digit * weight;
        // If the result is a two-digit number (e.g., 14), sum its digits (1+4=5)
        sum += Math.floor(res / 10) + (res % 10);
    }
    // The ID is valid if the sum is divisible by 10
    return sum % 10 === 0;
};
