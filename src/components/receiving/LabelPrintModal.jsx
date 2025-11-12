import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Snowflake, Microwave, Plus } from 'lucide-react';
import { labelAPI, itemsAPI } from '../../api';
import usePdfDownload from '../common/usePdfDownload';
import { getPrinters, addPrinter, removePrinter, getDefaultPrinter, setDefaultPrinter } from '../../utils/printerUtils';

const LabelPrintModal = ({ isOpen, onClose, onPrintComplete, itemData }) => {
  const [labelSize, setLabelSize] = useState(''); // '100X100' | '80X60' | '50X30' | '28X16'
  const [manufactureDate, setManufactureDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [printers, setPrinters] = useState([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [newPrinterName, setNewPrinterName] = useState('');
  const [showAddPrinter, setShowAddPrinter] = useState(false);
  const [itemDetail, setItemDetail] = useState(null);
  const [labelTemplate, setLabelTemplate] = useState(null);
  const [calculatedExpiryDate, setCalculatedExpiryDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const previewRef = useRef(null);
  const abortControllerRef = useRef(null);
  const { downloadPdf, isLoading: isPdfLoading } = usePdfDownload();
  const [barcodeImage, setBarcodeImage] = useState(null);
  const [isLoadingBarcode, setIsLoadingBarcode] = useState(false);
  const [barcodeNumber, setBarcodeNumber] = useState(null);

  // ---------- productName (고정) ----------
  const productName = useMemo(() => itemData?.itemName ?? itemData?.name ?? '', [itemData?.itemName, itemData?.name]);

  // ---------- 아이템 상세 정보 ----------
  useEffect(() => {
    if (!isOpen || !itemData?.itemCode) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    let isMounted = true;

    (async () => {
      try {
        const response = await itemsAPI.getItemByCode(itemData.itemCode);
        if (!signal.aborted && isMounted) {
          const item = response?.data?.data ?? response?.data ?? null;
          setItemDetail(item);
        }
      } catch (error) {
        if (!signal.aborted && isMounted && error?.name !== 'AbortError') {
          console.error('아이템 정보 가져오기 실패:', error);
        }
      }
    })();

    return () => {
      isMounted = false;
      abortControllerRef.current?.abort();
    };
  }, [isOpen, itemData?.itemCode]);

  // ---------- 라벨 템플릿 데이터 구성 ----------
  useEffect(() => {
    if (!isOpen || !itemData) return;

    setLabelTemplate({
      itemId: itemData.itemId ?? itemData.id ?? null,
      itemName: itemData.itemName ?? itemData.name ?? '',
      itemCode: itemData.itemCode ?? itemData.code ?? '',
      storageCondition: itemData.storageCondition ?? '냉동',
      registrationNumber: itemData.registrationNumber ?? itemData.itemCode ?? '',
      categoryAndForm: itemData.categoryAndForm ?? '',
      ingredients: itemData.ingredients ?? '',
      rawMaterials: itemData.rawMaterials ?? '',
      actualWeight: itemData.actualWeight ?? '',
      expiration_date: itemData.expiration_date ?? itemData.expiry_date ?? undefined,
    });
  }, [isOpen, itemData]);

  // ---------- 프린터 목록 ----------
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    (async () => {
      try {
        setIsLoadingPrinters(true);
        const printerList = await getPrinters(() => labelAPI.getPrinters());
        if (!isMounted) return;
        setPrinters(printerList);
        if (printerList.length > 0) {
          const def = getDefaultPrinter();
          const pick = def && printerList.map(p => (typeof p === 'string' ? p : (p?.name ?? p?.printerName ?? ''))).includes(def)
            ? def
            : (typeof printerList[0] === 'string' ? printerList[0] : (printerList[0]?.name ?? printerList[0]?.printerName ?? ''));
          setSelectedPrinter(pick);
        }
      } catch (e) {
        if (isMounted) setPrinters([]);
      } finally {
        if (isMounted) setIsLoadingPrinters(false);
      }
    })();

    return () => { isMounted = false; };
  }, [isOpen]);

  const handleAddPrinter = async () => {
    const name = newPrinterName?.trim();
    if (!name) { alert('프린터 이름을 입력해주세요.'); return; }
    try {
      if (addPrinter(name)) {
        const list = await getPrinters(() => labelAPI.getPrinters());
        setPrinters(list);
        setSelectedPrinter(name);
        setNewPrinterName('');
        setShowAddPrinter(false);
      } else {
        alert('이미 등록된 프린터입니다.');
      }
    } catch (e) {
      console.error(e);
      alert('프린터 추가 실패');
    }
  };

  const handleRemovePrinter = async (printerName) => {
    if (!window.confirm(`"${printerName}" 프린터를 삭제하시겠습니까?`)) return;
    try {
      removePrinter(printerName);
      const list = await getPrinters(() => labelAPI.getPrinters());
      setPrinters(list);
      if (selectedPrinter === printerName) setSelectedPrinter(list.length > 0 ? (typeof list[0] === 'string' ? list[0] : (list[0]?.name ?? '')) : '');
    } catch (e) {
      console.error(e);
      alert('프린터 삭제 실패');
    }
  };

  const handlePrinterChange = (printerName) => {
    setSelectedPrinter(printerName);
    setDefaultPrinter(printerName);
  };

  // ---------- 유통기한 자동 계산 (버그 수정) ----------
  const expiryDays = useMemo(() => {
    const cands = [
      itemDetail?.expiration_date,
      itemDetail?.expiry_date,
      labelTemplate?.expiration_date,
      labelTemplate?.item?.expiration_date, // 혹시 서버 구조가 다른 경우 대비
    ];
    const picked = cands.find(v => v !== undefined && v !== null && String(v).trim() !== '');
    const n = Number(picked);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [itemDetail?.expiration_date, itemDetail?.expiry_date, labelTemplate?.expiration_date]);

  useEffect(() => {
    if (!manufactureDate || !expiryDays) { setCalculatedExpiryDate(''); return; }
    try {
      const m = new Date(manufactureDate);
      if (Number.isNaN(m.getTime())) { setCalculatedExpiryDate(''); return; }
      const d = new Date(m);
      d.setDate(d.getDate() + expiryDays);
      setCalculatedExpiryDate(d.toISOString().split('T')[0]);
    } catch (e) {
      setCalculatedExpiryDate('');
    }
  }, [manufactureDate, expiryDays]);

  // ---------- (선택) 바코드 미리보기 - 프론트 임시 생성 ----------
  useEffect(() => {
    if (!isOpen) { setBarcodeImage(null); setBarcodeNumber(null); return; }
    if (!manufactureDate || !calculatedExpiryDate) { setBarcodeImage(null); setBarcodeNumber(null); return; }

    let isMounted = true;
    (async () => {
      try {
        setIsLoadingBarcode(true);
        const num = (labelTemplate?.registrationNumber ?? itemDetail?.code ?? itemData?.itemCode ?? '').toString();
        const digits = num.replace(/\D/g, '');
        if (digits.length < 8) { setBarcodeImage(null); setBarcodeNumber(num); return; }

        const canvas = document.createElement('canvas');
        canvas.width = 200; canvas.height = 60;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFF'; ctx.fillRect(0,0,200,60);
        ctx.fillStyle = '#000';
        let x = 10;
        for (let i = 0; i < digits.length; i++) {
          const w = (parseInt(digits[i], 10) % 2 === 0) ? 2 : 3;
          ctx.fillRect(x, 6, w, 40); x += w + 1;
        }
        ctx.font = '11px monospace'; ctx.textAlign = 'center'; ctx.fillText(digits, 100, 55);
        if (isMounted) { setBarcodeImage(canvas.toDataURL('image/png')); setBarcodeNumber(digits); }
      } catch (e) {
        if (isMounted) { setBarcodeImage(null); setBarcodeNumber(null); }
      } finally {
        if (isMounted) setIsLoadingBarcode(false);
      }
    })();
    return () => { isMounted = false; };
  }, [isOpen, manufactureDate, calculatedExpiryDate, labelTemplate?.registrationNumber, itemDetail?.code, itemData?.itemCode]);

  // ---------- labelSize → templateType ----------
  const labelType = useMemo(() => {
    switch (labelSize) {
      case '100X100': return 'large';
      case '80X60': return 'medium';
      case '50X30': return 'small';
      case '28X16': return 'verysmall';
      default: return null;
    }
  }, [labelSize]);

  // 파생 무게 추출 (제품명에 "(200g)" 등 포함 시 자동 채움)
  const derivedWeight = useMemo(() => {
    const m = /\(([^)]+)\)/.exec(productName ?? '');
    return m ? m[1] : '';
  }, [productName]);

  const isFormValid = useMemo(() => Boolean(
    labelType && productName && manufactureDate && selectedPrinter && (quantity ?? '') !== ''
  ), [labelType, productName, manufactureDate, selectedPrinter, quantity]);

  const handlePrint = useCallback(async () => {
    if (isProcessing || !isFormValid) return;

    const labelData = {
      labelSize, productName, manufactureDate, expiryDate: calculatedExpiryDate,
      quantity, printerName: selectedPrinter, itemData,
    };

    setIsProcessing(true);
    try {
      // (선택) 미리보기 PDF 저장
      const preview = previewRef.current;
      if (preview) {
        const filename = `라벨_${productName}_${manufactureDate}_${labelSize}.pdf`;
        const pdfResult = await downloadPdf(preview, {
          filename, orientation: 'portrait', scale: 1, margin: 0,
        });
        if (!pdfResult?.success) console.warn('미리보기 PDF 저장 실패(계속 진행):', pdfResult?.error);
      }

      const templateTypeMap = { '100X100': 'large', '80X60': 'medium', '50X30': 'small', '28X16': 'verysmall' };
      const templateType = templateTypeMap[labelSize] ?? 'large';

      // itemId 결정
      const itemId = itemDetail?.id ?? itemDetail?.itemId ?? itemData?.itemId ?? itemData?.id;

      const printResponse = await labelAPI.printLabel({
        templateType,
        itemId,
        manufactureDate,
        expiryDate: calculatedExpiryDate,
        printerName: selectedPrinter,
        printCount: parseInt(quantity, 10) || 1,
        productName,
        storageCondition: labelTemplate?.storageCondition ?? itemDetail?.storageCondition ?? itemDetail?.storage_condition ?? '냉동',
        registrationNumber: labelTemplate?.registrationNumber ?? itemDetail?.code ?? itemData?.itemCode ?? '',
        categoryAndForm: labelTemplate?.categoryAndForm ?? itemDetail?.category ?? '',
        ingredients: labelTemplate?.ingredients ?? itemDetail?.ingredients ?? '',
        rawMaterials: labelTemplate?.rawMaterials ?? itemDetail?.rawMaterials ?? itemDetail?.raw_materials ?? '',
        actualWeight: labelTemplate?.actualWeight ?? itemDetail?.actualWeight ?? itemDetail?.actual_weight ?? derivedWeight,
      });

      const result = printResponse?.data;
      if (result?.ok) {
        onPrintComplete ? onPrintComplete(labelData) : onClose();
      } else {
        const msg = result?.message ?? '프린트 실패';
        throw new Error(msg);
      }
    } catch (error) {
      console.error('라벨 프린트 중 오류:', error);
      const msg = error?.response?.data?.message ?? error?.message ?? '알 수 없는 오류';
      alert(`라벨 프린트 중 오류가 발생했습니다: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isFormValid, labelSize, productName, manufactureDate, calculatedExpiryDate, quantity, selectedPrinter, itemData, downloadPdf, onPrintComplete, onClose, itemDetail, labelTemplate]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-4xl rounded-xl bg-white shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-[#674529]'>라벨 프린트</h2>
          <button onClick={onClose} className='rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-4'>
          <div className='grid grid-cols-2 gap-6'>
            {/* Left */}
            <div className='space-y-4'>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>템플릿</label>
                <select value={labelSize} onChange={(e) => setLabelSize(e.target.value)} className='w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors'>
                  <option value=''>템플릿 양식 선택</option>
                  <option value='100X100'>100×100 mm</option>
                  <option value='80X60'>80×60 mm</option>
                  <option value='50X30'>50×30 mm</option>
                  <option value='28X16'>28×16 mm</option>
                </select>
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>제품명</label>
                <input type='text' value={productName} readOnly className='w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-gray-50 text-gray-600 cursor-not-allowed' />
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>제조일자</label>
                <input type='date' value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} className='w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors' />
              </div>

              {calculatedExpiryDate && (
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>유통기한 (자동 계산)</label>
                  <input type='text' value={calculatedExpiryDate} readOnly className='w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-blue-50 text-blue-700 cursor-not-allowed' />
                  {expiryDays && (<p className='mt-1 text-xs text-gray-500'>유통기한: {expiryDays}일</p>)}
                </div>
              )}

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>라벨 프린트 갯수</label>
                <input type='number' value={quantity} onChange={(e) => setQuantity(e.target.value)} className='w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors' placeholder='100' />
              </div>

              {/* Printer */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>프린트 기기 선택</label>
                <div className='flex gap-2'>
                  <select value={selectedPrinter} onChange={(e) => handlePrinterChange(e.target.value)} className='flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors'>
                    {printers.length === 0 ? (
                      <option value=''>프린터를 추가해주세요</option>
                    ) : (
                      printers.map((p, i) => {
                        const name = typeof p === 'string' ? p : (p?.name ?? p?.id ?? p?.printerName ?? String(p));
                        return <option key={i} value={name}>{name}</option>;
                      })
                    )}
                  </select>
                  <button type='button' onClick={() => setShowAddPrinter(!showAddPrinter)} className='px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1' title='프린터 추가'>
                    <Plus size={16} />
                  </button>
                </div>
                {showAddPrinter && (
                  <div className='mt-2 flex gap-2'>
                    <input type='text' value={newPrinterName} onChange={(e) => setNewPrinterName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddPrinter()} placeholder='프린터 이름 입력' className='flex-1 px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#674529] focus:outline-none transition-colors' autoFocus />
                    <button type='button' onClick={handleAddPrinter} className='px-3 py-2.5 bg-[#674529] text-white rounded-xl hover:bg-[#5a3d22] transition-colors text-sm'>추가</button>
                    <button type='button' onClick={() => { setShowAddPrinter(false); setNewPrinterName(''); }} className='px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm'>취소</button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Preview (mm 정확도 보장 위해 inline style 사용) */}
            <div className='flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl'>
              {labelType ? (
                <div ref={previewRef} className='bg-white shadow-md' style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  {labelType === 'large' && (
                    <LargeLabelContent
                      productName={labelTemplate?.itemName ?? productName}
                      storageCondition={labelTemplate?.storageCondition ?? itemDetail?.storageCondition ?? itemDetail?.storage_condition ?? '냉동'}
                      registrationNumber={labelTemplate?.registrationNumber ?? itemDetail?.code ?? itemData?.itemCode ?? ''}
                      categoryAndForm={labelTemplate?.categoryAndForm ?? itemDetail?.category ?? ''}
                      ingredients={labelTemplate?.ingredients ?? itemDetail?.ingredients ?? ''}
                      rawMaterials={labelTemplate?.rawMaterials ?? itemDetail?.rawMaterials ?? itemDetail?.raw_materials ?? ''}
                      actualWeight={labelTemplate?.actualWeight ?? itemDetail?.actualWeight ?? itemDetail?.actual_weight ?? ''}
                      manufactureDate={manufactureDate}
                      expiryDate={calculatedExpiryDate}
                      barcodeImage={barcodeImage}
                      barcodeNumber={barcodeNumber}
                      isLoadingBarcode={isLoadingBarcode}
                    />
                  )}
                  {labelType === 'medium' && (
                    <MediumLabelContent
                      productName={labelTemplate?.itemName ?? productName}
                      storageCondition={labelTemplate?.storageCondition ?? itemDetail?.storageCondition ?? itemDetail?.storage_condition ?? '냉동'}
                      registrationNumber={labelTemplate?.registrationNumber ?? itemDetail?.code ?? itemData?.itemCode ?? ''}
                      categoryAndForm={labelTemplate?.categoryAndForm ?? itemDetail?.category ?? ''}
                      ingredients={labelTemplate?.ingredients ?? itemDetail?.ingredients ?? ''}
                      manufactureDate={manufactureDate}
                      expiryDate={calculatedExpiryDate}
                      barcodeImage={barcodeImage}
                      barcodeNumber={barcodeNumber}
                      isLoadingBarcode={isLoadingBarcode}
                    />
                  )}
                  {labelType === 'small' && (
                    <SmallLabelContent
                      manufactureDate={manufactureDate}
                      expiryDate={calculatedExpiryDate}
                      barcodeImage={barcodeImage}
                      isLoadingBarcode={isLoadingBarcode}
                    />
                  )}
                  {labelType === 'verysmall' && (
                    <VerySmallLabelContent
                      productName={productName}
                      manufactureDate={manufactureDate}
                      expiryDate={calculatedExpiryDate}
                      barcodeImage={barcodeImage}
                      isLoadingBarcode={isLoadingBarcode}
                    />
                  )}
                </div>
              ) : (
                <div className='text-center text-gray-500 text-sm py-12'>템플릿 양식을 선택하면 미리보기가 표시됩니다.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-center border-t border-gray-200 px-6 py-4'>
          <button onClick={handlePrint} disabled={!isFormValid || isProcessing || isPdfLoading} className={`w-32 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors ${isFormValid && !isProcessing && !isPdfLoading ? 'bg-[#674529] hover:bg-[#5a3d22] cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}>
            {isProcessing || isPdfLoading ? '처리 중...' : '프린트'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===============================
// 라벨 컴포넌트들 (미리보기 전용)
// ===============================
const LargeLabelContent = React.memo(({ 
  productName, storageCondition, registrationNumber, categoryAndForm, ingredients, rawMaterials, actualWeight, manufactureDate, expiryDate, barcodeImage, barcodeNumber, isLoadingBarcode
}) => {
  const getStorageIcon = () => (storageCondition === '냉동' ? <Snowflake className='w-7 h-7 mb-1' /> : null);
  return (
    <div style={{ width: '100mm', height: '100mm', padding: '3mm', boxSizing: 'border-box' }} className='flex flex-col justify-between text-xs border border-gray-300'>
      <div className='flex justify-between items-start'>
        <div className='text-2xl font-bold text-gray-900'>{productName || '제품명'}</div>
        <div className='border-2 border-gray-800 rounded-xl p-2 w-16 h-16 flex flex-col items-center justify-center'>
          {getStorageIcon()}
          <div className='text-[7px] font-semibold'>{(storageCondition || '냉동')}식품</div>
        </div>
      </div>
      <div className='space-y-1 text-[8px] leading-relaxed'>
        {registrationNumber && (<p><span className='font-semibold'>등록번호:</span> {registrationNumber} / <span className='font-semibold'>제품명:</span> {productName || '제품명'}</p>)}
        {categoryAndForm && (<p><span className='font-semibold'>종류 및 형태:</span> {categoryAndForm}</p>)}
        {ingredients && (<p><span className='font-semibold'>성분량:</span> {ingredients}</p>)}
        {rawMaterials && (<p><span className='font-semibold'>원료의 명칭:</span> {rawMaterials}</p>)}
        {actualWeight && (<p><span className='font-semibold'>실제중량:</span> {actualWeight}</p>)}
        <p className='text-red-700 font-semibold'><span className='font-bold'>⚠ 주의사항:</span> 반려동물 이외에는 급여하지 마십시오.</p>
      </div>
      <div className='flex justify-between items-end'>
        <div className='text-center'>
          {isLoadingBarcode ? (
            <div className='w-32 h-16 flex items-center justify-center text-[8px] text-gray-400'>바코드 로딩 중...</div>
          ) : barcodeImage ? (
            <div className='w-full flex justify-center overflow-hidden'>
              <img src={barcodeImage} alt='Barcode' className='h-auto mb-1' style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          ) : (
            <div className='w-32 h-16 flex items-center justify-center text-[8px] text-gray-400'>바코드 없음</div>
          )}
          {barcodeNumber && <div className='text-[8px] text-gray-600'>{barcodeNumber}</div>}
        </div>
        <div className='text-[9px] text-right space-y-0.5'>
          {manufactureDate && <p><span className='font-semibold'>제조일자:</span> {manufactureDate}</p>}
          <p><span className='font-semibold'>유통기한:</span> {expiryDate || '-'}</p>
        </div>
        <div className='text-center'>
          <Microwave className='w-10 h-10 mx-auto mb-1' />
          <div className='text-[7px] font-semibold'>30초~2분</div>
        </div>
      </div>
    </div>
  );
});

const MediumLabelContent = React.memo(({ 
  productName, storageCondition, registrationNumber, categoryAndForm, ingredients, manufactureDate, expiryDate, barcodeImage, barcodeNumber, isLoadingBarcode
}) => (
  <div style={{ width: '80mm', height: '60mm', padding: '2.5mm', boxSizing: 'border-box' }} className='flex flex-col justify-start border border-gray-300'>
    <h2 className='text-xl font-bold mb-2 text-gray-900'>{productName || '제품명'}</h2>
    <div className='text-[8px] leading-relaxed space-y-1.5 mb-2'>
      {registrationNumber && (<p><span className='font-semibold'>등록번호:</span> {registrationNumber} / <span className='font-semibold'>제품명:</span> {productName || '제품명'}</p>)}
      {categoryAndForm && (<p><span className='font-semibold'>종류 및 형태:</span> {categoryAndForm}</p>)}
      {ingredients && (<p><span className='font-semibold'>성분량:</span> {ingredients}</p>)}
    </div>
    <div className='mt-auto flex items-end justify-between'>
      <div className='text-[9px] space-y-0.5'>
        {manufactureDate && <p><span className='font-semibold'>제조일자:</span> {manufactureDate}</p>}
        <p><span className='font-semibold'>유통기한:</span> {expiryDate || '-'}</p>
      </div>
      <div className='text-center'>
        {isLoadingBarcode ? (
          <div className='w-24 h-14 flex items-center justify-center text-[8px] text-gray-400'>로딩 중...</div>
        ) : barcodeImage ? (
          <img src={barcodeImage} alt='Barcode' className='h-auto' style={{ maxWidth: '100%', height: 'auto' }} />
        ) : null}
        {barcodeNumber && <div className='text-[8px] text-gray-600'>{barcodeNumber}</div>}
      </div>
    </div>
  </div>
));

const SmallLabelContent = React.memo(({ manufactureDate, expiryDate, barcodeImage, isLoadingBarcode }) => (
  <div style={{ width: '50mm', height: '30mm', padding: '1.5mm', boxSizing: 'border-box' }} className='flex flex-col border border-gray-300 items-center justify-center text-center overflow-hidden'>
    <div className='text-[7px] mb-1'>
      <p className='font-semibold mb-0.5'>제 조 날 짜</p>
      <p className='tracking-widest'>{manufactureDate ? manufactureDate.split('').join(' ') : '-'}</p>
    </div>
    <div className='text-[7px] mb-1'>
      <p className='font-semibold mb-0.5'>유 통 기 한</p>
      <p className='tracking-widest'>{expiryDate ? expiryDate.split('').join(' ') : '-'}</p>
    </div>
    {isLoadingBarcode ? (
      <div className='text-[6px] text-gray-400'>로딩 중...</div>
    ) : barcodeImage ? (
      <img src={barcodeImage} alt='Barcode' className='h-auto' style={{ maxWidth: '100%', height: 'auto' }} />
    ) : null}
  </div>
));

const VerySmallLabelContent = React.memo(({ productName, manufactureDate, expiryDate, barcodeImage, isLoadingBarcode }) => (
  <div style={{ width: '28mm', height: '16mm', padding: '1mm', boxSizing: 'border-box' }} className='flex items-center justify-center gap-2 border border-gray-300 overflow-hidden'>
    <div className='text-[6px] font-bold transform -rotate-90 whitespace-nowrap flex-shrink-0'>
      {productName || '제품명'}
    </div>
    {isLoadingBarcode ? (
      <div className='text-[5px] text-gray-400'>로딩 중...</div>
    ) : barcodeImage ? (
      <div className='flex-shrink min-w-0 flex justify-center overflow-hidden'>
        <img src={barcodeImage} alt='Barcode' className='h-auto max-w-full' style={{ maxWidth: '18mm', height: 'auto' }} />
      </div>
    ) : null}
  </div>
));

export default LabelPrintModal;