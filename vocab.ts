const intents = [
  { name:'record',    kws:['record','start recording','start'] },
  { name:'stop',      kws:['stop','finish','end','stop recording'] },
  { name:'clear',     kws:['clear','reset','erase'] },
  { name:'kit:drums', kws:['drums','drum kit','set kit drum', 'drum'] },
  { name:'kit:synth', kws:['synth','synth kit','set kit synth','funk kit'] },
  { name:'kit:piano', kws:['piano','keys','set kit piano'] },
  { name:'export',    kws:['export','download image','save image'] },
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