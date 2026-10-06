import {AsyncLocalStorage} from 'node:async_hooks';
export const visitorContext=new AsyncLocalStorage();
// Compatibility export for reused route code. These are NEW, anonymous visitors
// to this deployment; this never impersonates ChatGPT accounts or reads Sites data.
export async function getChatGPTUser(){return visitorContext.getStore()||null}
