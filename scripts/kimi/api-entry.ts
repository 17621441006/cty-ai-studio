import * as assistant from '@/app/api/assistant/route';
import * as desktop from '@/app/api/desktop-assistant/route';
import * as research from '@/app/api/research-brief/route';
import * as video from '@/app/api/video-script/route';
import * as discussions from '@/app/api/discussions/route';
import * as workshop from '@/app/api/workshop-progress/route';
import {visitorContext} from './visitor.mjs';
import {env} from './server-env.mjs';
const routes:Record<string,{GET?:()=>Promise<Response>;POST?:(r:Request)=>Promise<Response>}>= {
 '/api/assistant':assistant,'/api/desktop-assistant':desktop,'/api/research-brief':research,
 '/api/video-script':video,'/api/discussions':discussions,'/api/workshop-progress':workshop,
};
export async function handle(request:Request,visitor:{userId:string;fullName:string},config:{key?:string;db:unknown}){
 env.OPENROUTER_API_KEY=config.key;env.DB=config.db;
 const route=routes[new URL(request.url).pathname];
 const action=request.method==='GET'?route?.GET:request.method==='POST'?route?.POST:null;
 if(!action)return Response.json({error:route?'不支持的请求方法':'接口不存在'},{status:route?405:404});
 return visitorContext.run(visitor,()=>action(request));
}
