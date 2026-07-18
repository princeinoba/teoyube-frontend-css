import type {
  AnyTIGNode,
  TIGID,
  TIGNodeType,
  TIGRelationship,
  TIGRelationshipType
} from "./types";
import { getTIGSeedGraph } from "./seed";

export function createTIGQueryClient(params: {
  nodes: AnyTIGNode[];
  relationships: TIGRelationship[];
}) {
  const nodes = [...params.nodes];
  const relationships = [...params.relationships];
  const nodeById = new Map<TIGID, AnyTIGNode>(nodes.map((node) => [node.id, node]));
  const relationshipById = new Map<TIGID, TIGRelationship>(
    relationships.map((relationship) => [relationship.id, relationship])
  );

  const normalize = (value: string) => value.trim().toLowerCase();

  function getNodeById(id: TIGID): AnyTIGNode | undefined {
    return nodeById.get(id);
  }

  function getNodesByIds(ids: TIGID[]): AnyTIGNode[] {
    return ids.flatMap((id) => {
      const node = getNodeById(id);
      return node ? [node] : [];
    });
  }

  function getNodeBySlug(slug: string): AnyTIGNode | undefined {
    const normalizedSlug = normalize(slug);
    return nodes.find((node) => normalize(node.slug) === normalizedSlug);
  }

  function getNodesByType(type: TIGNodeType): AnyTIGNode[] {
    return nodes.filter((node) => node.type === type);
  }

  function getRelationshipById(id: TIGID): TIGRelationship | undefined {
    return relationshipById.get(id);
  }

  function getRelationshipsFromNode(nodeId: TIGID): TIGRelationship[] {
    return relationships.filter((relationship) => relationship.sourceNodeId === nodeId);
  }

  function getRelationshipsToNode(nodeId: TIGID): TIGRelationship[] {
    return relationships.filter((relationship) => relationship.targetNodeId === nodeId);
  }

  function getRelationshipsForNode(nodeId: TIGID): TIGRelationship[] {
    return relationships.filter(
      (relationship) => relationship.sourceNodeId === nodeId || relationship.targetNodeId === nodeId
    );
  }

  function getRelationshipsByType(type: TIGRelationshipType): TIGRelationship[] {
    return relationships.filter((relationship) => relationship.type === type);
  }

  function getConnectedNodes(nodeId: TIGID): AnyTIGNode[] {
    const connectedIds = new Set<TIGID>();

    for (const relationship of getRelationshipsForNode(nodeId)) {
      if (relationship.sourceNodeId === nodeId) connectedIds.add(relationship.targetNodeId);
      if (relationship.targetNodeId === nodeId) connectedIds.add(relationship.sourceNodeId);
    }

    return getNodesByIds([...connectedIds]);
  }

  function searchNodesByTag(tag: string): AnyTIGNode[] {
    const normalizedTag = normalize(tag);
    if (!normalizedTag) return [];

    return nodes.filter((node) =>
      node.tags.some((nodeTag) => normalize(nodeTag) === normalizedTag)
    );
  }

  function searchNodesByText(query: string): AnyTIGNode[] {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return [];

    return nodes.filter((node) => {
      const searchableText = [
        node.title,
        node.description,
        node.summary,
        ...node.tags,
        ...node.aliases
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }

  return {
    getNodeById,
    getNodesByIds,
    getNodeBySlug,
    getNodesByType,
    getRelationshipById,
    getRelationshipsFromNode,
    getRelationshipsToNode,
    getRelationshipsForNode,
    getRelationshipsByType,
    getConnectedNodes,
    searchNodesByTag,
    searchNodesByText
  };
}

export function createSeedTIGQueryClient() {
  return createTIGQueryClient(getTIGSeedGraph());
}
