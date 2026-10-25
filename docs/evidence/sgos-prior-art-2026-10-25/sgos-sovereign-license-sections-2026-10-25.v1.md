# SGOS — SOVEREIGN LICENSE CANDIDATE SECTIONS · 2026-10-25
**Status:** DRAFTED · NOT SENT — awaiting A.D. and qualified counsel review  
**Seat:** Kimi · **Source base:** SGOS governance canon and fail-closed attestation design  
**Lineage:** v1 (Kimi 2026-10-25)

> **Integration warning:** The base Sovereign License and an existing Section 7.3 were not supplied in this session. The following is candidate language, not a representation that these sections already exist or are legally effective. Counsel must reconcile definitions, liability, export controls, open-source notices, privacy, consumer law, and enforceability before use.

## PROPOSED SECTION 7.3 — AUTHORIZED EXECUTION ENVIRONMENTS; ATTESTATION; SAFE DENIAL

**7.3(a) Authorized Environments.** Licensee may execute the Software only on hardware, virtual machines, containers, cloud environments, and runtime configurations that Licensee owns or is authorized to control, and that satisfy the execution policy accompanying the applicable licensed deployment. Licensee shall not knowingly bypass, disable, spoof, or interfere with a required authorization, attestation, approval, audit, or stop control.

**7.3(b) Policy-Constrained Execution.** If a required execution policy cannot be satisfied, the Software may refuse to initiate the affected action. Any such refusal must be limited to the unauthorized action or environment and must not delete, corrupt, encrypt, exfiltrate, or intentionally render inaccessible any ledger, audit record, customer content, or other data.

**7.3(c) Safe Mode and Recovery.** Except where prohibited by law or necessary to prevent an imminent security incident, a denial under this Section must preserve a documented recovery path for read-only access, data export, credential rotation, policy correction, and authorized reactivation. No provision of this License grants Licensor an unannounced right to access Licensee’s systems or remotely destroy data or functionality.

**7.3(d) Attestation Data Minimization.** Where hardware, software-measurement, console-build, model-identity, jurisdiction, or nonce evidence is required, the implementation shall collect only information reasonably necessary for the stated authorization and audit purpose. Private attestation keys shall remain within the approved hardware boundary or designated secrets service. Attestation records shall not include private keys, unrelated personal data, or customer content.

**7.3(e) Evidence Integrity.** Licensee shall not falsify, backdate, selectively erase, or alter an approval or audit record to misrepresent an action’s authorization, execution, provenance, or outcome. Append-only correction records may be used to amend an error without erasing the original entry. Nothing in this Section requires retention beyond an applicable documented retention policy or legal obligation.

**7.3(f) No Claim of Absolute Security.** Attestation, measurement, and stop controls reduce specified risks but do not guarantee that hardware, software, output, or deployment is error-free, lawful for every use, or resistant to every attack. Any public statement regarding these controls must accurately identify their tested scope and deployment status.

## PROPOSED SECTION 7.4 — FRAMEWORK ATTRIBUTION; PROVENANCE; NO FALSE ENDORSEMENT

**7.4(a) Notice Preservation.** Licensee shall retain the applicable copyright, license, attribution, and provenance notices in copies or substantial portions of the Software, including in source distributions, packaged distributions, and machine-readable notice files, to the extent those notices are present and legally required.

**7.4(b) Product Attribution.** For a product or service that materially incorporates the Software, Licensee shall include a reasonably visible notice in its product documentation, deployment notices, or legal-notices page stating: **“Includes SGOS technology by Sovereign Growth AI.”** The notice shall include the SGOS source or project reference supplied with the licensed distribution. Counsel shall determine whether any additional user-interface attribution is appropriate for the relevant distribution channel.

**7.4(c) Modified Works.** Licensee shall provide a concise notice of material modifications to the licensed Software. Such notice must not suggest that Licensor authored, reviewed, approved, or endorsed Licensee’s modifications, models, outputs, hardware, or deployment unless Licensor has given separate written authorization.

**7.4(d) Provenance Metadata.** Licensee shall not intentionally remove or alter machine-readable provenance metadata for the purpose of concealing the Software’s origin, misrepresenting authorship, or defeating an agreed audit requirement. This provision does not restrict ordinary format conversion, security redaction, privacy minimization, or removal of metadata that is not reasonably capable of preservation, provided that required notices remain available.

**7.4(e) Names and Marks.** Except for the factual attribution required above, this License grants no right to use Licensor’s names, logos, product names, or marks to imply partnership, sponsorship, certification, deployment, revenue participation, or endorsement. Any certification or co-branding requires a separate written agreement.

**7.4(f) Ideas and Independent Implementations.** To the extent applicable law does not grant protection in an idea, method, workflow, mathematical concept, or unprotectable interface, this License does not purport to restrict independent implementation of that unprotectable subject matter. Attribution obligations apply to licensed Software and materials, not to independently created works merely because they address a similar problem.

## IMPLEMENTATION NOTES — NOT PART OF THE LICENSE TEXT

- The accompanying reference module implements **deny-new-action + audit evidence**, never ledger corruption.
- Production deployment needs a real hardware-rooted key/measurement flow, an atomic shared replay store, signed policy versions, and a tested recovery procedure.
- A license restriction does not substitute for technical enforcement, and technical enforcement does not prove legal enforceability.
- Partner-facing drafts must not call the hardware or console controls “live” until a live verification receipt exists.
