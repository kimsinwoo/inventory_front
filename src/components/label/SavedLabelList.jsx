import { useState, useEffect, useRef, useCallback } from 'react';
import { Printer, Search, Package, Barcode } from 'lucide-react';
import { labelAPI } from '../../api';

const SavedLabelList = () => {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('barcode'); // 'barcode' or 'inventory'
  const [searchValue, setSearchValue] = useState('');
  const [printCount, setPrintCount] = useState(1);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [printers, setPrinters] = useState([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [printingLabelId, setPrintingLabelId] = useState(null);
  const abortControllerRef = useRef(null); // API 요청 취소용

  // 프린터 목록 가져오기 (cleanup 추가)
  useEffect(() => {
    let isMounted = true;

    const fetchPrinters = async () => {
      try {
        setIsLoadingPrinters(true);
        const response = await labelAPI.getPrinters();
        if (isMounted) {
          const printerList = Array.isArray(response.data) 
            ? response.data 
            : response.data?.data || response.data?.printers || [];
          setPrinters(printerList);
          if (printerList.length > 0) {
            const firstPrinter = typeof printerList[0] === 'string' 
              ? printerList[0] 
              : printerList[0].name || printerList[0].id;
            setSelectedPrinter(firstPrinter);
          }
        }
      } catch (error) {
        if (isMounted && error.name !== 'AbortError') {
          console.error('프린터 목록 가져오기 실패:', error);
        }
      } finally {
        if (isMounted) {
          setIsLoadingPrinters(false);
        }
      }
    };

    fetchPrinters();

    // Cleanup 함수
    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 저장된 라벨 전체 조회 (cleanup 추가)
  const handleFetchAll = useCallback(async () => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    let isMounted = true;

    try {
      setLoading(true);
      const response = await labelAPI.getAllLabels({ page: 1, limit: 200 });
      if (!signal.aborted && isMounted) {
        const rows = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
        setLabels(rows);
      }
    } catch (error) {
      if (!signal.aborted && isMounted && error.name !== 'AbortError') {
        console.error('라벨 전체 조회 실패:', error);
        alert(`라벨 전체 조회에 실패했습니다: ${error.response?.data?.message || error.message || '알 수 없는 오류'}`);
        setLabels([]);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, []);

  // 마운트 시 자동 전체 조회
  useEffect(() => {
    handleFetchAll();
    
    // Cleanup 함수
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [handleFetchAll]);

  // 라벨 조회 (useCallback으로 최적화)
  const handleSearch = useCallback(async () => {
    if (!searchValue.trim()) {
      alert('검색값을 입력해주세요.');
      return;
    }

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    let isMounted = true;

    try {
      setLoading(true);
      let response;
      
      if (searchType === 'barcode') {
        response = await labelAPI.getLabelsByBarcode(searchValue);
      } else {
        response = await labelAPI.getLabelsByInventory(searchValue);
      }

      if (!signal.aborted && isMounted) {
        const labelList = Array.isArray(response.data) 
          ? response.data 
          : response.data?.data || response.data?.labels || [];
        setLabels(labelList);
      }
    } catch (error) {
      if (!signal.aborted && isMounted && error.name !== 'AbortError') {
        console.error('라벨 조회 실패:', error);
        alert(`라벨 조회에 실패했습니다: ${error.response?.data?.message || error.message || '알 수 없는 오류'}`);
        setLabels([]);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [searchType, searchValue]);

  // 저장된 라벨 출력 (useCallback으로 최적화)
  const handlePrint = useCallback(async (labelId) => {
    if (!selectedPrinter) {
      alert('프린터를 선택해주세요.');
      return;
    }

    try {
      setPrintingLabelId(labelId);
      await labelAPI.printSavedLabel({
        labelId,
        printerName: selectedPrinter,
        printCount,
      });
      alert(`${printCount}개가 성공적으로 인쇄되었습니다.`);
    } catch (error) {
      console.error('라벨 인쇄 실패:', error);
      alert(`인쇄에 실패했습니다: ${error.response?.data?.message || error.message || '알 수 없는 오류'}`);
    } finally {
      setPrintingLabelId(null);
    }
  }, [selectedPrinter, printCount]);

  const isPrinterList = Array.isArray(labels) && labels.length > 0 && (labels[0]?.name || labels[0]?.driver || labels[0]?.status);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6 flex items-center space-x-2">
        <Package className="h-5 w-5 text-[#674529]" />
        <h2 className="text-lg font-semibold text-[#674529]">저장된 라벨 조회</h2>
      </div>

      {/* 검색 영역 */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            검색 유형
          </label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
          >
            <option value="barcode">바코드로 조회</option>
            <option value="inventory">재고 ID로 조회</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {searchType === 'barcode' ? '바코드 번호' : '재고 ID'}
          </label>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
            placeholder={searchType === 'barcode' ? '바코드 번호 입력' : '재고 ID 입력'}
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-[#674529] text-white py-2.5 px-6 rounded-xl font-medium hover:bg-[#5a3d22] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={18} />
            {loading ? '조회 중...' : '조회'}
          </button>
        </div>
      </div>

      {/* 프린터 설정 영역 */}
      {labels.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              프린터 선택
            </label>
            <select
              value={selectedPrinter}
              onChange={(e) => setSelectedPrinter(e.target.value)}
              disabled={isLoadingPrinters || printers.length === 0}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              {isLoadingPrinters ? (
                <option>프린터 목록 로딩 중...</option>
              ) : printers.length === 0 ? (
                <option>사용 가능한 프린터가 없습니다</option>
              ) : (
                printers.map((printer, index) => {
                  const printerName = typeof printer === 'string' ? printer : printer.name || printer.id || `프린터 ${index + 1}`;
                  return (
                    <option key={index} value={printerName}>
                      {printerName}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              인쇄 개수
            </label>
            <input
              type="number"
              min="1"
              value={printCount}
              onChange={(e) => setPrintCount(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors bg-white"
              placeholder="인쇄할 개수"
            />
          </div>
        </div>
      )}

      {/* 라벨 목록 */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {isPrinterList ? (
                  <>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">프린터명</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">드라이버</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">상태</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">제품명</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">보관조건</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">등록번호</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">제조일자</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">유통기한</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">바코드</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">작업</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={8}>
                    조회 중...
                  </td>
                </tr>
              ) : labels.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={8}>
                    표시할 라벨이 없습니다.
                  </td>
                </tr>
              ) : (
                labels.map((row, idx) => (
                  isPrinterList ? (
                    <tr key={row.name || idx} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{row.driver || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{typeof row.status === 'number' ? row.status : row.status ?? '-'}</td>
                    </tr>
                  ) : (
                    <tr key={row.id || row.labelId || idx} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{row.id || row.labelId}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{row.productName || row.item_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{row.storageCondition || row.storage_condition || '냉동'}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{row.registrationNumber || row.registration_number || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{row.manufactureDate || row.manufacture_date || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{row.expiryDate || row.expiry_date || '-'}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-700">
                          <Barcode className="h-4 w-4 text-gray-500" />
                          <span>{row.barcode || row.barcodeNumber || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handlePrint(row.id || row.labelId)}
                          disabled={printingLabelId === (row.id || row.labelId) || !selectedPrinter}
                          className="flex items-center space-x-1 rounded-xl bg-[#674529] hover:bg-[#553821] px-3 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Printer className="h-4 w-4" />
                          <span>
                            {printingLabelId === (row.id || row.labelId) ? '인쇄 중...' : '인쇄'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  )
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SavedLabelList;

