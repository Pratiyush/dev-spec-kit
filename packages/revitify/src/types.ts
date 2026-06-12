/**
 * Revitify's graph shape IS graphify's output contract (the shape Rivet's loadCodeGraph was
 * verified against): nodes carry id/name/label/source_file/source_location/community; links carry
 * source/target/relation; built_at_commit stamps freshness. Changing this shape breaks every
 * downstream consumer — don't.
 */

export interface RevitifyNode {
  id: string;
  name?: string;
  label: string;
  kind?: string;
  source_file: string;
  source_location?: string;
  community?: number;
}

export interface RevitifyLink {
  source: string;
  target: string;
  relation?: string;
}

export interface RevitifyGraph {
  built_at_commit?: string;
  nodes: RevitifyNode[];
  links: RevitifyLink[];
}
