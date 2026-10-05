# 木叶原场景中的火影大楼：红色圆楼、金色重檐与灰色圆顶
from codecraft import world
from time import sleep
import math
RADIUS = 20
RED = 35, 14
ROOF = 41
STONE = 98
world.setBlocks(-36, 0, -29, 36, 0, 32, 2)
world.setBlocks(-30, 1, -24, 30, 1, 26, STONE)
world.setBlocks(-5, 1, 22, 5, 1, 32, 24)

def drum(cx, cz, radius, top):
    # 把墙面、窗带、每个楼层逐层建造
    for y in range(2, top+1):
        r = radius if y < top-7 else radius-3
        for i in range(240):
            a = i*math.tau/240
            x, z = round(r*math.cos(a)), round(r*math.sin(a))
            material = RED
            if y % 9 == 0:
                material = STONE
            if y % 9 in [5,6] and i % 40 < 30:
                material = 95, 9
            if abs(x) < 3 and z >= r-1 and y < 8:
                material = 17
            world.setBlock(cx+x, y, cz+z, material)
        sleep(0.055)
    # 宽大的金色环檐，与原场景的轮廓一致
    for base, r in [(9, radius+3), (top-7, radius+1)]:
        for tier in range(4):
            for rr in range(r-tier-1, r-tier+1):
                for i in range(240):
                    a = i*math.tau/240
                    world.setBlock(cx+round(rr*math.cos(a)), base+tier,
                                   cz+round(rr*math.sin(a)), ROOF)
            sleep(0.11)
    for x in range(-radius+3, radius-2):
        for z in range(-radius+3, radius-2):
            if x*x+z*z <= (radius-3)**2:
                world.setBlock(cx+x, top+1, cz+z, STONE)
    sleep(0.2)

print('建造主楼：红墙、窗带、金檐、圆顶')
drum(0, -3, RADIUS, 30)
print('建造右侧圆形附楼')
drum(23, 0, 10, 20)
# 顶层石柱与中央门额
for p in world.ring((0, 32, -3), 10, 6):
    world.setBlocks(p.x-1, p.y, p.z-1, p.x+1, p.y+7, p.z+1, STONE)
FIRE = ['001000100','000101000','100010001','010010010',
        '000111000','001010100','010000010','100000001']
world.setBlocks(-5, 22, 14, 5, 31, 15, 155)
for row, line in enumerate(FIRE):
    for col, pixel in enumerate(line):
        if pixel == '1':
            world.setBlock(col-4, 30-row, 16, RED)
print('火影大楼已建成。在「尘路」里可以骑龙参观原来的木叶村。')

# 场景边缘保留树木与绿地，主体建好后仍能看见环境尺度。
for tx, tz, height in [(-30, -21, 11), (-30, 1, 10), (-30, 20, 9), (-16, -24, 10), (14, -24, 9)]:
    world.setBlocks(tx,1,tz,tx,height,tz,17)
    for layer in range(4):
        radius = 3-layer//2
        for dx in range(-radius,radius+1):
            for dz in range(-radius,radius+1):
                if abs(dx)+abs(dz) <= radius+1:
                    world.setBlock(tx+dx,height-2+layer,tz+dz,18)
