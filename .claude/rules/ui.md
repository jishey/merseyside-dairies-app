# UI Rules

## Source of Truth
The prototype `merseyside-dairies-app.jsx` is the definitive visual reference. When in doubt, read the prototype. Copy styles exactly.

## Mobile-First Design
- Max width: 430px (Phone wrapper centres this on larger screens)
- Body text: 18px minimum (users are in their 60s)
- Touch targets: 48px minimum height/width
- Primary buttons: 56px minimum height
- Stepper buttons: 48px circles
- NumPad keys: 64px height
- No hover-only interactions -- everything must work with touch

## Design Tokens

### Colours
| Token | Hex | Usage |
|-------|-----|-------|
| Primary blue | #2563EB | Buttons, links, Blue Milk |
| Primary green | #16A34A | Confirm buttons, Green Milk |
| Dark navy | #1E3A5F | Headings, clipboard header gradient |
| Cream paper | #FDF6E3 | Clipboard paper background |
| Clipboard board | #E8E0D0 | Board behind the paper |
| Error red | #DC2626 | Errors, EDITED badges, delete actions |
| Warning amber | #F59E0B | Anomaly warnings |
| Amber bg | #FEF3C7 | Anomaly warning background |
| Admin body bg | #F8FAFC | Admin page backgrounds |
| Text primary | #1E293B | Body text |
| Text muted | #64748B | Secondary text |
| Text subtle | #78716C | Clipboard dates, labels |
| Border | #E2E8F0 | Card borders |

### Product Colour Palette (admin assigns to products)
Blue #2563EB, Green #16A34A, Red #DC2626, Orange #EA580C, Yellow #CA8A04, Purple #7C3AED, Pink #DB2777, Teal #0D9488

### Typography
- Font family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- Font weight: 800 for most text (the app uses bold weights throughout)
- Letter spacing: -0.02em on headings
- Body: text-sm equivalent but minimum 18px for readability

### Spacing & Borders
- Card border radius: 12-16px
- Button border radius: 14px
- Standard padding: 16-24px

## Clipboard Metaphor
The core milkman screens use a clipboard visual metaphor:
- **Board**: #E8E0D0 background (the actual clipboard board)
- **Metal clip**: Gradient grey bar at top with rounded bottom corners
- **Paper**: #FDF6E3 with subtle radial gradients (cream paper texture)
- **Folded corner**: Top-right "FLIP" corner that navigates to history (rotated 45 degrees)

CSS for paper texture:
```css
background: #FDF6E3;
background-image:
  radial-gradient(ellipse at 20% 50%, rgba(255,248,230,0.6) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, rgba(255,245,220,0.4) 0%, transparent 50%);
```

## Animations
- `screen-fade`: fadeIn 0.2s ease-out (translateY 8px to 0, opacity 0 to 1)
- `shake`: PIN error (translateX -8px to 8px, 0.3s)
- PIN dots: scale(1.1) with cubic-bezier(0.34, 1.56, 0.64, 1) when filled
- All buttons: transition all 0.2s
- Keep animations subtle and purposeful -- this is a work tool, not a showpiece

## Stepper Component (CRITICAL)
The Stepper must use a local draft state pattern:
```
function Stepper({ value, onChange, min=0, max=999, disabled }):
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')

  onFocus -> setTyping(true), setDraft('')
  onChange -> update draft only (strip non-digits, no state commit)
  onBlur -> setTyping(false), commit clamped value to parent
  Enter key -> blur the input

  Display: typing ? draft : value
  inputMode="numeric" + pattern="[0-9]*"
  Focused styling: green border (#2563EB), green background (#F0FDF4)
```
This prevents keystroke loss that happens with controlled inputs.

## Key Shared Components
- **Phone**: 430px max-width wrapper, centred, with shadow
- **Page**: min-height 100vh, padding, optional cream background
- **Btn**: Primary button, gradient backgrounds, 56px min-height, 14px border-radius
- **BackBtn**: Blue text button with ChevronLeft icon
- **NumPad**: 3x4 grid (1-9, empty, 0, delete). Delete = red gradient + X icon. Keys = 64px height, 28px font, 800 weight
- **PinDots**: 4 circles (24px), filled = #2563EB with scale(1.1), unfilled = #E2E8F0
- **StatusBadge**: Pill (borderRadius 20), colour per status (submitted=green, progress=blue, anomaly=amber, not_started=grey), all-caps 12px 800 weight
- **BottomNav**: Fixed bottom, 5 admin tabs (Home, Clipboards, Order, History, Settings), active = blue, inactive = grey #94A3B8

## Logo
- URL: `https://merseysidedairies.co.uk/wp-content/uploads/2016/04/Merseyside_Dairies_Logo_PNG.png`
- Welcome header: 80px height
- Admin login header: 70px height

## No Dark Mode
Single theme only. No theme toggle needed.

## No Emojis
Never use emojis anywhere. Use Lucide React icons or plain text.
