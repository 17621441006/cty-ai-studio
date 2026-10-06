export const learningRoutes=['ai','roadmap','glossary','work','tools','coding','learn','business','models','agents','industry','products','ontology','library','guides','resources','projects','community','desktop-assistant'];
const originalAI='https://ai-cat.jackchen911006.chatgpt.site';
const originalHome='https://tingjian-space-lab.jackchen911006.chatgpt.site';
export function publicPath(value,id,entries){
 if(!value.startsWith('/')||value.startsWith('//'))return value;
 const first=value.slice(1).split(/[/?#]/)[0];
 if(entries.has(first))return (id==='ai'?'/ai-assets':id==='usaco'?'/usaco':'/tingjian')+value;
 return id==='ai'&&value==='/'?'/ai':value;
}
export function desktopURL(value){
 if(value===originalAI)return '/ai';
 if(value.startsWith(originalAI+'/'))return value.slice(originalAI.length)==='/'?'/ai':value.slice(originalAI.length);
 if(value.startsWith('https://usaco-bronze-lab.jackchen911006.chatgpt.site'))return value.replace('https://usaco-bronze-lab.jackchen911006.chatgpt.site','/usaco');
 if(value.startsWith(originalHome))return value.replace(originalHome,'/tingjian');
 return value;
}
export function rewriteTextAssets(text,id,entries){
 // Only known public directories/files; never touch /workspace in Python code,
 // protocol-relative URLs, external references, or arbitrary slash expressions.
 return text.replace(/(["'`(])\/([A-Za-z0-9_.-]+)(?=[/\s?#"'`)])/g,(all,quote,first)=>entries.has(first)?quote+(id==='ai'?'/ai-assets':id==='usaco'?'/usaco':'/tingjian')+'/'+first:all);
}
