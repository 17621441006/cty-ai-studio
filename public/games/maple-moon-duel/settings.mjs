export function getSetting(key,fallback){try{return sessionStorage.getItem('moon:'+key)??fallback}catch{return fallback}}
export function setSetting(key,value){try{sessionStorage.setItem('moon:'+key,String(value))}catch{}}
