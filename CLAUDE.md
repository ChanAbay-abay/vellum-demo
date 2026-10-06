@AGENTS.md

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

<!-- graphify-feedback-start -->

### Graph feedback loop

In any repo with a `graphify-out/` directory, read `graphify-out/reflections/LESSONS.md` before answering a codebase question if it exists. It records which graph nodes have proved useful in that repo and which led nowhere.

After the graph materially helped or hindered an answer, record the outcome:

```bash
graphify save-result --question "<the question>" --answer "<short answer>" \
  --type query --nodes "<key nodes>" --outcome useful
```

Use `--outcome dead_end` when the graph did not contain the answer and you had to read source directly. Use `--outcome corrected --correction "<what was actually true>"` when the graph pointed the wrong way. Those two are the signals worth recording; do not log routine lookups, and do not log at all when the graph was not consulted.

`reflect` runs automatically on commit and rolls these into LESSONS.md.
<!-- graphify-feedback-end -->
