/**
 * VNInvest Symbol Search Component
 * Autocomplete dropdown with debounced search
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDemoI18n } from '../i18n';
import type { VNInvestDataSource } from '../dataSources';

export interface SymbolSearchProps {
  dataSource: any; // DataSource interface
  onSelect: (symbol: string) => void;
  initialValue?: string;
}

interface SearchResult {
  symbol: string;
  company_name?: string;
  exchange?: string;
}

export function VNSymbolSearch({ dataSource, onSelect, initialValue = '' }: SymbolSearchProps) {
  const { t } = useDemoI18n();
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const symbols = await dataSource.searchSymbols(query);
        setResults(
          symbols.map((s: any) => ({
            symbol: s.symbol,
            company_name: s.company_name,
            exchange: s.exchange,
          }))
        );
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Symbol search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, dataSource]);

  const handleSelect = useCallback(
    (symbol: string) => {
      setQuery(symbol);
      setIsOpen(false);
      setResults([]);
      onSelect(symbol);
    },
    [onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleSelect(results[selectedIndex].symbol);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
        default:
          break;
      }
    },
    [results, selectedIndex, handleSelect]
  );

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value.toUpperCase())}
        onKeyDown={handleKeyDown}
        onFocus={() => query && setIsOpen(true)}
        placeholder={t('vninvest.symbolSearch')}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid var(--chart-border, #ddd)',
          borderRadius: '4px',
          fontSize: '14px',
          backgroundColor: 'var(--chart-input-bg, #fff)',
          color: 'var(--chart-text, #000)',
          boxSizing: 'border-box',
        }}
      />

      {isOpen && (results.length > 0 || loading) && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'var(--chart-bg, #fff)',
            border: '1px solid var(--chart-border, #ddd)',
            borderRadius: '4px',
            marginTop: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {loading && (
            <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
              {t('common.loading')}
            </div>
          )}

          {results.length > 0 &&
            results.map((result, index) => (
              <div
                key={`${result.symbol}-${index}`}
                onClick={() => handleSelect(result.symbol)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor:
                    index === selectedIndex ? 'var(--chart-primary, #007bff)' : 'transparent',
                  color: index === selectedIndex ? '#fff' : 'var(--chart-text, #000)',
                  borderBottom: '1px solid var(--chart-border, #eee)',
                }}
              >
                <strong>{result.symbol}</strong> — {result.company_name || ''}
                {result.exchange && <span style={{ fontSize: '12px', opacity: 0.7 }}> ({result.exchange})</span>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
