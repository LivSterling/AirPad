const intents = [
  { name:'record',      kws:['record','start recording','start'] },
  { name:'stop',        kws:['stop','finish','end','stop recording'] },
  { name:'clear',       kws:['clear','reset','erase','delete loop'] },
  { name:'save loop',   kws:['save','save loop','save recording'] },
  { name:'play all',    kws:['play all','play loops','play everything'] },
  { name:'stop all',    kws:['stop all','stop loops','stop everything'] },
  { name:'open help',   kws:['help','open help','show instructions','instructions'] },
  { name:'close help',  kws:['close help','hide instructions','close instructions'] },
  { name:'kit:drums',   kws:['drums','drum kit','set kit drum', 'drum'] },
  { name:'kit:synth',   kws:['synth','synth kit','set kit synth','funk kit'] },
  { name:'kit:piano',   kws:['piano','keys','set kit piano'] },
  { name:'export',      kws:['export','download image','save image'] },
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