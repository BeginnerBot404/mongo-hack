> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: atlas, self
-->

# Manage Billing for Automated Embedding

## Overview

You can manage payments and billing for Automated Embedding through the billing and payments interface in the Atlas UI. Atlas sends billing charges to the Atlas account linked to your cluster. Your billing profile for Atlas is the same as the billing profile for your Automated Embedding. To view or edit your billing profile, see [Atlas Billing.](https://www.mongodb.com/docs/atlas/billing.md#std-label-atlas-billing)

Automated Embedding uses a token-based pricing model where you are charged based on the number of tokens processed by the embedding models. To learn more about:

- **Model pricing and costs**: See [Models for Automated Embedding](https://www.mongodb.com/docs/vector-search/crud-embeddings/automated-embedding/models.md#std-label-avs-auto-embeddings-model-ecosystem) for detailed pricing per model.

- **Usage tiers and rate limits**: See [Rate Limits](https://www.mongodb.com/docs/vector-search/crud-embeddings/automated-embedding/models.md#std-label-auto-embed-rate-limits) for information about free tokens, usage tiers, and rate limit tiers.

- **Supported models**: See [Models for Automated Embedding](https://www.mongodb.com/docs/vector-search/crud-embeddings/automated-embedding/models.md#std-label-avs-auto-embeddings-model-ecosystem) for the list of available Voyage AI embedding models.

### Atlas

You configure billing settings at the organization level, which apply to all projects within that organization. You can examine costs and billing for your model per project in the Atlas UI.

### Token-Based Pricing

### Atlas

MongoDB uses a pay-as-you-go pricing model and charges for usage based on consumption. Usage is based on the number of tokens embedded during:

- Index creation (initial sync)

- Document inserts and updates (steady-state)

- Queries performed

Pricing varies by model. For models that process text, charges apply per [token](https://www.mongodb.com/docs/voyageai.md#std-term-tokens) in your text field and queries. To see the cost per 1,000 tokens for each supported embedding model, see [Models for Automated Embedding.](https://www.mongodb.com/docs/vector-search/crud-embeddings/automated-embedding/models.md#std-label-avs-auto-embeddings-model-ecosystem)

### Free Tokens

### Atlas

For each model, Atlas includes a one-time allocation of 200 million free tokens at the organization level. The organization shares free tokens across all Atlas projects and clusters within the organization. Free tokens do not refresh. To learn more about free tokens and usage tiers, see [Rate Limits.](https://www.mongodb.com/docs/vector-search/crud-embeddings/automated-embedding/models.md#std-label-auto-embed-rate-limits)

### Model Pricing

The cost for each model is as follows:

| Embedding Model | Cost per 1K Tokens | Cost per 1M Tokens |
| --- | --- | --- |
| `voyage-4-large` | $0.00012 | $0.12 |
| `voyage-4` | $0.00006 | $0.06 |
| `voyage-4-lite` | $0.00002 | $0.02 |
| `voyage-code-4` | $0.00012 | $0.12 |
| `voyage-code-3` | $0.00018 | $0.18 |

## Manage Billing

### Atlas

**Required Access**

- To view billing information, you must have [`Organization Billing Viewer`](https://www.mongodb.com/docs/atlas/reference/user-roles.md#mongodb-authrole-Organization-Billing-Viewer) access or higher.

- To configure billing settings, such as the payment method and billing profile, you must have [`Organization Owner`](https://www.mongodb.com/docs/atlas/reference/user-roles.md#mongodb-authrole-Organization-Owner) or [`Organization Billing Admin`](https://www.mongodb.com/docs/atlas/reference/user-roles.md#mongodb-authrole-Organization-Billing-Admin) access.

### Procedure

To access billing:

1. Log in to [Atlas](https://cloud.mongodb.com).

2. In Atlas, go to the Billing page for your organization.

   If it's not already displayed, select your desired organization from the  Organizations menu in the navigation bar.

   In the sidebar, click Overview under the Billing header.

   The [Billing](https://cloud.mongodb.com/go?l=https%3A%2F%2Fcloud.mongodb.com%2Fv2%23%2Forg%2F%3Corganization%3E%2Fbilling%2Foverview) page displays.

### Payment Method

To pay for Automated Embedding, use your configured payment method. MongoDB accepts the following payment methods through the Atlas console:

- Credit card

- [PayPal](https://www.paypal.com/us/home)

To set your payment method for Automated Embedding in Atlas, see [Atlas Payment Methods.](https://www.mongodb.com/docs/atlas/billing.md#std-label-atlas-billing-methods)

Through [MongoDB Sales](https://www.mongodb.com/contact/atlas?tck=docs), you can pay using:

- A currency other than USD

- A method other than a credit card or PayPal

**Important:**

To confirm your credit card information, Atlas charges $1.00 when you first connect a credit card to your account. After Atlas confirms your information, it refunds the $1.00 charge. If you encounter any issues with connecting a credit card to your account, contact your card provider or banking institution. Verify whether they declined the initial charge, which would prevent Atlas from confirming your information.

## Manage Invoices

For each of your invoices, including your current invoice, you can:

- View the payment amount due, the total cost of your usage for the billing period, and your billing information.

- Export the invoice details to PDF or CSV.

- Explore invoice cost visualization charts that show total usage costs by service, such as Automated Embedding.

- Review usage summaries by project and by service, such as Automated Embedding.

- Examine payment and usage details that explain usage and paid and pending charges for Automated Embedding.

Your invoice shows usage broken down by embedding model (such as `voyage-4`, `voyage-4-lite`, `voyage-4-large`, `voyage-code-4`, and `voyage-code-3`), including the number of tokens processed and the cost per model. To learn more about supported models and their pricing, see [Models for Automated Embedding.](https://www.mongodb.com/docs/vector-search/crud-embeddings/automated-embedding/models.md#std-label-avs-auto-embeddings-model-ecosystem)

To learn more about invoice features, see [Invoices.](https://www.mongodb.com/docs/atlas/billing.md#std-label-examine-invoices)

### View Invoices

To view the most recent and pending charges for Automated Embedding in an organization:

1. Log in to [Atlas](https://cloud.mongodb.com).

2. Go to the Billing page for your organization.

   If it's not already displayed, select your desired organization from the  Organizations menu in the navigation bar.

   In the sidebar, click Invoices under the Billing header.

   The [Invoices](https://cloud.mongodb.com/go?l=https%3A%2F%2Fcloud.mongodb.com%2Fv2%23%2Forg%2F%3Corganization%3E%2Fbilling%2FpaymentHistory) page displays. On the Invoices page in Atlas, you can view your billing invoices for Automated Embedding.

   The Invoice page displays the following columns:

   - Payment Status: Shows `PENDING` or `SUCCESSFUL`.

   - Invoice Date: Shows the date when Atlas generates the invoice.

   - Invoice Period: Shows the billing period for the invoice. For example, you might see a usage summary for the billing period of `12/01/2025-01/01/2026`.

   - Total Cost: Shows your total monthly charges in your selected currency. The total monthly charges include the billed amount and any applicable taxes, but don't include any payments you made.

     For example, the Total Cost column might show `$29.98 (month-to-date)`. This indicates that your total charges for the month so far are $29.98, including taxes, but doesn't reflect any payments you might have made.

   - Download: Provides an icon for downloading the invoice. You can download your Usage Summary in PDF or CSV format. The Usage Summary shows a detailed breakdown of daily usage activity for Automated Embedding.

You can also access billing information directly from the Search & Vector
Search page by clicking the View Invoice button.

## Review the Costs

You can use the Cost Explorer to understand your Automated Embedding costs. The Billing Cost Explorer helps you understand your organization's billing data on a month-to-month basis. You can view monthly billing data in chart and table form. To view the specific costs for Automated Embedding, see the invoice for the month.

Costs are based on the number of tokens processed by each embedding model. For detailed pricing information per model, see [Models for Automated Embedding.](https://www.mongodb.com/docs/vector-search/crud-embeddings/automated-embedding/models.md#std-label-avs-auto-embeddings-model-ecosystem)

### Procedure

1. Log in to [Atlas](https://cloud.mongodb.com).

2. Go to the Billing page for your organization.

   If it's not already displayed, select your desired organization from the  Organizations menu in the navigation bar.

   In the sidebar, click Cost Explorer under the Billing header.

   The [Cost Explorer](https://cloud.mongodb.com/go?l=https%3A%2F%2Fcloud.mongodb.com%2Fv2%23%2Forg%2F%3Corganization%3E%2Fbilling%2FcostExplorer) page displays. The cost explorer provides a visual representation of your billing data, including Automated Embedding costs.

   To learn more, see [Billing Cost Explorer.](https://www.mongodb.com/docs/atlas/billing.md#std-label-cost-explorer)

3. Filter by Automated Embedding.

   To filter by Automated Embedding, select Automated Embedding from the Service dropdown menu.
