# GrabIt - Retro/Vintage Design System

## 🎨 Color Palette

### Primary Colors
```css
--background: #F5F1E8        /* Off-white / beige paper */
--foreground: #1A1A1A        /* Charcoal black */
--card: #FEFDFB              /* Slightly lighter paper */
```

### Accent Colors
```css
--retro-orange: #E07A3E      /* Muted orange - primary accent */
--retro-teal: #5B9A8B        /* Faded teal - secondary accent */
--retro-blue: #6B8CAE        /* Dusty blue - tertiary accent */
--destructive: #C84B31       /* Muted red - errors */
```

### Neutrals
```css
--muted: #D8D4CA             /* Muted beige */
--muted-foreground: #5A5A5A  /* Medium gray */
--secondary: #E8E4DB         /* Light beige */
```

## 📝 Typography

### Font Families
- **Headings**: Space Mono (700 weight) - Terminal/retro feel
- **Body**: IBM Plex Mono (400-700 weights) - Clean monospace
- **Buttons**: ALL CAPS, bold, letter-spacing: wider

### Usage
```tsx
// Headings
className="font-mono font-bold uppercase tracking-tight"

// Body text
className="font-mono uppercase tracking-wide"

// Buttons
className="font-bold tracking-wider uppercase"
```

## 🎯 UI Components

### Buttons
**Style**: Chunky borders with 3D shadow effect

```tsx
// Primary button
<Button variant="default">
  - 3px border
  - 4px × 4px shadow (black)
  - Translates down 2px on press
  - Shadow reduces on hover
  - ALL CAPS text
</Button>

// Secondary button (Orange accent)
<Button variant="secondary">
  - Orange background (#E07A3E)
  - Same 3D effect
</Button>

// Outline button
<Button variant="outline">
  - Transparent background
  - 3px border
  - Same shadow effect
</Button>
```

### Input Fields
**Style**: Terminal-style with bold borders

```tsx
<Input 
  className="h-12 border-[3px] border-foreground font-mono"
  placeholder="ALL CAPS PLACEHOLDER"
>
  - 3px solid border
  - 4px × 4px shadow
  - Shadow reduces on focus
  - Focus border changes to orange
  - Monospace font
</Input>
```

### Cards
**Style**: Sharp borders, no rounded corners

```tsx
<div className="border-[3px] border-foreground shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
  - 3px border
  - 6px × 6px offset shadow
  - No border radius
  - Paper-like background
</div>
```

### Badges
**Style**: Inline blocky tags

```tsx
<div className="border-[3px] border-foreground px-4 py-2 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
  <span className="text-xs font-bold tracking-wider uppercase">
    FREE • FAST • NO LOGIN
  </span>
</div>
```

## ✨ Animations

### Terminal Blink
```css
@keyframes terminal-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.terminal-blink {
  animation: terminal-blink 1s infinite;
}
```

**Usage**: Loading states with █ character

### Button Press Effect
```css
/* Built into button variants */
active:translate-y-[2px]
active:shadow-none

/* Shadow transitions */
shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]  /* Default */
hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]  /* Hover */
```

### Hover Effects
- Platform icons: translate down, reduce shadow
- Links: scale up/down on interaction
- Minimal, physical feedback

## 🎭 Visual Effects

### Paper Grain Texture
```css
/* Applied to body::before */
- Fixed position overlay
- SVG noise filter
- opacity: 0.04
- Non-interactive (pointer-events: none)
```

### Shadow Styles
**Chunky Shadows** (Retro 3D effect)
```css
/* Small elements */
shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]

/* Medium elements */
shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]

/* Large elements */
shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]
```

## 📱 Layout Guidelines

### Spacing
- Sharp, no rounded corners (border-radius: 0.25rem max)
- Generous padding for touch targets
- Clear visual hierarchy with borders

### Content Structure
```tsx
<section>
  - Centered content
  - Max-width: 4xl (896px)
  - Generous spacing between sections
  - Clear section separators
</section>
```

### Responsive Design
```tsx
// Mobile-first approach
className="text-base md:text-lg lg:text-xl"
className="px-4 md:px-6 lg:px-8"
```

## 🎨 Component Examples

### Loading State (Terminal Style)
```tsx
<div className="border-[3px] border-foreground bg-card shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] p-8">
  <Loader2 className="h-12 w-12 animate-spin" />
  <span className="terminal-blink">█</span>
  <p className="font-bold uppercase tracking-wider">⟩ PROCESSING LINK...</p>
  <p className="font-mono uppercase">PLEASE WAIT</p>
</div>
```

### Error Message
```tsx
<div className="border-[3px] border-destructive shadow-[4px_4px_0px_0px_rgba(200,75,49,1)]">
  <p className="text-destructive font-bold uppercase">⚠ ERROR MESSAGE</p>
</div>
```

### Platform Icons
```tsx
<div className="group">
  <div className="w-16 h-16 border-[3px] border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] 
       group-hover:translate-y-0.5 group-hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
    {/* Icon */}
  </div>
  <span className="text-[10px] font-bold uppercase tracking-widest">LABEL</span>
</div>
```

## 🔧 Implementation Notes

### Do's ✅
- Use ALL CAPS for UI text (headings, buttons, labels)
- Apply 3px borders consistently
- Use chunky shadow effects (4px-8px offsets)
- Implement press effects on interactive elements
- Use monospace fonts everywhere
- Keep sharp corners (minimal border-radius)
- Use terminal symbols: ⟩, █, ⚠
- Maintain high contrast (black on beige)

### Don'ts ❌
- No glassmorphism or blur effects
- No modern gradients
- No rounded pills (rounded-full)
- No soft shadows
- No lowercase in UI text
- No smooth, flowing animations
- No pastel or neon colors
- No thin borders (<3px)

## 🎯 Brand Voice

**Tone**: Nostalgic, bold, simple, trustworthy

**Messaging Style**:
- Short, punchy statements
- Terminal-style feedback
- Direct, no-nonsense copy
- ALL CAPS for emphasis
- Minimal decoration

**Example Copy**:
- "DOWNLOAD INSTAGRAM, X & THREADS VIDEOS IN SECONDS"
- "⟩ PROCESSING LINK..."
- "PASTE → PROCESS → DOWNLOAD"
- "FREE • FAST • NO LOGIN"

## 🚀 Future Enhancements

### Potential Additions
1. **Retro sounds**: Click/beep effects on interactions
2. **ASCII art**: Decorative elements in empty states
3. **Scanline effect**: Subtle CRT monitor simulation
4. **Dithered images**: Retro image processing
5. **Pixel perfect icons**: Custom 8-bit style icons
6. **Print styles**: Optimize for actual printing

### Color Variations
```css
/* Alternative accent colors to rotate */
--retro-rust: #B85C38
--retro-sage: #8B9556  
--retro-burgundy: #8B4049
--retro-steel: #617A89
```

## 📦 Production Checklist

- [x] Retro color palette applied
- [x] Monospace fonts loaded (Space Mono, IBM Plex Mono)
- [x] All buttons styled with 3D effect
- [x] Input fields have terminal styling
- [x] Header has retro borders
- [x] Loading states have terminal aesthetic
- [x] Paper grain texture applied
- [x] ALL CAPS text throughout UI
- [x] Platform icons have retro boxes
- [x] Error messages styled appropriately
- [x] Animations are minimal and physical
- [x] No modern effects (blur, gradients, pills)

## 🎓 Design Philosophy

This design evokes:
- **Early 2000s internet** - Bold, simple, functional
- **Terminal interfaces** - Monospace fonts, command-line feel
- **Vintage posters** - High contrast, bold typography
- **Old computer UI** - Chunky borders, physical buttons

While maintaining:
- **Modern performance** - Fast, responsive, PWA-ready
- **Accessibility** - High contrast, clear hierarchy
- **Usability** - Touch-friendly, intuitive interactions
- **Professional polish** - Clean code, production-ready

---

**Design System Version**: 1.0  
**Last Updated**: December 2024  
**Maintained by**: GrabIt Team
