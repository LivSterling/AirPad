# Tailwind CSS Utilities Guide

This document describes all custom Tailwind CSS utilities configured for the AirPad MVP.

## Custom Color Palette

### Pad States

| Class | Color | Hex | Usage |
|-------|-------|-----|-------|
| `bg-pad-active` | Blue 500 | `#3B82F6` | Active pad being triggered |
| `bg-pad-hover` | Blue 400 | `#60A5FA` | Pad hover state |
| `bg-pad-inactive` | Gray 800 | `#1F2937` | Default pad state |
| `bg-pad-triggered` | Violet 500 | `#8B5CF6` | Recently triggered pad |

**Example:**
```tsx
<div className="bg-pad-inactive hover:bg-pad-hover active:bg-pad-active" />
```

### Recording/Playback States

| Class | Color | Hex | Usage |
|-------|-------|-----|-------|
| `bg-recording` | Red 500 | `#EF4444` | Recording indicator |
| `bg-playing` | Green 500 | `#10B981` | Playing indicator |
| `bg-paused` | Amber 500 | `#F59E0B` | Paused state |

**Example:**
```tsx
{isRecording && <span className="bg-recording text-white px-2 py-1">● REC</span>}
```

### Kit Types

| Class | Color | Hex | Usage |
|-------|-------|-----|-------|
| `bg-kit-drums` | Pink 500 | `#EC4899` | Drum kit indicator |
| `bg-kit-piano` | Violet 500 | `#8B5CF6` | Piano kit indicator |
| `bg-kit-synth` | Cyan 500 | `#06B6D4` | Synth kit indicator |

**Example:**
```tsx
<div className={`px-4 py-2 bg-kit-${currentKit}`}>
  {currentKit.toUpperCase()}
</div>
```

### UI Elements

| Class | Value | Usage |
|-------|-------|-------|
| `bg-overlay-bg` | `rgba(0,0,0,0.85)` | Dark overlay backgrounds |
| `bg-glass-bg` | `rgba(255,255,255,0.1)` | Glass morphism backgrounds |
| `border-glass-border` | `rgba(255,255,255,0.2)` | Glass morphism borders |

## Custom Animations

### Animation Classes

| Class | Duration | Usage |
|-------|----------|-------|
| `animate-pulse-fast` | 1s | Fast pulsing effect |
| `animate-pulse-slow` | 3s | Slow pulsing effect |
| `animate-ping-slow` | 2s | Slow ping effect |
| `animate-bounce-subtle` | 1s | Subtle bounce |
| `animate-fade-in` | 0.3s | Fade in entrance |
| `animate-fade-out` | 0.3s | Fade out exit |
| `animate-slide-up` | 0.3s | Slide up from bottom |
| `animate-slide-down` | 0.3s | Slide down from top |
| `animate-scale-in` | 0.2s | Scale in from 90% |
| `animate-glow` | 2s | Glowing effect (infinite) |

**Examples:**
```tsx
// Recording indicator
<div className="animate-pulse-fast bg-recording" />

// Pad trigger feedback
<div className="animate-scale-in bg-pad-active" />

// Instructions overlay
<div className="animate-fade-in bg-overlay-bg" />
```

## Layout Utilities

### Grid System

```tsx
// 3×3 pad grid
<div className="grid grid-cols-3 grid-rows-3 gap-pad-gap">
  {pads.map((pad) => <Pad key={pad.id} />)}
</div>
```

### Custom Spacing

| Class | Value | Usage |
|-------|-------|-------|
| `w-pad` | 120px | Pad width |
| `h-pad` | 120px | Pad height |
| `gap-pad-gap` | 16px | Gap between pads |
| `h-control-panel` | 200px | Control panel height |

### Aspect Ratios

```tsx
// Square pads
<div className="aspect-square" />
```

## Visual Effects

### Box Shadows

| Class | Usage |
|-------|-------|
| `shadow-pad` | Default pad shadow |
| `shadow-pad-hover` | Elevated hover state |
| `shadow-pad-active` | Active/pressed state with blue glow |
| `shadow-glass` | Glass morphism shadow |
| `shadow-glow-blue` | Blue glow effect |
| `shadow-glow-green` | Green glow effect |
| `shadow-glow-red` | Red glow effect |

**Examples:**
```tsx
// Pad with state-based shadows
<div className="shadow-pad hover:shadow-pad-hover active:shadow-pad-active" />

// Recording indicator with glow
<div className="shadow-glow-red animate-pulse-fast" />
```

### Border Radius

```tsx
// Rounded pads
<div className="rounded-pad" />  // 12px

// Rounded controls
<button className="rounded-control" />  // 8px
```

### Backdrop Blur

```tsx
// Glass morphism effect
<div className="bg-glass-bg backdrop-blur-xs border border-glass-border" />
```

## Typography

### Font Sizes

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-pad-label` | 0.875rem | 1.25rem | Pad labels |
| `text-status` | 0.75rem | 1rem | Status indicators |

**Example:**
```tsx
<div className="text-pad-label text-gray-300">Kick</div>
<span className="text-status text-recording">● REC</span>
```

## Z-Index Layers

| Class | Value | Usage |
|-------|-------|-------|
| `z-overlay` | 50 | Overlay backgrounds |
| `z-modal` | 100 | Modal dialogs |
| `z-tooltip` | 200 | Tooltips and hints |

## Transition Durations

```tsx
// Custom durations
<div className="transition-all duration-250" />
<div className="transition-colors duration-350" />
```

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `xs` | 480px | Extra small devices |
| `sm` | 640px | Small devices (default) |
| `md` | 768px | Medium devices (default) |
| `lg` | 1024px | Large devices (default) |
| `xl` | 1280px | Extra large (default) |
| `2xl` | 1536px | 2XL (default) |
| `3xl` | 1920px | Ultra-wide displays |

## Common Patterns

### Pad Component

```tsx
<div
  className={`
    aspect-square rounded-pad shadow-pad
    bg-pad-inactive hover:bg-pad-hover
    transition-all duration-250
    ${isActive ? 'bg-pad-active shadow-pad-active scale-95' : ''}
    ${isHovered ? 'shadow-pad-hover' : ''}
  `}
>
  <div className="text-pad-label text-gray-300">
    {label}
  </div>
</div>
```

### Glass Morphism Card

```tsx
<div className="
  bg-glass-bg backdrop-blur-xs
  border border-glass-border rounded-control
  shadow-glass p-6
  animate-fade-in
">
  {content}
</div>
```

### Recording Indicator

```tsx
<div className="flex items-center gap-2">
  <div className="
    w-3 h-3 rounded-full
    bg-recording shadow-glow-red
    animate-pulse-fast
  " />
  <span className="text-status text-recording">
    RECORDING
  </span>
</div>
```

### Kit Selector

```tsx
<div className="flex gap-2">
  {['drums', 'piano', 'synth'].map((kit) => (
    <button
      key={kit}
      className={`
        px-4 py-2 rounded-control
        transition-all duration-250
        ${currentKit === kit
          ? `bg-kit-${kit} text-white shadow-glow-blue`
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }
      `}
    >
      {kit.toUpperCase()}
    </button>
  ))}
</div>
```

### Instructions Overlay

```tsx
<div className="
  fixed inset-0 z-overlay
  bg-overlay-bg backdrop-blur-sm
  animate-fade-in
  flex items-center justify-center
">
  <div className="
    bg-glass-bg backdrop-blur-xs
    border border-glass-border rounded-control
    shadow-glass p-8 max-w-2xl
    animate-slide-up
  ">
    {instructions}
  </div>
</div>
```

## Dynamic Class Safety

Classes in the safelist are guaranteed to be included in the build even if used dynamically:

```tsx
// These classes are safelisted
const kitClass = `bg-kit-${kitType}`  // ✅ Works
const glowClass = `shadow-glow-${color}`  // ✅ Works

// If you need to add more dynamic classes, update safelist in tailwind.config.js
```

## Performance Tips

1. **Use Tailwind's JIT Mode**: Already enabled by default in Tailwind 3.x
2. **Minimize Custom CSS**: Prefer Tailwind utilities over custom CSS
3. **Purge Unused Styles**: Content paths are configured to scan all components
4. **Combine Classes**: Use `@apply` in CSS for frequently repeated patterns

## Troubleshooting

### Classes Not Applying

1. **Check content paths** in `tailwind.config.js`
2. **Restart dev server** after config changes
3. **Verify class is not purged** - add to safelist if dynamic

### Animation Not Working

1. **Check keyframes** are defined in config
2. **Verify animation name** matches keyframe name
3. **Test in isolation** to rule out conflicts

### Colors Look Different

1. **Check color definition** in config
2. **Verify opacity** if using rgba
3. **Test with hex values** to rule out browser issues

## Next Steps

- Implement dark mode support (optional)
- Add custom plugins for advanced effects
- Create component library with standardized classes
- Add CSS-in-JS integration if needed









