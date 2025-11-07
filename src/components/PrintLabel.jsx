import React, { useEffect, useMemo, useState } from 'react';
import { X, Printer, Package, Barcode } from 'lucide-react';
import { labelAPI } from '../api';

const SIZES = [
  { value: 'large', label: 'Large (100mm)' },
  { value: 'medium', label: 'Medium (80mm)' },
  { value: 'small', label: 'Small (40mm)' },
  { value: 'verysmall', label: 'VerySmall (26mm)' },
];

const PrintLabel = ({ isOpen, onClose, onPrinted }) => {
  const [labels, setLabels] = useState([]);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [selectedLabelId, setSelectedLabelId] = useState('');

  const [printers, setPrinters] = useState([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState('');

  const [size, setSize] = useState('large');
  const [printCount, setPrintCount] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);

  // 프린터 목록 로드 (모달 열릴 때)
  useEffect(() => {
    if (!isOpen) return;
    const fetchPrinters = async () => {
      try {
        setIsLoadingPrinters(true);
        const response = await labelAPI.getPrinters();
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.printers || [];
        setPrinters(list);
        if (list.length > 0) {
          const first = typeof list[0] === 'string' ? list[0] : list[0].name || list[0].id;
          setSelectedPrinter(first);
        }
      } catch (err) {
        console.error('프린터 목록 가져오기 실패:', err);
      } finally {
        setIsLoadingPrinters(false);
      }
    };
    fetchPrinters();
  }, [isOpen]);

  // 저장된 라벨 로드 (모달 열릴 때)
  useEffect(() => {
    if (!isOpen) return;
    const fetchAllLabels = async () => {
      try {
        setLoadingLabels(true);
        // 페이지 파라미터는 백엔드 요구에 맞게 조정
        const response = await labelAPI.getAllLabels?.({ page: 1, limit: 200 })
          // getAllLabels가 없을 경우 대비해 labels 기본 엔드포인트 호출
          || (await labelAPI.getLabels());
        const rows = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.labels || [];
        setLabels(rows);
        if (rows.length > 0) {
          setSelectedLabelId(rows[0].id || rows[0].labelId || '');
        }
      } catch (err) {
        console.error('라벨 목록 가져오기 실패:', err);
        setLabels([]);
      } finally {
        setLoadingLabels(false);
      }
    };
    fetchAllLabels();
  }, [isOpen]);

  const selectedLabel = useMemo(() => {
    return labels.find(l => (l.id || l.labelId) === selectedLabelId);
  }, [labels, selectedLabelId]);

  const handlePrint = async () => {
    if (!selectedLabelId) {
      alert('라벨을 선택해주세요.');
      return;
    }
    if (!selectedPrinter) {
      alert('프린터를 선택해주세요.');
      return;
    }
    if (!printCount || printCount < 1) {
      alert('인쇄 개수는 1개 이상이어야 합니다.');
      return;
    }

    try {
      setIsPrinting(true);
      await labelAPI.printSavedLabel({
        labelId: selectedLabelId,
        printerName: selectedPrinter,
        printCount,
        // size는 현재 백엔드 스펙에 포함되지 않으므로 전송 생략 (UI 제어용)
      });
      alert(`${printCount}개 인쇄 요청이 완료되었습니다.`);
      if (onPrinted) onPrinted({ labelId: selectedLabelId, printerName: selectedPrinter, printCount, size });
      onClose?.();
    } catch (err) {
      console.error('라벨 인쇄 실패:', err);
      alert(`인쇄 실패: ${err.response?.data?.message || err.message || '알 수 없는 오류'}`);
    } finally {
      setIsPrinting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-[#674529]" />
            <h2 className="text-lg font-semibold text-[#674529]">라벨 프린트</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 좌측: 선택 영역 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">저장된 라벨 선택</label>
                <select
                  value={selectedLabelId}
                  onChange={(e) => setSelectedLabelId(e.target.value)}
                  disabled={loadingLabels || labels.length === 0}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingLabels ? (
                    <option>라벨 로딩 중...</option>
                  ) : labels.length === 0 ? (
                    <option>저장된 라벨이 없습니다</option>
                  ) : (
                    labels.map((l, idx) => (
                      <option key={l.id || l.labelId || idx} value={l.id || l.labelId}>
                        {(l.productName || l.item_name || '라벨') + ` (#${l.id || l.labelId})`}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">라벨 크기</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
                  >
                    {SIZES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">인쇄 개수</label>
                  <input
                    type="number"
                    min="1"
                    value={printCount}
                    onChange={(e) => setPrintCount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
                    placeholder="인쇄할 개수"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">프린터 선택</label>
                <select
                  value={selectedPrinter}
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                  disabled={isLoadingPrinters || printers.length === 0}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingPrinters ? (
                    <option>프린터 목록 로딩 중...</option>
                  ) : printers.length === 0 ? (
                    <option>사용 가능한 프린터가 없습니다</option>
                  ) : (
                    printers.map((p, idx) => {
                      const name = typeof p === 'string' ? p : p.name || p.id || `프린터 ${idx + 1}`;
                      const suffix = typeof p === 'object' && p.driver ? ` (${p.driver})` : '';
                      return (
                        <option key={idx} value={name}>{name}{suffix}</option>
                      );
                    })
                  )}
                </select>
              </div>
            </div>

            {/* 우측: 미리보기 정보 */}
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <div className="text-sm text-gray-700 space-y-2">
                <div className="font-semibold text-[#674529]">선택 정보</div>
                <div className="flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-gray-500" />
                  <span>라벨 ID: {selectedLabelId || '-'}</span>
                </div>
                <div>라벨 크기: {SIZES.find(s => s.value === size)?.label}</div>
                <div>인쇄 개수: {printCount}</div>
                <div>프린터: {selectedPrinter || '-'}</div>
                <hr className="my-3" />
                <div className="text-xs text-gray-500">
                  * 저장된 라벨의 실제 디자인은 서버에 저장된 템플릿 기준으로 인쇄됩니다.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting || !selectedLabelId || !selectedPrinter}
            className="inline-flex items-center rounded-xl bg-[#674529] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#5a3d22] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="mr-2 h-4 w-4" />
            {isPrinting ? '인쇄 중...' : '프린트하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintLabel;
