# Task: Publish this repo to GitHub

This directory (`chat-exporter`) is a git repo with 2 commits already made
locally (extension code, then README/LICENSE/.gitignore). It is NOT yet on
GitHub. Your job is to publish it.

## Steps

1. Confirm you're in the repo root (should contain `manifest.json`,
   `popup.js`, `scraper.js`, `popup.html`, `README.md`, `LICENSE`,
   `.gitignore`).
2. Check `git log --oneline` and `git status` to confirm history is intact
   and the working tree is clean.
3. Create the GitHub repo and push using the `gh` CLI:
   ```bash
   gh repo create chat-exporter --public --source=. --remote=origin --push
   ```
   - If `gh` isn't authenticated, run `gh auth login` first and follow the
     prompts (this requires interactive user input — ask the user to
     complete it if you can't).
   - If the user wants the repo **private** instead of public, use
     `--private` instead of `--public`.
4. Confirm the push succeeded and report back the repo URL.

## Notes

- Do not rewrite git history or force-push — this is a fresh repo, a
  normal push should work.
- Do not modify `manifest.json`, `popup.js`, `scraper.js`, or `popup.html`
  unless the user explicitly asks for changes — this task is publish-only.
- If `gh repo create` fails because a repo named `chat-exporter` already
  exists under the user's account, ask the user whether to pick a different
  name or push to the existing repo instead.
