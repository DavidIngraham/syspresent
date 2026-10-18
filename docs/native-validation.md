# Native dependency validation

Reviewed fork pin: `af37bbf155aea785b8ac494a14afe659244bbcdf`, on DavidIngraham/OpenSysML branch `feat/fault-tree-bluedog-pinned`. No upstream pull request was opened.

## Final source checks

Independent review reported these checks passing after the native identity changes were frozen:

- `go build ./...` and `go vet ./...`; formatting check returned no files.
- Package tests for renderidentity, engine, gRPC, IR views, native API export and layering hygiene.
- JS/WASI engine dependency-boundary checks. The optional identity export remains explicitly unsupported in WASM; normal rendering is unchanged.
- Python identity decoding; 28 document tests passed, 21 existing integration tests skipped.
- 330 browser renderer tests and TypeScript checks.
- The exact `TestViewsCommand` expected renderer list was corrected to include the previously registered fault-tree kind; its focused rerun passed.

The clean pinned CLI subsequently validated the Syspresent specification and the desk-fan notation fixture. Native payload assertions checked guards, concurrency, nested states, message order/self-message and matrix directions. All three declarative examples exported and packaged through the clean noninteractive build command.

## Broad suite result and limitations

`go test -p 2 -timeout=10m ./...` ran with Node 24 available and the official pinned pilot corpora installed. It completed with a nonzero result; it must not be described as one green whole-repository run.

Two version-metadata tests failed because Go did not embed VCS metadata from this worktree checkout. Both passed against the same source in an isolated regular checkout, without modifying their assertions or forcing metadata flags.

Three frontend package builds overlapped the addition of row-identity fields and therefore observed inconsistent intermediate files. All three packages passed after the files were frozen. That correction does not rewrite the earlier failed run.

The REPL suite found a stale expected renderer list from the earlier fault-tree registration. The exact expectation was updated and its focused test passed. The other packages in the broad run, including migration, model and the full WASM suite, completed successfully. The longer runtime, SMT, CLI and REPL durations explain why the earlier 180-second package timeout was insufficient; the final broad run used a ten-minute package limit.

This combination gives targeted evidence for the final changes and broad regression coverage with explicitly resolved failures. It is not a claim that an unmodified, coherent final checkout completed one all-green aggregate command. Human usability, engineering acceptance and hosted GitHub Actions/Pages validation remain separate.
