export const learningOrigin='https://ai-cat.jackchen911006.chatgpt.site';
export function safeLearningPath(path:string){return /^\/(?:$|(?:learn|ontology|projects|products|tools|coding|agents|models|resources|guides|roadmap|community|glossary|industry|work|business|library)(?:[?#]|$))/.test(path)?path:'/'}
export const learningUrl=(path:string)=>learningOrigin+safeLearningPath(path);
