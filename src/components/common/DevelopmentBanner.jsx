import { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { AlertCircle, X } from 'lucide-react';

/**
 * 개발 모드 배너
 * - 백엔드 서버 연결 실패 시 표시
 * - 로컬 모드로 동작 중임을 알림
 */
export default function DevelopmentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 백엔드 서버 연결 확인
    const checkBackend = async () => {
      // 이미 닫았으면 표시하지 않음
      if (isDismissed || sessionStorage.getItem('dev-banner-dismissed')) {
        return;
      }

      try {
        await apiClient.get('/health/ping', { timeout: 3000 });
      } catch (error) {
        // 서버 연결 실패
        setIsVisible(true);
      }
    };

    // 개발 환경에서만 체크
    if (import.meta.env.DEV) {
      checkBackend();
    }
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem('dev-banner-dismissed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-100 border-b border-yellow-300">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-700 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                개발 모드 (로컬 데이터 사용 중)
              </p>
              <p className="text-xs text-yellow-700">
                백엔드 서버에 연결할 수 없습니다. 일부 기능은 제한될 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-4 text-yellow-700 hover:text-yellow-900"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

