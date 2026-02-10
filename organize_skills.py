import os
import re
import shutil
from pathlib import Path

# Paths
BASE_DIR = Path.cwd()
ARCH_FILE = BASE_DIR / ".agent" / "ARCHITECTURE.md"
SKILLS_DIR = BASE_DIR / ".agent" / "skills"

# Category Mapping based on headers in ARCHITECTURE.md
CATEGORY_MAP = {
    "Segurança Cibernética & Pen-testing": "security",
    "Frontend": "frontend",
    "Backend & Dados": "backend-data",
    "Arquitetura & Qualidade": "architecture-quality",
    "IA, Agentes & LLMs": "ai-agents",
    "Marketing, SEO & Growth": "marketing-growth",
    "Outros / Ferramentas / Produtividade": "productivity-tools"
}

def parse_categories():
    if not ARCH_FILE.exists():
        print(f"Error: {ARCH_FILE} not found.")
        return {}

    content = ARCH_FILE.read_text(encoding='utf-8')
    skill_category_map = {}
    current_category = None
    
    # Simple state machine to parse the markdown
    lines = content.splitlines()
    for line in lines:
        line = line.strip()
        
        # Check for headers
        # We look for "### Title" or "#### Title"
        header_match = re.match(r'^#{3,4}\s+(?:.+?&)?\s*(.+)', line)
        if header_match:
            # Clean up the header text specifically to match our keys
            header_text = line.lstrip('#').strip()
            # print(f"Found header: {header_text}") # Debug
            
            # Remove emojis if any (simple approach) mostly we match string equality
            # The headers in ARCHITECTURE.md include emojis like "🛡️ Segurança..."
            # Let's try to match partial strings from our CATEGORY_MAP keys
            
            found_key = None
            for key in CATEGORY_MAP:
                if key in header_text:
                    found_key = key
                    break
            
            if found_key:
                current_category = CATEGORY_MAP[found_key]
                print(f"Switching to category: {current_category}")
            # else:
            #     print(f"Header '{header_text}' did not match any category key.")

        # Check for skill rows "| `skill-name` | ..."
        if current_category and line.startswith('|') and '`' in line:
            # Extract skill name
            skill_match = re.search(r'`([\w-]+)`', line)
            if skill_match:
                skill_name = skill_match.group(1)
                skill_category_map[skill_name] = current_category

    return skill_category_map

def organize_skills(mapping):
    if not SKILLS_DIR.exists():
        print(f"Error: {SKILLS_DIR} not found.")
        return

    # Create category directories
    for category in CATEGORY_MAP.values():
        (SKILLS_DIR / category).mkdir(exist_ok=True)

    # Move skills
    moved_count = 0
    for skill_name, category in mapping.items():
        src_path = SKILLS_DIR / skill_name
        dest_path = SKILLS_DIR / category / skill_name
        
        if src_path.exists() and src_path.is_dir():
            # If destination already exists (handled safely)
            if dest_path.exists():
                print(f"Skipping {skill_name}, already in {category}")
                continue
                
            print(f"Moving {skill_name} -> {category}/")
            try:
                shutil.move(str(src_path), str(dest_path))
                moved_count += 1
            except Exception as e:
                print(f"Failed to move {skill_name}: {e}")
        # else:
            # print(f"Skill dir {skill_name} not found in root (might already be moved).")

    print(f"Organization complete. Moved {moved_count} skills.")
    
    # Cleanup: Check for unmapped folders? 
    # Optional: List items still in root
    remaining = [x.name for x in SKILLS_DIR.iterdir() if x.is_dir() and x.name not in CATEGORY_MAP.values()]
    if remaining:
        print(f"Unmapped items remaining in root: {len(remaining)}")
        # print(remaining)

if __name__ == "__main__":
    print("Starting organization...")
    mapping = parse_categories()
    print(f"Found {len(mapping)} mappings.")
    organize_skills(mapping)
