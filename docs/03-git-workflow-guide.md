# Phase 6: Genuine Git & GitHub Workflow Guide (Mac)

To satisfy CSE 3206 requirements without fabricating Git history, follow these steps on your Mac to generate genuine branches, Pull Requests, and a real merge conflict.

## 1. Initial Commit & Push to GitHub
```bash
git add .
git commit -m "chore: initial QuizMaster setup with requirements, schema, and core app"
git remote add origin https://github.com/<your-username>/quizmaster-cse3206.git
git push -u origin main
```

## 2. Create Feature Branches & Pull Requests
Create branches following the naming convention:
- `feature/authentication`
- `feature/quiz-management`
- `feature/question-management`
- `feature/quiz-attempt`
- `feature/result-evaluation`
- `feature/dashboard`
- `test/unit-tests`
- `ci/github-actions`

Example for an **Accepted PR**:
```bash
git checkout -b ci/github-actions
# Make a small improvement (e.g., add a badge or comment in README.md)
git add README.md
git commit -m "docs: add CI status section to README"
git push -u origin ci/github-actions
```
Open a PR on GitHub, wait for **QuizMaster CI** to pass, and merge it!

## 3. Create a Revised / Rejected PR
```bash
git checkout main && git pull
git checkout -b feature/dashboard
# Make an intentional issue (e.g., unused variable or missing label), push, and open PR.
# Leave a PR review comment requesting changes, fix it in a second commit, or close it as rejected.
```

## 4. Create and Resolve a Real Merge Conflict
1. On `main`, edit line 1 of `README.md` (e.g., change title) and commit + push.
2. Checkout a branch from the previous commit: `git checkout -b feature/readme-update HEAD~1`
3. Edit line 1 of `README.md` differently, commit, and run `git merge main`.
4. Git will report `CONFLICT (content): Merge conflict in README.md`.
5. Open `README.md`, keep the desired header, remove `<<<<<<<`, `=======`, `>>>>>>>` markers, then:
   ```bash
   git add README.md
   git commit -m "fix: resolve merge conflict in README.md header"
   ```
6. Screenshot the conflict and resolution commit for your project report!
