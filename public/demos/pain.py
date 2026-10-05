# 原项目佩恩与卡卡西：展示比例放大，脚底贴合台面，向前走近镜头
from codecraft import world
from time import sleep
world.setBlocks(-10, 0, -9, 10, 0, 9, 98)
world.setBlocks(-4, 1, -4, 4, 1, 4, 155)
for p in world.ring((0, 1, 0), 7, 12):
    world.setBlocks(p.x, 1, p.z, p.x, 2, p.z, 89)
pain = world.summon('pain', -2, 2, -2)
kakashi = world.summon('kakashi', 2, 2, -2)
pain.say('这一次，用代码重建木叶。')
sleep(1)
for step in range(50):
    pain.move_to(-2, 2, -2+step*0.06)
    kakashi.move_to(2, 2, -2+step*0.06)
    sleep(0.06)
print('把 pain 改成 kakashi，或在其他坐标召唤伙伴。')

# 场景边缘保留树木与绿地，主体建好后仍能看见环境尺度。
for tx, tz, height in [(-8, -7, 4), (8, -7, 5), (-8, 5, 4), (8, 5, 4)]:
    world.setBlocks(tx,1,tz,tx,height,tz,17)
    for layer in range(4):
        radius = 3-layer//2
        for dx in range(-radius,radius+1):
            for dz in range(-radius,radius+1):
                if abs(dx)+abs(dz) <= radius+1:
                    world.setBlock(tx+dx,height-2+layer,tz+dz,18)
