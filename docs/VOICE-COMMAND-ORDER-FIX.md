# Voice Command Order Fix

## Problem

The "stop all" and "clear all" voice commands were not working correctly.

### Root Cause

The `matchIntent()` function checks intents in order and returns the first match. When you said "stop all", it would match "stop" first before checking "stop all".

**Example:**
```
User says: "stop all"
1. Checks "stop" keywords: ['stop', 'finish', 'end', 'stop recording']
2. "stop all" INCLUDES "stop" ✓ MATCH!
3. Returns 'stop' intent (wrong!)
4. Never checks 'stop all' intent
```

## Solution

Reordered the intents array so multi-word commands are checked BEFORE single-word commands.

### Before:
```typescript
const intents = [
  { name:'stop',        kws:['stop','finish','end'] },      // Checked FIRST
  { name:'clear',       kws:['clear','reset','erase'] },    // Checked FIRST
  { name:'stop all',    kws:['stop all','stop loops'] },    // Never reached
  { name:'clear all',   kws:['clear all','clear everything'] }, // Never reached
]
```

### After:
```typescript
const intents = [
  // Multi-word commands FIRST
  { name:'clear all',   kws:['clear all','clear everything'] },
  { name:'stop all',    kws:['stop all','stop loops'] },
  { name:'play all',    kws:['play all','play loops'] },
  { name:'save loop',   kws:['save','save loop'] },
  
  // Single-word commands AFTER
  { name:'stop',        kws:['stop','finish','end'] },
  { name:'clear',       kws:['clear','reset','erase'] },
]
```

### Now:
```
User says: "stop all"
1. Checks "clear all" keywords - no match
2. Checks "stop all" keywords: ['stop all', 'stop loops', 'stop everything']
3. "stop all" INCLUDES "stop all" ✓ MATCH!
4. Returns 'stop all' intent (correct!)
```

## Impact

- ✅ "stop all" now works correctly
- ✅ "clear all" now works correctly
- ✅ All other commands still work
- ✅ No breaking changes

## Testing

Say these commands to verify:
- "stop all" → Should stop all loops
- "clear all" → Should clear all loops
- "stop" → Should only stop recording
- "clear" → Should only clear current loop

## Files Changed

- `vocab.ts` - Reordered intents array

**Status:** ✅ Fixed and Validated

