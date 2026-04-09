# OnTheLine Agent Guidelines

## Branching

- Create a new branch before making code changes for any feature, fix, or refactor.
- Branch from `main` unless the user explicitly asks for a different base.
- Use the branch naming format `codex/<short-task-name>` unless the user asks for a different name.
- Do not work directly on `main` unless the user explicitly asks for it.
- Keep one branch focused on one feature or fix whenever practical.

## Parallel Work

- Parallel sub-agents share the same local workspace and branch by default.
- Do not assume parallel sub-agents are working on separate git branches.
- Use parallel sub-agents for read-only investigation, disjoint file edits, or implementation plus verification in parallel.
- Do not use parallel sub-agents for tasks that should become separate branches or separate PRs unless the user explicitly asks for branch isolation and we set that up deliberately.

## Safety

- If there is any risk that multiple agents will touch the same files or create unrelated changes on one branch, stop and confirm the preferred workflow with the user.
