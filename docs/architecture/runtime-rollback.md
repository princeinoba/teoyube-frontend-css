# Runtime rollback architecture

The rollback runtime is the original `server.js` application with its original
HTML, JavaScript, CSS, assets, route hashes, media boundaries, and publication
integrity behavior. Its command is deliberately direct:

```text
node --preserve-symlinks-main server.js
```

`static:start`, `prototype:start`, and `rollback:start` all resolve to this
exact command. No wrapper, framework, package install, build step, network
request, or Next artifact is required.

Operational rollback does not change Git:

```powershell
& "C:\Program Files\nodejs\npm.cmd" run rollback:start
```

Repository rollback is a focused revert of the Prompt 22 candidate cutover
commit. Its exact hash is recorded in the candidate and final reports after the
commit exists. The revert must restore the pre-cutover `start` and `dev`
commands without deleting protected visual source, Prompt 13–21 capability
code, owner approvals, evidence, user data, the WEB corpus, or the public
retrieval index.

The static runtime remains protected until a separately authorized Prompt 23
after an owner-defined stabilization period and actual production cutover
evidence. Prompt 22 authorizes no archive or deletion.
