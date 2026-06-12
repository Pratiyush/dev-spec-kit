/**
 * FIX-PROOF-04 — ONE renderer for proof identity, used by every surface that prints a proof
 * (check-run lines, PR body, approval artifacts, audit log → LEDGER recent activity).
 *
 * The identity is the tested CODE TREE (FIX-PROOF-01/02): same code ⇒ same hash, regardless of
 * commits or journal appends. A bare commit sha appears only as a legacy fallback for results
 * recorded before trees were journaled. The `*` marks a dirty working tree at proof time.
 */

export interface ProofIdentity {
  sha?: string;
  tree?: string;
  dirty?: boolean;
}

/** "tree a1b2c3d4*" · "a1b2c3d4" (legacy sha) · "" when no identity exists. */
export function identityLabel(r: ProofIdentity): string {
  const id = r.tree ?? r.sha;
  if (!id) return "";
  return `${r.tree ? "tree " : ""}${id.slice(0, 8)}${r.dirty ? "*" : ""}`;
}

/** The inline form printed after PASS/FAIL and evidence rows: " @ tree a1b2c3d4*". */
export function proofStamp(r: ProofIdentity): string {
  const label = identityLabel(r);
  return label ? ` @ ${label}` : "";
}
