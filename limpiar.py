import re
from pathlib import Path

index_path = Path("index.html")
sw_path = Path("sw.js")

# Limpiar index.html
with open(index_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

clean_index = []
ignore = False

for line in lines:
    if line.startswith("<<<<<<<") or line.startswith(">>>>>>>"):
        continue
    if line.startswith("======="):
        break
    clean_index.append(line)

with open(index_path, "w", encoding="utf-8") as f:
    f.writelines(clean_index)

# Limpiar sw.js
with open(sw_path, "r", encoding="utf-8") as f:
    sw_lines = f.readlines()

clean_sw = []
for line in sw_lines:
    if line.startswith("<<<<<<<") or line.startswith(">>>>>>>"):
        continue
    if line.startswith("======="):
        break
    if "diario-v28" in line:
        line = line.replace("diario-v28", "diario-v29")
    clean_sw.append(line)

with open(sw_path, "w", encoding="utf-8") as f:
    f.writelines(clean_sw)

print("✓ index.html y sw.js limpiados correctamente sin marcadores de conflicto.")
