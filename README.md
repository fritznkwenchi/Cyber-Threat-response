# Cyber Incident Response Simulator

A local, browser-based interview practice lab built from **The Evolving Cyber Threat Playbook 2026–2027** supplied for this project.

## What is included

- 60 scenario entries across 20 domains, with A/B/C variants.
- Search and filter by scenario or domain.
- A synthetic evidence timeline with analyst disposition controls.
- Incident worksheet for severity, assets, evidence correlation, containment, gaps, recovery proof, and executive updates.
- Response phase checklist.
- Interviewer rubric and evidence-quality self-check.
- JSON export of the selected scenario's worksheet and evidence dispositions.
- Browser-local persistence. No account, backend, or production integration.

## Run locally

No build tooling or dependencies are required.

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

You may also open `index.html` directly in a modern browser, though some browsers restrict loading `scenarios.json` from a `file://` URL. The local server avoids that issue.

## Suggested GitHub setup

1. Create a repository named `cyber-incident-response-lab`.
2. Upload all files in this directory to the repository root.
3. Enable GitHub Pages in repository settings, using the default branch and root folder.
4. Open the Pages URL and test scenario switching, worksheet saving, and JSON export.
5. Add screenshots of the completed lab and a redacted example report to the portfolio README.

## Suggested interview workflow

1. Pick a scenario without reading the playbook's final finding.
2. Review the evidence timeline and classify each observation as relevant, benign, or unknown.
3. Fill the incident worksheet. Record facts separately from hypotheses.
4. Explain severity, containment authority, business trade-offs, rollback criteria, and evidence gaps.
5. Use the interviewer review tab to evaluate the quality of your reasoning.
6. Export a case report and discuss the evidence supporting each decision.

## Data provenance and important limitations

The playbook says its telemetry is simulated. This lab preserves the scenario-domain organization and includes source-derived starter evidence for selected scenarios (including 01A, 01B, 01C, 02A, 03A, 03B, 04A, and 12A). The other scenario entries contain clearly labeled synthetic starter evidence, not a verbatim extraction of every playbook event. Review and replace those starter events against the corresponding playbook pages before presenting them as source-exact.

The scenario names for A variants follow the playbook's scenario index and are shortened in a few places for readability. The app is a portfolio training aid, not a production incident response platform or an authoritative replacement for your organization's procedures.

## Portfolio talking points

- Evidence correlation and event timelines
- Severity decisions tied to business impact
- Parallel containment and evidence preservation
- Evidence gaps and bounded findings
- Verification of control effectiveness
- Recovery acceptance, residual risk, and lessons learned

## Repository layout

```text
.
├── index.html
├── styles.css
├── app.js
├── scenarios.json
└── README.md
```

## License

Add a license appropriate for your intended use. The uploaded playbook's copyright and reuse terms remain separate from this simulator.
