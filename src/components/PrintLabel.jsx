import React, { useEffect, useState, useMemo } from 'react';
import { X, Printer, Package, Barcode } from 'lucide-react';
import { labelAPI, itemsAPI } from '../api';
import { getPrinters, getDefaultPrinter } from '../utils/printerUtils';

const SIZES = [
  { value: 'large', label: 'Large (100mm)' },
  { value: 'medium', label: 'Medium (80mm)' },
  { value: 'small', label: 'Small (40mm)' },
  { value: 'verysmall', label: 'VerySmall (26mm)' },
];

const PrintLabel = ({ isOpen, onClose, onPrinted }) => {
  // 품목 목록 상태
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');

  // 라벨 데이터 상태
  const [labelData, setLabelData] = useState({
    templateType: 'large',
    itemId: '',
    manufactureDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1년 후
    productName: '',
    storageCondition: '냉동',
    registrationNumber: '',
    categoryAndForm: '',
    ingredients: '',
    rawMaterials: '',
    actualWeight: '',
  });

  // 프린터 관련 상태
  const [printers, setPrinters] = useState([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [printCount, setPrintCount] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);

  // 품목 목록 자동 로드
  useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true;
    
    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        console.log('🔍 품목 목록 자동 로드 시작...');
        
        // Finished 카테고리 품목만 가져오기
        const response = await itemsAPI.getItems({ category: 'Finished', page: 1, limit: 1000 });
        
        if (isMounted) {
          const itemsList = Array.isArray(response.data) 
            ? response.data 
            : response.data?.data || response.data?.rows || [];
          
          // Finished 카테고리만 필터링
          const finishedOnly = itemsList.filter(item => {
            const category = item.category || item.Category || item.categoryName || '';
            return category === 'Finished' || category === '완제품';
          });
          
          setItems(finishedOnly);
          console.log('✅ 가져온 품목 목록:', finishedOnly);
          
          // 첫 번째 품목 자동 선택
          if (finishedOnly.length > 0) {
            const firstItem = finishedOnly[0];
            handleItemSelect(firstItem.id || firstItem.itemId);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ 품목 목록 로드 실패:', error);
          alert('품목 목록을 불러올 수 없습니다.');
        }
      } finally {
        if (isMounted) {
          setLoadingItems(false);
        }
      }
    };
    
    fetchItems();
    
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // 품목 선택 핸들러
  const handleItemSelect = (itemId) => {
    setSelectedItemId(itemId);
    const selectedItem = items.find(item => 
      (item.id === parseInt(itemId)) || (item.id === itemId) || (item.itemId === itemId)
    );
    
    if (selectedItem) {
      setLabelData(prev => ({
        ...prev,
        itemId: selectedItem.id || selectedItem.itemId || '',
        productName: selectedItem.name || selectedItem.itemName || selectedItem.productName || '',
        registrationNumber: selectedItem.code || selectedItem.registrationNumber || '',
        storageCondition: selectedItem.storageCondition || prev.storageCondition || '냉동',
      }));
    }
  };

  // 프린터 목록 로드
  useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true;
    
    const loadPrinters = async () => {
      try {
        setIsLoadingPrinters(true);
        console.log('🔍 프린터 목록 자동 로드 시작...');
        
        const printerList = await getPrinters(() => labelAPI.getPrinters());
        
        if (isMounted) {
          console.log('✅ 가져온 프린터 목록:', printerList);
          
          const printerNames = printerList.map(p => 
            typeof p === 'string' ? p : (p?.name || p?.id || p?.printerName || String(p))
          );
          
          setPrinters(printerNames);
          
          if (printerNames.length > 0) {
            const defaultPrinter = getDefaultPrinter();
            const printerToSelect = defaultPrinter && printerNames.includes(defaultPrinter) 
              ? defaultPrinter 
              : printerNames[0];
            setSelectedPrinter(printerToSelect);
            console.log('✅ 선택된 프린터:', printerToSelect);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ 프린터 목록 로드 실패:', error);
          setPrinters([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingPrinters(false);
        }
      }
    };
    
    loadPrinters();
    
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // 선택된 품목 정보
  const selectedItem = useMemo(() => {
    return items.find(item => 
      (item.id === parseInt(selectedItemId)) || (item.id === selectedItemId) || (item.itemId === selectedItemId)
    );
  }, [items, selectedItemId]);

  // 라벨 프린트
  const handlePrint = async () => {
    if (!selectedItemId) {
      alert('품목을 선택해주세요.');
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
    if (!labelData.manufactureDate) {
      alert('제조일자를 입력해주세요.');
      return;
    }
    if (!labelData.expiryDate) {
      alert('유통기한을 입력해주세요.');
      return;
    }

    try {
      setIsPrinting(true);
      
      await labelAPI.printLabel({
        templateType: labelData.templateType,
        itemId: labelData.itemId,
        manufactureDate: labelData.manufactureDate,
        expiryDate: labelData.expiryDate,
        printerName: selectedPrinter,
        printCount: printCount,
        productName: labelData.productName,
        storageCondition: labelData.storageCondition,
        registrationNumber: labelData.registrationNumber,
        categoryAndForm: labelData.categoryAndForm,
        ingredients: labelData.ingredients,
        rawMaterials: labelData.rawMaterials,
        actualWeight: labelData.actualWeight,
      });
      
      alert(`${printCount}개 인쇄 요청이 완료되었습니다.`);
      if (onPrinted) {
        onPrinted({ 
          itemId: labelData.itemId,
          printerName: selectedPrinter, 
          printCount, 
          templateType: labelData.templateType 
        });
      }
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
      <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 sticky top-0 bg-white z-10">
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
            {/* 좌측: 입력 영역 */}
            <div className="space-y-4">
              {/* 품목 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">품목 선택</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => handleItemSelect(e.target.value)}
                  disabled={loadingItems || items.length === 0}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingItems ? (
                    <option>품목 로딩 중...</option>
                  ) : items.length === 0 ? (
                    <option>품목이 없습니다</option>
                  ) : (
                    items.map((item, idx) => (
                      <option key={item.id || item.itemId || idx} value={item.id || item.itemId}>
                        {item.name || item.itemName || item.productName || `품목 ${idx + 1}`}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* 라벨 크기 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">라벨 크기</label>
                <select
                  value={labelData.templateType}
                  onChange={(e) => setLabelData({ ...labelData, templateType: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
                >
                  {SIZES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* 제조일자 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">제조일자</label>
                <input
                  type="date"
                  value={labelData.manufactureDate}
                  onChange={(e) => setLabelData({ ...labelData, manufactureDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
                />
              </div>

              {/* 유통기한 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">유통기한</label>
                <input
                  type="date"
                  value={labelData.expiryDate}
                  onChange={(e) => setLabelData({ ...labelData, expiryDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
                />
              </div>

              {/* 제품명 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">제품명</label>
                <input
                  type="text"
                  value={labelData.productName}
                  onChange={(e) => setLabelData({ ...labelData, productName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
                  placeholder="제품명"
                />
              </div>

              {/* 보관조건 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">보관조건</label>
                <select
                  value={labelData.storageCondition}
                  onChange={(e) => setLabelData({ ...labelData, storageCondition: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
                >
                  <option value="냉동">냉동</option>
                  <option value="냉장">냉장</option>
                  <option value="실온">실온</option>
                </select>
              </div>

              {/* 등록번호 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">등록번호</label>
                <input
                  type="text"
                  value={labelData.registrationNumber}
                  onChange={(e) => setLabelData({ ...labelData, registrationNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
                  placeholder="등록번호"
                />
              </div>

              {/* 카테고리 및 형태 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">카테고리 및 형태</label>
                <input
                  type="text"
                  value={labelData.categoryAndForm}
                  onChange={(e) => setLabelData({ ...labelData, categoryAndForm: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
                  placeholder="카테고리 및 형태"
                />
              </div>

              {/* 원재료 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">원재료</label>
                <input
                  type="text"
                  value={labelData.ingredients}
                  onChange={(e) => setLabelData({ ...labelData, ingredients: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
                  placeholder="원재료"
                />
              </div>

              {/* 원료 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">원료</label>
                <input
                  type="text"
                  value={labelData.rawMaterials}
                  onChange={(e) => setLabelData({ ...labelData, rawMaterials: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
                  placeholder="원료"
                />
              </div>

              {/* 실제 중량 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">실제 중량</label>
                <input
                  type="text"
                  value={labelData.actualWeight}
                  onChange={(e) => setLabelData({ ...labelData, actualWeight: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
                  placeholder="실제 중량"
                />
              </div>

              {/* 인쇄 개수 */}
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

              {/* 프린터 선택 */}
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
                    printers.map((p, idx) => (
                      <option key={idx} value={p}>{p}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* 우측: 미리보기 정보 */}
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 sticky top-20">
              <div className="text-sm text-gray-700 space-y-2">
                <div className="font-semibold text-[#674529] mb-4">선택 정보</div>
                <div className="space-y-2">
                  <div><span className="font-medium">품목 ID:</span> {labelData.itemId || '-'}</div>
                  <div><span className="font-medium">제품명:</span> {labelData.productName || '-'}</div>
                  <div><span className="font-medium">라벨 크기:</span> {SIZES.find(s => s.value === labelData.templateType)?.label || '-'}</div>
                  <div><span className="font-medium">제조일자:</span> {labelData.manufactureDate || '-'}</div>
                  <div><span className="font-medium">유통기한:</span> {labelData.expiryDate || '-'}</div>
                  <div><span className="font-medium">보관조건:</span> {labelData.storageCondition || '-'}</div>
                  <div><span className="font-medium">등록번호:</span> {labelData.registrationNumber || '-'}</div>
                  <div><span className="font-medium">인쇄 개수:</span> {printCount}</div>
                  <div><span className="font-medium">프린터:</span> {selectedPrinter || '-'}</div>
                </div>
                <hr className="my-3" />
                <div className="text-xs text-gray-500">
                  * 품목을 선택하면 자동으로 제품명과 등록번호가 입력됩니다.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting || !selectedItemId || !selectedPrinter || !labelData.manufactureDate || !labelData.expiryDate}
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
