# 展览示例：太和殿意象 · 重檐、台基与中轴院落
from mcpi.minecraft import Minecraft
from time import sleep

mc = Minecraft.create()
ROOF = 41          # 金色屋顶；可改为 95, 3
RED = 35, 14
STONE = 155
STEP = 0.11       # 每一层的建造间隔，可调快或调慢

def roof(cx, y, cz, width, depth):
    # 每一圈收进一格，生成重叠的坡屋面
    for tier in range(min(8, depth)):
        mc.postToChat("铺设琉璃瓦：第 " + str(tier+1) + " 层")
        w, d = width-tier, depth-tier
        for x in range(-w, w+1):
            mc.setBlock(cx+x, y+tier, cz-d, ROOF)
            mc.setBlock(cx+x, y+tier, cz+d, ROOF)
        for z in range(-d, d+1):
            mc.setBlock(cx-w, y+tier, cz+z, ROOF)
            mc.setBlock(cx+w, y+tier, cz+z, ROOF)
        sleep(STEP)
    mc.setBlocks(cx-width+7, y+8, cz-1,
                 cx+width-7, y+8, cz+1, ROOF)

def hall(cx, cz, base, w, d):
    # 逐层升起红墙、立柱和檐下彩绘，让过程完整可见
    for height in range(11):
        for z in [-d+2, d-2]:
            if height < 9:
                mc.setBlocks(cx-w+2, base+height, cz+z,
                             cx+w-2, base+height, cz+z, RED)
        for x in [-w+2, w-2]:
            if height < 9:
                mc.setBlocks(cx+x, base+height, cz-d+2,
                             cx+x, base+height, cz+d-2, RED)
        for x in range(-w, w+1, 5):
            for z in [-d, d]:
                mc.setBlock(cx+x, base+height, cz+z,
                            (35, 9) if height == 10 else RED)
        sleep(STEP)
    roof(cx, base+10, cz, w+4, d+4)
    mc.setBlocks(cx-w+5, base+16, cz-d+5,
                 cx+w-5, base+19, cz+d-5, RED)
    roof(cx, base+20, cz, w, d)

# 整个院落与三层汉白玉台基
mc.setBlocks(-56, 0, -44, 56, 0, 48, 1)
mc.setBlocks(-12, 1, -42, 12, 1, 46, STONE)
for level in range(3):
    w, d = 38-level*3, 24-level*3
    mc.setBlocks(-w, 1+level*2, -d-10,
                 w, 2+level*2, d-10, STONE)
    for x in range(-w, w+1, 4):
        for z in [-d-10, d-10]:
            mc.setBlocks(x, 3+level*2, z,
                         x, 4+level*2, z, STONE)
    mc.postToChat("汉白玉台基：第 " + str(level+1) + " 层")
    sleep(0.4)

mc.postToChat("主殿：立柱、下檐、上檐")
hall(0, -10, 7, 27, 13)
mc.postToChat("建造两侧配殿")
hall(-43, 24, 1, 10, 8)
hall(43, 24, 1, 10, 8)

# 仪门、红墙与宫灯
for x in [-55, 55]:
    mc.setBlocks(x, 1, -43, x, 5, 47, RED)
    mc.setBlocks(x-1, 6, -43, x+1, 6, 47, ROOF)
for i in range(8):
    mc.setBlocks(-7, 1, 28-i*2, 7, 1+i, 29-i*2, STONE)
for x in [-21, 21]:
    for z in [22, 34, 44]:
        mc.setBlocks(x, 1, z, x, 5, z, 17)
        mc.setBlocks(x-1, 6, z-1, x+1, 7, z+1, 89)
print("重檐与院落已建成。试试更换 ROOF 的方块材料。")

# 场景边缘保留树木与绿地，主体建好后仍能看见环境尺度。
for tx, tz, height in [(-48, -35, 10), (-46, -18, 8), (47, -34, 10), (47, -16, 8)]:
    mc.setBlocks(tx,1,tz,tx,height,tz,17)
    for layer in range(4):
        radius = 3-layer//2
        for dx in range(-radius,radius+1):
            for dz in range(-radius,radius+1):
                if abs(dx)+abs(dz) <= radius+1:
                    mc.setBlock(tx+dx,height-2+layer,tz+dz,18)
