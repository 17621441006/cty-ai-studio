export const learningRoutes=['ai','roadmap','glossary','work','tools','coding','learn','business','models','agents','industry','products','ontology','library','guides','resources','projects','community','desktop-assistant'];
const originalAI='https://ai-cat.jackchen911006.chatgpt.site';
const originalHome='https://tingjian-space-lab.jackchen911006.chatgpt.site';
export function publicPath(value,id,entries){
 if(!value.startsWith('/')||value.startsWith('//'))return value;
 const first=value.slice(1).split(/[/?#]/)[0];
 if(entries.has(first))return (id==='ai'?'/ai-assets':id==='usaco'?'/usaco':'/tingjian')+value;
 return id==='ai'&&value==='/'?'/ai':value;
}
// Kimi 静态托管不会把目录重写为 index.html，因此入口必须是显式的 index.html，
// 否则 /ai 这类目录地址会 404 或被套回主站（iframe 里出现“套娃”）。
const explicit=p=>p.endsWith('/')||!p.includes('.',p.lastIndexOf('/'))?p.replace(/\/?$/,'/index.html'):p;
export function desktopURL(value){
 if(value===originalAI)return '/ai/index.html';
 if(value.startsWith(originalAI+'/')){const rest=value.slice(originalAI.length);return rest==='/'?'/ai/index.html':explicit(rest);}
 if(value.startsWith('https://usaco-bronze-lab.jackchen911006.chatgpt.site'))return explicit(value.replace('https://usaco-bronze-lab.jackchen911006.chatgpt.site','/usaco'));
 if(value.startsWith(originalHome))return explicit(value.replace(originalHome,'/tingjian'));
 return value;
}
export function rewriteTextAssets(text,id,entries){
 // Only known public directories/files; never touch /workspace in Python code,
 // protocol-relative URLs, external references, or arbitrary slash expressions.
 return text.replace(/(["'`(])\/([A-Za-z0-9_.-]+)(?=[/\s?#"'`)])/g,(all,quote,first)=>entries.has(first)?quote+(id==='ai'?'/ai-assets':id==='usaco'?'/usaco':'/tingjian')+'/'+first:all);
}
