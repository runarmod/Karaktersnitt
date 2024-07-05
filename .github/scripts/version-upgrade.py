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

old_version_parts = tuple(map(int, old_version.split(".")))
new_version_parts = tuple(map(int, sys.argv[1].split(".")))

# Legal new versions, in order of patch, minor, major
new_legal_versions = [
    (old_version_parts[0], old_version_parts[1], old_version_parts[2] + 1),
    (old_version_parts[0], old_version_parts[1] + 1, 0),
    (old_version_parts[0] + 1, 0, 0),
]

if new_version_parts not in new_legal_versions:
    print("Invalid version number.")
    print("Legal versions are:")
    print("    Patch -", ".".join(map(str, new_legal_versions[0])))
    print("    Minor -", ".".join(map(str, new_legal_versions[1])))
    print("    Major -", ".".join(map(str, new_legal_versions[2])))
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
