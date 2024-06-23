import os
import re
import sys

if len(sys.argv) < 2 or not re.match(r"^\d+\.\d+\.\d+$", sys.argv[1]):
    print("Usage: python version-upgrade.py <version>")
    print("Example: python version-upgrade.py 1.1.0")
    print("(Note: format must be x.y.z where x, y, z are integers)")
    sys.exit(1)

manifest = os.path.join(os.path.dirname(__file__), "..", "..", "manifest.json")

with open(manifest, encoding="utf-8") as f:
    data = f.read()

old_version = re.search(r'"version":\s*"(\d+\.\d+\.\d+)"', data).group(1)

old_version_parts = list(map(int, old_version.split(".")))
new_version_parts = list(map(int, sys.argv[1].split(".")))

if new_version_parts <= old_version_parts:
    print("New version must be greater than the old version.")
    sys.exit(1)

new_data = re.sub(
    r'"version":\s*"\d+\.\d+\.\d+"',
    f'"version": "{sys.argv[1]}"',
    data,
    flags=re.MULTILINE,
)

if new_data == data:
    print("No changes made.")
    sys.exit(1)

try:
    with open(manifest, "w", encoding="utf-8") as f:
        f.write(new_data)
except Exception as e:
    print(f"An error occurred while writing the file: {e}")
    sys.exit(1)

print(f"Version upgraded from {old_version} to {sys.argv[1]}")
