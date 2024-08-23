import os
import re
import sys

ROOT_DIR = os.path.join(os.path.dirname(__file__), "..", "..")
manifest = os.path.join(ROOT_DIR, "manifest.json")

with open(manifest, encoding="utf-8") as f:
    data = f.read()

_match = re.search(r'"version":\s*"(\d+\.\d+\.\d+)"', data)
if not _match:
    print("Version not found in manifest.json")
    sys.exit(1)

old_version = _match.group(1)

old_version_parts = tuple(map(int, old_version.split(".")))

# Legal new versions, in order of patch, minor, major
LEGAL_VERSIONS = {
    "patch": (old_version_parts[0], old_version_parts[1], old_version_parts[2] + 1),
    "minor": (old_version_parts[0], old_version_parts[1] + 1, 0),
    "major": (old_version_parts[0] + 1, 0, 0),
}

if len(sys.argv) < 2 or sys.argv[1] not in LEGAL_VERSIONS:
    print("Usage: python version-upgrade.py <patch|minor|major>")
    print("Example: python version-upgrade.py minor")
    sys.exit(1)

VERSION_UPGRADE_TYPE = sys.argv[1]

NEW_VERSION = '.'.join(map(str, LEGAL_VERSIONS[VERSION_UPGRADE_TYPE]))

new_data = re.sub(
    r'"version":\s*"\d+\.\d+\.\d+"',
    f'"version": "{NEW_VERSION}"',
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

print(f"{VERSION_UPGRADE_TYPE.capitalize()} version upgrade successful.")
print(f"Upgraded from {old_version} to {NEW_VERSION}")
