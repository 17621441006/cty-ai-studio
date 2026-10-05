# 方块脏脏包：圆脸、短宽坐姿、蓬松白胸毛与卷在身侧的大尾巴
from codecraft import world
from time import sleep
import math

ORANGE = 35, 1
HONEY = 5, 0
GINGER = 5, 4
STRIPE = 35, 12
CREAM = 35, 0
WHITE = 155
PINK = 35, 6
SPEED = 0.045     # 每一层的间隔，修改这里控制建造速度

world.setBlocks(-34, 0, -26, 34, 0, 27, 2)
world.setBlocks(-27, 1, -19, 27, 1, 21, 98)
world.setBlocks(-25, 2, -17, 25, 2, 19, 155)

def ellipsoid(x, y, z, cx, cy, cz, rx, ry, rz):
    return ((x-cx)/rx)**2+((y-cy)/ry)**2+((z-cz)/rz)**2

def grain(x, y, z):
    # 相邻的几个方块形成一簇毛，避免满身零碎噪点
    return ((x//2)*17+(y//3)*23+(z//2)*11) % 13

for y in range(3, 50):
    for x in range(-25, 23):
        for z in range(-14, 20):
            color = None
            tuft = 0.05 if grain(x,y,z) < 4 else -0.015
            # 短宽的身体、坐下的后腿和两只并拢的前爪
            body = ellipsoid(x,y,z,0,17,-1,12,15,10)
            haunch = ellipsoid(abs(x),y,z,9,11,-1,7,9,9)
            arm = ellipsoid(abs(x),y,z,7,13,7,3.8,10,4.2)
            paw = ellipsoid(abs(x),y,z,6,5,10,4,2.7,4.3)
            if min(body,haunch,arm,paw) <= 1+tuft:
                color = HONEY if grain(x,y,z) < 3 else ORANGE
                if abs(x) >= 10 and (y+int(z/3)) % 10 < 2:
                    color = GINGER
                if paw <= 1.03 or (y <= 7 and arm <= 1):
                    color = WHITE if grain(x,y,z) < 6 else CREAM
            # 蓬松尾巴在左侧卷回身前；坐姿从侧面也能辨认
            tail = ((math.sqrt(((x+16)/1.13)**2+(y-10)**2)-5.0)/3.1)**2+((z-1)/4.7)**2
            if tail <= 1 and x <= -10 and y <= 17:
                color = GINGER if (y+x//3) % 8 < 2 else ORANGE
            # 圆而宽的头和外扩的脸颊，保留波斯猫的扁脸轮廓
            head = ellipsoid(x,y,z,0,34,1,15,11.5,11)
            cheek = ellipsoid(abs(x),y,z,10,30,6,6.5,7.5,7)
            if min(head,cheek) <= 1+tuft:
                color = HONEY if grain(x,y,z) < 3 else ORANGE
                if y >= 39 and z >= 7 and (abs(x) <= 1 or 5 <= abs(x) <= 6 or 10 <= abs(x) <= 11):
                    color = GINGER
                if abs(x) >= 11 and 28 <= y <= 35 and (y+int(abs(x)/3)) % 6 < 2:
                    color = STRIPE
            # 宽根尖耳，粉色内耳朝前，避免长成兔耳朵
            if 41 <= y <= 49:
                half = (50-y)*0.50
                if abs(abs(x)-10.5) <= half and abs(z-1) <= max(1,half*.66):
                    color = ORANGE if grain(x,y,z) > 2 else HONEY
                    if 43 <= y <= 47 and z >= 2 and abs(abs(x)-10.5) < half-1:
                        color = PINK
            # 多层立体胸毛向下收尖，白毛不是贴在肚子上的矩形
            bib_width = 3.0+(y-8)*0.33
            bib = ellipsoid(x,y,z,0,20,8,9.5,13.5,6.5)
            if 8 <= y <= 32 and abs(x) <= bib_width+tuft*15 and bib <= 1+tuft:
                color = WHITE if grain(x,y,z) < 7 else CREAM
            # 嘴套两侧鼓起，中央粉鼻子，微微下垂的小嘴
            if min(ellipsoid(x,y,z,-3.4,31,12,4.7,3.2,4),ellipsoid(x,y,z,3.4,31,12,4.7,3.2,4)) <= 1:
                color = WHITE
            # 眼睛嵌入圆脸表面，不能变成向前突出的方形眼镜。
            eye_front = round(1+11*math.sqrt(max(0,1-(x/15)**2-((y-34)/11.5)**2)))
            if 10 <= z <= eye_front+1 and 33 <= y <= 38:
                dx = abs(x)-6
                dy = y-36
                if dx*dx/7+dy*dy/6 <= 1:
                    color = STRIPE
                    if dx*dx/4.5+dy*dy/3.8 <= 1:
                        color = (35,4)
                    if dx == 0 and abs(dy) <= 1:
                        color = (35,15)
                    if dx == -1 and dy == 1:
                        color = WHITE
            if abs(x) <= 2 and 32 <= y <= 33 and 15 <= z <= 17:
                color = PINK if y == 33 else GINGER
            if z >= 15 and z <= 16 and ((x == 0 and 30 <= y <= 31) or (abs(x) <= 2 and y == 29)):
                color = STRIPE
            if color is not None:
                world.setBlock(x,y,z,color)
    if y % 10 == 0:
        print('正在搭建脏脏包的毛簇：第',y,'层')
    sleep(SPEED)
# 脸侧短短的浅色胡须，沿着脸颊向外展开
for side in [-1,1]:
    for yy in [29,31]:
        for k in range(5):
            world.setBlock(side*(7+k),yy+k//3,14-k//3,CREAM)
print('方块脏脏包完成！拖动看看坐姿、胸毛和卷尾。')

# 场景边缘保留树木与绿地，主体建好后仍能看见环境尺度。
for tx, tz, height in [(-30, -18, 8), (30, -17, 9), (-30, 19, 6), (30, 19, 6)]:
    world.setBlocks(tx,1,tz,tx,height,tz,17)
    for layer in range(4):
        radius = 3-layer//2
        for dx in range(-radius,radius+1):
            for dz in range(-radius,radius+1):
                if abs(dx)+abs(dz) <= radius+1:
                    world.setBlock(tx+dx,height-2+layer,tz+dz,18)
