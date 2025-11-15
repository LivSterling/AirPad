const intents = [
  // Multi-word commands FIRST to avoid partial matching
  { name:'clear all',   kws:['clear all','clear everything','delete all','clear all loops','delete all loops'] },
  { name:'stop all',    kws:['stop all','stop loops','stop everything'] },
  { name:'play all',    kws:['play all','play loops','play everything'] },
  { name:'save loop',   kws:['save','save loop','save recording'] },
  { name:'open help',   kws:['help','open help','show instructions','instructions'] },
  { name:'close help',  kws:['close','close help','hide','hide instructions','close instructions','dismiss'] },
  
  // Single-word commands AFTER
  { name:'record',      kws:['record','start recording','start'] },
  { name:'stop',        kws:['stop','finish','end','stop recording'] },
  { name:'clear',       kws:['clear','reset','erase','delete loop'] },
  { name:'kit:drums',   kws:['drums','drum kit','set kit drum', 'drum'] },
  { name:'kit:funk',    kws:['funk','funk kit','set kit funk','funky'] },
  { name:'kit:piano',   kws:['piano','keys','set kit piano'] },
  { name:'export',      kws:['export','download image','save image'] },
  { name:'silence',     kws:['silence','stop sounds','quiet','mute','all stop'] },
];

export function matchIntent(text: string): string | null {
  const t = text.toLowerCase().trim();
  for (const it of intents) {
    if (it.kws.some(k => t.includes(k))) return it.name;
  }
  return null;
}

// Export intents for reference
export { intents };