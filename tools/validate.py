"""
Validate verbs.json against schema
Run: python tools/validate.py
"""

import json
from pathlib import Path
from jsonschema import validate, ValidationError

ROOT = Path(__file__).parent.parent
VERBS_FILE = ROOT / "data" / "verbs.json"
SCHEMA_FILE = ROOT / "schemas" / "verb_schema.json"

def main():
    if not VERBS_FILE.exists():
        print(f"❌ {VERBS_FILE} not found")
        return
    
    with open(VERBS_FILE, "r", encoding="utf-8") as f:
        verbs = json.load(f)
    
    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        schema = json.load(f)
    
    if not isinstance(verbs, list):
        verbs = [verbs]
    
    errors = []
    for i, verb in enumerate(verbs):
        try:
            validate(verb, schema)
        except ValidationError as e:
            errors.append(f"Verb #{verb.get('id', i)}: {e.message}")
    
    if errors:
        print(f"❌ {len(errors)} validation errors:")
        for err in errors:
            print(f"  - {err}")
    else:
        print(f"✅ All {len(verbs)} verbs valid")

if __name__ == "__main__":
    main()
