/** Small, opaque moon-engraved buckler. Shared by the game and its cover. */
export function drawMoonShield(ctx, x, y, scale = 1, time = 0) {
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 // Layered metal edge, rather than a translucent umbrella or full-body bubble.
 ctx.fillStyle='#695135';ctx.beginPath();ctx.ellipse(0,1.1,10,4.5,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#eed29b';ctx.beginPath();ctx.ellipse(0,0,10,4.5,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#997144';ctx.beginPath();ctx.ellipse(0,0,8.4,3.25,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#614732';ctx.beginPath();ctx.ellipse(0,.35,7.3,2.55,0,0,Math.PI*2);ctx.fill();
 // Ivory crescent inlay and little brass rivets read clearly at pixel scale.
 ctx.fillStyle='#fff0c7';ctx.beginPath();ctx.ellipse(-.4,-.2,2.6,2.15,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#614732';ctx.beginPath();ctx.ellipse(.7,-.75,2.15,1.65,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff1c8';for(const [a,b] of [[-8.5,0],[8.5,0],[0,-3.5],[0,3.5]])ctx.fillRect(a-.5,b-.4,1,.8);
 ctx.globalAlpha=.5+.3*Math.sin(time*1.8);ctx.fillRect(-5,-3.3,3,.7);ctx.fillRect(4,2.8,2,.6);ctx.restore();
}
export function drawShieldPickup(ctx,x,y) {
 ctx.save();ctx.translate(x,y);ctx.fillStyle='#715237';ctx.strokeStyle='#f4d69c';ctx.lineWidth=.8;
 ctx.beginPath();ctx.moveTo(-4,-4);ctx.lineTo(4,-4);ctx.lineTo(3.5,1);ctx.quadraticCurveTo(2,4,0,5);ctx.quadraticCurveTo(-2,4,-3.5,1);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#fff1c8';ctx.beginPath();ctx.arc(0,-.5,2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#715237';ctx.beginPath();ctx.arc(.9,-1.1,1.6,0,Math.PI*2);ctx.fill();ctx.restore();
}
