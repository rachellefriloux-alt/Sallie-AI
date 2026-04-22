/**
 * Association Graph
 * 
 * Represents the network of relationships between memories.
 * Supports weighted edges and efficient traversal.
 */

/**
 * Association types
 */
export enum AssociationType {
  ENTITY_COOCCURRENCE = 'entity_cooccurrence',
  TOPIC_SIMILARITY = 'topic_similarity',
  TEMPORAL_PROXIMITY = 'temporal_proximity',
  CAUSAL_LINK = 'causal_link',
  SEMANTIC_RELATION = 'semantic_relation',
  EMOTIONAL_SIMILARITY = 'emotional_similarity',
  EXPLICIT_REFERENCE = 'explicit_reference'
}

/**
 * Association between memories
 */
export interface MemoryAssociation {
  /** Source memory ID */
  sourceId: string;
  
  /** Target memory ID */
  targetId: string;
  
  /** Association type */
  type: AssociationType;
  
  /** Association strength (0-1) */
  strength: number;
  
  /** Timestamp when association was created */
  createdAt: Date;
  
  /** Number of times this association has been reinforced */
  reinforcementCount: number;
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Association Graph
 * 
 * Maintains a directed weighted graph of memory associations.
 * Provides efficient querying and traversal operations.
 */
export class AssociationGraph {
  // Adjacency list: memoryId -> array of associations
  private outgoing: Map<string, MemoryAssociation[]> = new Map();
  private incoming: Map<string, MemoryAssociation[]> = new Map();
  
  /**
   * Add an association to the graph
   */
  addAssociation(association: MemoryAssociation): void {
    // Add to outgoing edges
    if (!this.outgoing.has(association.sourceId)) {
      this.outgoing.set(association.sourceId, []);
    }
    this.outgoing.get(association.sourceId)!.push(association);
    
    // Add to incoming edges
    if (!this.incoming.has(association.targetId)) {
      this.incoming.set(association.targetId, []);
    }
    this.incoming.get(association.targetId)!.push(association);
  }
  
  /**
   * Get all associations from a memory
   */
  getOutgoingAssociations(memoryId: string): MemoryAssociation[] {
    return this.outgoing.get(memoryId) || [];
  }
  
  /**
   * Get all associations to a memory
   */
  getIncomingAssociations(memoryId: string): MemoryAssociation[] {
    return this.incoming.get(memoryId) || [];
  }
  
  /**
   * Get all associations (both directions) for a memory
   */
  getAllAssociations(memoryId: string): MemoryAssociation[] {
    return [
      ...this.getOutgoingAssociations(memoryId),
      ...this.getIncomingAssociations(memoryId)
    ];
  }
  
  /**
   * Get associations of a specific type
   */
  getAssociationsByType(
    memoryId: string,
    type: AssociationType
  ): MemoryAssociation[] {
    return this.getAllAssociations(memoryId).filter(a => a.type === type);
  }
  
  /**
   * Get strongly associated memories
   */
  getStronglyAssociated(
    memoryId: string,
    minStrength: number = 0.5
  ): string[] {
    const associations = this.getAllAssociations(memoryId)
      .filter(a => a.strength >= minStrength);
    
    return associations.map(a =>
      a.sourceId === memoryId ? a.targetId : a.sourceId
    );
  }
  
  /**
   * Find path between two memories
   */
  findPath(
    startId: string,
    endId: string,
    maxDepth: number = 3
  ): string[] | null {
    const visited = new Set<string>();
    const queue: Array<{ id: string; path: string[] }> = [
      { id: startId, path: [startId] }
    ];
    
    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      
      if (id === endId) {
        return path;
      }
      
      if (path.length >= maxDepth) {
        continue;
      }
      
      if (visited.has(id)) {
        continue;
      }
      
      visited.add(id);
      
      const associations = this.getOutgoingAssociations(id);
      for (const assoc of associations) {
        if (!visited.has(assoc.targetId)) {
          queue.push({
            id: assoc.targetId,
            path: [...path, assoc.targetId]
          });
        }
      }
    }
    
    return null;
  }
  
  /**
   * Get neighbors within N hops
   */
  getNeighborhood(
    memoryId: string,
    hops: number = 1
  ): Set<string> {
    const neighbors = new Set<string>();
    const currentLevel = new Set([memoryId]);
    
    for (let i = 0; i < hops; i++) {
      const nextLevel = new Set<string>();
      
      for (const id of currentLevel) {
        const associations = this.getAllAssociations(id);
        for (const assoc of associations) {
          const neighborId = assoc.sourceId === id ? assoc.targetId : assoc.sourceId;
          if (neighborId !== memoryId && !neighbors.has(neighborId)) {
            nextLevel.add(neighborId);
          }
        }
      }
      
      nextLevel.forEach(id => neighbors.add(id));
      currentLevel.clear();
      nextLevel.forEach(id => currentLevel.add(id));
    }
    
    return neighbors;
  }
  
  /**
   * Reinforce an existing association
   */
  reinforceAssociation(sourceId: string, targetId: string, increment: number = 0.1): boolean {
    const outgoing = this.getOutgoingAssociations(sourceId);
    const association = outgoing.find(a => a.targetId === targetId);
    
    if (association) {
      association.strength = Math.min(1.0, association.strength + increment);
      association.reinforcementCount++;
      return true;
    }
    
    return false;
  }
  
  /**
   * Weaken associations (for decay)
   */
  applyDecay(decayRate: number = 0.01): void {
    for (const associations of this.outgoing.values()) {
      for (const assoc of associations) {
        assoc.strength *= (1 - decayRate);
      }
    }
  }
  
  /**
   * Remove weak associations
   */
  pruneWeakAssociations(threshold: number = 0.1): number {
    let removed = 0;
    
    // Prune outgoing associations
    for (const [memoryId, associations] of this.outgoing.entries()) {
      const strong = associations.filter(a => a.strength >= threshold);
      removed += associations.length - strong.length;
      this.outgoing.set(memoryId, strong);
    }
    
    // Prune incoming associations
    for (const [memoryId, associations] of this.incoming.entries()) {
      const strong = associations.filter(a => a.strength >= threshold);
      this.incoming.set(memoryId, strong);
    }
    
    return removed;
  }
  
  /**
   * Remove all associations for a memory
   */
  removeMemory(memoryId: string): void {
    // Remove outgoing
    this.outgoing.delete(memoryId);
    
    // Remove incoming
    this.incoming.delete(memoryId);
    
    // Remove references in other memories' associations
    for (const associations of this.outgoing.values()) {
      const filtered = associations.filter(a => a.targetId !== memoryId);
      associations.length = 0;
      associations.push(...filtered);
    }
    
    for (const associations of this.incoming.values()) {
      const filtered = associations.filter(a => a.sourceId !== memoryId);
      associations.length = 0;
      associations.push(...filtered);
    }
  }
  
  /**
   * Get statistics about the graph
   */
  getStats(): {
    totalMemories: number;
    totalAssociations: number;
    averageAssociationsPerMemory: number;
    strongAssociations: number;
  } {
    const memories = new Set([
      ...this.outgoing.keys(),
      ...this.incoming.keys()
    ]);
    
    let totalAssociations = 0;
    let strongAssociations = 0;
    
    for (const associations of this.outgoing.values()) {
      totalAssociations += associations.length;
      strongAssociations += associations.filter(a => a.strength >= 0.7).length;
    }
    
    return {
      totalMemories: memories.size,
      totalAssociations,
      averageAssociationsPerMemory: memories.size > 0 ? totalAssociations / memories.size : 0,
      strongAssociations
    };
  }
  
  /**
   * Export graph to JSON
   */
  export(): string {
    const allAssociations: MemoryAssociation[] = [];
    
    for (const associations of this.outgoing.values()) {
      allAssociations.push(...associations);
    }
    
    return JSON.stringify(allAssociations, null, 2);
  }
  
  /**
   * Import graph from JSON
   */
  import(jsonData: string): void {
    const associations: MemoryAssociation[] = JSON.parse(jsonData);
    
    for (const assoc of associations) {
      this.addAssociation(assoc);
    }
  }
  
  /**
   * Clear the graph
   */
  clear(): void {
    this.outgoing.clear();
    this.incoming.clear();
  }
}
