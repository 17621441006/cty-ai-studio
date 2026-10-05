"""Browser mcpi compatibility layer. Block IDs and metadata stay separate."""
import sys, types, json, math, ast, asyncio, time as _clock
from collections import namedtuple
Vec3 = namedtuple('Vec3', 'x y z')
BlockHit = namedtuple('BlockHit', 'pos face entityId')
_blocks, _base, _dirty = {}, {}, {}
_entities, _hits = [], []
_player = [0, 1, 8]
_entities_dirty = False
_player_dirty = False
_operations = 0
_MAX_BLOCKS = 60000
_valid_ids = {0,1,2,3,4,5,8,9,10,12,17,18,20,35,41,42,45,57,79,80,89,95,98,155,24,49,174,201,209,251}
_types = ('ranger','ember','warden','jigglypuff','pikachu','charmander','kakashi','pain','skeleton','iron_golem','snow_guard','villager','chicken','fire_dragon','storm_dragon','enderman','watchling')

class Block:
    def __init__(self,id,data=0): self.id,self.data=_material(id,data)
    def __int__(self): return self.id
    def __iter__(self): return iter((self.id,self.data))
    def __repr__(self): return f'Block({self.id}, {self.data})'
    def __eq__(self,other): return isinstance(other,Block) and (self.id,self.data)==(other.id,other.data)

def _material(value,data=None):
    if isinstance(value,Block): bid,metadata=value.id,value.data
    elif isinstance(value,(tuple,list)):
        if len(value) not in (1,2): raise ValueError('材料请写成 ID 或 (ID, data)，例如 BIRCHWOOD = 5, 2。')
        bid,metadata=value[0],value[1] if len(value)==2 else 0
    else: bid,metadata=value,0
    if data is not None: metadata=data
    if isinstance(bid,bool) or int(bid)!=bid: raise ValueError('方块 ID 必须是整数。')
    if float(metadata)!=int(metadata): raise ValueError('data 必须是整数。')
    bid,metadata=int(bid),int(metadata)
    if bid not in _valid_ids: raise ValueError(f'暂不支持方块 ID {bid}，请参考方块图鉴。')
    limits={5:5,17:15,18:15,35:15,95:15,251:63}
    if metadata<0 or metadata>limits.get(bid,0): raise ValueError(f'方块 {bid} 不支持 data={metadata}。')
    return (9 if bid==8 else bid),metadata

def _flatten(values):
    for value in values:
        if isinstance(value,Block): yield value.id; yield value.data
        elif isinstance(value,(tuple,list,Vec3)): yield from _flatten(value)
        else: yield value

def _xyz(values,floor=True):
    result=tuple(float(v) for v in values)
    if len(result)!=3 or not all(math.isfinite(v) and abs(v)<=(128 if i==1 else 1200) for i,v in enumerate(result)): raise ValueError('水平坐标请保持在 ±1200，高度保持在 ±128。')
    return tuple(math.floor(v) for v in result) if floor else result

def _put(x,y,z,material):
    global _operations
    _operations+=1
    if _operations>250000: raise ValueError('连续建造超过 250000 次，请在循环中使用 sleep(0.05)。')
    p=(x,y,z)
    if p not in _blocks and len(_blocks)>=_MAX_BLOCKS: raise ValueError('作品已达到 60000 个修改位置，请缩小建造范围。')
    _blocks[p]=material;_dirty[p]=material

class Player:
    def getTilePos(self): return Vec3(*[math.floor(v) for v in _player])
    def getPos(self): return Vec3(*_player)
    def setTilePos(self,*values): self._set(values,True)
    def setPos(self,*values): self._set(values,False)
    def _set(self,values,floor):
        global _player,_player_dirty
        _player=list(_xyz(tuple(_flatten(values)),floor));_player_dirty=True

class Events:
    def pollBlockHits(self):
        result=[BlockHit(Vec3(*h['pos']),h.get('face',1),h.get('entityId',1)) for h in _hits]
        _hits.clear();return result
    def clearAll(self): _hits.clear()

class Minecraft:
    def __init__(self): self.player=Player();self.events=Events()
    @classmethod
    def create(cls,*args,**kwargs): return cls()
    def setBlock(self,*args):
        values=list(_flatten(args))
        if len(values) not in (4,5): raise TypeError('setBlock 用法：mc.setBlock(x,y,z,ID[,data]) 或 mc.setBlock(pos, MATERIAL)。')
        _put(*_xyz(values[:3]),_material(values[3],values[4] if len(values)==5 else None))
    def setBlocks(self,*args):
        values=list(_flatten(args))
        if len(values) not in (7,8): raise TypeError('setBlocks 用法：mc.setBlocks(x1,y1,z1,x2,y2,z2,ID[,data])。')
        a,b=_xyz(values[:3]),_xyz(values[3:6]);material=_material(values[6],values[7] if len(values)==8 else None)
        lo=[min(a[i],b[i]) for i in range(3)];hi=[max(a[i],b[i]) for i in range(3)]
        if math.prod(hi[i]-lo[i]+1 for i in range(3))>_MAX_BLOCKS: raise ValueError('单次区域超过 60000 个方块，请缩小尺寸。')
        for x in range(lo[0],hi[0]+1):
            for y in range(lo[1],hi[1]+1):
                for z in range(lo[2],hi[2]+1): _put(x,y,z,material)
    def getBlock(self,*args): return self.getBlockWithData(*args).id
    def getBlockWithData(self,*args):
        p=_xyz(tuple(_flatten(args)));return Block(*_blocks.get(p,_base.get(p,(0,0))))
    def getBlocks(self,*args):
        values=list(_flatten(args));a,b=_xyz(values[:3]),_xyz(values[3:]);lo=[min(a[i],b[i]) for i in range(3)];hi=[max(a[i],b[i]) for i in range(3)]
        if math.prod(hi[i]-lo[i]+1 for i in range(3))>60000: raise ValueError('读取区域过大。')
        return [self.getBlock(x,y,z) for y in range(lo[1],hi[1]+1) for x in range(lo[0],hi[0]+1) for z in range(lo[2],hi[2]+1)]
    def getHeight(self,x,z):
        x,_,z=_xyz((x,0,z));return max([y for (bx,y,bz),material in {**_base,**_blocks}.items() if bx==x and bz==z and material[0] not in (0,9)],default=-128)
    def postToChat(self,message): print(str(message)[:2000])
    def getEntities(self):
        return [types.SimpleNamespace(**e) for e in _entities]
    def spawnEntity(self,entity_type,x,y,z):
        global _entities_dirty
        if entity_type == 'snow_guard' and not getattr(self, '_assembling_snow_guard', False): raise ValueError('雪地守卫需要雪块与钻石配方，请使用 world.assemble。')
        if entity_type not in _types: raise ValueError('角色可选：'+', '.join(_types))
        if len(_entities)>=100: raise ValueError('每个世界最多 100 个角色。')
        x,y,z=_xyz((x,y,z),False);eid=max([e['id'] for e in _entities],default=0)+1
        _entities.append(dict(id=eid,type=entity_type,x=x,y=y,z=z));_entities_dirty=True;return eid

names={'AIR':0,'STONE':1,'GRASS':2,'DIRT':3,'COBBLESTONE':4,'WOOD_PLANKS':5,'WATER':9,'LAVA':10,'LAVA_STATIONARY':10,'WATER_STATIONARY':9,'SAND':12,'WOOD':17,'LEAVES':18,'GLASS':20,'WOOL':35,'GOLD_BLOCK':41,'IRON_BLOCK':42,'BRICK_BLOCK':45,'DIAMOND_BLOCK':57,'ICE':79,'SNOW_BLOCK':80,'PACKED_ICE':174,'GLOWSTONE_BLOCK':89,'STAINED_GLASS':95,'PURPUR_BLOCK':201,'END_GATEWAY':209}
block_module=types.ModuleType('mcpi.block');block_module.Block=Block
for name,value in names.items():setattr(block_module,name,Block(value))
mcpi=types.ModuleType('mcpi');mcpi.__path__=[];mcpi.block=block_module
minecraft_module=types.ModuleType('mcpi.minecraft');minecraft_module.Minecraft=Minecraft;mcpi.minecraft=minecraft_module
vec_module=types.ModuleType('mcpi.vec3');vec_module.Vec3=Vec3
sys.modules.update({'mcpi':mcpi,'mcpi.block':block_module,'mcpi.minecraft':minecraft_module,'mcpi.vec3':vec_module})

# This module is registered by the shared runtime; all calls use the same live world.
class CodeEntity:
    def __init__(self, entity_id): self.id = entity_id
    def _entity(self):
        entity = next((e for e in _entities if e['id'] == self.id), None)
        if entity is None: raise ValueError('这个召唤物已不在当前世界。')
        return entity
    @property
    def position(self):
        e = self._entity()
        return Vec3(e['x'], e['y'], e['z'])
    def move_to(self, *position):
        global _entities_dirty
        xyz = _xyz(tuple(_flatten(position)), False)
        e = self._entity()
        e.update(zip(('x','y','z'), xyz)); _entities_dirty = True
        return self
    def say(self, message):
        print(f"{self._entity()['type']} #{self.id}: {str(message)[:500]}")

class CodeWorld(Minecraft):
    def summon(self, species, *position):
        names = {'dragon':'fire_dragon', 'red_dragon':'fire_dragon', 'purple_dragon':'storm_dragon', 'monster':'enderman'}
        species = names.get(species, species)
        if species in ('fire_dragon','storm_dragon') and sum(e['type'] in ('fire_dragon','storm_dragon') for e in _entities) >= 8:
            raise ValueError('当前世界最多 8 条代码龙，请给飞行伙伴留下空间。')
        return CodeEntity(self.spawnEntity(species, *_xyz(tuple(_flatten(position)), False)))
    def recipe(self, name, *origin):
        if name not in ('iron_golem', 'snow_guard'): raise ValueError('当前可组合配方：iron_golem、snow_guard。')
        x,y,z = _xyz(tuple(_flatten(origin)))
        if name == 'snow_guard': return [(Vec3(*_xyz((x,y+dy,z))), Block(bid)) for dy,bid in [(0,80),(1,80),(2,57)]]
        return [(Vec3(*_xyz((x+dx,y+dy,z))), Block(bid)) for dx,dy,bid in [(0,0,42),(0,1,42),(-1,1,42),(1,1,42),(0,2,41)]]
    def assemble(self, name, *origin):
        global _operations
        position = _xyz(tuple(_flatten(origin)))
        if name == 'snow_guard':
            x,y,z = position
            existing = next((e for e in _entities if e['type'] == name and (e['x'],e['y'],e['z']) == position), None)
            if existing: return CodeEntity(existing['id'])
            if not (x in (961,967,973,979) and z in (685,691) and y == 13): raise ValueError('请在霜守镇指定的合成广场唤醒守卫。')
            if sum(e['type'] == name for e in _entities) >= 8: raise ValueError('霜守镇的八个守卫岗位已经齐备。')
        parts = self.recipe(name, *origin)
        missing = [p for p,b in parts if self.getBlock(p) != b.id]
        if missing: raise ValueError(f'配方未完成：还差 {len(missing)} 格。请对照 world.recipe 返回的位置与材料。')
        if len(_entities) >= 100: raise ValueError('召唤物已满，原建筑已保留。')
        if len(set(_blocks) | {tuple(p) for p,_ in parts}) > _MAX_BLOCKS or _operations+len(parts)>250000:
            raise ValueError('本次造物超过修改限额，原建筑已保留。')
        for p,_ in parts: self.setBlock(p, 0)
        self._assembling_snow_guard = name == 'snow_guard'
        try: return self.summon(name, *origin)
        finally: self._assembling_snow_guard = False
    def line(self, start, end):
        a,b = _xyz(start),_xyz(end)
        steps = max(abs(b[i]-a[i]) for i in range(3))
        if steps > 256: raise ValueError('line 最多跨越 256 格。')
        return [Vec3(*(round(a[j]+(b[j]-a[j])*i/max(1,steps)) for j in range(3))) for i in range(steps+1)]
    def ring(self, center, radius, count=12):
        x,y,z = _xyz(center)
        if not isinstance(count,int) or isinstance(count,bool) or not 3 <= count <= 128: raise ValueError('ring 的数量应为 3～128。')
        if not isinstance(radius,(int,float)) or not math.isfinite(radius) or not 1 <= radius <= 64: raise ValueError('半径应为 1～64 格。')
        return [Vec3(*_xyz((round(x+radius*math.cos(i*2*math.pi/count)),y,round(z+radius*math.sin(i*2*math.pi/count))))) for i in range(count)]

codecraft = types.ModuleType('codecraft')
codecraft.world = CodeWorld()
codecraft.Vec3 = Vec3
codecraft.block = block_module
codecraft.__version__ = '0.1'
sys.modules['codecraft'] = codecraft
sys.modules['codecraft.block'] = block_module

def _reset_world():
    global _blocks,_base,_dirty,_entities,_hits,_player,_operations,_entities_dirty,_player_dirty
    _blocks={};_base={};_dirty={};_entities=[];_hits=[];_player=[0,1,8];_operations=0;_entities_dirty=False;_player_dirty=False

def _configure_world(value):
    global _blocks,_base,_entities,_player
    _reset_world();data=json.loads(value)
    _base={tuple(v[:3]):(v[3],v[4] if len(v)>4 else 0) for v in data.get('base',[])}
    seed=data.get('world',{});_blocks={tuple(v[:3]):(v[3],v[4] if len(v)>4 else 0) for v in seed.get('blocks',[])}
    _entities=seed.get('entities',[]);_player=list(data.get('player') or seed.get('player') or [0,1,8])

def _apply_input(value):
    global _player
    data=json.loads(value)
    if 'player' in data and not _player_dirty: _player=list(data['player'])
    for v in data.get('blocks',[]):_blocks[tuple(v[:3])]=(v[3],v[4] if len(v)>4 else 0)
    for v in data.get('terrain',[]):
        p=tuple(v[:3])
        if v[3]:_base[p]=(v[3],v[4] if len(v)>4 else 0)
        else:_base.pop(p,None)
    for v in data.get('protected',[]):
        p=tuple(v[:3]);_blocks.pop(p,None);_dirty.pop(p,None)
        if v[3]:_base[p]=(v[3],v[4] if len(v)>4 else 0)
        else:_base.pop(p,None)
    if 'hit' in data:_hits.append(data['hit']);del _hits[:-100]

def _export_world():return json.dumps({'blocks':[[*p,*material] for p,material in _blocks.items()],'entities':_entities,'player':_player})

def _export_delta():
    global _entities_dirty,_player_dirty
    result={'blocks':[[*p,*material] for p,material in _dirty.items()]}
    if _entities_dirty:result['entities']=_entities
    if _player_dirty:result['player']=_player
    _dirty.clear();_entities_dirty=False;_player_dirty=False
    return json.dumps(result)

_bridge=None
_last_tick=0
_tick_count=0
async def _bc_runtime_checkpoint():
    global _last_tick,_tick_count,_operations
    _tick_count+=1
    # Yield by elapsed work, not every 32 tiny voxel operations.
    # Large models remain cancellable without adding seconds of artificial waits.
    if _tick_count%64:return
    if _clock.monotonic()-_last_tick<0.045:return
    if _bridge:_bridge(_export_delta())
    _last_tick=_clock.monotonic();_operations=0
    await asyncio.sleep(0.005)

async def _bc_runtime_sleep(delay):
    global _operations
    delay=float(delay)
    if not math.isfinite(delay) or delay<0:raise ValueError('sleep 的等待时间需要是非负有限数。')
    if _bridge:_bridge(_export_delta())
    _operations=0
    await asyncio.sleep(max(0.005,delay))

def _compile_live(source):
    """Cooperate at loops/sleep; ordinary mcpi calls and globals keep Python semantics."""
    tree=ast.parse(source,'main.py','exec');sleep_names={'sleep'};time_names={'time'}
    for node in ast.walk(tree):
        if isinstance(node,ast.ImportFrom) and node.module=='time':
            for alias in node.names:
                if alias.name=='sleep':sleep_names.add(alias.asname or alias.name)
        if isinstance(node,ast.Import):
            for alias in node.names:
                if alias.name=='time':time_names.add(alias.asname or alias.name)
    def is_sleep(node):
        return isinstance(node,ast.Call) and ((isinstance(node.func,ast.Name) and node.func.id in sleep_names) or (isinstance(node.func,ast.Attribute) and node.func.attr=='sleep' and isinstance(node.func.value,ast.Name) and node.func.value.id in time_names))
    functions={node.name:node for node in ast.walk(tree) if isinstance(node,ast.FunctionDef)}
    asynchronous={name for name,node in functions.items() if any(isinstance(n,ast.While) or is_sleep(n) for n in ast.walk(node))}
    while True:
        expanded=asynchronous|{name for name,node in functions.items() if any(isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id in asynchronous for n in ast.walk(node))}
        if expanded==asynchronous:break
        asynchronous=expanded
    class Cooperate(ast.NodeTransformer):
        enabled=True
        def visit_FunctionDef(self,node):
            old=self.enabled;self.enabled=node.name in asynchronous
            node.body=[self.visit(n) for n in node.body];self.enabled=old
            if node.name in asynchronous:
                if any(isinstance(n,(ast.Yield,ast.YieldFrom)) for n in ast.walk(node)):raise SyntaxError('带 yield 的生成器请不要使用阻塞式循环。')
                result=ast.AsyncFunctionDef(name=node.name,args=node.args,body=node.body,decorator_list=node.decorator_list,returns=node.returns,type_comment=node.type_comment,type_params=getattr(node,'type_params',[]));return ast.copy_location(result,node)
            return node
        def visit_AsyncFunctionDef(self,node):
            old=self.enabled;self.enabled=True;node.body=[self.visit(n) for n in node.body];self.enabled=old;return node
        def visit_Lambda(self,node):return node
        def visit_Call(self,node):
            node=self.generic_visit(node)
            if self.enabled and is_sleep(node):return ast.copy_location(ast.Await(ast.Call(ast.Name('_bc_runtime_sleep',ast.Load()),node.args,node.keywords)),node)
            if self.enabled and isinstance(node.func,ast.Name) and node.func.id in asynchronous:return ast.copy_location(ast.Await(node),node)
            return node
        def loop(self,node):
            node=self.generic_visit(node)
            if self.enabled:node.body.insert(0,ast.copy_location(ast.Expr(ast.Await(ast.Call(ast.Name('_bc_runtime_checkpoint',ast.Load()),[],[]))),node))
            return node
        visit_For=loop
        visit_While=loop
    tree=ast.fix_missing_locations(Cooperate().visit(tree))
    return compile(tree,'main.py','exec',flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
