export function mobileGreeting(clock: string) {
  if (!/^\d{1,2}:\d{2}$/.test(clock)) return '你好，欢迎来到小脏的灵感星球。';
  const hour = Number(clock.split(':')[0]);
  if (hour < 6) return '夜深了，还没睡？小脏陪你看一会儿。';
  if (hour < 9) return '早上好，新的一天开始啦。';
  if (hour < 12) return '上午好，今天想创造点什么？';
  if (hour < 14) return '午间好，歇一会儿，听首歌吧。';
  if (hour < 18) return '下午好，来找一点新灵感？';
  if (hour < 22) return '晚上好，让喜欢的作品陪你一会儿。';
  return '这么晚了还没睡？小脏还在陪你。';
}
