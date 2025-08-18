import json, os

MAP_FILE = os.path.join(os.path.dirname(__file__), "..", "name_category_map.json")

DEFAULT_CATEGORIES = [
    "Shopping","Grocery / Daily Needs","Bills & Recharge","Food & Dining",
    "Subscriptions","Transfers","Salary / Income","Travel / Fuel","Others"
]

def ensure_map_file():
    if not os.path.exists(MAP_FILE):
        with open(MAP_FILE,"w") as f: json.dump({}, f)

def load_mapping():
    ensure_map_file()
    with open(MAP_FILE,"r") as f: return json.load(f)

def save_mapping(mapping):
    with open(MAP_FILE,"w") as f: json.dump(mapping,f,indent=2)

def update_mapping(new_map):
    m = load_mapping()
    m.update(new_map)
    save_mapping(m)
    return m
