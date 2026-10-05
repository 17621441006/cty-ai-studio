import {loadPyodide} from './pyodide.mjs';
let runtime,logCount=0,running=false;
const ready=(async()=>{
 runtime=await loadPyodide({indexURL:new URL('./',import.meta.url).href,stdout:text=>{if(logCount++<100)self.postMessage({type:'stdout',text:text.slice(0,2000)});},stderr:()=>{}});
 const response=await fetch(new URL('./mcpi_shim.py',import.meta.url));if(!response.ok)throw new Error('无法加载方块编程接口');
 runtime.runPython(await response.text());
 runtime.globals.set('_bridge',serialized=>{const delta=JSON.parse(serialized);if(delta.blocks.length||delta.entities||delta.player)self.postMessage({type:'patch',delta});});
 self.postMessage({type:'ready'});return runtime;
})();
ready.catch(error=>self.postMessage({type:'init-error',error:String(error)}));
setInterval(()=>{if(running)self.postMessage({type:'heartbeat'});},500);
self.onmessage=async({data})=>{
 if(data.type==='input'&&runtime&&running){runtime.globals.set('_bc_input',JSON.stringify(data.input));runtime.runPython('_apply_input(_bc_input)');return;}
 if(data.type!=='run'||running)return;
 let globals;
 try{
  const py=await ready;running=true;logCount=0;self.postMessage({type:'started'});
  py.globals.set('_bc_config',JSON.stringify(data));py.runPython('_configure_world(_bc_config)');
  py.globals.set('_bc_source',data.code);
  globals=py.runPython("{'__name__':'__main__','_bc_runtime_checkpoint':_bc_runtime_checkpoint,'_bc_runtime_sleep':_bc_runtime_sleep}");
  const compiled=py.runPython('_compile_live(_bc_source)');globals.set('_bc_compiled',compiled);compiled.destroy();
  const start=performance.now();
  await py.runPythonAsync('import inspect\n_bc_result=eval(_bc_compiled,globals())\nif inspect.isawaitable(_bc_result):\n    await _bc_result',{globals});
  py.runPython('_bridge(_export_delta())');
  self.postMessage({type:'result',world:JSON.parse(py.runPython('_export_world()')),concepts:JSON.parse(py.runPython("json.dumps(list({type(n).__name__ for n in ast.walk(ast.parse(_bc_source))}))")),elapsed:Math.round(performance.now()-start)});
 }catch(error){if(runtime)runtime.runPython('_bridge(_export_delta())');self.postMessage({type:'error',error:String(error.message||error)});}
 finally{running=false;globals?.destroy();}
};
