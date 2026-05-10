/**
 * PAT Token Modal for VNInvest authentication
 * Supports both token paste and login flow
 */

import { useCallback, useState, type ReactNode } from 'react';
import { useDemoI18n } from '../i18n';

export interface PATTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPATSaved: (token: string) => void;
  currentToken?: string;
}

type TabType = 'paste' | 'login';

export function PATTokenModal({
  isOpen,
  onClose,
  onPATSaved,
  currentToken,
}: PATTokenModalProps) {
  const { t } = useDemoI18n();
  const [activeTab, setActiveTab] = useState<TabType>('paste');
  const [pasteToken, setPasteToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSaveToken = useCallback(() => {
    const token = pasteToken.trim();
    if (!token) {
      setError('Token không được để trống');
      return;
    }
    setLoading(true);
    try {
      onPATSaved(token);
      setPasteToken('');
      setError(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, [pasteToken, onPATSaved, onClose]);

  const handleLogin = useCallback(async () => {
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost/api/auth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const data = await response.json();
      const token = data.access || data.token;
      if (!token) {
        throw new Error('No token in response');
      }

      onPATSaved(token);
      setUsername('');
      setPassword('');
      setError(null);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi đăng nhập';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [username, password, onPATSaved, onClose]);

  const handleClearToken = useCallback(() => {
    if (window.confirm('Xóa PAT token đã lưu?')) {
      localStorage.removeItem('vni_pat');
      setPasteToken('');
      setError(null);
      onClose();
    }
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--chart-bg, #fff)',
          color: 'var(--chart-text, #000)',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '70vh',
          overflow: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            {t('vninvest.patModal.title')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--chart-border, #ddd)' }}>
          {(['paste', 'login'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(null); }}
              style={{
                padding: '8px 16px',
                background: activeTab === tab ? 'var(--chart-primary, #007bff)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--chart-text, #000)',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--chart-primary, #007bff)' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab === 'paste' ? t('vninvest.patModal.tab.paste') : t('vninvest.patModal.tab.login')}
            </button>
          ))}
        </div>

        {/* Paste Token Tab */}
        {activeTab === 'paste' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              value={pasteToken}
              onChange={(e) => { setPasteToken(e.target.value); setError(null); }}
              placeholder={t('vninvest.patModal.input.token')}
              style={{
                padding: '10px',
                border: '1px solid var(--chart-border, #ddd)',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical',
                minHeight: '80px',
                backgroundColor: 'var(--chart-input-bg, #fff)',
                color: 'var(--chart-text, #000)',
              }}
            />
            {error && (
              <div style={{ color: '#d32f2f', fontSize: '13px', padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSaveToken}
                disabled={loading}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  opacity: loading ? 0.6 : 1,
                  flex: 1,
                }}
              >
                {loading ? t('common.loading') : t('vninvest.patModal.btn.save')}
              </button>
              {currentToken && (
                <button
                  onClick={handleClearToken}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {t('vninvest.patModal.btn.clear')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Login Tab */}
        {activeTab === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(null); }}
              placeholder={t('vninvest.patModal.input.username')}
              style={{
                padding: '10px',
                border: '1px solid var(--chart-border, #ddd)',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'var(--chart-input-bg, #fff)',
                color: 'var(--chart-text, #000)',
              }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder={t('vninvest.patModal.input.password')}
              style={{
                padding: '10px',
                border: '1px solid var(--chart-border, #ddd)',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'var(--chart-input-bg, #fff)',
                color: 'var(--chart-text, #000)',
              }}
            />
            {error && (
              <div style={{ color: '#d32f2f', fontSize: '13px', padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                {error}
              </div>
            )}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                padding: '10px 16px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? t('common.loading') : t('vninvest.patModal.btn.login')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
