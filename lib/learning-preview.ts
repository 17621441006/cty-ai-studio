export const learningOrigin='https://ai-cat.jackchen911006.chatgpt.site';
export const previewSections=[
 {id:'learn',name:'学习启航',label:'01 / LEARN',title:'把上下文，交代清楚。',description:'不只学提示词，更学会管理资料、边界与交付标准。',href:'/learn?lesson=context'},
 {id:'agents',name:'智能体工坊',label:'02 / BUILD',title:'让每一步，都有依据。',description:'以采购审单为例，把模型建议、业务规则与人工复核连起来。',href:'/agents'},
 {id:'tools',name:'办公工具',label:'03 / CREATE',title:'从手边的小事，开始提效。',description:'会议记录、表格整理、文档写作与 PPT，在同一个工作台里练习。',href:'/tools'},
 {id:'ontology',name:'3D 实验室',label:'04 / EXPLORE',title:'看见业务之间的关系。',description:'从仓储、运输到工厂，用三维场景理解供应链中的对象与关系。',href:'/ontology'},
] as const;
export type PreviewSection=typeof previewSections[number]['id'];
export function safeLearningPath(path:string){return /^\/(?:$|(?:learn|ontology|projects|products|tools|coding|agents|models|resources|guides|roadmap|community|glossary|industry|work|business|library)(?:[?#]|$))/.test(path)?path:'/'}
export function learningSection(path:string):PreviewSection{const route=safeLearningPath(path).split(/[?#]/)[0];return route==='/ontology'?'ontology':['/agents','/products','/projects','/coding','/models','/industry'].includes(route)?'agents':['/tools','/work','/business'].includes(route)?'tools':'learn'}
