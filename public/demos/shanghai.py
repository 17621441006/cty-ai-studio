# 上海中心：圆角三角形、120° 扭转、收分玻璃幕墙
from mcpi.minecraft import Minecraft
from time import sleep
import math
mc = Minecraft.create()
HEIGHT = 118
TWIST = math.radians(120)
RADIUS = 14
SPEED = 0.042     # 每层建造间隔；调大可以慢慢看
GLASS = 95, 3
SEAM = 95, 9

mc.setBlocks(-43, 0, -37, 43, 0, 40, 1)
mc.setBlocks(-43, 1, 29, 43, 1, 40, 9)
mc.setBlocks(-43, 1, 26, 43, 1, 28, 155)
mc.setBlocks(-22, 1, -21, 22, 2, 21, 98)
# 小尺度街区衬出主楼的高度
for bx, bz, height in [(-32,-23,17),(32,-24,23),(-32,9,11),(31,10,14)]:
    mc.setBlocks(bx-5, 1, bz-5, bx+5, height, bz+5, 95, 8)
    for y in range(3, height, 4):
        mc.setBlocks(bx-5, y, bz-5, bx+5, y, bz-5, 95, 7)
    mc.setBlocks(bx-5, height+1, bz-5, bx+5, height+1, bz+5, 98)
sleep(0.25)

# 三次谐波让三个圆角和三个内凹边清晰可辨。
# 顶端沿同一轮廓渐低收口，不再叠成一个白色尖帽。
for y in range(3, HEIGHT+1):
    t = (y-3)/(HEIGHT-3)
    r = RADIUS * (1-0.48*t)
    for i in range(240):
        a = i*math.tau/240
        crown = HEIGHT-6 + round(6*math.cos(a-0.7))
        if y > crown:
            continue
        radius = r * (1+0.21*math.cos(3*a))
        angle = a + t*TWIST
        x = round(radius*math.cos(angle))
        z = round(radius*math.sin(angle))
        # 顺着楼体扭转的三根竖向收边，而不是粗白横圈
        edge = abs(math.sin(1.5*a)) < 0.055
        material = SEAM if edge or y % 13 == 0 else GLASS
        if y >= crown-1:
            material = 95, 8
        mc.setBlock(x, y, z, material)
    if y % 16 == 0:
        mc.postToChat('玻璃幕墙建造中：' + str(round(t*100)) + '%')
    sleep(SPEED)
# 冠部的内部机房，低于外侧的斜口冠顶
mc.setBlocks(-4, HEIGHT-13, -4, 4, HEIGHT-7, 4, 95, 8)
mc.setBlocks(-2, HEIGHT-6, -2, 2, HEIGHT-5, 2, 20)
print('上海中心已建成。试试把 TWIST 改成 90°，比较旋转轮廓。')

# 场景边缘保留树木与绿地，主体建好后仍能看见环境尺度。
for tx, tz, height in [(-37, -9, 9), (-27, -3, 8), (-38, 19, 7), (-28, 20, 8), (27, 20, 8), (38, 18, 9), (38, -7, 10), (24, -31, 8), (-21, -31, 7)]:
    mc.setBlocks(tx,1,tz,tx,height,tz,17)
    for layer in range(4):
        radius = 3-layer//2
        for dx in range(-radius,radius+1):
            for dz in range(-radius,radius+1):
                if abs(dx)+abs(dz) <= radius+1:
                    mc.setBlock(tx+dx,height-2+layer,tz+dz,18)
