'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { apiRequest } from '@/lib/api';
import { DNA3DViewer } from './DNA3DViewer';

interface DNAChange {
  position: number;
  original: string;
  modified: string;
}

interface DNAComparison {
  suggestion_index: number;
  guide_rna: string;
  target_position: number;
  edit_type: string;
  efficiency_score: number;
  confidence: number;
  original_base: string | null;
  target_base: string | null;
  original_dna: string;
  modified_dna: string;
  changes: DNAChange[];
  change_count: number;
}

interface DNAComparisonViewerProps {
  analysisId: string;
  width?: number;
  height?: number;
}

const NUCLEOTIDE_COLORS: Record<string, string> = {
  A: '#ff4444', // Red
  T: '#4444ff', // Blue
  G: '#44ff44', // Green
  C: '#ffff44', // Yellow
};

export function DNAComparisonViewer({
  analysisId,
  width = 1200,
  height = 600,
}: DNAComparisonViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [comparisons, setComparisons] = useState<DNAComparison[]>([]);
  const [originalDna, setOriginalDna] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewportStart, setViewportStart] = useState(0);
  const nucleotidesPerView = 100;
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    fetchComparisonData();
  }, [analysisId]);

  const fetchComparisonData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{
        analysis_id: string;
        original_dna: string;
        comparisons: DNAComparison[];
        total_suggestions: number;
      }>(`/gene-analysis/history/${analysisId}/dna-comparison`);

      setComparisons(response.comparisons || []);
      setOriginalDna(response.original_dna || '');
      if (response.comparisons && response.comparisons.length > 0) {
        setActiveTab(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load DNA comparison data');
      console.error('Error fetching DNA comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || error || comparisons.length === 0) return;
    // Don't render 2D when showing 3D view
    if (show3D) return;
    
    // Wait for SVG to be available
    if (!svgRef.current) {
      // Use a small delay to ensure SVG is mounted
      const timer = setTimeout(() => {
        if (svgRef.current && !show3D) {
          render2DView();
        }
      }, 50);
      return () => clearTimeout(timer);
    }

    render2DView();
  }, [comparisons, activeTab, viewportStart, loading, error, show3D, width, height]);

  const render2DView = () => {
    if (!svgRef.current || show3D) return;
    if (comparisons.length === 0) return;

    const activeComparison = comparisons[activeTab];
    if (!activeComparison) return;

    // Clear previous rendering
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 80, right: 80, bottom: 100, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Get viewport range
    const viewportEnd = Math.min(viewportStart + nucleotidesPerView, activeComparison.original_dna.length);
    const viewportDna = activeComparison.original_dna.substring(viewportStart, viewportEnd);
    const viewportModified = activeComparison.modified_dna.substring(viewportStart, viewportEnd);

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', 'currentColor')
      .text(`Edit Suggestion ${activeTab + 1} - DNA Comparison`);

    // Add info text
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.7)
      .text(
        `Efficiency: ${activeComparison.efficiency_score.toFixed(1)}% | ` +
        `Confidence: ${activeComparison.confidence.toFixed(2)} | ` +
        `Changes: ${activeComparison.change_count} | ` +
        `Position: ${viewportStart + 1}-${viewportEnd} of ${activeComparison.original_dna.length}`
      );

    // Calculate nucleotide width
    const nucleotideWidth = innerWidth / nucleotidesPerView;
    const sequenceHeight = 40;
    const spacing = 80; // Increased spacing to prevent overlap
    const topMargin = 100; // Extra top margin for labels

    // Calculate positions with proper spacing
    const originalSequenceY = topMargin;
    const modifiedSequenceY = originalSequenceY + sequenceHeight + spacing;
    const labelY = topMargin - 10;
    const modifiedLabelY = modifiedSequenceY - 10;

    // Draw background highlighting for changed regions
    const highlightGroup = g.append('g').attr('class', 'highlight-regions');
    activeComparison.changes
      .filter((c) => c.position >= viewportStart && c.position < viewportEnd)
      .forEach((change) => {
        const x = (change.position - viewportStart) * nucleotideWidth;
        // Highlight original sequence
        highlightGroup
          .append('rect')
          .attr('x', x)
          .attr('y', originalSequenceY - 2)
          .attr('width', nucleotideWidth)
          .attr('height', sequenceHeight + 4)
          .attr('fill', '#ff0000')
          .attr('opacity', 0.25)
          .attr('rx', 2);
        // Highlight modified sequence
        highlightGroup
          .append('rect')
          .attr('x', x)
          .attr('y', modifiedSequenceY - 2)
          .attr('width', nucleotideWidth)
          .attr('height', sequenceHeight + 4)
          .attr('fill', '#00ff00')
          .attr('opacity', 0.25)
          .attr('rx', 2);
      });

    // Draw original DNA sequence label
    g.append('text')
      .attr('x', 10)
      .attr('y', labelY)
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .attr('fill', 'currentColor')
      .text('Original DNA:');

    const originalGroup = g.append('g').attr('class', 'original-sequence');
    viewportDna.split('').forEach((nucleotide, idx) => {
      const x = idx * nucleotideWidth;
      const globalPos = viewportStart + idx;
      const isChanged = activeComparison.changes.some(
        (c) => c.position === globalPos
      );

      // Background for changed nucleotides
      if (isChanged) {
        originalGroup
          .append('rect')
          .attr('x', x)
          .attr('y', originalSequenceY)
          .attr('width', nucleotideWidth - 1)
          .attr('height', sequenceHeight)
          .attr('fill', '#ff4444')
          .attr('opacity', 0.3)
          .attr('rx', 3);
      }

      originalGroup
        .append('rect')
        .attr('x', x)
        .attr('y', originalSequenceY)
        .attr('width', nucleotideWidth - 1)
        .attr('height', sequenceHeight)
        .attr('fill', NUCLEOTIDE_COLORS[nucleotide] || '#cccccc')
        .attr('stroke', isChanged ? '#ff0000' : '#333333')
        .attr('stroke-width', isChanged ? 3 : 0.5)
        .attr('opacity', isChanged ? 1 : 0.8)
        .attr('rx', 2);

      originalGroup
        .append('text')
        .attr('x', x + nucleotideWidth / 2)
        .attr('y', originalSequenceY + sequenceHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', isChanged ? '12px' : '10px')
        .attr('font-weight', isChanged ? 'bold' : 'normal')
        .attr('fill', isChanged ? '#ffffff' : '#000000')
        .text(nucleotide);

      // Position number every 10 nucleotides
      if (idx % 10 === 0 || isChanged) {
        originalGroup
          .append('text')
          .attr('x', x + nucleotideWidth / 2)
          .attr('y', originalSequenceY - 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', isChanged ? '9px' : '8px')
          .attr('fill', isChanged ? '#ff0000' : 'currentColor')
          .attr('font-weight', isChanged ? 'bold' : 'normal')
          .attr('opacity', isChanged ? 1 : 0.6)
          .text((globalPos + 1).toString());
      }
    });

    // Draw modified DNA sequence label
    g.append('text')
      .attr('x', 10)
      .attr('y', modifiedLabelY)
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .attr('fill', 'currentColor')
      .text('Modified DNA:');

    const modifiedGroup = g.append('g').attr('class', 'modified-sequence');
    viewportModified.split('').forEach((nucleotide, idx) => {
      const x = idx * nucleotideWidth;
      const globalPos = viewportStart + idx;
      const isChanged = activeComparison.changes.some(
        (c) => c.position === globalPos
      );
      const change = activeComparison.changes.find((c) => c.position === globalPos);

      // Background for changed nucleotides
      if (isChanged) {
        modifiedGroup
          .append('rect')
          .attr('x', x)
          .attr('y', modifiedSequenceY)
          .attr('width', nucleotideWidth - 1)
          .attr('height', sequenceHeight)
          .attr('fill', '#44ff44')
          .attr('opacity', 0.3)
          .attr('rx', 3);
      }

      modifiedGroup
        .append('rect')
        .attr('x', x)
        .attr('y', modifiedSequenceY)
        .attr('width', nucleotideWidth - 1)
        .attr('height', sequenceHeight)
        .attr('fill', NUCLEOTIDE_COLORS[nucleotide] || '#cccccc')
        .attr('stroke', isChanged ? '#00ff00' : '#333333')
        .attr('stroke-width', isChanged ? 3 : 0.5)
        .attr('opacity', isChanged ? 1 : 0.8)
        .attr('rx', 2);

      modifiedGroup
        .append('text')
        .attr('x', x + nucleotideWidth / 2)
        .attr('y', modifiedSequenceY + sequenceHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', isChanged ? '12px' : '10px')
        .attr('font-weight', isChanged ? 'bold' : 'normal')
        .attr('fill', isChanged ? '#ffffff' : '#000000')
        .text(nucleotide);

      // Position number every 10 nucleotides or if changed
      if (idx % 10 === 0 || isChanged) {
        modifiedGroup
          .append('text')
          .attr('x', x + nucleotideWidth / 2)
          .attr('y', modifiedSequenceY - 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', isChanged ? '9px' : '8px')
          .attr('fill', isChanged ? '#00ff00' : 'currentColor')
          .attr('font-weight', isChanged ? 'bold' : 'normal')
          .attr('opacity', isChanged ? 1 : 0.6)
          .text((globalPos + 1).toString());
      }

      // Draw change indicator arrow with better visibility
      if (isChanged && change) {
        const arrowY = originalSequenceY + sequenceHeight + spacing / 2;
        const centerX = x + nucleotideWidth / 2;
        
        // Draw connecting line
        modifiedGroup
          .append('line')
          .attr('x1', centerX)
          .attr('y1', originalSequenceY + sequenceHeight + 5)
          .attr('x2', centerX)
          .attr('y2', modifiedSequenceY - 5)
          .attr('stroke', '#ff6600')
          .attr('stroke-width', 3)
          .attr('opacity', 0.8);

        // Draw arrow head
        modifiedGroup
          .append('path')
          .attr(
            'd',
            `M ${centerX} ${modifiedSequenceY - 5} L ${centerX - 5} ${modifiedSequenceY - 12} M ${centerX} ${modifiedSequenceY - 5} L ${centerX + 5} ${modifiedSequenceY - 12}`
          )
          .attr('stroke', '#ff6600')
          .attr('stroke-width', 3)
          .attr('fill', 'none');

        // Draw change label with background
        const labelBg = modifiedGroup
          .append('rect')
          .attr('x', centerX - 20)
          .attr('y', arrowY - 8)
          .attr('width', 40)
          .attr('height', 18)
          .attr('fill', '#ff6600')
          .attr('opacity', 0.9)
          .attr('rx', 4);

        modifiedGroup
          .append('text')
          .attr('x', centerX)
          .attr('y', arrowY + 5)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#ffffff')
          .attr('font-weight', 'bold')
          .text(`${change.original}→${change.modified}`);
      }
    });

    // Draw change markers at bottom
    const changeMarkersGroup = g.append('g').attr('class', 'change-markers');
    const markerY = modifiedSequenceY + sequenceHeight + 30;

    activeComparison.changes
      .filter((c) => c.position >= viewportStart && c.position < viewportEnd)
      .forEach((change) => {
        const x = (change.position - viewportStart) * nucleotideWidth + nucleotideWidth / 2;
        changeMarkersGroup
          .append('circle')
          .attr('cx', x)
          .attr('cy', markerY)
          .attr('r', 4)
          .attr('fill', '#ff6600')
          .attr('opacity', 0.8);

        changeMarkersGroup
          .append('text')
          .attr('x', x)
          .attr('y', markerY + 18)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('fill', 'currentColor')
          .text(`Pos ${change.position + 1}`);
      });

    // Add legend
    const legendGroup = g.append('g').attr('class', 'legend');
    const legendY = innerHeight - 30;
    const legendItems = [
      { label: 'A', color: NUCLEOTIDE_COLORS.A },
      { label: 'T', color: NUCLEOTIDE_COLORS.T },
      { label: 'G', color: NUCLEOTIDE_COLORS.G },
      { label: 'C', color: NUCLEOTIDE_COLORS.C },
    ];

    legendItems.forEach((item, idx) => {
      const x = innerWidth - 150 + idx * 30;
      legendGroup
        .append('rect')
        .attr('x', x)
        .attr('y', legendY - 15)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', item.color)
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5);

      legendGroup
        .append('text')
        .attr('x', x + 10)
        .attr('y', legendY)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', 'currentColor')
        .text(item.label);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text/70">Loading DNA comparison data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (comparisons.length === 0) {
    return (
      <div className="p-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-600 dark:text-yellow-400">
          No edit suggestions found for this analysis.
        </p>
      </div>
    );
  }

  const activeComparison = comparisons[activeTab];
  const maxViewport = Math.max(0, activeComparison.original_dna.length - nucleotidesPerView);

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-secondary/30">
        {comparisons.map((comp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveTab(idx);
              setViewportStart(0);
            }}
            className={`px-4 py-2 rounded-t-lg transition-all ${
              activeTab === idx
                ? 'bg-primary text-background font-semibold'
                : 'bg-secondary/20 text-text/70 hover:bg-secondary/40'
            }`}
          >
            Suggestion {idx + 1} ({comp.efficiency_score.toFixed(0)}%)
          </button>
        ))}
      </div>

      {/* Navigation Controls */}
      {activeComparison && (
        <div className="mb-4 p-4 bg-secondary/10 rounded-lg flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewportStart(Math.max(0, viewportStart - nucleotidesPerView / 2))}
              disabled={viewportStart === 0}
              className="px-4 py-2 bg-primary text-background rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() =>
                setViewportStart(
                  Math.min(maxViewport, viewportStart + nucleotidesPerView / 2)
                )
              }
              disabled={viewportStart >= maxViewport}
              className="px-4 py-2 bg-primary text-background rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
            <span className="text-sm text-text/70">
              Viewing positions {viewportStart + 1}-
              {Math.min(viewportStart + nucleotidesPerView, activeComparison.original_dna.length)} of{' '}
              {activeComparison.original_dna.length}
            </span>
          </div>
          <div className="text-sm text-text/70">
            <strong>{activeComparison.change_count}</strong> change(s) detected | Target:{' '}
            {activeComparison.target_position + 1} ({activeComparison.original_base}→
            {activeComparison.target_base})
          </div>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => setShow3D(!show3D)}
          className={`px-4 py-2 rounded-lg transition-all ${
            show3D
              ? 'bg-primary text-background'
              : 'bg-secondary/20 text-text hover:bg-secondary/40'
          }`}
        >
          {show3D ? 'Show 2D Comparison' : 'Show 3D DNA Model'}
        </button>
      </div>

      {show3D && (
        <div className="mb-4">
          <DNA3DViewer
            originalDna={activeComparison.original_dna}
            modifiedDna={activeComparison.modified_dna}
            changes={activeComparison.changes}
            height={500}
          />
        </div>
      )}
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full border border-secondary/30 rounded-lg bg-background"
        style={{ 
          maxWidth: '100%', 
          height: 'auto', 
          display: show3D ? 'none' : 'block' 
        }}
      />
    </div>
  );
}

