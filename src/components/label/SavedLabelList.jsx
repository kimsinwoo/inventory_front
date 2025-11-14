import { useState, useEffect, useRef, useCallback } from 'react';
<<<<<<< HEAD
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
=======
import { Printer, Search, Package, Barcode, Save } from 'lucide-react';
import { labelAPI } from '../../api';
import { getPrinters, getDefaultPrinter } from '../../utils/printerUtils';

const SavedLabelList = () => {
  // 템플릿 목록 상태
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 템플릿 저장 폼 상태
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveFormData, setSaveFormData] = useState({
    labelType: 'large',
    itemId: '',
    itemName: '',
    storageCondition: '냉동',
    registrationNumber: '',
    categoryAndForm: '',
    ingredients: '',
    rawMaterials: '',
    actualWeight: '',
  });
  const [saving, setSaving] = useState(false);

  // 프린터 관련 상태
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [printers, setPrinters] = useState([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [printCount, setPrintCount] = useState(1);
  const [printingTemplateId, setPrintingTemplateId] = useState(null);
  
  const abortControllerRef = useRef(null);

  // 프린터 목록 가져오기
  useEffect(() => {
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
>>>>>>> origin/label-print
          }
        }
      } catch (error) {
        if (isMounted && error.name !== 'AbortError') {
<<<<<<< HEAD
          console.error('프린터 목록 가져오기 실패:', error);
=======
          console.error('❌ 프린터 목록 로드 실패:', error);
          setPrinters([]);
>>>>>>> origin/label-print
        }
      } finally {
        if (isMounted) {
          setIsLoadingPrinters(false);
        }
      }
    };

<<<<<<< HEAD
    fetchPrinters();

    // Cleanup 함수
=======
    loadPrinters();

>>>>>>> origin/label-print
    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

<<<<<<< HEAD
  // 저장된 라벨 전체 조회 (cleanup 추가)
  const handleFetchAll = useCallback(async () => {
    // 이전 요청 취소
=======
  // 템플릿 목록 조회
  const handleFetchTemplates = useCallback(async () => {
>>>>>>> origin/label-print
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    let isMounted = true;

    try {
      setLoading(true);
<<<<<<< HEAD
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
=======
      const response = await labelAPI.getTemplates({ page: 1, limit: 200 });
      
      if (!signal.aborted && isMounted) {
        // 응답 데이터 파싱 - API 응답 구조에 맞게 수정
        // response.data는 { ok: true, message: "...", data: [...], meta: {...} } 형태
        const responseData = response.data;
        let templateList = [];
        
        if (responseData) {
          // data 필드가 배열인 경우
          if (Array.isArray(responseData.data)) {
            templateList = responseData.data;
          } else if (Array.isArray(responseData)) {
            // response.data 자체가 배열인 경우
            templateList = responseData;
          } else if (responseData.templates && Array.isArray(responseData.templates)) {
            templateList = responseData.templates;
          }
        }
        
        // snake_case 필드를 camelCase로 변환 (호환성 유지)
        const formattedTemplates = templateList.map((template) => ({
          id: template.id,
          templateId: template.id,
          itemId: template.item_id || template.itemId,
          itemName: template.item_name || template.itemName || null,
          labelType: template.label_type || template.labelType || 'large',
          storageCondition: template.storage_condition || template.storageCondition || '냉동',
          registrationNumber: template.registration_number || template.registrationNumber || '',
          categoryAndForm: template.category_and_form || template.categoryAndForm || '',
          ingredients: template.ingredients || '',
          rawMaterials: template.raw_materials || template.rawMaterials || '',
          actualWeight: template.actual_weight || template.actualWeight || '',
          printerName: template.printer_name || template.printerName || null,
          printCount: template.print_count || template.printCount || 1,
          printStatus: template.print_status || template.printStatus || 'PENDING',
          errorMessage: template.error_message || template.errorMessage || null,
          createdAt: template.createdAt || template.created_at || '',
          updatedAt: template.updatedAt || template.updated_at || '',
          // 원본 데이터도 유지 (호환성)
          ...template,
        }));
        
        console.log('✅ 템플릿 목록 로드 완료:', formattedTemplates);
        setTemplates(formattedTemplates);
      }
    } catch (error) {
      if (!signal.aborted && isMounted && error.name !== 'AbortError') {
        console.error('템플릿 목록 조회 실패:', error);
        alert(`템플릿 목록 조회에 실패했습니다: ${error.response?.data?.message || error.message || '알 수 없는 오류'}`);
        setTemplates([]);
>>>>>>> origin/label-print
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, []);

<<<<<<< HEAD
  // 마운트 시 자동 전체 조회
  useEffect(() => {
    handleFetchAll();
    
    // Cleanup 함수
=======
  // 마운트 시 템플릿 목록 자동 조회
  useEffect(() => {
    handleFetchTemplates();
    
>>>>>>> origin/label-print
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
<<<<<<< HEAD
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
=======
  }, [handleFetchTemplates]);

  // 템플릿 저장
  const handleSaveTemplate = useCallback(async () => {
    try {
      setSaving(true);
      await labelAPI.saveTemplate(saveFormData);
      alert('템플릿이 저장되었습니다.');
      setShowSaveForm(false);
      setSaveFormData({
        labelType: 'large',
        itemId: '',
        itemName: '',
        storageCondition: '냉동',
        registrationNumber: '',
        categoryAndForm: '',
        ingredients: '',
        rawMaterials: '',
        actualWeight: '',
      });
      // 템플릿 목록 새로고침
      handleFetchTemplates();
    } catch (error) {
      console.error('템플릿 저장 실패:', error);
      alert(`템플릿 저장에 실패했습니다: ${error.response?.data?.message || error.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  }, [saveFormData, handleFetchTemplates]);

  // 템플릿 프린트용 날짜 입력 상태
  const [printDateModal, setPrintDateModal] = useState(null);
  const [printDates, setPrintDates] = useState({
    manufactureDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // 템플릿 프린트
  const handlePrintTemplate = useCallback(async (template) => {
>>>>>>> origin/label-print
    if (!selectedPrinter) {
      alert('프린터를 선택해주세요.');
      return;
    }

<<<<<<< HEAD
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
=======
    // 날짜 입력 모달 표시
    setPrintDateModal(template);
    setPrintDates({
      manufactureDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  }, [selectedPrinter]);

  // 날짜 입력 후 실제 프린트
  const handleConfirmPrint = useCallback(async () => {
    if (!printDateModal) return;
    if (!printDates.manufactureDate || !printDates.expiryDate) {
      alert('제조일자와 유통기한을 입력해주세요.');
      return;
    }

    const template = printDateModal;
    
    try {
      setPrintingTemplateId(template.id || template.templateId);
      
      // 템플릿 조회하여 전체 데이터 가져오기
      const templateResponse = await labelAPI.getTemplate(template.id || template.templateId);
      const templateData = templateResponse.data?.data || templateResponse.data || template;
      
      // 프린트 API 호출 (템플릿 데이터 + 날짜 사용)
      // snake_case와 camelCase 모두 지원
      await labelAPI.printLabel({
        templateType: templateData.label_type || templateData.labelType || template.label_type || template.labelType || 'large',
        itemId: templateData.item_id || templateData.itemId || template.item_id || template.itemId || '',
        manufactureDate: printDates.manufactureDate,
        expiryDate: printDates.expiryDate,
        printerName: selectedPrinter,
        printCount: printCount,
        productName: templateData.item_name || templateData.itemName || template.item_name || template.itemName || '',
        storageCondition: templateData.storage_condition || templateData.storageCondition || template.storage_condition || template.storageCondition || '냉동',
        registrationNumber: templateData.registration_number || templateData.registrationNumber || template.registration_number || template.registrationNumber || '',
        categoryAndForm: templateData.category_and_form || templateData.categoryAndForm || template.category_and_form || template.categoryAndForm || '',
        ingredients: templateData.ingredients || template.ingredients || '',
        rawMaterials: templateData.raw_materials || templateData.rawMaterials || template.raw_materials || template.rawMaterials || '',
        actualWeight: templateData.actual_weight || templateData.actualWeight || template.actual_weight || template.actualWeight || '',
      });
      
      alert(`${printCount}개가 성공적으로 인쇄되었습니다.`);
      setPrintDateModal(null);
    } catch (error) {
      console.error('템플릿 인쇄 실패:', error);
      alert(`인쇄에 실패했습니다: ${error.response?.data?.message || error.message || '알 수 없는 오류'}`);
    } finally {
      setPrintingTemplateId(null);
    }
  }, [printDateModal, printDates, selectedPrinter, printCount]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-[#674529]" />
          <h2 className="text-lg font-semibold text-[#674529]">저장된 템플릿</h2>
        </div>
        <button
          onClick={() => setShowSaveForm(!showSaveForm)}
          className="flex items-center space-x-2 bg-[#674529] text-white px-4 py-2 rounded-xl hover:bg-[#5a3d22] transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>템플릿 저장</span>
        </button>
      </div>

      {/* 템플릿 저장 폼 */}
      {showSaveForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-md font-semibold text-gray-700 mb-4">템플릿 저장</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">라벨 타입</label>
              <select
                value={saveFormData.labelType}
                onChange={(e) => setSaveFormData({ ...saveFormData, labelType: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none"
              >
                <option value="large">Large (100mm)</option>
                <option value="medium">Medium (80mm)</option>
                <option value="small">Small (40mm)</option>
                <option value="verysmall">VerySmall (26mm)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">품목 ID</label>
              <input
                type="text"
                value={saveFormData.itemId}
                onChange={(e) => setSaveFormData({ ...saveFormData, itemId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none"
                placeholder="품목 ID"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">품목명</label>
              <input
                type="text"
                value={saveFormData.itemName}
                onChange={(e) => setSaveFormData({ ...saveFormData, itemName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none"
                placeholder="품목명"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">보관조건</label>
              <select
                value={saveFormData.storageCondition}
                onChange={(e) => setSaveFormData({ ...saveFormData, storageCondition: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none"
              >
                <option value="냉동">냉동</option>
                <option value="냉장">냉장</option>
                <option value="실온">실온</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">등록번호</label>
              <input
                type="text"
                value={saveFormData.registrationNumber}
                onChange={(e) => setSaveFormData({ ...saveFormData, registrationNumber: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none"
                placeholder="등록번호"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">카테고리 및 형태</label>
              <input
                type="text"
                value={saveFormData.categoryAndForm}
                onChange={(e) => setSaveFormData({ ...saveFormData, categoryAndForm: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none"
                placeholder="카테고리 및 형태"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">원재료</label>
              <input
                type="text"
                value={saveFormData.ingredients}
                onChange={(e) => setSaveFormData({ ...saveFormData, ingredients: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none"
                placeholder="원재료"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">원료</label>
              <input
                type="text"
                value={saveFormData.rawMaterials}
                onChange={(e) => setSaveFormData({ ...saveFormData, rawMaterials: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none"
                placeholder="원료"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">실제 중량</label>
              <input
                type="text"
                value={saveFormData.actualWeight}
                onChange={(e) => setSaveFormData({ ...saveFormData, actualWeight: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none"
                placeholder="실제 중량"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setShowSaveForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSaveTemplate}
              disabled={saving}
              className="px-4 py-2 bg-[#674529] text-white rounded-xl hover:bg-[#5a3d22] disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      )}

      {/* 프린터 설정 영역 */}
      {templates.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">프린터 선택</label>
>>>>>>> origin/label-print
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
<<<<<<< HEAD
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
=======
                printers.map((printer, index) => (
                  <option key={index} value={printer}>
                    {printer}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">인쇄 개수</label>
>>>>>>> origin/label-print
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

<<<<<<< HEAD
      {/* 라벨 목록 */}
=======
      {/* 템플릿 목록 */}
>>>>>>> origin/label-print
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
<<<<<<< HEAD
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
=======
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">라벨 타입</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">품목명</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">보관조건</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">등록번호</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">작업</th>
>>>>>>> origin/label-print
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
<<<<<<< HEAD
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
=======
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={6}>
                    조회 중...
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={6}>
                    저장된 템플릿이 없습니다.
                  </td>
                </tr>
              ) : (
                templates.map((template, idx) => {
                  // item_name이 null인 경우 item_id로 표시하거나 품목 정보를 가져올 수 있음
                  const displayItemName = template.itemName || template.item_name || (template.itemId ? `품목 ID: ${template.itemId}` : '-');
                  const displayLabelType = template.labelType || template.label_type || '-';
                  const displayStorageCondition = template.storageCondition || template.storage_condition || '-';
                  const displayRegistrationNumber = template.registrationNumber || template.registration_number || '-';
                  
                  return (
                    <tr key={template.id || template.templateId || idx} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{template.id || template.templateId || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{displayLabelType}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{displayItemName}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{displayStorageCondition}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{displayRegistrationNumber}</td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handlePrintTemplate(template)}
                          disabled={printingTemplateId === (template.id || template.templateId) || !selectedPrinter}
>>>>>>> origin/label-print
                          className="flex items-center space-x-1 rounded-xl bg-[#674529] hover:bg-[#553821] px-3 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Printer className="h-4 w-4" />
                          <span>
<<<<<<< HEAD
                            {printingLabelId === (row.id || row.labelId) ? '인쇄 중...' : '인쇄'}
=======
                            {printingTemplateId === (template.id || template.templateId) ? '인쇄 중...' : '인쇄'}
>>>>>>> origin/label-print
                          </span>
                        </button>
                      </td>
                    </tr>
<<<<<<< HEAD
                  )
                ))
=======
                  );
                })
>>>>>>> origin/label-print
              )}
            </tbody>
          </table>
        </div>
      </div>
<<<<<<< HEAD
=======

      {/* 날짜 입력 모달 */}
      {printDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">인쇄 정보 입력</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">제조일자</label>
                <input
                  type="date"
                  value={printDates.manufactureDate}
                  onChange={(e) => setPrintDates({ ...printDates, manufactureDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">유통기한</label>
                <input
                  type="date"
                  value={printDates.expiryDate}
                  onChange={(e) => setPrintDates({ ...printDates, expiryDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#674529] focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setPrintDateModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleConfirmPrint}
                disabled={printingTemplateId !== null}
                className="px-4 py-2 bg-[#674529] text-white rounded-xl hover:bg-[#5a3d22] disabled:opacity-50"
              >
                {printingTemplateId !== null ? '인쇄 중...' : '인쇄'}
              </button>
            </div>
          </div>
        </div>
      )}
>>>>>>> origin/label-print
    </div>
  );
};

export default SavedLabelList;
<<<<<<< HEAD

=======
>>>>>>> origin/label-print
