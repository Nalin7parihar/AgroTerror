'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { apiRequest } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface SNP {
  snp_id: string;
  chromosome: string;
  position: number;
  original_allele: string;
  new_allele: string;
  effect_size: number;
  is_causal_candidate: boolean;
  nearby_genes?: string[];
  dnabert_score?: number;
}

interface DensityBin {
  start: number;
  end: number;
  count: number;
  density: number;
}

interface SNPLocusViewerProps {
  analysisId: string;
  width?: number;
  height?: number;
  window?: number;
  bins?: number;
}

export function SNPLocusViewer({
  analysisId,
  width = 1200,
  height = 700,
  window = 5000,
  bins = 100,
}: SNPLocusViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [snps, setSnps] = useState<SNP[]>([]);
  const [densityBins, setDensityBins] = useState<DensityBin[]>([]);
  const [causalCandidates, setCausalCandidates] = useState<SNP[]>([]);
  const [chromosome, setChromosome] = useState<string | null>(null);
  const [startPos, setStartPos] = useState<number | null>(null);
  const [endPos, setEndPos] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSNP, setSelectedSNP] = useState<SNP | null>(null);

  useEffect(() => {
    fetchLocusData();
  }, [analysisId, window, bins]);

  const fetchLocusData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{
        analysis_id: string;
        chromosome: string | null;
        start: number | null;
        end: number | null;
        window: number;
        bins: number;
        snps: SNP[];
        density_bins: DensityBin[];
        causal_candidates: SNP[];
        total_snps: number;
        dataset: string;
      }>(`/gene-analysis/history/${analysisId}/snp-locus?window=${window}&bins=${bins}`);

      setSnps(response.snps || []);
      setDensityBins(response.density_bins || []);
      setCausalCandidates(response.causal_candidates || []);
      setChromosome(response.chromosome);
      setStartPos(response.start);
      setEndPos(response.end);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load locus data');
      console.error('Error fetching locus data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || error || !svgRef.current || !startPos || !endPos || !chromosome) return;

    // Clear previous rendering
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 70, right: 100, bottom: 120, left: 90 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([startPos, endPos])
      .range([0, innerWidth]);

    const maxDensity = d3.max(densityBins, (d) => d.density) || 1;
    const yDensityScale = d3
      .scaleLinear()
      .domain([0, maxDensity * 1.1])
      .range([innerHeight * 0.35, 0]);

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('fill', 'currentColor')
      .text(`SNP Locus Viewer: Chromosome ${chromosome} (${startPos.toLocaleString()} - ${endPos.toLocaleString()} bp)`);

    // Draw density histogram
    const densityGroup = g.append('g').attr('class', 'density-histogram');

    densityGroup
      .selectAll('rect')
      .data(densityBins)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.start))
      .attr('width', (d) => Math.max(1, xScale(d.end) - xScale(d.start)))
      .attr('y', (d) => yDensityScale(d.density))
      .attr('height', (d) => innerHeight * 0.35 - yDensityScale(d.density))
      .attr('fill', '#3b82f6')
      .attr('opacity', 0.7)
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 0.5);

    // Add density axis labels
    densityGroup
      .append('text')
      .attr('x', -50)
      .attr('y', innerHeight * 0.175)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90, -50, ' + innerHeight * 0.175 + ')')
      .attr('font-size', '12px')
      .attr('fill', 'currentColor')
      .text('SNP Density (per kb)');

    densityGroup
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight * 0.38)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', 'currentColor')
      .text('SNP Density Track (HapMap3)');

    // Draw SNP positions track
    const snpGroup = g.append('g').attr('class', 'snp-positions');
    const trackY = innerHeight * 0.45;

    // Draw regular SNPs
    snpGroup
      .selectAll('circle.snp')
      .data(snps.filter((s) => !s.is_causal_candidate))
      .enter()
      .append('circle')
      .attr('class', 'snp')
      .attr('cx', (d) => xScale(d.position))
      .attr('cy', trackY)
      .attr('r', 4)
      .attr('fill', '#6b7280')
      .attr('opacity', 0.8)
      .attr('stroke', '#4b5563')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function (event: MouseEvent, d: SNP) {
        d3.select(this).attr('r', 6).attr('opacity', 1);
        setSelectedSNP(d);
        showTooltip(event, d);
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 4).attr('opacity', 0.8);
        hideTooltip();
      });

    // Draw causal candidates (highlighted)
    snpGroup
      .selectAll('circle.causal')
      .data(causalCandidates)
      .enter()
      .append('circle')
      .attr('class', 'causal')
      .attr('cx', (d) => xScale(d.position))
      .attr('cy', trackY)
      .attr('r', 6)
      .attr('fill', '#ef4444')
      .attr('opacity', 0.9)
      .attr('stroke', '#dc2626')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function (event: MouseEvent, d: SNP) {
        d3.select(this).attr('r', 8).attr('opacity', 1);
        setSelectedSNP(d);
        showTooltip(event, d, true);
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 6).attr('opacity', 0.9);
        hideTooltip();
      });

    // Add SNP track label
    snpGroup
      .append('text')
      .attr('x', -50)
      .attr('y', trackY + 5)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90, -50, ' + (trackY + 5) + ')')
      .attr('font-size', '12px')
      .attr('fill', 'currentColor')
      .text('SNP Positions');

    snpGroup
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', trackY + 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', 'currentColor')
      .text('SNP Changes (Red = Causal Candidates)');

    // Add X axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => {
        const val = typeof d === 'number' ? d : Number(d);
        return val.toLocaleString();
      })
      .ticks(10);

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('fill', 'currentColor');

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 70)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', 'currentColor')
      .text(`Genomic Position (bp) - Chromosome ${chromosome}`);

    // Add Y axis for density
    const yAxis = d3.axisLeft(yDensityScale).ticks(5);
    densityGroup
      .append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('fill', 'currentColor');

    // Draw region boundary lines
    g.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#fbbf24')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.6);

    g.append('line')
      .attr('x1', innerWidth)
      .attr('x2', innerWidth)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#fbbf24')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.6);
  }, [snps, densityBins, causalCandidates, loading, error, chromosome, startPos, endPos, width, height]);

  const showTooltip = (event: MouseEvent, snp: SNP, isCausal: boolean = false) => {
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'snp-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.95)')
      .style('color', 'white')
      .style('padding', '10px 14px')
      .style('border-radius', '6px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('font-size', '12px')
      .style('box-shadow', '0 4px 6px rgba(0,0,0,0.3)')
      .html(`
        <strong style="color: ${isCausal ? '#ef4444' : '#93c5fd'}">${snp.snp_id}</strong><br/>
        Position: ${snp.position.toLocaleString()} bp<br/>
        Change: ${snp.original_allele} → ${snp.new_allele}<br/>
        Effect Size: ${snp.effect_size.toFixed(2)}<br/>
        ${isCausal ? '<span style="color: #ef4444; font-weight: bold;">⚠ Causal Candidate</span><br/>' : ''}
        ${snp.nearby_genes && snp.nearby_genes.length > 0 ? `Genes: ${snp.nearby_genes.join(', ')}<br/>` : ''}
        ${snp.dnabert_score ? `DNABERT Score: ${snp.dnabert_score.toFixed(3)}` : ''}
      `);

    tooltip
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 10}px`);
  };

  const hideTooltip = () => {
    d3.selectAll('.snp-tooltip').remove();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text/70">Loading SNP locus data...</p>
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

  if (!startPos || !endPos || !chromosome || snps.length === 0) {
    return (
      <div className="p-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-600 dark:text-yellow-400">
          No SNP data available for this analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 p-4 bg-secondary/20 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-text/70">
              <strong>{snps.length}</strong> SNPs found |{' '}
              <strong className="text-red-500">{causalCandidates.length}</strong> Causal Candidates
            </p>
            <p className="text-sm text-text/70">
              Max density: {Math.max(...densityBins.map((d) => d.density)).toFixed(2)} SNPs/kb | Region: {startPos.toLocaleString()} - {endPos.toLocaleString()} bp
            </p>
          </div>
          {selectedSNP && (
            <div className="text-sm">
              <p className="font-semibold text-text">Selected SNP:</p>
              <p className="text-text/70">
                {selectedSNP.snp_id} at {selectedSNP.position.toLocaleString()}
                {selectedSNP.is_causal_candidate && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                    Causal
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full border border-secondary/30 rounded-lg bg-background"
        style={{ maxWidth: '100%', height: 'auto' }}
      />

      <style jsx global>{`
        .snp-tooltip {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
}
