# Checkout Page Design System

## Color Specifications

### Primary Colors
```
Primary Indigo:     #6366f1  (rgb(99, 102, 241))
Dark Indigo:        #4338ca  (rgb(67, 56, 202))
Light Indigo:       #e0e7ff  (rgba(99, 102, 241, 0.25))
```

### Semantic Colors
```
Success Green:      #10b981  (rgb(16, 185, 129))
Success Light:      #d1fae5  (rgba(16, 185, 129, 0.15))

Error Red:          #ef4444  (rgb(239, 68, 68))
Error Light:        #fecdd3  (rgba(239, 68, 68, 0.15))

Warning Yellow:     #f59e0b
```

### Neutral Colors
```
Background Dark:    #0f172a  (rgb(15, 23, 42))
Card Dark:          #0d1123  (rgb(13, 17, 35))
Surface Light:      #1e293b  (rgb(30, 41, 59))

Text Primary:       #f8fafc  (rgb(248, 250, 252))
Text Secondary:     #cbd5e1  (rgb(203, 213, 225))
Text Muted:         #94a3b8  (rgb(148, 163, 184))

Border:             rgba(255, 255, 255, 0.06)
Border Light:       rgba(255, 255, 255, 0.04)
Border Hover:       rgba(99, 102, 241, 0.5)
```

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
             'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
             sans-serif;
```

### Font Sizes
```
Header Title:       20px (bold)
Section Heading:    18px (bold)
Label:              13px (uppercase, semibold)
Body:               15px (regular)
Caption:            12px (muted)
```

### Font Weights
```
Regular:    400
Semibold:   600
Bold:       700
```

## Spacing System

### Padding
```
Header:             24px (20px on mobile)
Sections:           32px (24px on tablet, 16px on mobile)
Form Groups:        16px (gap between fields)
Card Interior:      20px
```

### Gaps
```
Form Inputs:        8px (label to input)
Grid Items:         12px
Method Buttons:     12px
Element Spacing:    16px
```

## Border Radius

```
Large Cards:        20px
Medium Elements:    14px
Small Elements:     12px
Buttons:            12px
Badges:             20px (rounded pill)
Icons:              50% (circles)
```

### Shadow System

```
Subtle:             0 4px 10px rgba(0, 0, 0, 0.1)
Card:               0 20px 50px rgba(15, 23, 42, 0.45)
Button Rest:        0 12px 30px rgba(99, 102, 241, 0.35)
Button Hover:       0 16px 36px rgba(99, 102, 241, 0.45)
Input Focus:        0 10px 30px rgba(99, 102, 241, 0.25)
```

## Component Specifications

### Header
```
Height:             Auto (padding driven)
Background:         Gradient (135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))
Border Bottom:      1px solid rgba(255, 255, 255, 0.06)
Display:            flex, centered
Gap:                12px
Padding:            24px
```

### Order Summary Section
```
Width:              50% (desktop), 100% (mobile)
Padding:            32px (24px tablet, 16px mobile)
Border Right:       1px solid rgba(255, 255, 255, 0.06) [desktop]
Border Bottom:      1px solid rgba(255, 255, 255, 0.06) [mobile]
Display:            flex column
Justify:            space-between
```

### Order Details Card
```
Background:         rgba(255, 255, 255, 0.02)
Border:             1px solid rgba(255, 255, 255, 0.06)
Border Radius:      14px
Padding:            20px
Margin:             0
```

### Payment Method Buttons
```
Width:              calc(50% - 6px) [two column]
Padding:            16px
Background Default: rgba(255, 255, 255, 0.04)
Background Hover:   rgba(99, 102, 241, 0.08)
Background Active:  linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(99, 102, 241, 0.12))
Border Default:     2px solid rgba(255, 255, 255, 0.06)
Border Hover:       2px solid rgba(99, 102, 241, 0.5)
Border Active:      2px solid #6366f1
Box Shadow Active:  0 8px 20px rgba(99, 102, 241, 0.2)
Border Radius:      12px
Transition:         all 0.2s ease
Cursor:             pointer
```

### Form Inputs
```
Width:              100%
Padding:            12px 14px
Background:         rgba(255, 255, 255, 0.04)
Border:             1px solid rgba(255, 255, 255, 0.06)
Border Radius:      12px
Font Size:          14px
Color:              #f8fafc
Placeholder Color:  rgba(226, 232, 240, 0.6)
Transition:         border-color 0.2s, box-shadow 0.2s

Focus State:
  Border:           1px solid rgba(99, 102, 241, 0.7)
  Box Shadow:       0 10px 30px rgba(99, 102, 241, 0.25)
  Outline:          none
```

### Primary Button (Pay)
```
Width:              100%
Padding:            13px 16px
Background:         linear-gradient(135deg, #6366f1, #4338ca)
Color:              #fff
Border:             none
Border Radius:      12px
Font Size:          15px
Font Weight:        700
Box Shadow:         0 12px 30px rgba(99, 102, 241, 0.35)
Cursor:             pointer
Transition:         transform 0.15s ease, box-shadow 0.2s ease
Margin Top:         8px

Hover State:
  Transform:        translateY(-2px)
  Box Shadow:       0 16px 36px rgba(99, 102, 241, 0.45)

Disabled State:
  Opacity:          0.7
  Cursor:           not-allowed
```

### Form Error Message
```
Color:              #fecdd3 (light red)
Background:         rgba(239, 68, 68, 0.12)
Border:             1px solid rgba(248, 113, 113, 0.45)
Padding:            12px
Border Radius:      12px
Font Size:          13px
Text Align:         center
Margin Bottom:      10px
```

### State Icons
```
Success Icon:
  Size:             80x80px
  Background:       rgba(16, 185, 129, 0.15)
  Color:            #10b981
  Content:          ✓
  Font Size:        40px
  Animation:        scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)

Error Icon:
  Size:             80x80px
  Background:       rgba(239, 68, 68, 0.15)
  Color:            #ef4444
  Content:          ✗
  Font Size:        40px
  Animation:        shake 0.5s
```

## Animations

### Spin
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
Duration:           1s
Iteration:          infinite
Timing:             linear
```

### ScaleIn
```css
@keyframes scaleIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
Duration:           0.5s
Timing:             cubic-bezier(0.175, 0.885, 0.32, 1.275) [bounce]
```

### Shake
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
}
Duration:           0.5s
```

## Responsive Breakpoints

### Desktop (≥861px)
- Two-column grid layout
- Full padding (32px)
- Order summary width: 50%
- Payment methods width: 50%

### Tablet (861px → 480px)
- Single column layout
- Reduced padding (24px)
- Order summary border: bottom (not right)
- Font sizes: slightly reduced

### Mobile (<480px)
- Single column layout
- Minimal padding (16px)
- Reduced header padding (16px)
- Method buttons: single column (100% width)
- Form row: single column (100% width)
- Header font: 18px
- Section headings: 16px

## Glassmorphism Effect

### Backdrop
```css
Background:         rgba(13, 17, 35, 0.9)
Backdrop Filter:    blur(10px)
Border:             1px solid rgba(255, 255, 255, 0.06)
```

### Gradient Overlay
```css
Background:         radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.18) 0, transparent 25%),
                    radial-gradient(circle at 90% 10%, rgba(14, 165, 233, 0.18) 0, transparent 22%),
                    linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.95)),
                    #0f172a
```

## Accessibility Guidelines

- ✅ All inputs have associated labels
- ✅ Focus states clearly visible (glow effect)
- ✅ Color contrast meets WCAG AA standards
- ✅ Semantic HTML structure
- ✅ Clear error messaging
- ✅ Loading/processing states clearly indicated
- ✅ All interactive elements keyboard accessible
- ✅ Test IDs preserved for automation

## Performance Considerations

- CSS Grid for efficient layout
- Hardware acceleration on transforms (translateY, scale, rotate)
- Minimal repaints with transform-based animations
- Backdrop filter performance: tested on modern browsers
- No JavaScript animation libraries required
- Optimized media queries (only 2 breakpoints)

## Design Reference

Inspired by modern fintech design patterns from:
- Stripe Checkout
- Razorpay Payment Page
- Square Online Payments
- Apple Pay design language

Modern aesthetic with:
- Dark mode (reduces eye strain)
- Glassmorphic effects (visual depth)
- Smooth animations (user feedback)
- Clear information hierarchy (conversion optimization)
- Accessible dark theme (WCAG compliant)
