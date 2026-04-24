# Architecture

## High-level components
- **Clients**: Desktop app (Electron), Web UI, Mobile (future)
- **Core Runtime**: Orchestrator that routes requests to models, retrieval, and tools
- **Memory Store**: user profile, preferences, long-term notes, embeddings
- **Retrieval Layer**: connectors + indexing + ranking + citation packaging
- **Tools Layer**: integrations (calendar, email, files, devices, dev tools)
- **Policy Layer**: permissions, autonomy policies, data boundaries
- **Labs**: feature flags + experimental pipelines

## Key design choices
- **Model router**: support local models and cloud models with clear labeling
- **Connector-first retrieval**: add sources by implementing a connector contract
- **Audit-first tooling**: every tool call is logged with inputs/outputs

## Safety model
- Default: “assist” not “act”
- Actions require explicit confirmation, except for pre-approved low-risk actions
- High-risk actions (money, deletes, outbound messages) are always confirmed
