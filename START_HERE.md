# Shooting Star — Remote Setup Guide

This doc gets you from zero to working on Shooting Star from any machine.

## 1. What You Need

- **Hermes Agent installed** (`curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`)
- **GitHub access** to `jgruveehugz/string` (private) and `jgruveehugz/shooting-star-godot` (private)
- **API keys** from 1Password (OpenRouter, Anthropic, Telegram, etc.)
- **Godot 4.7** installed (`brew install godot`)
- **Node.js** for web prototype (`node --check main.js`)

## 2. Clone the Repos

```bash
# Web prototype (dev repo)
git clone https://github.com/jgruveehugz/string.git ~/Claude/Projects/neon-lattice
cd ~/Claude/Projects/neon-lattice
git checkout refine/mobile-polish
sh bin/stamp-build.sh
python3 -m http.server 5184 --bind 127.0.0.1
# Dev URL: http://localhost:5184/index.html?debug=1

# Godot project
git clone https://github.com/jgruveehugz/shooting-star-godot.git ~/Projects/shooting-star-godot
# Open: open -a Godot ~/Projects/shooting-star-godot/project.godot

# Web stable checkout (for ship routine)
git clone https://github.com/jgruveehugz/string.git ~/Claude/Projects/string-stable
cd ~/Claude/Projects/string-stable
git checkout refine/mobile-polish

# Web public checkout (for GitHub Pages sync)
git clone https://github.com/jgruveehugz/string-play.git ~/Claude/Projects/string-play
```

## 3. Full Hermes Configuration

The complete Hermes config duplication guide is in the string repo:

```bash
cd ~/Claude/Projects/neon-lattice
cat handoff/HERMES_CONFIG_DUPLICATION_GUIDE.md
```

That doc covers: model config, API keys, MCP servers, profiles, memory, SOUL.md, AGENTS.md, skills, cron jobs, gateway, and a 12-step checklist.

## 4. Game State Handoff

The current game state handoff (Build 244, all P1 complete):

```bash
cat handoff/SESSION_HANDOFF_2026-07-11-BUILD-244-P1-COMPLETE.md
```

## 5. Daily Workflow

```bash
# Pull latest
cd ~/Claude/Projects/neon-lattice && git pull origin refine/mobile-polish
cd ~/Projects/shooting-star-godot && git pull origin main

# Make changes, test
node --check ~/Claude/Projects/neon-lattice/main.js
godot --headless --quit --quit-after 5 --path ~/Projects/shooting-star-godot

# Push
cd ~/Claude/Projects/neon-lattice && git add -A && git commit -m "feat: ..." && git push origin refine/mobile-polish
cd ~/Projects/shooting-star-godot && git add -A && git commit -m "feat: ..." && git push origin main
```

## 6. Ship to Public

```bash
# Update stable
cd ~/Claude/Projects/string-stable
DEV_HASH=$(cd ~/Claude/Projects/neon-lattice && git rev-parse --short HEAD)
git fetch origin refine/mobile-polish
git checkout -f $DEV_HASH
sh bin/stamp-build.sh
node --check main.js

# Sync to public + push to GitHub Pages
sh ~/Claude/Projects/neon-lattice/bin/sync-public.sh

# Verify (wait 30s)
sleep 30
curl -s "https://jgruveehugz.github.io/string-play/build.js?t=$(date +%s)" | head -1
```

## 7. URLs

- **Web dev:** http://localhost:5184/index.html?debug=1
- **Web public:** https://jgruveehugz.github.io/string-play/
- **Tailscale (from MacBook):** http://100.77.43.114:5184/index.html?debug=1

## 8. Current State (2026-07-11)

- Web: Build 244, branch `refine/mobile-polish`, HEAD `72469aa`
- Godot: Build 12, branch `main`, HEAD `5aaa83d`
- P0 ✅ | P1 ✅ | P2 pending (FTUX, IAP, ignition animation)
- All code pushed to GitHub
- Both repos clean
