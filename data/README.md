# data/

`b2b_sales.csv`: 448 real B2B sales opportunities (227 Won / 221 Lost) with 22 qualitative deal features. Semicolon-delimited.
- Source: Hugging Face dataset `markobo/B2B_Sales_data`, license **CC-BY-4.0**.
- Originally from Bohanec, Kljajić Borštnar & Robnik-Šikonja, "Explaining machine learning models in sales predictions", *Expert Systems with Applications* (2017).
- Used unmodified. The Atlas copy (`waypoints.opportunities`) adds snake_case keys, a `won` boolean and a fixed train/holdout split.

`accounts.csv` (85 accounts) and `products.csv` (7 products): the Maven Analytics "CRM Sales Opportunities" sample dataset (fictional companies), published as **public domain** on the Maven Analytics Data Playground (also mirrored on data.world).
- Used unmodified on disk. The Atlas copy (`waypoints.accounts`, `bun run load:accounts`) fixes the sector typo `technolgy` → `technology`, renames `revenue` → `revenue_musd` (millions of USD), and adds `queue_index` (CSV order) and `status`.
- Outreach pack (docs/OUTREACH-PACK.md): the agent writes one cold email per account; `products.csv` is the fictional seller's catalog (prices in USD).
