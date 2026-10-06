import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
export function openDatabase(directory){
 fs.mkdirSync(directory,{recursive:true,mode:0o700});
 const db=new DatabaseSync(path.join(directory,'cty.sqlite'));
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000;
 CREATE TABLE IF NOT EXISTS discussions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,author TEXT NOT NULL,parent_id TEXT,title TEXT NOT NULL,body TEXT NOT NULL,category TEXT NOT NULL,created_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS idx_discussions_parent_created ON discussions(parent_id,created_at);
 CREATE TABLE IF NOT EXISTS workshop_progress(user_id TEXT PRIMARY KEY,completed_at INTEGER NOT NULL,graph_json TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1);`);
 return {prepare(sql){const statement=db.prepare(sql);function wrapper(values=[]){return {bind(...args){return wrapper(args)},async all(){return {results:statement.all(...values)}},async first(){return statement.get(...values)||null},async run(){return statement.run(...values)}}}return wrapper()},close(){db.close()}};
}
