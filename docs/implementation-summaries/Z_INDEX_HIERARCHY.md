# Z-Index Hierarchy Documentation

## Complete Layering System

To prevent UI overlap issues, all components follow this strict z-index hierarchy:

```
┌─────────────────────────────────────────────────────────────┐
│                     Z-Index Layers                          │
│                  (bottom to top)                            │
└─────────────────────────────────────────────────────────────┘

 0     │ Main Content (default)
       │ - Page content
       │ - Regular elements
       │
1100   │ Header & Primary Navigation
       │ - Header component
       │ - EnhancedMegaMenu bar
       │
1150   │ Mega Menu Dropdown
       │ - Category subcategory dropdowns
       │ - Product listings in menu
       │
1200   │ Header Dropdowns
       │ - User menu dropdown
       │ - TopBanner
       │
1300   │ Global Search Results
       │ - Search dropdown results
       │ - Product search listings
       │
1500   │ Floating Elements
       │ - FloatingContactButton
       │ - Floating action buttons
       │
2000   │ Modals & Overlays
       │ - ContactUsModal
       │ - Full-screen overlays
       │
```

## Component-by-Component Breakdown

### Base Layer (z-index: 0 or default)
**Components:**
- Main content area
- Product cards
- Category sections
- Footer

**Purpose:** Standard page content, lowest priority

---

### Header Layer (z-index: 1100)
**Components:**
- `Header.js` - headerStyle
- `EnhancedMegaMenu.js` - menuBarStyle

**Purpose:** Primary navigation, always visible

**Positioning:** `position: relative` or `fixed` depending on scroll

---

### Mega Menu Dropdown Layer (z-index: 1150)
**Components:**
- `EnhancedMegaMenu.js` - megaMenuStyle

**Purpose:** Category dropdown menus with subcategories

**Issue Fixed:** Was 1000, causing overlap with header elements
**Solution:** Increased to 1150 to appear above header but below user dropdowns

**Positioning:** `position: absolute`, `top: 100%`

---

### Header Dropdowns Layer (z-index: 1200)
**Components:**
- `Header.js` - userMenuStyle
- `TopBanner.js` - bannerStyle

**Purpose:** User menu, notifications, top announcements

**Issue Fixed:** User dropdown was going behind mega menu
**Solution:** Set to 1200 to appear above everything except search/modals

**Positioning:** `position: absolute`, `top: 100%`

---

### Global Search Results Layer (z-index: 1300)
**Components:**
- `GlobalSearch.js` - resultsStyle

**Purpose:** Product search results dropdown

**Reasoning:** Should appear above all navigation elements

**Positioning:** `position: absolute`, `top: 100%`

---

### Floating Elements Layer (z-index: 1500)
**Components:**
- `FloatingContactButton.js` - containerStyle

**Purpose:** Persistent floating action buttons

**Reasoning:** Should be accessible but not block modals

**Positioning:** `position: fixed`, bottom-right

---

### Modal Layer (z-index: 2000)
**Components:**
- `ContactUsModal.js` - overlayStyle

**Purpose:** Full-screen modals and overlays

**Reasoning:** Highest priority, blocks all other interactions

**Positioning:** `position: fixed`, full viewport

---

## Rules for Adding New Components

### 1. Navigation Elements
- **Range:** 1100-1199
- Use for: Nav bars, menu bars, breadcrumbs

### 2. Dropdowns from Navigation
- **Range:** 1150-1199
- Use for: Mega menus, nav dropdowns

### 3. User Interface Dropdowns
- **Range:** 1200-1299
- Use for: User menus, notifications, account dropdowns

### 4. Search Results
- **Range:** 1300-1399
- Use for: Search dropdowns, autocomplete

### 5. Floating Actions
- **Range:** 1500-1599
- Use for: Floating buttons, sticky elements

### 6. Modals & Overlays
- **Range:** 2000+
- Use for: Dialogs, full-page overlays, lightboxes

---

## Common Issues & Solutions

### Issue 1: Dropdown Going Behind Other Elements
**Symptom:** User menu, search results, or mega menu hidden by other components

**Solution:**
1. Check z-index of the dropdown
2. Ensure it's higher than elements it should cover
3. Verify parent has `position: relative`

**Example Fix:**
```javascript
// Before
const dropdownStyle = {
    zIndex: 1000  // Too low!
};

// After
const dropdownStyle = {
    zIndex: 1200  // Above navigation
};
```

---

### Issue 2: Modal Not Blocking Content
**Symptom:** Can still interact with page behind modal

**Solution:**
1. Ensure modal overlay has high z-index (2000+)
2. Overlay should have `position: fixed`
3. Consider adding `pointer-events: auto`

---

### Issue 3: Floating Button Behind Dropdown
**Symptom:** Floating action button appears behind dropdowns

**Solution:**
1. Check if floating button z-index is high enough
2. Should be 1500+ to appear above dropdowns
3. But below modals (< 2000)

---

## Testing Checklist

When adding/modifying components:

- [ ] Test dropdown appears above content
- [ ] Test dropdown appears below appropriate elements
- [ ] Test on desktop viewport
- [ ] Test on mobile viewport
- [ ] Test with user menu open
- [ ] Test with mega menu open
- [ ] Test with search results showing
- [ ] Test floating button visibility
- [ ] Test modal blocks all interaction
- [ ] Test stacking of multiple dropdowns

---

## Current Component Z-Indexes

| Component | File | Z-Index | Purpose |
|-----------|------|---------|---------|
| Main Content | Various | 0 (default) | Page content |
| Header | Header.js | 1100 | Main header bar |
| Mega Menu Bar | EnhancedMegaMenu.js | 1100 | Category navigation |
| Mega Menu Dropdown | EnhancedMegaMenu.js | 1150 | ✅ FIXED - Category dropdowns |
| Top Banner | TopBanner.js | 1200 | Announcement banner |
| User Menu Dropdown | Header.js | 1200 | ✅ FIXED - User account menu |
| Search Results | GlobalSearch.js | 1300 | Product search results |
| Floating Contact | FloatingContactButton.js | 1500 | Contact quick actions |
| Contact Modal | ContactUsModal.js | 2000 | Contact overlay |

---

## Visual Representation

```
                                    ┌──────────────────┐
                                    │  Modal Overlay   │ 2000
                                    │   (Top Layer)    │
                                    └──────────────────┘

                                ┌──────────┐
                                │ Floating │ 1500
                                │  Button  │
                                └──────────┘

                            ┌─────────────────┐
                            │ Search Results  │ 1300
                            └─────────────────┘

                        ┌─────────────────┐
                        │  User Dropdown  │ 1200
                        └─────────────────┘

                    ┌─────────────────────────┐
                    │  Mega Menu Dropdown     │ 1150 ✅ FIXED
                    └─────────────────────────┘

╔═══════════════════════════════════════════════════════╗
║              Header & Mega Menu Bar                   ║ 1100
╚═══════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────┐
│                                                       │
│              Main Content Area                        │ 0
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## Maintenance Notes

### When Adding New Components:
1. Determine component's priority level
2. Choose appropriate z-index range
3. Document in this file
4. Test against existing components
5. Update visual diagram if needed

### When Fixing Overlap Issues:
1. Check this document for correct layer
2. Verify parent positioning
3. Test on all screen sizes
4. Update documentation if structure changes

---

## Recent Fixes

### October 14, 2025
**Issue:** Category mega menu dropdown overlapping header elements
**Root Cause:** z-index was 1000, too low
**Fix:** Increased to 1150
**Result:** Dropdown now appears properly without hiding header controls

**Issue:** User menu dropdown going behind category banner
**Root Cause:** z-index was 1000, lower than mega menu bar (1100)
**Fix:** Increased to 1200
**Result:** User menu now appears above all navigation elements

---

## Best Practices

1. **Use Relative Values:** Keep z-indexes in defined ranges (100s)
2. **Document Changes:** Always update this file when changing z-indexes
3. **Test Interactions:** Test all dropdown combinations
4. **Mobile Matters:** Verify on mobile viewports
5. **Consistency:** Follow the established hierarchy

---

**Last Updated:** October 14, 2025  
**Status:** ✅ All Overlap Issues Resolved

