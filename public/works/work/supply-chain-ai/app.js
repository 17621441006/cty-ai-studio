lucide.createIcons();

        // 1. Interactive AI Workbench Simulator Data
        const demoScenarios = [
            {
                title: "01 现状调研：现场照片 OCR + 语音转写 → 自动生成《现状诊断书》",
                badge: "驻场 20天 → 7天",
                img: "./images/photo-114d93314a43.jpg",
                inputLabel: "现场原始输入（车间白板照片 + 访谈录音）",
                inputDesc: "顾问在钢铁/物流客户现场拍摄业务流白板照片，移动调研助手通过多模态 OCR 与 ASR 实时提取关键实体。",
                aiOutputTitle: "AI 自动生成的《TMS/MES 现状诊断书》初稿片段：",
                aiCode: `【痛点识别】当前成品出库依赖人工调度派车，月均滞留时长 4.2 小时。\n【上下游口径】ERP 销售发货单 → WMS 波次拣货 → TMS 拆并单与运价引擎。\n【AI 缺失追问】⚠️ 检测到“越库直发(Cross-docking)”计费口径未明确，已自动生成客户追问单。`,
                gateText: "诊断书业务方签字门禁"
            },
            {
                title: "06 系统架构图：由 WBS 一键生成 C4 / 部署 / 集成架构图",
                badge: "绘图 2周 → 2天",
                img: "./images/photo-29c2a9f2e63c.jpg",
                inputLabel: "上游输入（03环节 WBS 拆解结构 + 05环节选型结果）",
                inputDesc: "告别 Visio 手工拖拽！架构生成器内嵌 PlantUML/Mermaid，自动识别与外部系统的标准接口协议。",
                aiOutputTitle: "AI 架构生成器实时输出的集成拓扑定义：",
                aiCode: `[SAP ERP] <--(REST/IDoc 经 Kafka 总线)--> [宝信 TMS 微服务]\n[宝信 MES] <--(OPC UA 边缘网关 + TDengine时序库)--> [车间 OT 轧机设备]\n[TMS 计费服务] --> 内置 Drools 规则引擎 (支持阶梯运价/拆并单分摊)`,
                gateText: "架构评审签字门禁"
            },
            {
                title: "07 & 08 原型与前端：用户故事一键生成高保真原型与 Vue/React 代码",
                badge: "原型 4周→1周 | 前端提效 70%",
                img: "./images/photo-7cd069e45b0c.jpg",
                inputLabel: "行业标准模板库（钢铁 MES 报工 / TMS 在途监控页）",
                inputDesc: "直接套用事业部沉淀的钢铁/物流统一设计系统模板，由低保真秒级渲染为可点击高保真原型并输出前端代码。",
                aiOutputTitle: "前端 Agent 自动生成的 Vue3 组件与接口桩：",
                aiCode: `<template>\n  <BaosightTmsMap :waybills="activeWaybills" @reroute="handleAiReroute" />\n  <DroolsFeePreview :ruleId="currentContract.ruleId" :manualAudit="true" />\n</template>\n// 已自动挂载 Mock 接口桩与 ESLint 规范校验`,
                gateText: "原型签字 + 代码走查门禁"
            },
            {
                title: "10 & 11 智能测试：自动生成复杂边界用例 + Nightly 自愈流水线",
                badge: "覆盖率 ×2 | 回归 25天→8天",
                img: "./images/photo-b9647e386154.jpg",
                inputLabel: "需求基线 + 代码仓库 + 历史缺陷库",
                inputDesc: "针对人工极易漏测的工业现场断网、物流拆并单计费边界，AI 自动构造仿真测试数据并在夜间流水线执行。",
                aiOutputTitle: "用例 Copilot 生成的行业专属边界测试集：",
                aiCode: `✅ [MES异常用例 #104] 边缘网关断网 15 分钟后恢复，验证 TDengine 断点续传与防重报工。\n✅ [TMS计费用例 #209] 一单三车越库拆单 + 跨省阶梯税率，验证 Drools 分摊精度误差 = 0.00元。\n✅ [Playwright UI自愈] 检测到按钮 DOM 变更，已自动修复定位器，零 P0 缺陷遗留！`,
                gateText: "零 P0 遗留签字放行"
            }
        ];

        const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
        function switchDemo(idx) {
            document.querySelectorAll('.demo-tab').forEach((btn, i) => {
                btn.className = i === idx
                    ? "demo-tab px-3 py-1 rounded-md bg-[#0052D9] text-white font-semibold transition"
                    : "demo-tab px-3 py-1 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 transition";
            });
            const d = demoScenarios[idx];
            const container = document.getElementById('demo-body');
            container.innerHTML = `
                <!-- Left Image & Input -->
                <div class="lg:col-span-5 space-y-3">
                    <div class="rounded-xl overflow-hidden h-48 relative shadow-md border border-slate-200">
                        <img src="${d.img}" class="w-full h-full object-cover" alt="场景实拍">
                        <div class="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#0052D9] text-white text-xs font-bold shadow">${d.badge}</div>
                    </div>
                    <div class="p-3.5 rounded-xl bg-white border border-slate-200">
                        <div class="text-xs font-extrabold text-slate-800 mb-1 flex items-center gap-1.5">
                            <i data-lucide="file-input" class="w-4 h-4 text-[#0052D9]"></i> ${d.inputLabel}
                        </div>
                        <p class="text-xs text-slate-500 leading-relaxed">${d.inputDesc}</p>
                    </div>
                </div>

                <!-- Right AI Output & Human Gate -->
                <div class="lg:col-span-7 space-y-4">
                    <div class="flex items-center justify-between">
                        <h4 class="font-extrabold text-slate-900 text-base">${d.title}</h4>
                        <span class="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">AI 已生成初稿</span>
                    </div>

                    <div class="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed shadow-inner">
                        <div class="text-sky-400 font-sans font-bold mb-2">${d.aiOutputTitle}</div>
                        <pre class="whitespace-pre-wrap text-emerald-300">${escapeHTML(d.aiCode)}</pre>
                    </div>

                    <!-- Interactive Human Gate Bar -->
                    <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div class="flex items-center space-x-2.5">
                            <i data-lucide="shield-check" class="w-5 h-5 text-rose-600 shrink-0"></i>
                            <div class="text-xs">
                                <span class="font-extrabold text-rose-800">红线门禁：${d.gateText}</span>
                                <span class="text-rose-600 block">AI 产物必须由顾问/业务方确认签字后，方可流入下一环节</span>
                            </div>
                        </div>
                        <button onclick="this.innerHTML='✓ 业务方已签字放行'; this.className='px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold shrink-0 transition'" class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 shadow-sm transition">
                            点击模拟人工签字放行
                        </button>
                    </div>
                </div>
            `;
            lucide.createIcons();
        }

        // 2. 12 Steps Complete Data
        const stepsData = [
            { id: "01", name: "现状调研", cat: "req", rate: 80, trad: "驻场访谈+手记（驻场2~4周，结论打架）", ai: "AI 问卷+语音转写+现场照片 OCR；大模型按 ERP/MES/TMS 调研框架自动生成《现状诊断书》初稿", tool: "移动调研助手+ASR+多模态模型", role: "AI 做纪要与初稿，顾问审核", gain: "驻场 20天 → 7天", gate: "诊断书业务方签字", checked: true },
            { id: "02", name: "需求清单结构化", cat: "req", rate: 90, trad: "Excel 零散收集", ai: "客户填标准模板，AI 校验完整性(必填/口径/上下游)，缺失自动追问", tool: "需求门户+规则引擎+LLM", role: "客户填、AI 检、人定", gain: "返工 -40%", gate: "需求基线冻结", checked: true },
            { id: "03", name: "业务板块模块拆解", cat: "req", rate: 85, trad: "靠资深顾问人脑拆", ai: "AI 按“计划-采购-库存-生产-物流-结算”参考模型输出 WBS/用户故事/优先级", tool: "业务架构知识库+RAG", role: "AI 拆、人调", gain: "3天 → 0.5天", gate: "WBS 评审会", checked: false },
            { id: "04", name: "客户补充确认", cat: "req", rate: 60, trad: "会议反复拉齐", ai: "AI 生成差异清单与影响分析，客户点选式补充，自动更新范围说明书", tool: "协同评审工作台", role: "客户点选、双方会签", gain: "会议 -50%", gate: "范围说明书 SOW", checked: false },
            { id: "05", name: "技术选型", cat: "design", rate: 70, trad: "架构师经验拍板", ai: "AI 按并发/实时性/集成度打分推荐：如 MES 实时采集选边缘网关+时序库，TMS 选规则引擎+地图服务，并给出 TCO 对比", tool: "选型 Copilot", role: "AI 推荐、人决策", gain: "选型 1周 → 1天", gate: "选型评审", checked: false },
            { id: "06", name: "系统架构图", cat: "design", rate: 75, trad: "Visio 手画", ai: "AI 由 WBS 一键生成 C4/部署/集成架构图，自动标注与 SAP/WMS/OT 设备接口", tool: "架构生成器(PlantUML/Mermaid)", role: "AI 画、人改", gain: "2周 → 2天", gate: "架构评审", checked: false },
            { id: "07", name: "原型/草图/页面流", cat: "design", rate: 85, trad: "Axure 高保真耗时", ai: "AI 由用户故事生成低保真→高保真→可点击原型，ERP 单据、MES 报工、TMS 在途页直接套行业模板", tool: "原型 Copilot+设计系统", role: "AI 出、业务点", gain: "4周 → 1周", gate: "原型签字", checked: false },
            { id: "08", name: "前端页面", cat: "dev", rate: 90, trad: "手写 Vue/React", ai: "AI 由原型+设计系统生成页面代码+接口桩，人工只调交互细节", tool: "前端 Agent+组件库", role: "AI 写、人审", gain: "提效 60~70%", gate: "走查 + Lint", checked: false },
            { id: "09", name: "后端代码", cat: "dev", rate: 85, trad: "手写 CRUD 与接口", ai: "AI 生成领域模型/接口/单据流/计费规则/单测，沉淀钢铁/物流领域包复用", tool: "后端 Agent+领域脚手架", role: "AI 写、人审核核心逻辑", gain: "提效 50~60%", gate: "单测覆盖率 ≥80%", checked: false },
            { id: "10", name: "测试用例生成", cat: "test", rate: 90, trad: "手工编写", ai: "AI 由需求+代码+历史缺陷生成功能/集成/性能用例，含 MES 异常(断网/重传)、TMS 越库/拆并单场景", tool: "用例 Copilot", role: "AI 生、人补", gain: "覆盖率 ×2", gate: "用例评审", checked: false },
            { id: "11", name: "自动化测试", cat: "test", rate: 85, trad: "人点回归", ai: "API/UI/性能流水线 nightly 执行，缺陷自动定位到提交，自愈定位器抗 UI 变化", tool: "CI+Playwright/JMeter", role: "机跑、人看报告", gain: "回归 25天 → 8天", gate: "零 P0 遗留", checked: false },
            { id: "12", name: "报告生成", cat: "test", rate: 95, trad: "周报月报手写", ai: "AI 汇总需求/代码/测试/缺陷数据，自动生成阶段报告、测试报告、验收材料", tool: "PMO Copilot", role: "AI 写、人签", gain: "文档 20% 工作量", gate: "里程碑签字", checked: false }
        ];

        function renderSteps(filter = 'all') {
            const grid = document.getElementById('steps-grid');
            grid.innerHTML = '';
            const list = filter === 'all' ? stepsData : stepsData.filter(s => s.cat === filter);

            list.forEach(s => {
                const card = document.createElement('div');
                card.className = `corp-card p-5 rounded-2xl flex flex-col justify-between cursor-pointer ${s.checked ? 'ring-2 ring-[#0052D9] bg-blue-50/30' : ''}`;
                card.onclick = (e) => { if (e.target.type !== 'checkbox') openModal(s.id); };

                card.innerHTML = `
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center space-x-2">
                                <span class="px-2.5 py-0.5 rounded-md bg-[#0052D9] text-white font-black text-xs">${s.id}</span>
                                <h4 class="font-extrabold text-slate-900 text-base">${s.name}</h4>
                            </div>
                            <label class="flex items-center space-x-1.5 text-xs text-slate-500 cursor-pointer" onclick="event.stopPropagation()">
                                <input type="checkbox" ${s.checked ? 'checked' : ''} onchange="toggleCheck('${s.id}')" class="rounded border-slate-300 text-[#0052D9] focus:ring-0">
                                <span class="font-semibold">立项勾选</span>
                            </label>
                        </div>

                        <div class="mb-3">
                            <div class="flex justify-between text-[11px] font-semibold mb-1">
                                <span class="text-slate-500">AI 承担工作量占比</span>
                                <span class="text-[#0052D9] font-extrabold">${s.rate}%</span>
                            </div>
                            <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-[#0052D9] to-sky-400 rounded-full" style="width:${s.rate}%"></div>
                            </div>
                        </div>

                        <div class="space-y-2 text-xs mb-4">
                            <div class="p-2 rounded-lg bg-slate-100 text-slate-600 truncate">
                                <strong class="text-slate-800">传统：</strong>${s.trad}
                            </div>
                            <div class="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-slate-800 line-clamp-2 leading-relaxed">
                                <strong class="text-[#0052D9]">AI 做法：</strong>${s.ai}
                            </div>
                        </div>
                    </div>

                    <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span class="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">${s.gain}</span>
                        <span class="text-rose-600 font-bold flex items-center gap-1 text-[11px]">
                            <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> ${s.gate}
                        </span>
                    </div>
                `;
                grid.appendChild(card);
            });
            lucide.createIcons();
            document.getElementById('checklist-count').innerText = `${stepsData.filter(s => s.checked).length} / 12`;
        }

        let currentStepCategory = 'all';
        function filterSteps(cat) {
            currentStepCategory = cat;
            document.querySelectorAll('.step-tab').forEach(b => {
                b.className = "step-tab px-4 py-2 rounded-xl bg-white text-slate-600 border border-slate-200 hover:border-blue-300 transition";
            });
            document.getElementById(`tab-${cat}`).className = "step-tab px-4 py-2 rounded-xl bg-[#0052D9] text-white font-bold shadow-sm transition";
            renderSteps(cat);
        }

        function toggleCheck(id) {
            const item = stepsData.find(x => x.id === id);
            if (item) item.checked = !item.checked;
            renderSteps(currentStepCategory);
        }

        function checkAllSteps() {
            const all = stepsData.every(x => x.checked);
            stepsData.forEach(x => x.checked = !all);
            renderSteps(currentStepCategory);
        }

        function openModal(id) {
            const s = stepsData.find(x => x.id === id);
            if (!s) return;
            document.getElementById('modal-content').innerHTML = `
                <div class="flex items-center space-x-3 mb-4">
                    <span class="px-3 py-1 rounded-lg bg-[#0052D9] text-white font-black text-sm">环节 ${s.id}</span>
                    <h3 class="text-2xl font-black text-slate-900">${s.name}</h3>
                    <span class="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0052D9] text-xs font-extrabold border border-blue-200">AI 渗透率 ${s.rate}%</span>
                </div>
                <div class="space-y-4 text-sm">
                    <div class="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                        <div class="text-xs text-slate-500 font-bold mb-1">传统做法：</div>
                        <div class="text-slate-800 font-medium">${s.trad}</div>
                    </div>
                    <div class="p-4 rounded-xl bg-blue-50/80 border border-blue-200">
                        <div class="text-xs text-[#0052D9] font-extrabold mb-1">AI 优化做法（具体）：</div>
                        <div class="text-slate-900 font-semibold leading-relaxed">${s.ai}</div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <div class="text-xs text-slate-500">推荐工具形态</div>
                            <div class="text-[#0052D9] font-bold mt-0.5">${s.tool}</div>
                        </div>
                        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <div class="text-xs text-slate-500">人机分工</div>
                            <div class="text-slate-900 font-bold mt-0.5">${s.role}</div>
                        </div>
                        <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                            <div class="text-xs text-emerald-700">效率/质量收益</div>
                            <div class="text-emerald-700 font-black text-base mt-0.5">${s.gain}</div>
                        </div>
                        <div class="p-3 rounded-xl bg-rose-50 border border-rose-200">
                            <div class="text-xs text-rose-600">人工终审门禁 (红线)</div>
                            <div class="text-rose-700 font-black text-base mt-0.5">${s.gate}</div>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('step-modal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('step-modal').classList.add('hidden');
        }

        // ROI Calculator
        function updateROI() {
            const b = parseInt(document.getElementById('budget-slider').value);
            const d = parseInt(document.getElementById('days-slider').value);
            document.getElementById('budget-val').innerText = `${b} 万元`;
            document.getElementById('days-val').innerText = `${d} 天`;
            const newDays = Math.round(d * (49 / 150));
            document.getElementById('calc-saved-cost').innerText = `≈ ${Math.round(b*0.5)}~${Math.round(b*0.65)}万`;
            document.getElementById('calc-new-days').innerText = `≈ ${newDays} 天`;
            document.getElementById('calc-saved-days').innerText = `提前 ${d - newDays} 天上线交付`;
        }

        function toggleFullScreen() {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
            else document.exitFullscreen?.().catch(() => {});
        }

        // ECharts Light Theme Initialization
        function initCharts() {
            // Chart 1: Cycle
            const c1 = echarts.init(document.getElementById('chart-cycle'));
            c1.setOption({
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: { data: ['传统模式 (天)', 'AI增强模式 (天)'], top: 0, textStyle: { color: '#334155', fontWeight: 'bold' } },
                grid: { left: '3%', right: '6%', bottom: '3%', top: '14%', containLabel: true },
                xAxis: { type: 'value', splitLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel: { color: '#64748B' } },
                yAxis: { type: 'category', data: ['调研与需求', '基本设计', '详细设计', '前后端开发', '测试与联调', '上线与报告'], axisLabel: { color: '#0F172A', fontWeight: 'bold' } },
                series: [
                    { name: '传统模式 (天)', type: 'bar', data: [20, 15, 20, 60, 25, 10], itemStyle: { color: '#94A3B8', borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', formatter: '{c}天', color: '#64748B' } },
                    { name: 'AI增强模式 (天)', type: 'bar', data: [7, 4, 5, 22, 8, 3], itemStyle: { color: '#0052D9', borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', formatter: '{c}天', color: '#0052D9', fontWeight: 'bold' } }
                ]
            });

            // Chart 2: Penetration
            const c2 = echarts.init(document.getElementById('chart-penetration'));
            c2.setOption({
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '2%', bottom: '15%', top: '12%', containLabel: true },
                xAxis: { type: 'category', data: stepsData.map(s => `${s.id}${s.name.substring(0,4)}`), axisLabel: { color: '#334155', interval: 0, rotate: 18, fontSize: 11, fontWeight: 600 } },
                yAxis: { type: 'value', max: 100, splitLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel: { formatter: '{value}%', color: '#64748B' } },
                series: [{
                    type: 'bar', barWidth: '45%', data: stepsData.map(s => s.rate),
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#0052D9' }, { offset: 1, color: '#38BDF8' }]),
                        borderRadius: [6, 6, 0, 0]
                    },
                    label: { show: true, position: 'top', formatter: '{c}%', color: '#0052D9', fontWeight: 'bold', fontSize: 11 }
                }]
            });
            c2.on('click', p => openModal(stepsData[p.dataIndex].id));

            // Chart 3: Cost
            const c3 = echarts.init(document.getElementById('chart-cost'));
            c3.setOption({
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: { data: ['优化前=100%', '优化后剩余占比'], top: 0, textStyle: { color: '#334155', fontWeight: 'bold' } },
                grid: { left: '3%', right: '3%', bottom: '5%', top: '16%', containLabel: true },
                xAxis: { type: 'category', data: ['需求/设计人力', '开发人力', '测试人力', '差旅/现场', '返工成本', '文档报告'], axisLabel: { color: '#0F172A', interval: 0, fontSize: 11, fontWeight: 600 } },
                yAxis: { type: 'value', max: 100, splitLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel: { formatter: '{value}%', color: '#64748B' } },
                series: [
                    { name: '优化前=100%', type: 'bar', barGap: '-100%', barWidth: '42%', data: [100, 100, 100, 100, 100, 100], itemStyle: { color: '#E2E8F0', borderRadius: [6, 6, 0, 0] } },
                    { name: '优化后剩余占比', type: 'bar', barWidth: '42%', data: [35, 40, 30, 30, 35, 20], itemStyle: { color: '#0052D9', borderRadius: [6, 6, 0, 0] }, label: { show: true, position: 'top', formatter: '{c}%', color: '#0052D9', fontWeight: 'bold' } }
                ]
            });

            window.addEventListener('resize', () => { c1.resize(); c2.resize(); c3.resize(); });
        }

        // Light-Mode 3D Architectural Mesh Background
        function initThreeLight() {
            const canvas = document.getElementById('bg-canvas');
            let renderer;
            try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false }); }
            catch { canvas.hidden = true; return; }
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
            const geo = new THREE.IcosahedronGeometry(14, 2);
            const mat = new THREE.MeshBasicMaterial({ color: 0x0052D9, wireframe: true, transparent: true, opacity: 0.06 });
            const mesh = new THREE.Mesh(geo, mat); scene.add(mesh); camera.position.z = 28;
            const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
            let active = true, request = 0, last = 0, disposed = false;
            const resize = () => {
                camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
                renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
                renderer.setSize(innerWidth, innerHeight); renderer.render(scene, camera);
            };
            function animate(now) {
                request = 0;
                if (disposed || !active || document.hidden || reducedMotion.matches) return;
                if (!last || now - last >= 32) {
                    const dt = Math.min(0.06, last ? (now-last)/1000 : 1/30); last = now;
                    mesh.rotation.y += dt * 0.06; mesh.rotation.x += dt * 0.03;
                    renderer.render(scene, camera);
                }
                request = requestAnimationFrame(animate);
            }
            const sync = () => {
                cancelAnimationFrame(request); request = 0; last = 0;
                if (!disposed && active && !document.hidden && !reducedMotion.matches) request = requestAnimationFrame(animate);
            };
            const message = event => {
                if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'cty:work-visibility') return;
                active = event.data.active === true; sync();
            };
            window.addEventListener('message', message);
            window.addEventListener('resize', resize);
            document.addEventListener('visibilitychange', sync);
            reducedMotion.addEventListener('change', sync);
            window.addEventListener('pagehide', () => {
                disposed = true; cancelAnimationFrame(request); geo.dispose(); mat.dispose(); renderer.dispose();
                window.removeEventListener('message', message); window.removeEventListener('resize', resize);
                document.removeEventListener('visibilitychange', sync); reducedMotion.removeEventListener('change', sync);
            }, {once:true});
            resize(); sync();
        }

        document.addEventListener('keydown', event => { if(event.key === 'Escape') closeModal(); });
        document.getElementById('step-modal').addEventListener('click', event => { if(event.target.id === 'step-modal') closeModal(); });
        window.addEventListener('DOMContentLoaded', () => {
            switchDemo(0);
            renderSteps('all');
            initCharts();
            initThreeLight();
        });
    