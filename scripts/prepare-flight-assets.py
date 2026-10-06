"""Offline flight assets. Run with Python 3 + Pillow; originals stay untouched.

Model welding compares every Float32/Uint16 attribute, including skin weights.
Only untextured, coplanar unit faces are merged in the village. All textured
landmark faces are copied verbatim. BCF4 is a lossless byte-plane encoding.
"""
import gzip
import hashlib
import json
import struct
from collections import defaultdict
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public/works/minecraft"
FORMATS = {"Float32Array": "f", "Uint16Array": "H", "Uint32Array": "I"}


def save_gzip(path, data):
    path.write_bytes(gzip.compress(data, compresslevel=9, mtime=0))
    return path.stat().st_size


def pack_kakashi():
    folder = ASSETS / "models/kakashi"
    model = json.loads(gzip.decompress((folder / "kakashi.json.gz").read_bytes()))
    binary = bytearray()
    before = after = 0
    for geometry in model["geometries"]:
        data = geometry["data"]
        attrs = data["attributes"]
        count = len(attrs["position"]["array"]) // 3
        before += count
        streams = [struct.pack("<" + FORMATS[a["type"]] * len(a["array"]), *a["array"]) for a in attrs.values()]
        strides = [struct.calcsize(FORMATS[a["type"]]) * a["itemSize"] for a in attrs.values()]
        unique, remap, welded = {}, [], [bytearray() for _ in attrs]
        for i in range(count):
            parts = [b[i * s:(i + 1) * s] for b, s in zip(streams, strides)]
            key = b"".join(parts)
            if key not in unique:
                unique[key] = len(unique)
                for target, part in zip(welded, parts):
                    target.extend(part)
            remap.append(unique[key])
        after += len(unique)
        for a, b in zip(attrs.values(), welded):
            del a["array"]
            while len(binary) % 4:
                binary.append(0)
            a["buffer"] = {"offset": len(binary), "length": len(b) // struct.calcsize(FORMATS[a["type"]])}
            binary.extend(b)
        index = data["index"]
        index["type"] = "Uint16Array" if len(unique) < 65536 else "Uint32Array"
        indices = [remap[i] for i in index.pop("array")]
        while len(binary) % 4:
            binary.append(0)
        index["buffer"] = {"offset": len(binary), "length": len(indices)}
        binary.extend(struct.pack("<" + FORMATS[index["type"]] * len(indices), *indices))
    for material in model["materials"]:
        if material.get("userData", {}).get("texture"):
            material["userData"]["texture"] = Path(material["userData"]["texture"]).stem + "-flight.webp"
    header = json.dumps(model, separators=(",", ":"), ensure_ascii=False).encode()
    header += b" " * (-len(header) % 4)
    size = save_gzip(folder / "kakashi-flight-v32.bin.gz", b"CTYM" + struct.pack("<I", len(header)) + header + binary)
    for name in ("Head", "Chest", "Kakashi_Legs"):
        # Same pixel dimensions; retain the face, costume and alpha channel.
        Image.open(folder / (name + ".png")).save(folder / (name + "-flight.webp"), quality=82, method=5)
    print(f"Kakashi: {before:,} -> {after:,} vertices (same triangles/rig); {size:,} bytes")


def merge_flat_faces(raw):
    planes = defaultdict(dict)
    passthrough = []
    for offset in range(0, len(raw), 56):
        face = raw[offset:offset + 56]
        vertices = [struct.unpack_from("<HHHbbbBHH", face, i * 14) for i in range(4)]
        normal = vertices[0][3:6]
        axis = next(i for i, n in enumerate(normal) if n)
        u, v = [i for i in range(3) if i != axis]
        lo = [min(p[i] for p in vertices) for i in range(3)]
        hi = [max(p[i] for p in vertices) for i in range(3)]
        if hi[u] - lo[u] != 1 or hi[v] - lo[v] != 1:
            passthrough.append(face)
            continue
        planes[(normal, lo[axis])][(lo[u], lo[v])] = (face, vertices, lo, hi, u, v)
    output = bytearray(b"".join(passthrough))
    for cells in planes.values():
        for start in sorted(cells, key=lambda p: (p[1], p[0])):
            if start not in cells:
                continue
            face, vertices, lo, hi, u, v = cells[start]
            x, y = start
            width = height = 1
            while (x + width, y) in cells:
                width += 1
            while all((x + dx, y + height) in cells for dx in range(width)):
                height += 1
            for dy in range(height):
                for dx in range(width):
                    del cells[x + dx, y + dy]
            for p in vertices:
                p = list(p)
                p[u] = lo[u] + (width if p[u] == hi[u] else 0)
                p[v] = lo[v] + (height if p[v] == hi[v] else 0)
                output.extend(struct.pack("<HHHbbbBHH", *p))
    return output


def pack_village():
    metadata = json.loads((ROOT / "lib/minecraft/village-data.json").read_text())
    before = after = size = 0
    for tile in metadata["tiles"]:
        original = gzip.decompress((ASSETS / tile["url"].lstrip("/")).read_bytes())
        data = bytearray()
        for group in tile["groups"]:
            face_bytes = original[8 + group["start"] * 14:8 + (group["start"] + group["count"]) * 14]
            group["start"] = len(data) // 14
            # Preserve every textured block's UVs and hand-built silhouette.
            if group["id"] != 251:
                face_bytes = merge_flat_faces(face_bytes)
            group["count"] = len(face_bytes) // 14
            data.extend(face_bytes)
        before += tile["vertices"]
        tile["vertices"] = len(data) // 14
        after += tile["vertices"]
        encoded = b"BCF4" + struct.pack("<I", tile["vertices"]) + b"".join(data[i::14] for i in range(14))
        tile["url"] = tile["url"].replace("static-", "flight-").replace("v48", "v32")
        tile["sha256"] = hashlib.sha256(encoded).hexdigest()
        tile["bytes"] = save_gzip(ASSETS / tile["url"].lstrip("/"), encoded)
        size += tile["bytes"]
    metadata["texture"] = "/regions/hidden-leaf/village-atlas-flight-v32.webp"
    Image.open(ASSETS / "regions/hidden-leaf/village-atlas-v26.webp").save(ASSETS / metadata["texture"].lstrip("/"), quality=82, method=5)
    (ROOT / "lib/minecraft/village-flight-data.json").write_text(json.dumps(metadata, indent=2) + "\n")
    print(f"Village: {before:,} -> {after:,} vertices; {size:,} bytes")


if __name__ == "__main__":
    pack_kakashi()
    pack_village()
