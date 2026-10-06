'use client';
import {useEffect,useState} from 'react';
import {ArrowUpRight,ArrowRight,BookOpen,Workflow,Table2,Boxes,Check,ChevronRight} from 'lucide-react';
import {learningOrigin,learningSection,previewSections,safeLearningPath,type PreviewSection} from '@/lib/learning-preview';
import './ai-learning-preview.css';

const symbols={learn:BookOpen,agents:Workflow,tools:Table2,ontology:Boxes};
const checkpoints=[['读取订单','订单 PO-1024 · 120 件 · 单价 ¥108'],['核对规则','合同约定单价 ¥100，发现单价差异 ¥8'],['给出建议','标记价差 ¥960，附上合同与订单字段'],['人工复核','交由采购负责人确认，确认前不自动提交']];
const rows=[['PO-1024','华东仓','120'],['PO-1024','华东仓','120'],['PO-1025',' 华南仓 ','80']];

/** Local portfolio exhibit: no iframe, model, worker, audio or external data request. */
export default function AILearningPreview({initialPath=''}:{initialPath?:string}){
 const [selected,setSelected]=useState<PreviewSection>(()=>learningSection(initialPath)),[request,setRequest]=useState(initialPath);
 const [context,setContext]=useState([true,false,false]),[step,setStep]=useState(0),[cleaned,setCleaned]=useState(false);
 useEffect(()=>{setSelected(learningSection(initialPath));setRequest(initialPath)},[initialPath]);
 const section=previewSections.find(s=>s.id===selected)!,Icon=symbols[selected];
 const href=learningOrigin+(request?safeLearningPath(request):section.href);
 const table=cleaned?[...new Map(rows.map(r=>[r[0],r.map(v=>v.trim())])).values()]:rows;
 function choose(id:PreviewSection){setSelected(id);setRequest('')}
 return <div className="ai-exhibit">
  <header className="ai-exhibit-top"><div><span className="ai-exhibit-mark">AI</span><div><b>AI 研习所</b><small>LEARN. MAKE. UNDERSTAND.</small></div></div><a href={href} target="_blank" rel="noopener noreferrer">进入完整研习所 <ArrowUpRight size={16}/></a></header>
  <div className="ai-exhibit-layout"><aside className="ai-exhibit-nav"><span>一起，把想法做出来。</span><nav aria-label="研习所精选演示">{previewSections.map(s=>{const Glyph=symbols[s.id];return <button key={s.id} aria-pressed={selected===s.id} onClick={()=>choose(s.id)}><Glyph size={19}/><span>{s.name}</span><ChevronRight size={14}/></button>})}</nav><div className="ai-exhibit-note"><span>AI × 业务 × 创作</span><p>这里是几段可以动手的精选体验。更多课程与实验，收在完整研习所。</p></div></aside>
  <main className="ai-exhibit-main"><div className="ai-exhibit-heading"><span>{section.label}</span><h1>{section.title}</h1><p>{section.description}</p></div>
   <section className={'ai-exhibit-demo demo-'+selected} aria-label={section.name+'示例'}>
    <div className="ai-demo-caption"><span><Icon size={16}/>{selected==='ontology'?'原站界面预览':'动手试一小步'}</span><small>{selected==='ontology'?'SCENE PREVIEW':'示例演示'}</small></div>
    {selected==='learn'&&<div className="ai-context-demo"><div><h2>写一份采购审单建议</h2><p>勾选条件，看看一句话如何变成清晰的任务。</p>{['附上订单与合同资料','约定输出字段和格式','写明权限与复核边界'].map((label,i)=><label key={label}><input type="checkbox" checked={context[i]} onChange={()=>setContext(v=>v.map((x,j)=>j===i?!x:x))}/><span>{label}</span></label>)}</div><div className="ai-prompt-paper"><small>给 AI 的任务说明</small><p>请核对这份采购订单，给出审单建议。</p>{context[0]&&<p>资料：订单 PO-1024 和当前有效合同。每项判断都要引用对应字段。</p>}{context[1]&&<p>输出：问题项、证据、影响金额、建议处理人；缺失的信息标注“待补充”。</p>}{context[2]&&<p>边界：只提供建议，不能修改订单或代替业务人员审批。</p>}<footer>{context.filter(Boolean).length} / 3 项上下文已补齐</footer></div></div>}
    {selected==='agents'&&<div className="ai-agent-demo"><div className="ai-agent-order"><span>采购订单 / PO-1024</span><b>¥12,960</b><small>120 件 × ¥108 / 件</small><p>合同单价：¥100 / 件</p></div><div className="ai-agent-steps">{checkpoints.map(([label,detail],i)=><button key={label} className={step===i?'chosen':''} onClick={()=>setStep(i)} aria-pressed={step===i}><span>{i<step?<Check size={14}/>:String(i+1).padStart(2,'0')}</span><div><b>{label}</b>{step===i&&<p>{detail}</p>}</div></button>)}<button className="ai-demo-action" onClick={()=>setStep(n=>(n+1)%4)}>{step===3?'再看一遍':'查看下一步'} <ArrowRight size={16}/></button></div></div>}
    {selected==='tools'&&<div className="ai-table-demo"><div><h2>让一张表，干净一点。</h2><p>示例里有重复订单和多余空格。点一下，查看整理结果。</p><button className="ai-demo-action" onClick={()=>setCleaned(v=>!v)}>{cleaned?'还原原始数据':'去重并整理空格'} <ArrowRight size={16}/></button><small role="status">{cleaned?'已合并 1 条重复记录，去除首尾空格。':'3 条记录 · 2 个订单'}</small></div><div className="ai-table-paper"><table><thead><tr><th>订单号</th><th>仓库</th><th>数量</th></tr></thead><tbody>{table.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table><p>还可以体验会议纪要、写作助手与 PPT 工坊。</p></div></div>}
    {selected==='ontology'&&<div className="ai-spatial-demo"><img src="/works/covers/ai.webp" alt="AI 研习所原站界面预览" width={1200} height={750} decoding="async"/><div><span>从对象，到关系。</span><h2>工厂、仓库、运输，<br/>放进同一幅业务地图。</h2><p>进入原站探索 3D 场景、知识图谱和业务实验。</p><a href={href} target="_blank" rel="noopener noreferrer">探索完整实验室 <ArrowUpRight size={16}/></a></div></div>}
   </section>
   <footer className="ai-exhibit-bottom"><span>从一个小实验开始，慢慢建立自己的方法。</span><a href={href} target="_blank" rel="noopener noreferrer">继续在原站学习 <ArrowUpRight size={15}/></a></footer>
  </main></div>
 </div>
}
