# Safety & Privacy

## Defaults
- Autonomy is **off** by default
- Cloud calls are **off** by default (unless explicitly enabled)
- All tool actions are **logged**

## Permission model
- Per-connector permissions (e.g., calendar read vs write)
- Per-action confirmation (send email, buy item, delete file)
- Autonomy policies that are human-readable and easy to revoke

## Audit log
Every run should capture:
- user request
- retrieved sources
- model used
- tools invoked + inputs/outputs
- final answer/action summary

## Data boundaries
- Separate secrets store from app config
- Clear “what leaves the device” indicators
- Easy export/delete for user data
