import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { calculateItemGST } from '../utils/gstCalculations';

// We'll use a public URL for a font that supports Tamil.
const FONT_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanstamil/NotoSansTamil-Regular.ttf';

let fontLoaded = false;

// Function to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Helper function to safely convert values to strings
const safeToString = (value) => {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
};

async function loadFont(doc) {
    if (fontLoaded) {
        doc.setFont('NotoSansTamil');
        return;
    }
    try {
        const response = await fetch(FONT_URL);
        if (!response.ok) throw new Error('Network response was not ok for font');
        
        const font = await response.arrayBuffer();
        const fontB64 = arrayBufferToBase64(font);
        
        doc.addFileToVFS('NotoSansTamil-Regular.ttf', fontB64);
        doc.addFont('NotoSansTamil-Regular.ttf', 'NotoSansTamil', 'normal');
        doc.setFont('NotoSansTamil');
        fontLoaded = true;
    } catch (error) {
        console.error("Failed to load custom font, falling back to default:", error);
        doc.setFont('helvetica'); // Fallback font
    }
}

export const generateInvoicePdf = async (order, user, t) => {
    const doc = new jsPDF();
    await loadFont(doc);

    // Professional Header with Company Details
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(safeToString(t('appName')), 14, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Bridal Collection', 14, 32);
    doc.text('123 Fashion Street, Design District', 14, 37);
    doc.text('Chennai, Tamil Nadu - 600001', 14, 42);
    doc.text('Phone: +91-44-1234-5678 | Email: info@sundarisaj.com', 14, 47);
    
    // Invoice Title and Details (Right Aligned)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(safeToString(t('invoice')), 160, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${safeToString(order?.id || 'N/A')}`, 160, 32);
    doc.text(`Date: ${order?.date ? new Date(order.date).toLocaleDateString() : 'N/A'}`, 160, 37);
    doc.text(`Status: ${safeToString(t(order?.status?.toLowerCase() || 'pending'))}`, 160, 42);

    // User Details ("Bill To") - Professional Formatting
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(safeToString(t('billTo')), 14, 65);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(safeToString(user?.name || 'N/A'), 14, 72);
    
    // Format address properly with multiple lines
    if (user?.address && typeof user.address === 'object') {
        const address = user.address;
        let currentY = 77;
        
        if (address.address) {
            doc.text(safeToString(address.address), 14, currentY);
            currentY += 5;
        }
        if (address.city) {
            doc.text(safeToString(address.city), 14, currentY);
            currentY += 5;
        }
        if (address.state) {
            doc.text(safeToString(address.state), 14, currentY);
            currentY += 5;
        }
        if (address.zipCode) {
            doc.text(safeToString(address.zipCode), 14, currentY);
            currentY += 5;
        }
    } else {
        doc.text(safeToString(user?.address || 'N/A'), 14, 77);
    }
    
    doc.text(safeToString(user?.phone || 'N/A'), 14, 95);

    // Order Details moved to header for better layout

    // Professional Table with Enhanced Styling
    const tableColumn = [
        'Name', 
        'Type', 
        'Quantity', 
        'Price', 
        'Total'
    ];
    const tableRows = [];

    let subtotalBeforeGST = 0;
    let totalSGST = 0;
    let totalCGST = 0;
    let totalGST = 0;

    if (order?.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
            const itemPrice = (item.price || 0) * (item.quantity || 0);
            // Check multiple possible fields for rental status
            const isRentalItem = item.isRental || item.purchaseType === 'rent' || item.type === 'rental';
            const orderType = isRentalItem
                ? `Rental (${item.rentalDays || 1} day${(item.rentalDays || 1) > 1 ? 's' : ''})`
                : 'Sale';
            
            // Calculate GST for this item
            const gst = calculateItemGST(itemPrice, isRentalItem);
            
            subtotalBeforeGST += gst.baseAmount;
            totalSGST += gst.sgst;
            totalCGST += gst.cgst;
            totalGST += gst.totalGST;
            
            const rowData = [
                safeToString(item.name || 'N/A'),
                safeToString(orderType),
                safeToString(item.quantity || 0),
                `Rs. ${(item.price || 0).toLocaleString('en-IN')}`,
                `Rs. ${itemPrice.toLocaleString('en-IN')}`
            ];
            tableRows.push(rowData);
        });
    }
    
    // Round totals
    subtotalBeforeGST = parseFloat(subtotalBeforeGST.toFixed(2));
    totalSGST = parseFloat(totalSGST.toFixed(2));
    totalCGST = parseFloat(totalCGST.toFixed(2));
    totalGST = parseFloat(totalGST.toFixed(2));
    const grandTotal = parseFloat((subtotalBeforeGST + totalGST).toFixed(2));
    
    // Add subtotal and GST breakdown rows
    const subtotalRow = [
        { content: 'Subtotal (Before GST)', colSpan:4, styles: { halign: 'right', fontStyle: 'normal' } },
        { content: `Rs. ${subtotalBeforeGST.toLocaleString('en-IN')}`, styles: { halign: 'right' } }
    ];
    
    const sgstRow = [
        { content: 'SGST', colSpan:4, styles: { halign: 'right', fontStyle: 'normal' } },
        { content: `Rs. ${totalSGST.toLocaleString('en-IN')}`, styles: { halign: 'right' } }
    ];
    
    const cgstRow = [
        { content: 'CGST', colSpan:4, styles: { halign: 'right', fontStyle: 'normal' } },
        { content: `Rs. ${totalCGST.toLocaleString('en-IN')}`, styles: { halign: 'right' } }
    ];
    
    const gstTotalRow = [
        { content: 'Total GST', colSpan:4, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: `Rs. ${totalGST.toLocaleString('en-IN')}`, styles: { halign: 'right', fontStyle: 'bold' } }
    ];
    
    const grandTotalRow = [
        { content: 'Grand Total', colSpan:4, styles: { halign: 'right', fontStyle: 'bold', fontSize: 12 } },
        { content: `Rs. ${grandTotal.toLocaleString('en-IN')}`, styles: { halign: 'right', fontStyle: 'bold', fontSize: 12 } }
    ];
    
    // Professional table styling with GST breakdown
    autoTable(doc, {
        startY: 110,
        head: [tableColumn],
        body: tableRows,
        foot: [subtotalRow, sgstRow, cgstRow, gstTotalRow, grandTotalRow],
        styles: { 
            font: 'helvetica', 
            fontStyle: 'normal',
            fontSize: 10,
            cellPadding: 5,
            textColor: [0, 0, 0]
        },
        headStyles: { 
            fillColor: [51, 51, 51],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 11
        },
        footStyles: { 
            fillColor: [248, 249, 250],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 70 }, // Product Name - wider for longer names
            1: { cellWidth: 30 }, // Type
            2: { cellWidth: 25, halign: 'center' }, // Quantity
            3: { cellWidth: 35, halign: 'right' }, // Price - wider for currency
            4: { cellWidth: 35, halign: 'right' }  // Total - wider for currency
        },
        margin: { top: 10, right: 14, bottom: 10, left: 14 },
        tableWidth: 180
    });
    
    const finalY = doc.lastAutoTable.finalY;
    
    // Professional Footer Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Payment Terms
    doc.text('Payment Terms: Net 30 days', 14, finalY + 15);
    doc.text('Payment Method: Google Pay / Bank Transfer', 14, finalY + 20);
    
    // Company Information
    doc.text('Thank you for your business!', 14, finalY + 30);
    doc.text('For any queries, please contact us at support@sundarisaj.com', 14, finalY + 35);
    
    // Page Number
    doc.text(`Page 1 of 1`, 160, finalY + 35);

    doc.save(`invoice-${order?.id || 'unknown'}.pdf`);
};

export const generateReportPdf = async (title, headers, rows, t) => {
    const doc = new jsPDF();
    await loadFont(doc);
    
    doc.setFontSize(18);
    doc.text(safeToString(title), 14, 22);

    // Ensure headers and rows are properly formatted
    const safeHeaders = headers.map(header => safeToString(header));
    const safeRows = rows.map(row => 
        Array.isArray(row) ? row.map(cell => safeToString(cell)) : [safeToString(row)]
    );

    autoTable(doc, {
        startY: 30,
        head: [safeHeaders],
        body: safeRows,
        styles: { font: 'NotoSansTamil', fontStyle: 'normal' },
        headStyles: { fillColor: [45, 45, 45] },
    });

    doc.save(`${safeToString(title).replace(/ /g, '_')}_report.pdf`);
}; 