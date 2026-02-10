import os
import shutil
import sys
import argparse
from pathlib import Path

# Configuration
GLOBAL_ANTIGRAVITY_DIR = Path.home() / ".antigravity"
TEMPLATE_DIR = GLOBAL_ANTIGRAVITY_DIR / "template"
CURRENT_DIR = Path.cwd()
AGENT_DIR_NAME = ".agent"

def ensure_global_dir():
    """Ensure the global .antigravity directory exists."""
    if not GLOBAL_ANTIGRAVITY_DIR.exists():
        print(f"Creating global directory: {GLOBAL_ANTIGRAVITY_DIR}")
        GLOBAL_ANTIGRAVITY_DIR.mkdir(parents=True, exist_ok=True)
    
    if not TEMPLATE_DIR.exists():
        TEMPLATE_DIR.mkdir(exist_ok=True)

def save_template():
    """Save the current .agent directory as the global template."""
    source_agent = CURRENT_DIR / AGENT_DIR_NAME
    
    if not source_agent.exists():
        print(f"Error: No {AGENT_DIR_NAME} directory found in the current folder.")
        print("Run this command from the root of your configured project.")
        return

    target_agent = TEMPLATE_DIR / AGENT_DIR_NAME
    
    if target_agent.exists():
        print(f"Removing existing template at {target_agent}...")
        shutil.rmtree(target_agent)
    
    print(f"Copying {source_agent} to {target_agent}...")
    shutil.copytree(source_agent, target_agent)
    print("✅ Template saved successfully!")
    print(f"Location: {target_agent}")

def init_project():
    """Initialize the current directory with the Antigravity Kit template."""
    source_agent = TEMPLATE_DIR / AGENT_DIR_NAME
    target_agent = CURRENT_DIR / AGENT_DIR_NAME
    
    if not source_agent.exists():
        print("Error: No template found.")
        print("Please run 'python init_antigravity.py save' from a configured project first.")
        return

    if target_agent.exists():
        resp = input(f"Warning: {target_agent} already exists. Overwrite? (y/N): ")
        if resp.lower() != 'y':
            print("Operation cancelled.")
            return
        shutil.rmtree(target_agent)
    
    print(f"Installing Antigravity Kit to {target_agent}...")
    shutil.copytree(source_agent, target_agent)
    print("✅ Project initialized successfully!")
    print("Welcome to the Antigravity family.")

def main():
    parser = argparse.ArgumentParser(description="Antigravity Kit Manager")
    parser.add_argument('action', choices=['save', 'init'], help="Action to perform: 'save' current setup as template or 'init' new project from template")
    
    if len(sys.argv) == 1:
        parser.print_help(sys.stderr)
        sys.exit(1)

    args = parser.parse_args()
    
    ensure_global_dir()
    
    if args.action == 'save':
        save_template()
    elif args.action == 'init':
        init_project()
    elif args.action == 'sync':
        sync_skills()

def sync_skills():
    """Sync skills from global repository to local project."""
    global_skills_dir = GLOBAL_ANTIGRAVITY_DIR / "skills"
    local_skills_dir = CURRENT_DIR / AGENT_DIR_NAME / "skills"

    if not global_skills_dir.exists():
        print(f"Error: Global skills directory not found at {global_skills_dir}")
        return

    if not local_skills_dir.exists():
        print(f"Creating local skills directory: {local_skills_dir}")
        local_skills_dir.mkdir(parents=True, exist_ok=True)

    print("Syncing skills...")
    synced_count = 0
    for item in global_skills_dir.iterdir():
        if item.is_dir():
            target_dir = local_skills_dir / item.name
            if not target_dir.exists():
                print(f"Installing skill: {item.name}")
                shutil.copytree(item, target_dir)
                synced_count += 1
    
    if synced_count > 0:
        print(f"✅ Successfully installed {synced_count} new skills!")
    else:
        print("All global skills are already installed locally.")

def main():
    parser = argparse.ArgumentParser(description="Antigravity Kit Manager")
    parser.add_argument('action', choices=['save', 'init', 'sync'], help="Action to perform: 'save', 'init', or 'sync' skills")
    
    if len(sys.argv) == 1:
        parser.print_help(sys.stderr)
        sys.exit(1)

    args = parser.parse_args()
    
    ensure_global_dir()
    
    if args.action == 'save':
        save_template()
    elif args.action == 'init':
        init_project()
    elif args.action == 'sync':
        sync_skills()

if __name__ == "__main__":
    main()

