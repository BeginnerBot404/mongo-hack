# Atlas custom role for the agent-role DB user

The harness mounts `src/server.ts --role agent`. Give that server a DB user that can write its own collections but
can only **read** `harness_config` and `policies`. Then the harness can't change its own settings or policies even if
it goes around the MCP tools. Only the sentinel/surgeon (full `readWrite` on `waypoints`) writes them. This is the
second wall, after the `$jsonSchema` validator.

## atlas CLI

`--privilege` takes `ACTION@db.collection` items, comma-separated or repeated.

```bash
atlas customDbRoles create waypointsAgent \
  --privilege 'FIND@waypoints.objectives,INSERT@waypoints.objectives,UPDATE@waypoints.objectives,REMOVE@waypoints.objectives' \
  --privilege 'FIND@waypoints.checkpoints,INSERT@waypoints.checkpoints,UPDATE@waypoints.checkpoints,REMOVE@waypoints.checkpoints' \
  --privilege 'FIND@waypoints.decisions,INSERT@waypoints.decisions,UPDATE@waypoints.decisions,REMOVE@waypoints.decisions' \
  --privilege 'FIND@waypoints.failures,INSERT@waypoints.failures,UPDATE@waypoints.failures,REMOVE@waypoints.failures' \
  --privilege 'FIND@waypoints.memories,INSERT@waypoints.memories,UPDATE@waypoints.memories,REMOVE@waypoints.memories' \
  --privilege 'FIND@waypoints.resumes,INSERT@waypoints.resumes,UPDATE@waypoints.resumes,REMOVE@waypoints.resumes' \
  --privilege 'FIND@waypoints.events,INSERT@waypoints.events,UPDATE@waypoints.events,REMOVE@waypoints.events' \
  --privilege 'FIND@waypoints.taps,INSERT@waypoints.taps,UPDATE@waypoints.taps,REMOVE@waypoints.taps' \
  --privilege 'FIND@waypoints.harness_config' \
  --privilege 'FIND@waypoints.policies'

# Not done by the build. Create the user yourself:
# atlas dbusers create --username waypoints-agent --password '<pw>' --role waypointsAgent@admin
```

Run `bun run setup` as an admin user, not as this one: it creates collections, indexes and validators.
`recall`'s `$vectorSearch` only needs `find` on `memories`.

## Admin API / UI JSON

`POST /api/atlas/v2/groups/{groupId}/customDBRoles/roles`, or enter the same actions in
**Database Access → Custom Roles → Add Custom Role**.

```json
{
  "roleName": "waypointsAgent",
  "actions": [
    { "action": "FIND", "resources": [
      {"db":"waypoints","collection":"objectives"}, {"db":"waypoints","collection":"checkpoints"},
      {"db":"waypoints","collection":"decisions"},  {"db":"waypoints","collection":"failures"},
      {"db":"waypoints","collection":"memories"},   {"db":"waypoints","collection":"resumes"},
      {"db":"waypoints","collection":"events"},     {"db":"waypoints","collection":"taps"},
      {"db":"waypoints","collection":"harness_config"}, {"db":"waypoints","collection":"policies"} ] },
    { "action": "INSERT", "resources": [
      {"db":"waypoints","collection":"objectives"}, {"db":"waypoints","collection":"checkpoints"},
      {"db":"waypoints","collection":"decisions"},  {"db":"waypoints","collection":"failures"},
      {"db":"waypoints","collection":"memories"},   {"db":"waypoints","collection":"resumes"},
      {"db":"waypoints","collection":"events"},     {"db":"waypoints","collection":"taps"} ] },
    { "action": "UPDATE", "resources": [
      {"db":"waypoints","collection":"objectives"}, {"db":"waypoints","collection":"checkpoints"},
      {"db":"waypoints","collection":"decisions"},  {"db":"waypoints","collection":"failures"},
      {"db":"waypoints","collection":"memories"},   {"db":"waypoints","collection":"resumes"},
      {"db":"waypoints","collection":"events"},     {"db":"waypoints","collection":"taps"} ] },
    { "action": "REMOVE", "resources": [
      {"db":"waypoints","collection":"objectives"}, {"db":"waypoints","collection":"checkpoints"},
      {"db":"waypoints","collection":"decisions"},  {"db":"waypoints","collection":"failures"},
      {"db":"waypoints","collection":"memories"},   {"db":"waypoints","collection":"resumes"},
      {"db":"waypoints","collection":"events"},     {"db":"waypoints","collection":"taps"} ] }
  ],
  "inheritedRoles": []
}
```
