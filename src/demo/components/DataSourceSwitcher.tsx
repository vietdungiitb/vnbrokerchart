/**
 * Data Source Switcher Component
 * Toggle between Demo and VNInvest data sources
 */

import { useCallback, useState } from 'react';
import { useDemoI18n } from '../i18n';
import { VNSymbolSearch } from './VNSymbolSearch';

export type DataSourceId = 'demo' | 'vninvest';

export interface DataSourceSwitcherProps {
  activeSource: DataSourceId;
  onSourceChange: (id: DataSourceId) => void;
  onPATModalOpen?: () => void;
  hasPAT?: boolean;
  dataSource?: any; // VNInvestDataSource interface
  selectedSymbol?: string;
  onSymbolChange?: (symbol: string) => void;
  selectedTimeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
  selectedDays?: number;
  onDaysChange?: (days: number) => void;
  onLoadChart?: () => void;
  isLoading?: boolean;
}

export function DataSourceSwitcher({
  activeSource,
  onSourceChange,
  onPATModalOpen,
  hasPAT,
  dataSource,
  selectedSymbol = 'VCB',
  onSymbolChange,
  selectedTimeframe = '1D',
  onTimeframeChange,
  selectedDays = 90,
  onDaysChange,
  onLoadChart,
  isLoading = false,
}: DataSourceSwitcherProps) {
  const { t } = useDemoI18n();
  const [showVNIOptions, setShowVNIOptions] = useState(activeSource === 'vninvest');

  const handleSourceChange = useCallback(
    (newSource: DataSourceId) => {
      onSourceChange(newSource);
      setShowVNIOptions(newSource === 'vninvest');
      if (newSource === 'vninvest' && !hasPAT && onPATModalOpen) {
        // Don't open modal immediately, let user interact with the button
      }
    },
    [onSourceChange, hasPAT, onPATModalOpen]
  );

  const timeframes = ['1m', '5m', '15m', '1H', '1D'];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        backgroundColor: 'var(--chart-surface, #f5f5f5)',
        borderRadius: '4px',
        border: '1px solid var(--chart-border, #ddd)',
      }}
    >
      {/* Source selector */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label style={{ fontSize: '13px', fontWeight: 600 }}>
          {t('dataSource.label')}:
        </label>
        {(['demo', 'vninvest'] as DataSourceId[]).map((source) => (
          <button
            key={source}
            onClick={() => handleSourceChange(source)}
            style={{
              padding: '6px 12px',
              backgroundColor: activeSource === source ? 'var(--chart-primary, #007bff)' : 'var(--chart-bg, #fff)',
              color: activeSource === source ? '#fff' : 'var(--chart-text, #000)',
              border: `1px solid ${activeSource === source ? 'var(--chart-primary, #007bff)' : 'var(--chart-border, #ddd)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeSource === source ? 600 : 400,
            }}
          >
            {source === 'demo' ? t('dataSource.demo') : t('dataSource.vninvest')}
          </button>
        ))}

        {/* PAT status badge */}
        {activeSource === 'vninvest' && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {hasPAT ? (
              <span style={{ fontSize: '12px', color: '#4caf50', fontWeight: 600 }}>✓ Đã kết nối</span>
            ) : (
              <>
                <span style={{ fontSize: '12px', color: '#f44336' }}>✗ Chưa kết nối</span>
                {onPATModalOpen && (
                  <button
                    onClick={onPATModalOpen}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#f44336',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    🔑 {t('vninvest.connect')}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* VNInvest options panel */}
      {showVNIOptions && activeSource === 'vninvest' && dataSource && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--chart-border, #ddd)' }}>
          {/* Symbol search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>
              {t('vninvest.symbol')}
            </label>
            {dataSource && (
              <VNSymbolSearch
                dataSource={dataSource}
                initialValue={selectedSymbol}
                onSelect={(symbol) => onSymbolChange?.(symbol)}
              />
            )}
          </div>

          {/* Timeframe & Days selectors */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>
                {t('vninvest.timeframe')}
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => onTimeframeChange?.(e.target.value)}
                style={{
                  padding: '6px',
                  border: '1px solid var(--chart-border, #ddd)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: 'var(--chart-input-bg, #fff)',
                  color: 'var(--chart-text, #000)',
                }}
              >
                {timeframes.map((tf) => (
                  <option key={tf} value={tf}>
                    {tf}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>
                {t('vninvest.days')}
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={selectedDays}
                onChange={(e) => onDaysChange?.(Math.max(1, parseInt(e.target.value, 10)))}
                style={{
                  padding: '6px',
                  border: '1px solid var(--chart-border, #ddd)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: 'var(--chart-input-bg, #fff)',
                  color: 'var(--chart-text, #000)',
                }}
              />
            </div>
          </div>

          {/* Load chart button */}
          {onLoadChart && (
            <button
              onClick={onLoadChart}
              disabled={isLoading || !hasPAT}
              style={{
                padding: '8px 12px',
                backgroundColor: !hasPAT ? '#ccc' : '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: !hasPAT || isLoading ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                opacity: isLoading || !hasPAT ? 0.6 : 1,
              }}
            >
              {isLoading ? t('vninvest.loading') : t('vninvest.load')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
