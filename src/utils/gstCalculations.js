/**
 * GST Calculations Utility
 * 
 * GST Rules:
 * - Rental Items: 5% GST (2.5% SGST + 2.5% CGST)
 * - Sale Items: 18% GST (9% SGST + 9% CGST)
 */

/**
 * Calculate GST for a single item
 * @param {number} baseAmount - Price before GST
 * @param {boolean} isRental - True if rental item, false if sale
 * @returns {Object} GST breakdown
 */
export const calculateItemGST = (baseAmount, isRental) => {
    const gstRate = isRental ? 0.05 : 0.18; // 5% for rental, 18% for sale
    const sgstRate = gstRate / 2;
    const cgstRate = gstRate / 2;
    
    const sgst = parseFloat((baseAmount * sgstRate).toFixed(2));
    const cgst = parseFloat((baseAmount * cgstRate).toFixed(2));
    const totalGST = parseFloat((sgst + cgst).toFixed(2));
    const totalAmount = parseFloat((baseAmount + totalGST).toFixed(2));
    
    return {
        baseAmount: parseFloat(baseAmount.toFixed(2)),
        sgst,
        cgst,
        totalGST,
        totalAmount,
        gstRate: gstRate * 100, // Convert to percentage
        sgstRate: sgstRate * 100,
        cgstRate: cgstRate * 100
    };
};

/**
 * Calculate GST for cart/order with multiple items
 * @param {Array} items - Array of items with {price, quantity, isRental}
 * @returns {Object} Detailed GST breakdown
 */
export const calculateOrderGST = (items) => {
    let totalBaseAmount = 0;
    let totalSGST = 0;
    let totalCGST = 0;
    let totalGST = 0;
    let grandTotal = 0;
    
    const itemsWithGST = items.map(item => {
        const baseAmount = item.price * (item.quantity || 1);
        const gst = calculateItemGST(baseAmount, item.isRental);
        
        totalBaseAmount += gst.baseAmount;
        totalSGST += gst.sgst;
        totalCGST += gst.cgst;
        totalGST += gst.totalGST;
        grandTotal += gst.totalAmount;
        
        return {
            ...item,
            gstDetails: gst
        };
    });
    
    return {
        items: itemsWithGST,
        summary: {
            totalBaseAmount: parseFloat(totalBaseAmount.toFixed(2)),
            totalSGST: parseFloat(totalSGST.toFixed(2)),
            totalCGST: parseFloat(totalCGST.toFixed(2)),
            totalGST: parseFloat(totalGST.toFixed(2)),
            grandTotal: parseFloat(grandTotal.toFixed(2))
        }
    };
};

/**
 * Format GST amount for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount with rupee symbol
 */
export const formatGSTAmount = (amount) => {
    return `₹${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

/**
 * Get GST label based on item type
 * @param {boolean} isRental - True if rental item
 * @returns {string} GST label
 */
export const getGSTLabel = (isRental) => {
    return isRental ? 'GST @ 5%' : 'GST @ 18%';
};

/**
 * Calculate reverse GST (when total includes GST)
 * Useful for refund calculations
 * @param {number} totalAmount - Amount including GST
 * @param {boolean} isRental - True if rental item
 * @returns {Object} GST breakdown
 */
export const calculateReverseGST = (totalAmount, isRental) => {
    const gstRate = isRental ? 0.05 : 0.18;
    const baseAmount = totalAmount / (1 + gstRate);
    const totalGST = totalAmount - baseAmount;
    const sgst = totalGST / 2;
    const cgst = totalGST / 2;
    
    return {
        baseAmount: parseFloat(baseAmount.toFixed(2)),
        sgst: parseFloat(sgst.toFixed(2)),
        cgst: parseFloat(cgst.toFixed(2)),
        totalGST: parseFloat(totalGST.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        gstRate: gstRate * 100
    };
};

/**
 * Validate GST calculation
 * @param {Object} gstDetails - GST details to validate
 * @returns {boolean} True if valid
 */
export const validateGST = (gstDetails) => {
    if (!gstDetails) return false;
    
    const { baseAmount, sgst, cgst, totalGST, totalAmount } = gstDetails;
    
    // Check if SGST + CGST = Total GST
    const calculatedTotal = parseFloat((sgst + cgst).toFixed(2));
    if (calculatedTotal !== totalGST) return false;
    
    // Check if Base + GST = Total
    const calculatedGrandTotal = parseFloat((baseAmount + totalGST).toFixed(2));
    if (calculatedGrandTotal !== totalAmount) return false;
    
    return true;
};

/**
 * Generate GST invoice breakdown text
 * @param {Object} gstSummary - GST summary from calculateOrderGST
 * @returns {string} Formatted breakdown
 */
export const generateGSTBreakdown = (gstSummary) => {
    const { totalBaseAmount, totalSGST, totalCGST, totalGST, grandTotal } = gstSummary;
    
    return `
Subtotal (Before GST): ${formatGSTAmount(totalBaseAmount)}
SGST: ${formatGSTAmount(totalSGST)}
CGST: ${formatGSTAmount(totalCGST)}
Total GST: ${formatGSTAmount(totalGST)}
────────────────────────
Grand Total: ${formatGSTAmount(grandTotal)}
    `.trim();
};

export default {
    calculateItemGST,
    calculateOrderGST,
    formatGSTAmount,
    getGSTLabel,
    calculateReverseGST,
    validateGST,
    generateGSTBreakdown
};

