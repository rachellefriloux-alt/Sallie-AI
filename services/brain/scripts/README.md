# Sallie Brain — scripts/

Operational scripts for the brain.

| Script                       | Purpose                                                                                    |
|------------------------------|--------------------------------------------------------------------------------------------|
| `export_openapi.py`          | Export the brain's OpenAPI spec to a file. Used to regenerate `packages/sdk/openapi.json`. |

## Regenerating the SDK source spec

After any change to the brain's HTTP surface (routes, request/response
models, error envelopes), run:

```bash
python services/brain/scripts/export_openapi.py \
    --output packages/sdk/openapi.json
```

CI will compare the committed `packages/sdk/openapi.json` against a
fresh export and fail if they have drifted. (CI hookup is added in the
Phase 0.7 workflow PR.)
