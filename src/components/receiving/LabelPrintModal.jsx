import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Snowflake, Microwave, Plus } from 'lucide-react';
import { labelAPI, itemsAPI } from '../../api';
import usePdfDownload from '../common/usePdfDownload';
import {
  getPrinters,
  addPrinter,
  removePrinter,
  getDefaultPrinter,
  setDefaultPrinter,
} from '../../utils/printerUtils';

// ===============================
// PDF Base64 헬퍼
// ===============================
const normalizePdfBase64 = (rawPdf) => {
  console.log('📦 normalizePdfBase64 input type:', typeof rawPdf);

  if (rawPdf == null) {
    throw new Error('pdfBase64 데이터가 비어 있습니다.');
  }

  const toBase64FromByteArray = (bytes) => {
    const uint8 = new Uint8Array(bytes);
    let binary = '';
    for (let i = 0; i < uint8.length; i += 1) {
      binary += String.fromCharCode(uint8[i]);
    }
    return window.btoa(binary);
  };

  // 숫자 배열: [37,80,68,...]
  if (Array.isArray(rawPdf)) {
    console.log('📦 normalizePdfBase64: number[] 로 인식');
    const bytes = rawPdf.map((n) => Number(n));
    return toBase64FromByteArray(bytes);
  }

  // 문자열
  if (typeof rawPdf === 'string') {
    const trimmed = rawPdf.trim();

    // "37,80,68,..." 형태의 CSV 숫자 문자열
    const looksLikeCsv = /^[0-9]+(,[0-9]+)*$/.test(trimmed);
    if (looksLikeCsv) {
      console.log('📦 normalizePdfBase64: CSV number string 로 인식');
      const parts = trimmed.split(',');
      const bytes = parts.map((n) => Number(n));
      return toBase64FromByteArray(bytes);
    }

    // 그 외는 이미 base64 라고 가정
    console.log('📦 normalizePdfBase64: base64 string 으로 사용');
    return trimmed;
  }

  // 그 외 타입은 지원하지 않음
  throw new Error('지원하지 않는 pdfBase64 포맷입니다.');
};

const LabelPrintModal = ({
  isOpen,
  onClose,
  onPrintComplete,
  itemData,
  onTemplateCreationRequired,
}) => {
  const [labelSize, setLabelSize] = useState(''); // '100X100' | '80X60' | '50X30' | '28X16'
  const [manufactureDate, setManufactureDate] = useState(
    new Date().toISOString().split('T')[0],
  );
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
  const productName = useMemo(
    () => itemData?.itemName ?? itemData?.name ?? '',
    [itemData?.itemName, itemData?.name],
  );

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

  // ---------- 라벨 템플릿 데이터 (프론트에서 구성) ----------
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
      expiration_date:
        itemData.expiration_date ?? itemData.expiry_date ?? undefined,
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
          const names = printerList.map((p) =>
            typeof p === 'string' ? p : p?.name ?? p?.printerName ?? '',
          );
          const pick =
            def && names.includes(def)
              ? def
              : names[0];
          setSelectedPrinter(pick);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setPrinters([]);
      } finally {
        if (isMounted) setIsLoadingPrinters(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleAddPrinter = async () => {
    const name = newPrinterName?.trim();
    if (!name) {
      alert('프린터 이름을 입력해주세요.');
      return;
    }
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
      if (selectedPrinter === printerName) {
        const first =
          list.length > 0
            ? typeof list[0] === 'string'
              ? list[0]
              : list[0]?.name ?? ''
            : '';
        setSelectedPrinter(first);
      }
    } catch (e) {
      console.error(e);
      alert('프린터 삭제 실패');
    }
  };

  const handlePrinterChange = (printerName) => {
    setSelectedPrinter(printerName);
    setDefaultPrinter(printerName);
  };

  // ---------- 유통기한 자동 계산 ----------
  const expiryDays = useMemo(() => {
    const cands = [
      itemDetail?.expiration_date,
      itemDetail?.expiry_date,
      labelTemplate?.expiration_date,
      labelTemplate?.item?.expiration_date,
    ];
    const picked = cands.find(
      (v) => v !== undefined && v !== null && String(v).trim() !== '',
    );
    const n = Number(picked);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [
    itemDetail?.expiration_date,
    itemDetail?.expiry_date,
    labelTemplate?.expiration_date,
  ]);

  useEffect(() => {
    if (!manufactureDate || !expiryDays) {
      setCalculatedExpiryDate('');
      return;
    }
    try {
      const m = new Date(manufactureDate);
      if (Number.isNaN(m.getTime())) {
        setCalculatedExpiryDate('');
        return;
      }
      const d = new Date(m);
      d.setDate(d.getDate() + expiryDays);
      setCalculatedExpiryDate(d.toISOString().split('T')[0]);
    } catch {
      setCalculatedExpiryDate('');
    }
  }, [manufactureDate, expiryDays]);

  // ---------- 바코드 미리보기 (프론트 임시 생성) ----------
  useEffect(() => {
    if (!isOpen) {
      setBarcodeImage(null);
      setBarcodeNumber(null);
      return;
    }
    if (!manufactureDate || !calculatedExpiryDate) {
      setBarcodeImage(null);
      setBarcodeNumber(null);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        setIsLoadingBarcode(true);
        const num = (
          labelTemplate?.registrationNumber ??
          itemDetail?.code ??
          itemData?.itemCode ??
          ''
        ).toString();
        const digits = num.replace(/\D/g, '');
        if (digits.length < 8) {
          if (isMounted) {
            setBarcodeImage(null);
            setBarcodeNumber(num);
          }
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, 200, 60);
        ctx.fillStyle = '#000';
        let x = 10;
        for (let i = 0; i < digits.length; i += 1) {
          const w = parseInt(digits[i], 10) % 2 === 0 ? 2 : 3;
          ctx.fillRect(x, 6, w, 40);
          x += w + 1;
        }
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(digits, 100, 55);
        if (isMounted) {
          setBarcodeImage(canvas.toDataURL('image/png'));
          setBarcodeNumber(digits);
        }
      } catch {
        if (isMounted) {
          setBarcodeImage(null);
          setBarcodeNumber(null);
        }
      } finally {
        if (isMounted) setIsLoadingBarcode(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    manufactureDate,
    calculatedExpiryDate,
    labelTemplate?.registrationNumber,
    itemDetail?.code,
    itemData?.itemCode,
  ]);

  // ---------- labelSize → labelType ----------
  const labelType = useMemo(() => {
    switch (labelSize) {
      case '100X100':
        return 'large';
      case '80X60':
        return 'medium';
      case '50X30':
        return 'small';
      case '28X16':
        return 'verysmall';
      default:
        return null;
    }
  }, [labelSize]);

  // 제품명에서 "(200g)" 같은 무게 추출 (실제중량 비어 있을 때 fallback)
  const derivedWeight = useMemo(() => {
    const m = /\(([^)]+)\)/.exec(productName ?? '');
    return m ? m[1] : '';
  }, [productName]);

  const isFormValid = useMemo(
    () =>
      Boolean(
        labelType &&
          productName &&
          manufactureDate &&
          selectedPrinter &&
          (quantity ?? '') !== '',
      ),
    [labelType, productName, manufactureDate, selectedPrinter, quantity],
  );

  // ===============================
  // 프린트 핸들러
  // 1) /label/pdf (printSavedLabelPdf) 에서 pdfBase64 받기
  // 2) 4310/print (printLabel) 로 보내서 실제 인쇄
  // ===============================
  const handlePrint = useCallback(async () => {
    if (isProcessing || !isFormValid) return;
    if (!labelType) {
      alert('템플릿 양식을 선택해주세요.');
      return;
    }

    // itemId 필수 (백엔드 Zod: itemId)
    const itemId =
      itemDetail?.id ??
      itemDetail?.itemId ??
      itemData?.itemId ??
      itemData?.id ??
      null;

    if (!itemId) {
      alert('이 품목의 itemId를 찾을 수 없습니다. 관리자에게 문의해주세요.');
      return;
    }

    // expiryDate 필수 (백엔드 Zod: expiryDate required)
    if (!calculatedExpiryDate) {
      alert('유통기한이 계산되지 않았습니다. 품목의 유통기한(일)을 확인해주세요.');
      return;
    }

    const printCount = parseInt(quantity, 10) || 1;

    const baseLabelData = {
      labelSize,
      productName,
      manufactureDate,
      expiryDate: calculatedExpiryDate,
      quantity,
      printerName: selectedPrinter,
      selectedPrinter,
      itemData,
    };

    setIsProcessing(true);

    try {
      // (선택) 미리보기 PDF 저장 - 기존 기능 유지 (프린트 실패와는 분리)
      const preview = previewRef.current;
      if (preview) {
        const filename = `라벨_${productName}_${manufactureDate}_${labelSize}.pdf`;
        const pdfResult = await downloadPdf(preview, {
          filename,
          orientation: 'portrait',
          scale: 1,
          margin: 0,
        });
        if (!pdfResult?.success) {
          console.warn(
            '미리보기 PDF 저장 실패(계속 진행):',
            pdfResult?.error,
          );
        }
      }

      const templateTypeMap = {
        '100X100': 'large',
        '80X60': 'medium',
        '50X30': 'small',
        '28X16': 'verysmall',
      };
      const templateType = templateTypeMap[labelSize] ?? 'large';

      // =======================
      // 1단계: /label/pdf 호출
      //   -> 현재 백엔드 Zod 스키마에 맞는 payload
      // =======================
      const pdfRequestPayload = {
        itemId,                             // ✅ 숫자 또는 숫자 문자열
        templateType,                       // ✅ 'large' | 'medium' | 'small' | 'verysmall'
        manufactureDate,                    // ✅ 'YYYY-MM-DD'
        expiryDate: calculatedExpiryDate,   // ✅ 'YYYY-MM-DD'
        printCount,                         // ✅ number (Zod가 number/string 둘 다 허용)
      };

      console.log('▶ /label/pdf payload:', pdfRequestPayload);

      const pdfResponse = await labelAPI.printSavedLabelPdf(pdfRequestPayload);
      console.log('✅ /label/pdf response:', pdfResponse);

      const pdfData = pdfResponse?.data;
      const rawPdf =
        pdfData?.data?.pdfBase64 ??
        pdfData?.pdfBase64 ??
        pdfData?.pdf ??
        pdfData?.data ??
        pdfData;

      const pdfBase64 = normalizePdfBase64(rawPdf);
      console.log('✅ pdfBase64 length:', pdfBase64.length);

      // =======================
      // 2단계: 4310/print 호출
      // =======================
      const printerPayload = {
        printerName: selectedPrinter,
        printCount,
        pdfBase64,
      };

      console.log('▶ 4310/print payload:', {
        ...printerPayload,
        pdfBase64: `${pdfBase64.slice(0, 30)}...`,
      });

      const printResponse = await labelAPI.printLabel(printerPayload);
      console.log('✅ 4310/print response:', printResponse);

      const printResult = printResponse?.data;
      const ok =
        typeof printResult?.ok === 'boolean' ? printResult.ok : true;
      const message =
        printResult?.message ??
        `${printCount}건 라벨 인쇄 요청이 완료되었습니다.`;

      if (!ok) {
        throw new Error(message);
      }

      alert(message);
      onPrintComplete ? onPrintComplete(baseLabelData) : onClose();
    } catch (error) {
      console.error('라벨 프린트 중 오류:', error);
      const errorMessage =
        error?.response?.data?.message ??
        error?.message ??
        '알 수 없는 오류';
      const errorStatus = error?.response?.status ?? 0;
      const errorDetail = error?.response?.data?.detail ?? '';
      const errorString = String(errorDetail || errorMessage || '');

      const isTemplateError =
        errorStatus === 500 ||
        errorMessage.includes('category_and_form') ||
        errorMessage.includes('Cannot read properties of null') ||
        errorString.includes('category_and_form') ||
        errorString.includes('Cannot read properties of null');

      if (isTemplateError && onTemplateCreationRequired) {
        console.log('📋 라벨 템플릿 생성 필요:', {
          itemId:
            itemDetail?.id ??
            itemDetail?.itemId ??
            itemData?.itemId ??
            itemData?.id,
          itemCode: itemDetail?.code ?? itemData?.itemCode ?? '',
          itemName:
            itemDetail?.name ??
            itemDetail?.itemName ??
            itemData?.itemName ??
            productName,
        });

        onTemplateCreationRequired({
          itemId:
            itemDetail?.id ??
            itemDetail?.itemId ??
            itemData?.itemId ??
            itemData?.id,
          itemCode: itemDetail?.code ?? itemData?.itemCode ?? '',
          itemName:
            itemDetail?.name ??
            itemDetail?.itemName ??
            itemData?.itemName ??
            productName,
          productName,
          storageCondition:
            labelTemplate?.storageCondition ??
            itemDetail?.storageCondition ??
            itemDetail?.storage_condition ??
            '냉동',
          registrationNumber:
            labelTemplate?.registrationNumber ??
            itemDetail?.code ??
            itemData?.itemCode ??
            '',
          categoryAndForm:
            labelTemplate?.categoryAndForm ?? itemDetail?.category ?? '',
          ingredients:
            labelTemplate?.ingredients ?? itemDetail?.ingredients ?? '',
          rawMaterials:
            labelTemplate?.rawMaterials ??
            itemDetail?.rawMaterials ??
            itemDetail?.raw_materials ??
            '',
          actualWeight:
            labelTemplate?.actualWeight ??
            itemDetail?.actualWeight ??
            itemDetail?.actual_weight ??
            derivedWeight,
        });
      } else {
        alert(`라벨 프린트 중 오류가 발생했습니다: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing,
    isFormValid,
    labelType,
    labelSize,
    productName,
    manufactureDate,
    calculatedExpiryDate,
    quantity,
    selectedPrinter,
    itemData,
    itemDetail,
    labelTemplate,
    derivedWeight,
    downloadPdf,
    onPrintComplete,
    onClose,
    onTemplateCreationRequired,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-[#674529]">
            라벨 프린트
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Left */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  템플릿
                </label>
                <select
                  value={labelSize}
                  onChange={(e) => setLabelSize(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors"
                >
                  <option value="">템플릿 양식 선택</option>
                  <option value="100X100">100×100 mm</option>
                  <option value="80X60">80×60 mm</option>
                  <option value="50X30">50×30 mm</option>
                  <option value="28X16">28×16 mm</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  제품명
                </label>
                <input
                  type="text"
                  value={productName}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  제조일자
                </label>
                <input
                  type="date"
                  value={manufactureDate}
                  onChange={(e) => setManufactureDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors"
                />
              </div>

              {calculatedExpiryDate && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    유통기한 (자동 계산)
                  </label>
                  <input
                    type="text"
                    value={calculatedExpiryDate}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-gray-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-700"
                  />
                  {expiryDays && (
                    <p className="mt-1 text-xs text-gray-500">
                      유통기한: {expiryDays}일
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  라벨 프린트 갯수
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors"
                  placeholder="100"
                />
              </div>

              {/* Printer */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  프린트 기기 선택
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedPrinter}
                    onChange={(e) => handlePrinterChange(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors"
                  >
                    {printers.length === 0 ? (
                      <option value="">프린터를 추가해주세요</option>
                    ) : (
                      printers.map((p, i) => {
                        const name =
                          typeof p === 'string'
                            ? p
                            : p?.name ??
                              p?.id ??
                              p?.printerName ??
                              String(p);
                        return (
                          <option key={i} value={name}>
                            {name}
                          </option>
                        );
                      })
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddPrinter(!showAddPrinter)}
                    className="flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2.5 text-gray-700 transition-colors hover:bg-gray-200"
                    title="프린터 추가"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {showAddPrinter && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newPrinterName}
                      onChange={(e) => setNewPrinterName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleAddPrinter()
                      }
                      placeholder="프린터 이름 입력"
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddPrinter}
                      className="rounded-xl bg-[#674529] px-3 py-2.5 text-sm text-white transition-colors hover:bg-[#5a3d22]"
                    >
                      추가
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPrinter(false);
                        setNewPrinterName('');
                      }}
                      className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Preview */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 p-8">
              {labelType ? (
                <div
                  ref={previewRef}
                  className="bg-white shadow-md"
                  style={{
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                >
                  {labelType === 'large' && (
                    <LargeLabelContent
                      productName={labelTemplate?.itemName ?? productName}
                      storageCondition={
                        labelTemplate?.storageCondition ??
                        itemDetail?.storageCondition ??
                        itemDetail?.storage_condition ??
                        '냉동'
                      }
                      registrationNumber={
                        labelTemplate?.registrationNumber ??
                        itemDetail?.code ??
                        itemData?.itemCode ??
                        ''
                      }
                      categoryAndForm={
                        labelTemplate?.categoryAndForm ??
                        itemDetail?.category ??
                        ''
                      }
                      ingredients={
                        labelTemplate?.ingredients ??
                        itemDetail?.ingredients ??
                        ''
                      }
                      rawMaterials={
                        labelTemplate?.rawMaterials ??
                        itemDetail?.rawMaterials ??
                        itemDetail?.raw_materials ??
                        ''
                      }
                      actualWeight={
                        labelTemplate?.actualWeight ??
                        itemDetail?.actualWeight ??
                        itemDetail?.actual_weight ??
                        ''
                      }
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
                      storageCondition={
                        labelTemplate?.storageCondition ??
                        itemDetail?.storageCondition ??
                        itemDetail?.storage_condition ??
                        '냉동'
                      }
                      registrationNumber={
                        labelTemplate?.registrationNumber ??
                        itemDetail?.code ??
                        itemData?.itemCode ??
                        ''
                      }
                      categoryAndForm={
                        labelTemplate?.categoryAndForm ??
                        itemDetail?.category ??
                        ''
                      }
                      ingredients={
                        labelTemplate?.ingredients ??
                        itemDetail?.ingredients ??
                        ''
                      }
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
                <div className="py-12 text-center text-sm text-gray-500">
                  템플릿 양식을 선택하면 미리보기가 표시됩니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center border-t border-gray-200 px-6 py-4">
          <button
            onClick={handlePrint}
            disabled={!isFormValid || isProcessing || isPdfLoading}
            className={`w-32 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors ${
              isFormValid && !isProcessing && !isPdfLoading
                ? 'cursor-pointer bg-[#674529] hover:bg-[#5a3d22]'
                : 'cursor-not-allowed bg-gray-300'
            }`}
          >
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
const LargeLabelContent = React.memo(
  ({
    productName,
    storageCondition,
    registrationNumber,
    categoryAndForm,
    ingredients,
    rawMaterials,
    actualWeight,
    manufactureDate,
    expiryDate,
    barcodeImage,
    barcodeNumber,
    isLoadingBarcode,
  }) => {
    const getStorageIcon = () =>
      storageCondition === '냉동' ? (
        <Snowflake className="mb-1 h-7 w-7" />
      ) : null;
    return (
      <div
        style={{
          width: '100mm',
          height: '100mm',
          padding: '3mm',
          boxSizing: 'border-box',
        }}
        className="flex flex-col justify-between border border-gray-300 text-xs"
      >
        <div className="flex items-start justify-between">
          <div className="text-2xl font-bold text-gray-900">
            {productName || '제품명'}
          </div>
          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border-2 border-gray-800 p-2">
            {getStorageIcon()}
            <div className="text-[7px] font-semibold">
              {(storageCondition || '냉동')}식품
            </div>
          </div>
        </div>
        <div className="space-y-1 text-[8px] leading-relaxed">
          {registrationNumber && (
            <p>
              <span className="font-semibold">등록번호:</span>{' '}
              {registrationNumber} /{' '}
              <span className="font-semibold">제품명:</span>{' '}
              {productName || '제품명'}
            </p>
          )}
          {categoryAndForm && (
            <p>
              <span className="font-semibold">종류 및 형태:</span>{' '}
              {categoryAndForm}
            </p>
          )}
          {ingredients && (
            <p>
              <span className="font-semibold">성분량:</span> {ingredients}
            </p>
          )}
          {rawMaterials && (
            <p>
              <span className="font-semibold">원료의 명칭:</span>{' '}
              {rawMaterials}
            </p>
          )}
          {actualWeight && (
            <p>
              <span className="font-semibold">실제중량:</span>{' '}
              {actualWeight}
            </p>
          )}
          <p className="font-semibold text-red-700">
            <span className="font-bold">⚠ 주의사항:</span>{' '}
            반려동물 이외에는 급여하지 마십시오.
          </p>
        </div>
        <div className="flex items-end justify-between">
          <div className="text-center">
            {isLoadingBarcode ? (
              <div className="flex h-16 w-32 items-center justify-center text-[8px] text-gray-400">
                바코드 로딩 중...
              </div>
            ) : barcodeImage ? (
              <div className="flex w-full justify-center overflow-hidden">
                <img
                  src={barcodeImage}
                  alt="Barcode"
                  className="mb-1 h-auto"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            ) : (
              <div className="flex h-16 w-32 items-center justify-center text-[8px] text-gray-400">
                바코드 없음
              </div>
            )}
            {barcodeNumber && (
              <div className="text-[8px] text-gray-600">
                {barcodeNumber}
              </div>
            )}
          </div>
          <div className="space-y-0.5 text-right text-[9px]">
            {manufactureDate && (
              <p>
                <span className="font-semibold">제조일자:</span>{' '}
                {manufactureDate}
              </p>
            )}
            <p>
              <span className="font-semibold">유통기한:</span>{' '}
              {expiryDate || '-'}
            </p>
          </div>
          <div className="text-center">
            <Microwave className="mx-auto mb-1 h-10 w-10" />
            <div className="text-[7px] font-semibold">30초~2분</div>
          </div>
        </div>
      </div>
    );
  },
);

const MediumLabelContent = React.memo(
  ({
    productName,
    storageCondition,
    registrationNumber,
    categoryAndForm,
    ingredients,
    manufactureDate,
    expiryDate,
    barcodeImage,
    barcodeNumber,
    isLoadingBarcode,
  }) => (
    <div
      style={{
        width: '80mm',
        height: '60mm',
        padding: '2.5mm',
        boxSizing: 'border-box',
      }}
      className="flex flex-col justify-start border border-gray-300"
    >
      <h2 className="mb-2 text-xl font-bold text-gray-900">
        {productName || '제품명'}
      </h2>
      <div className="mb-2 space-y-1.5 text-[8px] leading-relaxed">
        {registrationNumber && (
          <p>
            <span className="font-semibold">등록번호:</span>{' '}
            {registrationNumber} /{' '}
            <span className="font-semibold">제품명:</span>{' '}
            {productName || '제품명'}
          </p>
        )}
        {categoryAndForm && (
          <p>
            <span className="font-semibold">종류 및 형태:</span>{' '}
            {categoryAndForm}
          </p>
        )}
        {ingredients && (
          <p>
            <span className="font-semibold">성분량:</span> {ingredients}
          </p>
        )}
      </div>
      <div className="mt-auto flex items-end justify-between">
        <div className="space-y-0.5 text-[9px]">
          {manufactureDate && (
            <p>
              <span className="font-semibold">제조일자:</span>{' '}
              {manufactureDate}
            </p>
          )}
          <p>
            <span className="font-semibold">유통기한:</span>{' '}
            {expiryDate || '-'}
          </p>
        </div>
        <div className="text-center">
          {isLoadingBarcode ? (
            <div className="flex h-14 w-24 items-center justify-center text-[8px] text-gray-400">
              로딩 중...
            </div>
          ) : barcodeImage ? (
            <img
              src={barcodeImage}
              alt="Barcode"
              className="h-auto"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          ) : null}
          {barcodeNumber && (
            <div className="text-[8px] text-gray-600">
              {barcodeNumber}
            </div>
          )}
        </div>
      </div>
    </div>
  ),
);

const SmallLabelContent = React.memo(
  ({ manufactureDate, expiryDate, barcodeImage, isLoadingBarcode }) => (
    <div
      style={{
        width: '50mm',
        height: '30mm',
        padding: '1.5mm',
        boxSizing: 'border-box',
      }}
      className="flex flex-col items-center justify-center overflow-hidden border border-gray-300 text-center"
    >
      <div className="mb-1 text-[7px]">
        <p className="mb-0.5 font-semibold">제 조 날 짜</p>
        <p className="tracking-widest">
          {manufactureDate
            ? manufactureDate.split('').join(' ')
            : '-'}
        </p>
      </div>
      <div className="mb-1 text-[7px]">
        <p className="mb-0.5 font-semibold">유 통 기 한</p>
        <p className="tracking-widest">
          {expiryDate ? expiryDate.split('').join(' ') : '-'}
        </p>
      </div>
      {isLoadingBarcode ? (
        <div className="text-[6px] text-gray-400">로딩 중...</div>
      ) : barcodeImage ? (
        <img
          src={barcodeImage}
          alt="Barcode"
          className="h-auto"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      ) : null}
    </div>
  ),
);

const VerySmallLabelContent = React.memo(
  ({ productName, manufactureDate, expiryDate, barcodeImage, isLoadingBarcode }) => (
    <div
      style={{
        width: '28mm',
        height: '16mm',
        padding: '1mm',
        boxSizing: 'border-box',
      }}
      className="flex items-center justify-center gap-2 overflow-hidden border border-gray-300"
    >
      <div className="flex-shrink-0 transform -rotate-90 whitespace-nowrap text-[6px] font-bold">
        {productName || '제품명'}
      </div>
      {isLoadingBarcode ? (
        <div className="text-[5px] text-gray-400">로딩 중...</div>
      ) : barcodeImage ? (
        <div className="flex min-w-0 flex-shrink justify-center overflow-hidden">
          <img
            src={barcodeImage}
            alt="Barcode"
            className="h-auto max-w-full"
            style={{ maxWidth: '18mm', height: 'auto' }}
          />
        </div>
      ) : null}
    </div>
  ),
);

export default LabelPrintModal;
