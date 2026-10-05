# 召唤两种原项目方块龙：红龙和紫色风暴龙
from codecraft import world
from time import sleep
import math
world.setBlocks(-16, 0, -16, 16, 0, 16, 98)
for p in world.ring((0, 1, 0), 12, 24):
    world.setBlock(p, 89)
red = world.summon('fire_dragon', -5, 1, 0)
storm = world.summon('storm_dragon', 5, 1, 0)
print('两条龙已召唤。用 move_to 控制它们的位置。')
sleep(1)
# 缓缓升空，再绕着召唤阵飞行一圈
for step in range(150):
    angle = step/149 * math.tau
    height = 1 + min(4, step*0.08)
    red.move_to(math.cos(angle)*7, height, math.sin(angle)*7)
    storm.move_to(math.cos(angle+math.pi)*7, height+1, math.sin(angle+math.pi)*7)
    sleep(0.06)
print('试试改动半径、飞行高度，或只召唤你最喜欢的一条龙。')
