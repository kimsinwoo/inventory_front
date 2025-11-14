<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from 'react';
import { X, Printer, Package, Barcode } from 'lucide-react';
import { labelAPI } from '../api';
=======
import React, { useEffect, useState, useMemo } from 'react';
import { X, Printer, Package, Barcode } from 'lucide-react';
import { labelAPI, itemsAPI } from '../api';
import { getPrinters, getDefaultPrinter } from '../utils/printerUtils';
>>>>>>> origin/label-print

const SIZES = [
  { value: 'large', label: 'Large (100mm)' },
  { value: 'medium', label: 'Medium (80mm)' },
  { value: 'small', label: 'Small (40mm)' },
  { value: 'verysmall', label: 'VerySmall (26mm)' },
];

const PrintLabel = ({ isOpen, onClose, onPrinted }) => {
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/label-print
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
<<<<<<< HEAD

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
=======
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
>>>>>>> origin/label-print
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
<<<<<<< HEAD
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
=======
      <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 sticky top-0 bg-white z-10">
>>>>>>> origin/label-print
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
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/label-print
                      </option>
                    ))
                  )}
                </select>
              </div>

<<<<<<< HEAD
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

=======
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
>>>>>>> origin/label-print
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
<<<<<<< HEAD
                    printers.map((p, idx) => {
                      const name = typeof p === 'string' ? p : p.name || p.id || `프린터 ${idx + 1}`;
                      const suffix = typeof p === 'object' && p.driver ? ` (${p.driver})` : '';
                      return (
                        <option key={idx} value={name}>{name}{suffix}</option>
                      );
                    })
=======
                    printers.map((p, idx) => (
                      <option key={idx} value={p}>{p}</option>
                    ))
>>>>>>> origin/label-print
                  )}
                </select>
              </div>
            </div>

            {/* 우측: 미리보기 정보 */}
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/label-print
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
<<<<<<< HEAD
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
=======
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 sticky bottom-0 bg-white">
>>>>>>> origin/label-print
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handlePrint}
<<<<<<< HEAD
            disabled={isPrinting || !selectedLabelId || !selectedPrinter}
=======
            disabled={isPrinting || !selectedItemId || !selectedPrinter || !labelData.manufactureDate || !labelData.expiryDate}
>>>>>>> origin/label-print
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
