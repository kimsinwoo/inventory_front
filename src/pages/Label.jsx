import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Printer, Package, Snowflake, Microwave, Plus, X } from 'lucide-react';
import { labelAPI, itemsAPI } from '../api';
import SavedLabelList from '../components/label/SavedLabelList';
import { getPrinters, addPrinter, removePrinter, getDefaultPrinter, setDefaultPrinter } from '../utils/printerUtils';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const Label = () => {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'list'
  const [labelType, setLabelType] = useState('large'); // 미리보기용
  const [selectedItemId, setSelectedItemId] = useState('');
  const [finishedItems, setFinishedItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [productName, setProductName] = useState('');
  const [storageCondition, setStorageCondition] = useState('냉동'); // 냉동, 냉장, 실온
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [categoryAndForm, setCategoryAndForm] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [rawMaterials, setRawMaterials] = useState('');
  const [actualWeight, setActualWeight] = useState('');
  const [printCount, setPrintCount] = useState(1);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [printers, setPrinters] = useState([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newPrinterName, setNewPrinterName] = useState('');
  const [showAddPrinter, setShowAddPrinter] = useState(false);
  const printRef = useRef();
  const abortControllerRef = useRef(null); // API 요청 취소용

  // Finished 카테고리 품목 목록 가져오기 (cleanup 추가)
  useEffect(() => {
    let isMounted = true;

    const fetchFinishedItems = async () => {
      try {
        setIsLoadingItems(true);
        const response = await itemsAPI.getItems({ category: 'Finished', page: 1, limit: 1000 });
        if (isMounted) {
          const items = Array.isArray(response.data) 
            ? response.data 
            : response.data?.data || response.data?.rows || [];
          // 클라이언트 측에서도 Finished 카테고리만 필터링
          const finishedOnly = items.filter(item => {
            const category = item.category || item.Category || item.categoryName || '';
            return category === 'Finished' || category === '완제품';
          });
          setFinishedItems(finishedOnly);
        }
      } catch (error) {
        if (isMounted && error.name !== 'AbortError') {
          console.error('품목 목록 가져오기 실패:', error);
          alert('품목 목록을 불러올 수 없습니다.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingItems(false);
        }
      }
    };

    fetchFinishedItems();

    // Cleanup 함수
    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // localStorage에서 선택된 라벨 데이터 로드
  useEffect(() => {
    const selectedLabelData = localStorage.getItem('selectedLabelData');
    if (selectedLabelData) {
      try {
        const labelData = JSON.parse(selectedLabelData);
        
        // 폼 필드 자동 입력
        if (labelData.itemId) {
          setSelectedItemId(String(labelData.itemId));
        }
        if (labelData.productName) {
          setProductName(labelData.productName);
        }
        if (labelData.storageCondition) {
          setStorageCondition(labelData.storageCondition);
        }
        if (labelData.registrationNumber) {
          setRegistrationNumber(labelData.registrationNumber);
        }
        if (labelData.categoryAndForm) {
          setCategoryAndForm(labelData.categoryAndForm);
        }
        if (labelData.ingredients) {
          setIngredients(labelData.ingredients);
        }
        if (labelData.rawMaterials) {
          setRawMaterials(labelData.rawMaterials);
        }
        if (labelData.actualWeight) {
          setActualWeight(labelData.actualWeight);
        }
        if (labelData.labelType) {
          setLabelType(labelData.labelType);
        }

        // localStorage에서 데이터 제거 (한 번만 사용)
        localStorage.removeItem('selectedLabelData');
        
        // 'create' 탭으로 전환
        setActiveTab('create');
      } catch (error) {
        console.error('라벨 데이터 로드 실패:', error);
      }
    }
  }, []);

  // 제품 선택 시 제품명과 등록번호 자동 설정 (useCallback으로 최적화)
  const handleItemChange = useCallback((itemId) => {
    setSelectedItemId(itemId);
    const selectedItem = finishedItems.find(item => item.id === parseInt(itemId) || item.id === itemId);
    if (selectedItem) {
      setProductName(selectedItem.name || selectedItem.itemName || '');
      setRegistrationNumber(selectedItem.code || '');
    } else {
      setProductName('');
      setRegistrationNumber('');
    }
  }, [finishedItems]);

  // 프린터 목록 가져오기 (자동으로 API 또는 localStorage에서)
  useEffect(() => {
    let isMounted = true;
    
    const loadPrinters = async () => {
      try {
        setIsLoadingPrinters(true);
        console.log('🔍 프린터 목록 자동 로드 시작...');
        
        // API를 통해 프린터 목록 가져오기 시도
        const printerList = await getPrinters(() => labelAPI.getPrinters());
        
        if (isMounted) {
          console.log('✅ 가져온 프린터 목록:', printerList);
          setPrinters(printerList);
          
          if (printerList.length > 0) {
            const defaultPrinter = getDefaultPrinter();
            // 기본 프린터가 있으면 사용, 없으면 첫 번째 프린터 사용
            const printerToSelect = defaultPrinter && printerList.includes(defaultPrinter) 
              ? defaultPrinter 
              : printerList[0];
            setSelectedPrinter(printerToSelect);
            console.log('✅ 선택된 프린터:', printerToSelect);
          } else {
            console.warn('⚠️ 프린터 목록이 비어있습니다. 프린터를 추가해주세요.');
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
  }, []);

  // 프린터 추가 핸들러
  const handleAddPrinter = () => {
    if (!newPrinterName.trim()) {
      alert('프린터 이름을 입력해주세요.');
      return;
    }
    
    if (addPrinter(newPrinterName.trim())) {
      const updatedPrinters = getSavedPrinters();
      setPrinters(updatedPrinters);
      setSelectedPrinter(newPrinterName.trim());
      setNewPrinterName('');
      setShowAddPrinter(false);
    } else {
      alert('이미 등록된 프린터입니다.');
    }
  };

  // 프린터 삭제 핸들러
  const handleRemovePrinter = (printerName) => {
    if (window.confirm(`"${printerName}" 프린터를 삭제하시겠습니까?`)) {
      removePrinter(printerName);
      const updatedPrinters = getSavedPrinters();
      setPrinters(updatedPrinters);
      
      if (selectedPrinter === printerName) {
        setSelectedPrinter(updatedPrinters.length > 0 ? updatedPrinters[0] : '');
      }
    }
  };

  // 프린터 선택 시 기본 프린터로 설정
  const handlePrinterChange = (printerName) => {
    setSelectedPrinter(printerName);
    setDefaultPrinter(printerName);
  };

  // 바코드 이미지 생성 (useMemo로 최적화)
  const barcodeImage = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';
    const barcode = '8800278470831';
    let x = 10;

    for (let i = 0; i < barcode.length; i++) {
      const digit = parseInt(barcode[i]);
      const width = digit % 2 === 0 ? 8 : 12;
      if (i % 2 === 0) {
        ctx.fillRect(x, 5, width, 45);
      }
      x += width + 2;
    }

    return canvas.toDataURL();
  }, []); // 한 번만 생성

  const buildLargeLabelHtml = useCallback(() => {
    const safeProductName = escapeHtml(productName || '제품명');
    const safeStorage = escapeHtml(storageCondition || '냉동');
    const safeRegistration = escapeHtml(registrationNumber || '');
    const safeCategory = escapeHtml(categoryAndForm || '');
    const safeIngredients = escapeHtml(ingredients || '');
    const safeRawMaterials = escapeHtml(rawMaterials || '');
    const safeActualWeight = escapeHtml(actualWeight || '');

    return `
<div style="width:100mm;height:100mm;padding:16px;display:flex;flex-direction:column;justify-content:space-between;border:2px solid #e5e7eb;background-color:#ffffff;color:#1f2937;font-family:'Pretendard','Noto Sans KR','Segoe UI',sans-serif;box-sizing:border-box;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
    <h1 style="margin:0;font-size:24px;font-weight:700;line-height:1.1;max-width:calc(100% - 88px);word-break:keep-all;">${safeProductName}</h1>
    <div style="border:2px solid #111827;border-radius:12px;width:64px;height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:10px;font-weight:600;">
      ${storageCondition === '냉동' ? '<span style="font-size:22px;line-height:1;">❄️</span>' : ''}
      <span style="margin-top:2px;">${safeStorage}식품</span>
    </div>
  </div>
  <div style="font-size:9px;line-height:1.5;margin-top:8px;">
    ${registrationNumber ? `<p style="margin:4px 0;"><strong>등록번호:</strong> ${safeRegistration} / <strong>제품명:</strong> ${safeProductName}</p>` : ''}
    ${categoryAndForm ? `<p style="margin:4px 0;"><strong>종류 및 형태:</strong> ${safeCategory}</p>` : ''}
    ${ingredients ? `<p style="margin:4px 0;"><strong>성분량:</strong> ${safeIngredients}</p>` : ''}
    ${rawMaterials ? `<p style="margin:4px 0;"><strong>원료의 명칭:</strong> ${safeRawMaterials}</p>` : ''}
    ${actualWeight ? `<p style="margin:4px 0;"><strong>실제중량:</strong> ${safeActualWeight}</p>` : ''}
  </div>
  <p style="margin:8px 0 0;color:#b91c1c;font-size:9px;font-weight:600;">⚠ 주의사항: 반려동물 이외에는 급여하지 마십시오.</p>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:12px;gap:12px;">
    <div style="text-align:center;">
      <img src="${barcodeImage}" alt="Barcode" style="width:128px;height:auto;margin-bottom:4px;" />
      <div style="font-size:9px;font-family:'Courier New',monospace;">8 800278 470831</div>
    </div>
    <div style="text-align:center;font-size:9px;line-height:1.3;">
      <div style="font-size:26px;line-height:1;">🔥</div>
      <div>30초~2분</div>
    </div>
  </div>
</div>`;
  }, [productName, storageCondition, registrationNumber, categoryAndForm, ingredients, rawMaterials, actualWeight, barcodeImage]);

  const handleSaveTemplate = async () => {
    try {
      setIsSending(true);

      // 유효성 검사
      if (!selectedItemId) {
        alert('제품을 선택해주세요.');
        return;
      }
      if (!selectedPrinter) {
        alert('프린터를 선택해주세요.');
        return;
      }

      const htmlContent = buildLargeLabelHtml();
      const payload = {
        htmlContent,
        printerName: selectedPrinter,
        printCount: Number.isFinite(printCount) && printCount > 0 ? printCount : 1,
        labelType,
        productName,
        storageCondition,
        registrationNumber,
        categoryAndForm,
        ingredients,
        rawMaterials,
        actualWeight,
        itemId: selectedItemId ? Number(selectedItemId) : null,
      };

      console.log('전송할 데이터:', payload);

      const response = await labelAPI.saveTemplate(payload);

      const success = response.data?.ok !== false;
      const templateId = response.data?.data?.templateId;

      if (success) {
        alert(`라벨 템플릿이 성공적으로 저장되었습니다.${typeof templateId === 'number' ? ` (ID: ${templateId})` : ''}`);
      } else {
        const backendMessage = response.data?.message || '프린터 출력은 실패했습니다.';
        alert(`${backendMessage}\n템플릿은 저장되었습니다.${typeof templateId === 'number' ? ` (ID: ${templateId})` : ''}`);
      }
    } catch (error) {
      console.error('템플릿 저장 실패:', error);
      console.error('에러 응답 상세:', error.response?.data);
      console.error('에러 상태 코드:', error.response?.status);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || '알 수 없는 오류';
      alert(`오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  };

  const generateBarcode = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';
    const barcode = '8800278470831';
    let x = 10;

    for (let i = 0; i < barcode.length; i++) {
      const digit = parseInt(barcode[i]);
      const width = digit % 2 === 0 ? 8 : 12;
      if (i % 2 === 0) {
        ctx.fillRect(x, 5, width, 45);
      }
      x += width + 2;
    }

    return canvas.toDataURL();
  };

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className='mb-6'>
        <div className='mb-1 flex items-center space-x-2'>
          <Package className='h-5 w-5 text-[#674529]' />
          <h1 className='text-lg font-semibold text-[#674529]'>
            라벨관리
          </h1>
        </div>
        <p className='text-sm text-gray-600'>
          제품 라벨 템플릿 생성 및 저장
        </p>
      </div>

      {/* 탭 선택 */}
      <div className="mb-6 flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'create'
              ? 'text-[#674529] border-b-2 border-[#674529]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          라벨 템플릿 생성
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'list'
              ? 'text-[#674529] border-b-2 border-[#674529]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          저장된 라벨 조회
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'create' ? (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#674529] mb-6 flex items-center gap-2">
          <Printer className="h-5 w-5" />
          라벨 템플릿 생성
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              제품명 *
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => handleItemChange(e.target.value)}
              disabled={isLoadingItems}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">제품을 선택하세요</option>
              {finishedItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name || item.itemName || `제품 ${item.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              보관조건 *
            </label>
            <select
              value={storageCondition}
              onChange={(e) => setStorageCondition(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
            >
              <option value="냉동">냉동</option>
              <option value="냉장">냉장</option>
              <option value="실온">실온</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              등록번호 (자동)
            </label>
            <input
              type="text"
              value={registrationNumber}
              readOnly
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="제품 선택 시 자동으로 입력됩니다"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              종류 및 형태
            </label>
            <input
              type="text"
              value={categoryAndForm}
              onChange={(e) => setCategoryAndForm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
              placeholder="예: 단미사료 / 혼합성-혼합제 / 큐브"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              성분량
            </label>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
              placeholder="예: 조단백질 36% 이상, 조지방 25% 이하"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              원료의 명칭
            </label>
            <input
              type="text"
              value={rawMaterials}
              onChange={(e) => setRawMaterials(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
              placeholder="예: 쌀, 계란, 두부, 브로콜리"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              실제중량
            </label>
            <input
              type="text"
              value={actualWeight}
              onChange={(e) => setActualWeight(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
              placeholder="예: 50g"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              미리보기 크기
            </label>
            <div className="flex gap-2">
              {['large', 'medium', 'small', 'verysmall'].map((type) => (
                <button
                  key={type}
                  onClick={() => setLabelType(type)}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                    labelType === type
                      ? 'bg-[#674529] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {type === 'large' ? 'Large (100mm)' : type === 'medium' ? 'Medium (80mm)' : type === 'small' ? 'Small (40mm)' : 'VerySmall (28mm)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              프린트 개수 *
            </label>
            <input
              type="number"
              disabled={true}
              min="1"
              value={printCount}
              onChange={(e) => setPrintCount(1)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
              placeholder="인쇄할 개수"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              프린터 선택 *
            </label>
            <div className="flex gap-2">
              <select
                value={selectedPrinter}
                onChange={(e) => handlePrinterChange(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
              >
                {printers.length === 0 ? (
                  <option value="">프린터를 추가해주세요</option>
                ) : (
                  printers.map((printer, index) => {
                    const printerName = typeof printer === 'string' 
                      ? printer 
                      : (printer?.name || printer?.id || printer?.printerName || String(printer));
                    return (
                      <option key={index} value={printerName}>
                        {printerName}
                      </option>
                    );
                  })
                )}
              </select>
              <button
                type="button"
                onClick={() => setShowAddPrinter(!showAddPrinter)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                title="프린터 추가"
              >
                <Plus size={18} />
              </button>
            </div>
            
            {/* 프린터 추가 입력 필드 */}
            {showAddPrinter && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newPrinterName}
                  onChange={(e) => setNewPrinterName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPrinter()}
                  placeholder="프린터 이름 입력"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddPrinter}
                  className="px-4 py-2.5 bg-[#674529] text-white rounded-xl hover:bg-[#5a3d22] transition-colors"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPrinter(false);
                    setNewPrinterName('');
                  }}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
              </div>
            )}
            
            {/* 저장된 프린터 목록 표시 (삭제 가능) */}
            {printers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {printers.map((printer, index) => {
                  const printerName = typeof printer === 'string' 
                    ? printer 
                    : (printer?.name || printer?.id || printer?.printerName || String(printer));
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
                    >
                      <span>{printerName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePrinter(printerName)}
                        className="text-red-500 hover:text-red-700"
                        title="삭제"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSaveTemplate}
          disabled={isSending}
          className="w-full bg-[#674529] text-white py-3 px-6 rounded-xl font-medium hover:bg-[#5a3d22] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer size={20} />
          {isSending ? '저장 중...' : '라벨 템플릿 저장'}
        </button>
      </div>

      {/* 미리보기 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#674529] mb-6">미리보기</h2>
        <div className="flex justify-center items-center p-8 bg-gray-50 rounded-xl">
          <div ref={printRef} className="bg-white shadow-md">
            {labelType === 'large' && (
              <LargeLabelContent
                productName={productName}
                storageCondition={storageCondition}
                registrationNumber={registrationNumber}
                categoryAndForm={categoryAndForm}
                ingredients={ingredients}
                rawMaterials={rawMaterials}
                actualWeight={actualWeight}
                manufactureDate=""
                expiryDate=""
                barcodeImage={generateBarcode()}
              />
            )}
            {labelType === 'medium' && (
              <MediumLabelContent
                productName={productName}
                storageCondition={storageCondition}
                registrationNumber={registrationNumber}
                categoryAndForm={categoryAndForm}
                ingredients={ingredients}
                manufactureDate=""
                expiryDate=""
              />
            )}
            {labelType === 'small' && (
              <SmallLabelContent
                productName={productName}
                manufactureDate=""
                expiryDate=""
                barcodeImage={generateBarcode()}
              />
            )}
            {labelType === 'verysmall' && (
              <VerySmallLabelContent
                productName={productName}
                manufactureDate=""
                expiryDate=""
                barcodeImage={generateBarcode()}
              />
            )}
          </div>
        </div>
      </div>
        </>
      ) : (
        <SavedLabelList />
      )}
    </div>
  );
};

const LargeLabelContent = ({ 
  productName, 
  storageCondition, 
  registrationNumber, 
  categoryAndForm, 
  ingredients, 
  rawMaterials, 
  actualWeight, 
  manufactureDate, 
  expiryDate, 
  barcodeImage 
}) => {
  const getStorageIcon = () => {
    if (storageCondition === '냉동') {
      return <Snowflake className="w-7 h-7 mb-1" />;
    }
    return null;
  };

  return (
    <div className="w-[100mm] h-[100mm] p-4 flex flex-col justify-between text-xs border-2 border-gray-200">
      {/* 상단 */}
      <div className="flex justify-between items-start">
        <div className="text-2xl font-bold text-gray-900">{productName || '제품명'}</div>
        <div className="border-2 border-gray-800 rounded-xl p-2 w-16 h-16 flex flex-col items-center justify-center">
          {getStorageIcon()}
          <div className="text-[7px] font-semibold">{storageCondition || '냉동'}식품</div>
        </div>
      </div>

      {/* 본문 */}
      <div className="space-y-1 text-[8px] leading-relaxed">
        {registrationNumber && (
          <p><span className="font-semibold">등록번호:</span> {registrationNumber} / <span className="font-semibold">제품명:</span> {productName || '제품명'}</p>
        )}
        {categoryAndForm && (
          <p><span className="font-semibold">종류 및 형태:</span> {categoryAndForm}</p>
        )}
        {ingredients && (
          <p><span className="font-semibold">성분량:</span> {ingredients}</p>
        )}
        {rawMaterials && (
          <p><span className="font-semibold">원료의 명칭:</span> {rawMaterials}</p>
        )}
        {actualWeight && (
          <p><span className="font-semibold">실제중량:</span> {actualWeight}</p>
        )}
        <p className="text-red-700 font-semibold"><span className="font-bold">⚠ 주의사항:</span> 반려동물 이외에는 급여하지 마십시오.</p>
      </div>

      {/* 하단 */}
      <div className="flex justify-between items-end">
        <div className="text-center">
          <img src={barcodeImage} alt="Barcode" className="w-32 h-auto mb-1" />
          <div className="text-[8px] font-mono">8 800278 470831</div>
        </div>
        <div className="text-[9px] text-right space-y-0.5">
          {manufactureDate && <p><span className="font-semibold">제조일자:</span> {manufactureDate}</p>}
          {expiryDate && <p><span className="font-semibold">유통기한:</span> {expiryDate}</p>}
        </div>
        <div className="text-center">
          <Microwave className="w-10 h-10 mx-auto mb-1" />
          <div className="text-[7px] font-semibold">30초~2분</div>
        </div>
      </div>
    </div>
  );
};

const MediumLabelContent = ({ 
  productName, 
  storageCondition, 
  registrationNumber, 
  categoryAndForm, 
  ingredients, 
  manufactureDate, 
  expiryDate 
}) => (
  <div className="w-[80mm] h-[60mm] p-3 flex flex-col justify-start border-2 border-gray-200">
    <h2 className="text-xl font-bold mb-2 text-gray-900">{productName || '제품명'}</h2>
    <div className="text-[8px] leading-relaxed space-y-1.5 mb-2">
      {registrationNumber && (
        <p><span className="font-semibold">등록번호:</span> {registrationNumber} / <span className="font-semibold">제품명:</span> {productName || '제품명'}</p>
      )}
      {categoryAndForm && (
        <p><span className="font-semibold">종류 및 형태:</span> {categoryAndForm}</p>
      )}
      {ingredients && (
        <p><span className="font-semibold">성분량:</span> {ingredients}</p>
      )}
    </div>
    <div className="text-[9px] space-y-0.5 mt-auto">
      {manufactureDate && <p><span className="font-semibold">제조일자:</span> {manufactureDate}</p>}
      {expiryDate && <p><span className="font-semibold">유통기한:</span> {expiryDate}</p>}
    </div>
  </div>
);

const SmallLabelContent = ({ productName, manufactureDate, expiryDate, barcodeImage }) => (
  <div className="w-[40mm] h-[20mm] p-1 flex flex-col border-2 border-gray-200 items-center justify-center text-center">
    <div className="text-[7px] mb-1">
      <p className="font-semibold mb-0.5">제 조 날 짜</p>
      <p className="tracking-widest">{manufactureDate.split('').join(' ')}</p>
    </div>
    <div className="text-[7px] mb-2">
      <p className="font-semibold mb-0.5">유 통 기 한</p>
      <p className="tracking-widest">{expiryDate.split('').join(' ')}</p>
    </div>
  </div>
);

const VerySmallLabelContent = ({ productName, manufactureDate, expiryDate, barcodeImage }) => (
  <div className="w-[26mm] h-[15mm] p-1 flex items-center justify-center gap-2 border-2 border-gray-200">
    <div className="text-[6px] font-bold transform -rotate-90 whitespace-nowrap">
      {productName}
    </div>
    <img src={barcodeImage} alt="Barcode" className="w-16 h-auto" />
  </div>
);

export default Label;
