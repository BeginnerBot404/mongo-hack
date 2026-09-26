> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: org-level, project-level
-->

# Manage Voyage AI Model API Keys

Model API keys serve as the authentication and authorization mechanism for the Embedding and Reranking API and enable you to access Voyage AI models through the API. This page describes how to create and manage your API keys in the Atlas UI.

**Note:**

It is named *model API key* to distinguish it from other API keys in Atlas. You use this key the same way as API keys from other model providers.

## Create and Manage Model API Keys

You can create and manage model API keys from the Atlas UI at the organization and project levels. [Rate limits](https://www.mongodb.com/docs/voyageai/management/rate-limits.md#std-label-voyage-rate-limits) apply to the API (Application Programming Interface) keys based on whether you created them at the organization or project level.

### Required Permissions

To create, update, and delete model API keys:

- At the organization level, you must have [`Organization Owner`](https://www.mongodb.com/docs/atlas/reference/user-roles.md#mongodb-authrole-Organization-Owner) access to Atlas.

- At the project level, you must have [`Project Model Owner`](https://www.mongodb.com/docs/atlas/reference/user-roles.md#mongodb-authrole-Project-Model-Owner), [`Project Owner`](https://www.mongodb.com/docs/atlas/reference/user-roles.md#mongodb-authrole-Project-Owner), or higher access to Atlas.

To view model API keys:

- At the organization and project levels, you must have [`Organization Read Only`](https://www.mongodb.com/docs/atlas/reference/user-roles.md#mongodb-authrole-Organization-Read-Only) or higher access to Atlas.

- At only the project level, you must have [`Project Read Only`](https://www.mongodb.com/docs/atlas/reference/user-roles.md#mongodb-authrole-Project-Read-Only) or higher access to Atlas.

For a complete list of permissions for each role, see [Organization and Project Access.](https://www.mongodb.com/docs/voyageai/management/organization-project-access.md#std-label-voyage-organization-project-access)

### Create an API Key

When you [create](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-create-api-keys) a model API key at the organization level, link the key to a project. After you create the key, you can't change which project the key is linked to. Rate limits apply to each key in the project.

**Note:**

If you create a model API key through Atlas, as described in the following procedure, the key authenticates requests to the `ai.mongodb.com` endpoints. Conversely, if you create a key through VoyageAI directly, the key authenticates requests to `https://api.voyageai.com/v1/embeddings`.

You also set the key's scope when you create it. To learn more, see [Key Scope.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-key-scope)

### Organization Level

To create model API keys at the organization level, complete the following steps:

1. Log in to [Atlas](https://cloud.mongodb.com).

2. Go to the AI Model APIs page in the Atlas UI.

   If it's not already displayed, select your desired organization from the  Organizations menu in the navigation bar.

   At the organization level, click Model API Keys under the Services header in the navigation bar.

3. Create the model API key.

   Click Create new model API key.

   Enter a name for the key.

   Model API keys can't exceed 250 characters.

   Select a project from the dropdown to link with the API key.

   Select a cloud provider from the Cloud
   provider dropdown.

   Select `any` to leave the cloud dimension unscoped.

   Optional. Select a geography from the Geography dropdown.

   Most keys don't need a Geography. Select `any` to leave the geography dimension unscoped.

   Atlas displays the read-only API
   Endpoint for the scope that you select. The key authenticates against this endpoint.

   Click Create.

4. Save the API key.

   Copy the model API key and store it in a secure location.

   After you leave the page where the key is displayed, you won't be able to view it again. If you lose it, create a new one.

   Click Done.

### Key Scope

**Note: Public Preview**

The Europe Geography and its endpoint, `eu.ai.mongodb.com`, are available as a Public Preview feature. The feature and the corresponding documentation might change at any time during the Preview period.

When you create a model API key, you supply a `cloud` and a `geography`. Together these set the key's scope, which determines the endpoint that the key authenticates against.

Set either value to `any` to leave that dimension unscoped. A key with `cloud` and `geography` both set to `any` is an unscoped key and works against `ai.mongodb.com`.

| Endpoint | Geography |
| --- | --- |
| `ai.mongodb.com` | Unscoped. Atlas can serve the request from any Geography. |
| `eu.ai.mongodb.com` | Europe |
| `us.ai.mongodb.com` | United States |

Scoped endpoints follow the pattern `<geography>.ai.mongodb.com`, where `<geography>` is the `geography` value of the model API key that you send with the request.

To learn what a Geography is and when to scope a key to one, see [Geographies for Voyage AI Inference.](https://www.mongodb.com/docs/voyageai/geographies.md#std-label-voyage-geographies)

Consider the following when you scope a key:

- The scope is fixed when you create the key. To use a different cloud or Geography, delete the key and create a new one. A `PATCH` request to a model API key changes only the key's name.

- The key prefix encodes the scope. For example, a key scoped to Europe begins with `al-eu-`. Use the prefix to identify a key's scope without recreating it.

- Scoped keys require a paid usage tier. You can't scope a key on the free trial. To learn more, see [Usage Tiers.](https://www.mongodb.com/docs/voyageai/management/billing.md#std-label-voyage-api-usage-tiers)

model API keys that you created before Geographies were available read as `cloud=any` and `geography=any`. These keys keep working against `ai.mongodb.com` and are not migrated. To use a scope, create a new key.

### Restrict Model API Key Scope Using a Resource Policy

You can configure a resource policy at the organization level to require that new model API keys be created in a given cloud, a given Geography, or both. To do this, add a `forbid` rule written in Cedar that targets the Embedding and Reranking API action.

The policy governs key *creation*. It does not constrain where an existing key is used. If you configure this policy, users can't create keys outside the scope you allow. However, the policy doesn't revoke or re-scope keys that already exist. Those keys keep working. To remove a key that predates the policy, see [Delete an API Key.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-delete-api-keys)

You can allow specific scopes by using the `unless` clause in the `forbid` rule.

```text
forbid (principal, action == ResourcePolicy::Action::"project.aiModelAPI.modify", resource) unless { <exception> };
```

To restrict keys to a Geography, use the `context.aiModelApi.geography` attribute in the `unless` clause. The following policy allows users to create model API keys only for the Europe Geography:

```text
forbid (principal, action == ResourcePolicy::Action::"project.aiModelAPI.modify", resource) unless { context.aiModelApi.geography == ResourcePolicy::Geography::"eu" };
```

To learn more about setting the resource policy, see [Atlas Resource Policies Overview.](https://www.mongodb.com/docs/atlas/atlas-resource-policies.md#std-label-atlas-resource-policies-overview)

### View an API Key

Organization owners can [view](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-view-api-keys) and [edit](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-edit-api-keys) all model API keys for the organization at the organization level. Project owners can view and edit only the model API keys for the projects to which they have access.

### Organization Level

To view model API keys at the organization level, complete the following steps:

1. Log in to [Atlas](https://cloud.mongodb.com).

2. Go to the AI Model APIs page in the Atlas UI.

   If it's not already displayed, select your desired organization from the  Organizations menu in the navigation bar.

   At the organization level, click Model API Keys under the Services header in the navigation bar.

### Edit an API Key

### Organization Level

To edit model API keys at the organization level, complete the following steps:

1. Log in to [Atlas](https://cloud.mongodb.com).

2. Go to the AI Model APIs page in the Atlas UI.

   If it's not already displayed, select your desired organization from the  Organizations menu in the navigation bar.

   At the organization level, click Model API Keys under the Services header in the navigation bar.

3. Edit the key.

   In the Actions column, click  corresponding to the key that you want to edit.

   In the Edit Model API Key page, modify the name of the model API key.

   model API key name must be unique to the project and can be up to 250 characters in length.

   Click Save to apply the changes.

### Delete an API Key

When you [delete](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-delete-api-keys) a model API key, MongoDB immediately disables the key and rejects any API (Application Programming Interface) requests made using the deleted key. Once you delete the key, you can't view, restore, or modify it.

### Organization Level

To delete model API keys at the organization level, complete the following steps:

1. Log in to [Atlas](https://cloud.mongodb.com).

2. Go to the AI Model APIs page in the Atlas UI.

   If it's not already displayed, select your desired organization from the  Organizations menu in the navigation bar.

   At the organization level, click Model API Keys under the Services header in the navigation bar.

3. Delete the key.

   In the Actions column, click  corresponding to the key that you want to delete.

   In the confirmation modal, click Delete key to delete the key.

## Next Steps

After creating a model API key, you can:

- [Set rate limits](https://www.mongodb.com/docs/voyageai/management/rate-limits.md#std-label-voyage-rate-limits) for your model API keys.

- [Monitor API key usage](https://www.mongodb.com/docs/voyageai/management/monitor-usage.md#std-label-voyage-monitor-usage) in real-time.
