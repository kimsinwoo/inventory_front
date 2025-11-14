import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
<<<<<<< HEAD
import { X, Snowflake, Microwave } from 'lucide-react';
import { labelAPI, itemsAPI } from '../../api';
import usePdfDownload from '../common/usePdfDownload';

const LabelPrintModal = ({ isOpen, onClose, onPrintComplete, itemData }) => {
  const [labelSize, setLabelSize] = useState('');
  const [manufactureDate, setManufactureDate] = useState(
    new Date().toISOString().split('T')[0]
  );
=======
import { X, Snowflake, Microwave, Plus } from 'lucide-react';
import { labelAPI, itemsAPI } from '../../api';
import usePdfDownload from '../common/usePdfDownload';
import { getPrinters, addPrinter, removePrinter, getDefaultPrinter, setDefaultPrinter } from '../../utils/printerUtils';

const LabelPrintModal = ({ isOpen, onClose, onPrintComplete, itemData, onTemplateCreationRequired }) => {
  const [labelSize, setLabelSize] = useState(''); // '100X100' | '80X60' | '50X30' | '28X16'
  const [manufactureDate, setManufactureDate] = useState(new Date().toISOString().split('T')[0]);
>>>>>>> origin/label-print
  const [quantity, setQuantity] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [printers, setPrinters] = useState([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
<<<<<<< HEAD
=======
  const [newPrinterName, setNewPrinterName] = useState('');
  const [showAddPrinter, setShowAddPrinter] = useState(false);
>>>>>>> origin/label-print
  const [itemDetail, setItemDetail] = useState(null);
  const [labelTemplate, setLabelTemplate] = useState(null);
  const [calculatedExpiryDate, setCalculatedExpiryDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const previewRef = useRef(null);
<<<<<<< HEAD
  const abortControllerRef = useRef(null); // API 요청 취소용
  const { downloadPdf, isLoading: isPdfLoading } = usePdfDownload();
  const [barcodeImage, setBarcodeImage] = useState(null);
  const [isLoadingBarcode, setIsLoadingBarcode] = useState(false);
  const [barcodeNumber, setBarcodeNumber] = useState(null); // 실제 바코드 번호

  // 제품명은 itemData에서 고정으로 사용 (useMemo로 최적화)
  const productName = useMemo(() => itemData?.itemName || itemData?.name || '', [itemData?.itemName, itemData?.name]);

  // 아이템 상세 정보 가져오기 (cleanup 추가)
  useEffect(() => {
    if (!isOpen || !itemData?.itemCode) return;

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    let isMounted = true;

    const fetchItemDetail = async () => {
      try {
        const response = await itemsAPI.getItemByCode(itemData.itemCode);
        if (!signal.aborted && isMounted) {
          const item = response.data?.data || response.data || {};
          setItemDetail(item);
        }
      } catch (error) {
        if (!signal.aborted && isMounted && error.name !== 'AbortError') {
          console.error('아이템 정보 가져오기 실패:', error);
        }
      }
    };
    
    fetchItemDetail();

    // Cleanup 함수
    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, itemData?.itemCode]);

  // 라벨 템플릿 가져오기 (cleanup 추가)
  useEffect(() => {
    if (!isOpen || !itemData?.itemCode) return;

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    let isMounted = true;

    const fetchLabelTemplate = async () => {
      try {
        const response = await labelAPI.getLabelTemplate(itemData.itemCode);
        if (!signal.aborted && isMounted) {
          const template = response.data?.data || response.data || null;
          setLabelTemplate(template);
        }
      } catch (error) {
        if (!signal.aborted && isMounted && error.name !== 'AbortError') {
          console.error('라벨 템플릿 가져오기 실패:', error);
          setLabelTemplate(null);
        }
      }
    };
    
    fetchLabelTemplate();

    // Cleanup 함수
    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, itemData?.itemCode]);

  // 프린터 목록 가져오기 (cleanup 추가)
  useEffect(() => {
    if (!isOpen) return;

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
    };
  }, [isOpen]);

  // 제조일자 변경 시 유통기한 자동 계산 (최적화: 불필요한 로그 제거)
  useEffect(() => {
    if (!manufactureDate) {
      setCalculatedExpiryDate('');
      return;
    }

    // 유통기한 가져오기 (우선순위: labelTemplate.item.expiration_date → itemDetail.expiration_date)
    const expiryDaysStr = labelTemplate?.item?.expiration_date || 
                         itemDetail?.expiration_date || 
                         itemDetail?.expiry_date || 
                         '';

    if (!expiryDaysStr || expiryDaysStr === '') {
      setCalculatedExpiryDate('');
      return;
    }

    // 숫자 형식으로 변환
    const expiryDaysMatch = expiryDaysStr.toString().trim().match(/\d+/);
    const expiryDays = expiryDaysMatch ? parseInt(expiryDaysMatch[0]) : parseInt(expiryDaysStr.toString().trim());
    
    if (isNaN(expiryDays) || expiryDays <= 0) {
      setCalculatedExpiryDate('');
      return;
    }

    try {
      const manufacture = new Date(manufactureDate);
      if (isNaN(manufacture.getTime())) {
        setCalculatedExpiryDate('');
        return;
      }

      // 제조일자에 유통기한 일수를 더함
      const expiry = new Date(manufacture);
      expiry.setDate(expiry.getDate() + expiryDays);
      const calculatedDate = expiry.toISOString().split('T')[0];
      setCalculatedExpiryDate(calculatedDate);
    } catch (error) {
      console.error('유통기한 계산 실패:', error);
      setCalculatedExpiryDate('');
    }
  }, [
    manufactureDate, 
    labelTemplate?.item?.expiration_date,
    itemDetail?.expiration_date, 
    itemDetail?.expiry_date
  ]);

  // 바코드 이미지 생성 (백엔드 API 사용 - generate-issue-label)
  useEffect(() => {
    if (!isOpen || !itemData?.itemCode) {
      setBarcodeImage(null);
      setBarcodeNumber(null);
      return;
    }

    // manufactureDate와 calculatedExpiryDate가 없으면 바코드를 생성하지 않음
    if (!manufactureDate || !calculatedExpiryDate) {
      setBarcodeImage(null);
      setBarcodeNumber(null);
      return;
    }

    let isMounted = true;

    const fetchBarcode = async () => {
      try {
        setIsLoadingBarcode(true);
        
        // itemId 찾기: 여러 경로에서 시도
        let itemId = itemDetail?.id || 
                     itemDetail?.itemId || 
                     itemData?.itemId || 
                     itemData?.id;
        
        // itemId가 없으면 itemDetail을 다시 가져오기 시도
        if (!itemId && itemData?.itemCode) {
          try {
            const response = await itemsAPI.getItemByCode(itemData.itemCode);
            const item = response.data?.data || response.data || {};
            itemId = item.id || item.itemId;
            if (itemId && isMounted) {
              setItemDetail(item);
            }
          } catch (error) {
            console.error('itemId 가져오기 실패:', error);
          }
        }
        
        if (!itemId) {
          console.error('itemId가 없습니다. itemData:', itemData, 'itemDetail:', itemDetail);
          if (isMounted) {
            setIsLoadingBarcode(false);
          }
          return;
        }
        
        // quantity 결정: 출고 시 shippedQuantity 사용, 입고 시 quantity 사용
        // 출고량(shippedQuantity)이 있으면 우선 사용, 없으면 quantity 사용
        const shippedQty = itemData?.shippedQuantity;
        const unitCnt = itemData?.unitCount;
        
        let quantityNum;
        if (shippedQty) {
          // 출고량이 있으면 출고량 사용 (문자열에서 숫자만 추출)
          const numericQty = shippedQty.toString().replace(/[^0-9.]/g, '');
          quantityNum = numericQty ? parseFloat(numericQty) : 1;
        } else if (quantity) {
          // 입고 시 quantity 사용
          quantityNum = parseInt(quantity, 10);
        } else {
          // 기본값: 묶음 수가 있으면 묶음 수 사용, 없으면 1
          quantityNum = unitCnt ? parseInt(unitCnt, 10) : 1;
        }
        
        if (isNaN(quantityNum) || quantityNum <= 0) {
          console.error('유효하지 않은 quantity:', quantityNum);
          setIsLoadingBarcode(false);
          return;
        }
        
        // 유통기한(calculatedExpiryDate)을 ISO 형식으로 변환
        let issuedAt;
        if (calculatedExpiryDate) {
          const date = new Date(calculatedExpiryDate);
          if (isNaN(date.getTime())) {
            console.error('유효하지 않은 유통기한:', calculatedExpiryDate);
            setIsLoadingBarcode(false);
            return;
          }
          // ISO 형식으로 변환 (UTC)
          issuedAt = date.toISOString();
        } else {
          console.error('유통기한이 없습니다.');
          setIsLoadingBarcode(false);
          return;
        }
        
        // generate-issue-label API에 전송할 데이터 준비
        const requestData = {
          itemId: Number(itemId),
          quantity: quantityNum,
          issuedAt: issuedAt,
        };
        
        console.log('바코드 생성 요청 데이터:', requestData);
        
        // generate-issue-label API 호출
        const response = await labelAPI.generateIssueLabel(requestData);
        
        if (!isMounted) return;

        // JSON 응답 처리
        const responseData = response.data?.data || response.data || {};
        const barcode = responseData.barcode;
        
        if (barcode) {
          // 바코드 번호 설정
          setBarcodeNumber(barcode);
          
          // 바코드 검증 (14자리 숫자)
          const barcodeStr = barcode.toString();
          if (barcodeStr.length !== 14 || !/^\d{14}$/.test(barcodeStr)) {
            console.warn('유효하지 않은 바코드 형식:', barcodeStr);
          }
          
          // 프론트엔드에서 바코드 이미지 생성
          const canvas = document.createElement('canvas');
          canvas.width = 200;  // 너비
          canvas.height = 50;  // 높이 증가 (바코드 바 + 숫자 텍스트 공간)
          
          const ctx = canvas.getContext('2d');
          
          // 배경을 흰색으로
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // 바코드 그리기 (Code 128 스타일)
          ctx.fillStyle = '#000000';
          const baseBarWidth = 1.5;  // 기본 바 너비
          const barHeight = 25;       // 바 높이
          const startY = 5;           // 상단 여백
          
          // 바코드 바의 실제 너비를 계산하기 위해 먼저 모든 바의 너비 계산
          let totalBarcodeWidth = 0;
          for (let i = 0; i < barcodeStr.length; i++) {
            const digit = parseInt(barcodeStr[i]);
            const isThick = digit % 2 === 1;
            const width = isThick ? baseBarWidth * 2.5 : baseBarWidth;
            totalBarcodeWidth += width;
            if (i < barcodeStr.length - 1) {
              totalBarcodeWidth += baseBarWidth; // 간격
            }
          }
          
          // 바코드 바를 중앙 정렬하기 위한 시작 위치
          const startX = (canvas.width - totalBarcodeWidth) / 2;
          let x = startX;
          
          // 14자리 바코드 형식: [타임스탬프 13자리] + [체크섬 1자리]
          // 각 숫자에 대해 바를 그리기
          for (let i = 0; i < barcodeStr.length; i++) {
            const digit = parseInt(barcodeStr[i]);
            
            // Code 128 스타일: 각 숫자에 대해 2개의 바(검은색)와 2개의 공백(흰색) 패턴
            // 간단한 패턴: 짝수는 얇은 바, 홀수는 두꺼운 바
            const isThick = digit % 2 === 1;
            const width = isThick ? baseBarWidth * 2.5 : baseBarWidth;
            
            // 바 그리기
            ctx.fillRect(x, startY, width, barHeight);
            x += width;
            
            // 숫자 사이 간격 (공백)
            if (i < barcodeStr.length - 1) {
              x += baseBarWidth;
            }
          }
          
          // 바코드 번호 텍스트 추가 (바코드 아래 중앙 정렬)
          ctx.fillStyle = '#000000';
          ctx.font = '11px monospace';  // monospace로 숫자 정렬
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';  // 텍스트 기준선 설정
          const textY = startY + barHeight + 8; // 바코드 바 아래 여백
          // 바코드 바의 중앙에 맞춰 숫자 텍스트 정렬
          const barcodeCenterX = startX + totalBarcodeWidth / 2;
          ctx.fillText(barcodeStr, barcodeCenterX, textY);
          
          // Canvas를 base64 이미지로 변환
          const barcodeImageData = canvas.toDataURL('image/png');
          if (isMounted) {
            setBarcodeImage(barcodeImageData);
          }
        } else {
          console.error('바코드 번호가 응답에 없습니다:', responseData);
          // 응답에서 바코드 번호를 가져오거나, registrationNumber 사용
          const barcodeNum = labelTemplate?.registration_number || 
                           itemDetail?.code || 
                           itemData?.itemCode || 
                           '';
          setBarcodeNumber(barcodeNum);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('바코드 생성 실패:', error);
        // 백엔드 API 실패 시 기본 바코드 생성
        const actualBarcodeNumber = labelTemplate?.registration_number || 
                                    itemDetail?.code || 
                                    itemData?.itemCode || 
                                    '';
        const numericBarcode = actualBarcodeNumber.toString().replace(/\D/g, '');
        const barcode = numericBarcode && numericBarcode.length >= 8 ? numericBarcode : '8800278470831';
        
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        let x = 10;
        for (let i = 0; i < barcode.length; i++) {
          const digit = parseInt(barcode[i]);
          const width = digit % 2 === 0 ? 8 : 12;
          if (i % 2 === 0) {
            ctx.fillRect(x, 5, width, 45);
          }
          x += width + 2;
        }
        setBarcodeImage(canvas.toDataURL());
        setBarcodeNumber(actualBarcodeNumber || barcode);
      } finally {
        if (isMounted) {
          setIsLoadingBarcode(false);
        }
      }
    };

    fetchBarcode();

    return () => {
      isMounted = false;
    };
  }, [isOpen, itemData?.itemCode, itemData?.itemName, itemData?.name, itemData?.id, itemData?.shippedQuantity, itemData?.unitCount, manufactureDate, calculatedExpiryDate, quantity, labelTemplate?.registration_number, itemDetail?.code, itemDetail?.id]);

  // 라벨 크기를 labelType으로 변환 (useMemo로 최적화)
  const labelType = useMemo(() => {
    if (labelSize === '100X100') return 'large';
    if (labelSize === '80X60') return 'medium';
    if (labelSize === '40X20') return 'small';
    if (labelSize === '26X15' || labelSize === '15X26') return 'verysmall';
    return null;
  }, [labelSize]);

  // 모든 필드가 입력되었는지 확인 (useMemo로 최적화)
  const isFormValid = useMemo(() => {
    return (
      labelSize &&
      labelSize !== '템플릿 양식 선택' &&
      productName &&
      manufactureDate &&
      quantity &&
      quantity !== '' &&
      selectedPrinter
    );
  }, [labelSize, productName, manufactureDate, quantity, selectedPrinter]);

  // 프린트 핸들러 (useCallback으로 최적화)
  const handlePrint = useCallback(async () => {
    if (isProcessing || !isFormValid) return;

    const labelData = {
      labelSize,
      productName,
      manufactureDate,
      expiryDate: calculatedExpiryDate,
      quantity,
      printerName: selectedPrinter,
      itemData,
    };

    setIsProcessing(true);

    try {
      // 1. 먼저 PDF 다운로드
      const previewElement = previewRef.current;
      if (previewElement) {
        const filename = `라벨_${productName}_${manufactureDate}_${labelSize}.pdf`;
        
        const pdfResult = await downloadPdf(previewElement, {
          filename: filename,
          orientation: 'portrait',
          scale: 2,
          margin: 10,
        });

        if (!pdfResult.success) {
          throw new Error(pdfResult.error || 'PDF 다운로드에 실패했습니다.');
        }
      }

      // 2. PDF 다운로드 완료 후 라벨 프린트 작업 진행
      const printResult = await labelAPI.saveTemplate(labelData);

      // 프린트 완료 후 콜백 호출
      if (onPrintComplete) {
        onPrintComplete(labelData);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('라벨 프린트 중 오류 발생:', error);
      alert(`라벨 프린트 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsProcessing(false);
=======
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
>>>>>>> origin/label-print
    }
  }, [isProcessing, isFormValid, labelSize, productName, manufactureDate, calculatedExpiryDate, quantity, selectedPrinter, itemData, downloadPdf, onPrintComplete, onClose]);

<<<<<<< HEAD
  if (!isOpen) return null;
=======
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
>>>>>>> origin/label-print

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
      labelSize, 
      productName, 
      manufactureDate, 
      expiryDate: calculatedExpiryDate,
      quantity, 
      printerName: selectedPrinter, 
      selectedPrinter, // fallback을 위해 중복 추가
      itemData,
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
      const errorMessage = error?.response?.data?.message ?? error?.message ?? '알 수 없는 오류';
      const errorStatus = error?.response?.status ?? 0;
      const errorDetail = error?.response?.data?.detail ?? '';
      const errorString = String(errorDetail || errorMessage || '');
      
      // API 오류(500) 및 category_and_form 관련 오류 체크
      const isTemplateError = errorStatus === 500 || 
                             errorMessage.includes('category_and_form') ||
                             errorMessage.includes('Cannot read properties of null') ||
                             errorString.includes('category_and_form') ||
                             errorString.includes('Cannot read properties of null');
      
      if (isTemplateError && onTemplateCreationRequired) {
        // 라벨 템플릿 생성 모달 표시
        console.log('📋 라벨 템플릿 생성 필요:', {
          itemId: itemDetail?.id ?? itemDetail?.itemId ?? itemData?.itemId ?? itemData?.id,
          itemCode: itemDetail?.code ?? itemData?.itemCode ?? '',
          itemName: itemDetail?.name ?? itemDetail?.itemName ?? itemData?.itemName ?? productName,
        });
        
        onTemplateCreationRequired({
          itemId: itemDetail?.id ?? itemDetail?.itemId ?? itemData?.itemId ?? itemData?.id,
          itemCode: itemDetail?.code ?? itemData?.itemCode ?? '',
          itemName: itemDetail?.name ?? itemDetail?.itemName ?? itemData?.itemName ?? productName,
          productName: productName,
          storageCondition: labelTemplate?.storageCondition ?? itemDetail?.storageCondition ?? itemDetail?.storage_condition ?? '냉동',
          registrationNumber: labelTemplate?.registrationNumber ?? itemDetail?.code ?? itemData?.itemCode ?? '',
          categoryAndForm: labelTemplate?.categoryAndForm ?? itemDetail?.category ?? '',
          ingredients: labelTemplate?.ingredients ?? itemDetail?.ingredients ?? '',
          rawMaterials: labelTemplate?.rawMaterials ?? itemDetail?.rawMaterials ?? itemDetail?.raw_materials ?? '',
          actualWeight: labelTemplate?.actualWeight ?? itemDetail?.actualWeight ?? itemDetail?.actual_weight ?? '',
        });
      } else {
        // 일반 오류는 alert 표시
        alert(`라벨 프린트 중 오류가 발생했습니다: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isFormValid, labelSize, productName, manufactureDate, calculatedExpiryDate, quantity, selectedPrinter, itemData, downloadPdf, onPrintComplete, onClose, itemDetail, labelTemplate, onTemplateCreationRequired]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-4xl rounded-xl bg-white shadow-xl'>
<<<<<<< HEAD
        {/* 모달 헤더 */}
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-[#674529]'>라벨 프린트</h2>
          <button 
            onClick={onClose}
            className='rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
          >
=======
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-[#674529]'>라벨 프린트</h2>
          <button onClick={onClose} className='rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
>>>>>>> origin/label-print
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-4'>
          <div className='grid grid-cols-2 gap-6'>
            {/* Left */}
            <div className='space-y-4'>
              <div>
<<<<<<< HEAD
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  템플릿
                </label>
                <select
                  value={labelSize}
                  onChange={(e) => setLabelSize(e.target.value)}
                  className='w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors'
                >
                  <option value='템플릿 양식 선택' disabled hidden>템플릿 양식 선택</option>
                  <option value='100X100'>100X100</option>
                  <option value='80X60'>80X60</option>
                  <option value='40X20'>40X20</option>
                  <option value='26X15'>26X15</option>
                </select>
              </div>

              {/* 제품명 (고정) */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  제품명
                </label>
                <input
                  type='text'
                  value={productName}
                  readOnly
                  className='w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-gray-50 text-gray-600 cursor-not-allowed'
                />
=======
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
>>>>>>> origin/label-print
              </div>

              <div>
<<<<<<< HEAD
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  제조일자
                </label>
                <input
                  type='date'
                  value={manufactureDate}
                  onChange={(e) => setManufactureDate(e.target.value)}
                  className='w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors'
                />
              </div>

              {/* 유통기한 (자동 계산, 읽기 전용) */}
              {calculatedExpiryDate && (
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    유통기한 (자동 계산)
                  </label>
                  <input
                    type='text'
                    value={calculatedExpiryDate}
                    readOnly
                    className='w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-blue-50 text-blue-700 cursor-not-allowed'
                  />
                  {(labelTemplate?.item?.expiration_date || itemDetail?.expiration_date || itemDetail?.expiry_date) && (
                    <p className='mt-1 text-xs text-gray-500'>
                      유통기한: {labelTemplate?.item?.expiration_date || itemDetail?.expiration_date || itemDetail?.expiry_date}일
                    </p>
                  )}
                </div>
              )}

              {/* 제품수량 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  라벨 프린트 갯수
                </label>
                <input
                  type='number'
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className='w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors'
                  placeholder='100'
                />
=======
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
>>>>>>> origin/label-print
              </div>

              {/* 프린트 기기 선택 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  프린트 기기 선택
                </label>
                <select
                  value={selectedPrinter}
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                  disabled={isLoadingPrinters || printers.length === 0}
                  className='w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
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
            </div>

<<<<<<< HEAD
            {/* 오른쪽: 미리보기 영역 */}
            <div className='flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl'>
              {labelType ? (
                <div ref={previewRef} className='bg-white shadow-md'>
                  {labelType === 'large' && (
                    <LargeLabelContent
                      productName={labelTemplate?.item_name || productName}
                      storageCondition={labelTemplate?.storage_condition || itemDetail?.storageCondition || itemDetail?.storage_condition || '냉동'}
                      registrationNumber={labelTemplate?.registration_number || itemDetail?.code || itemData?.itemCode || ''}
                      categoryAndForm={labelTemplate?.category_and_form || itemDetail?.category || ''}
                      ingredients={labelTemplate?.ingredients || itemDetail?.ingredients || ''}
                      rawMaterials={labelTemplate?.raw_materials || itemDetail?.rawMaterials || itemDetail?.raw_materials || ''}
                      actualWeight={labelTemplate?.actual_weight || itemDetail?.actualWeight || itemDetail?.actual_weight || ''}
=======
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
>>>>>>> origin/label-print
                      manufactureDate={manufactureDate}
                      expiryDate={calculatedExpiryDate}
                      barcodeImage={barcodeImage}
                      barcodeNumber={barcodeNumber}
                      isLoadingBarcode={isLoadingBarcode}
                    />
                  )}
                  {labelType === 'medium' && (
                    <MediumLabelContent
<<<<<<< HEAD
                      productName={labelTemplate?.item_name || productName}
                      storageCondition={labelTemplate?.storage_condition || itemDetail?.storageCondition || itemDetail?.storage_condition || '냉동'}
                      registrationNumber={labelTemplate?.registration_number || itemDetail?.code || itemData?.itemCode || ''}
                      categoryAndForm={labelTemplate?.category_and_form || itemDetail?.category || ''}
                      ingredients={labelTemplate?.ingredients || itemDetail?.ingredients || ''}
=======
                      productName={labelTemplate?.itemName ?? productName}
                      storageCondition={labelTemplate?.storageCondition ?? itemDetail?.storageCondition ?? itemDetail?.storage_condition ?? '냉동'}
                      registrationNumber={labelTemplate?.registrationNumber ?? itemDetail?.code ?? itemData?.itemCode ?? ''}
                      categoryAndForm={labelTemplate?.categoryAndForm ?? itemDetail?.category ?? ''}
                      ingredients={labelTemplate?.ingredients ?? itemDetail?.ingredients ?? ''}
>>>>>>> origin/label-print
                      manufactureDate={manufactureDate}
                      expiryDate={calculatedExpiryDate}
                      barcodeImage={barcodeImage}
                      barcodeNumber={barcodeNumber}
                      isLoadingBarcode={isLoadingBarcode}
                    />
                  )}
                  {labelType === 'small' && (
                    <SmallLabelContent
<<<<<<< HEAD
                      productName={productName}
                      manufactureDate={manufactureDate}
                      expiryDate={calculatedExpiryDate}
                      barcodeImage={barcodeImage}
=======
                      manufactureDate={manufactureDate}
                      expiryDate={calculatedExpiryDate}
                      barcodeImage={barcodeImage}
                      isLoadingBarcode={isLoadingBarcode}
>>>>>>> origin/label-print
                    />
                  )}
                  {labelType === 'verysmall' && (
                    <VerySmallLabelContent
                      productName={productName}
                      manufactureDate={manufactureDate}
                      expiryDate={calculatedExpiryDate}
                      barcodeImage={barcodeImage}
<<<<<<< HEAD
=======
                      isLoadingBarcode={isLoadingBarcode}
>>>>>>> origin/label-print
                    />
                  )}
                </div>
              ) : (
<<<<<<< HEAD
                <div className='text-center text-gray-500 text-sm py-12'>
                  템플릿 양식을 선택하면 미리보기가 표시됩니다.
                </div>
=======
                <div className='text-center text-gray-500 text-sm py-12'>템플릿 양식을 선택하면 미리보기가 표시됩니다.</div>
>>>>>>> origin/label-print
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-center border-t border-gray-200 px-6 py-4'>
<<<<<<< HEAD
          <button
            onClick={handlePrint}
            disabled={!isFormValid || isProcessing || isPdfLoading}
            className={`w-32 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors ${
              isFormValid && !isProcessing && !isPdfLoading
                ? 'bg-[#674529] hover:bg-[#5a3d22] cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
=======
          <button onClick={handlePrint} disabled={!isFormValid || isProcessing || isPdfLoading} className={`w-32 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors ${isFormValid && !isProcessing && !isPdfLoading ? 'bg-[#674529] hover:bg-[#5a3d22] cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}>
>>>>>>> origin/label-print
            {isProcessing || isPdfLoading ? '처리 중...' : '프린트'}
          </button>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
// 라벨 컴포넌트들 (React.memo로 최적화)
const LargeLabelContent = React.memo(({ 
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
  isLoadingBarcode
}) => {
  const getStorageIcon = () => {
    if (storageCondition === '냉동') {
      return <Snowflake className="w-7 h-7 mb-1" />;
    }
    return null;
  };

  return (
    <div className="w-[100mm] h-[100mm] p-4 flex flex-col justify-between text-xs border-2 border-gray-200">
      <div className="flex justify-between items-start">
        <div className="text-2xl font-bold text-gray-900">{productName || '제품명'}</div>
        <div className="border-2 border-gray-800 rounded-xl p-2 w-16 h-16 flex flex-col items-center justify-center">
          {getStorageIcon()}
          <div className="text-[7px] font-semibold">{storageCondition || '냉동'}식품</div>
        </div>
      </div>

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

      <div className="flex justify-between items-end">
        <div className="text-center">
          {isLoadingBarcode ? (
            <div className="w-32 h-16 flex items-center justify-center text-[8px] text-gray-400">
              바코드 로딩 중...
            </div>
          ) : barcodeImage ? (
            <div className="w-full flex justify-center overflow-hidden">
              <img src={barcodeImage} alt="Barcode" className="h-auto mb-1" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          ) : (
            <div className="w-32 h-16 flex items-center justify-center text-[8px] text-gray-400">
              바코드 없음
            </div>
          )}
        </div>
        <div className="text-[9px] text-right space-y-0.5">
          {manufactureDate && <p><span className="font-semibold">제조일자:</span> {manufactureDate}</p>}
          <p><span className="font-semibold">유통기한:</span> {expiryDate || '-'}</p>
        </div>
        <div className="text-center">
          <Microwave className="w-10 h-10 mx-auto mb-1" />
          <div className="text-[7px] font-semibold">30초~2분</div>
=======
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
>>>>>>> origin/label-print
        </div>
      </div>
    </div>
  );
});

const MediumLabelContent = React.memo(({ 
<<<<<<< HEAD
  productName, 
  storageCondition, 
  registrationNumber, 
  categoryAndForm, 
  ingredients, 
  manufactureDate, 
  expiryDate,
  barcodeImage,
  barcodeNumber,
  isLoadingBarcode
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
    <div className="flex justify-end items-end mt-auto">
      <div className="text-[9px] space-y-0.5">
        {manufactureDate && <p><span className="font-semibold">제조일자:</span> {manufactureDate}</p>}
        <p><span className="font-semibold">유통기한:</span> {expiryDate || '-'}</p>
=======
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
>>>>>>> origin/label-print
      </div>
    </div>
  </div>
));

<<<<<<< HEAD
const SmallLabelContent = React.memo(({ productName, manufactureDate, expiryDate, barcodeImage, isLoadingBarcode }) => (
  <div className="w-[40mm] h-[20mm] p-1 flex flex-col border-2 border-gray-200 items-center justify-center text-center overflow-hidden">
    <div className="text-[7px] mb-1">
      <p className="font-semibold mb-0.5">제 조 날 짜</p>
      <p className="tracking-widest">{manufactureDate ? manufactureDate.split('').join(' ') : '-'}</p>
    </div>
    <div className="text-[7px] mb-2">
      <p className="font-semibold mb-0.5">유 통 기 한</p>
      <p className="tracking-widest">{expiryDate ? expiryDate.split('').join(' ') : '-'}</p>
    </div>
=======
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
>>>>>>> origin/label-print
  </div>
));

const VerySmallLabelContent = React.memo(({ productName, manufactureDate, expiryDate, barcodeImage, isLoadingBarcode }) => (
<<<<<<< HEAD
  <div className="w-[26mm] h-[15mm] p-1 flex items-center justify-center gap-2 border-2 border-gray-200 overflow-hidden">
    <div className="text-[6px] font-bold transform -rotate-90 whitespace-nowrap flex-shrink-0">
      {productName || '제품명'}
    </div>
    {isLoadingBarcode ? (
      <div className="text-[5px] text-gray-400">로딩 중...</div>
    ) : barcodeImage ? (
      <div className="flex-shrink min-w-0 flex justify-center overflow-hidden">
        <img src={barcodeImage} alt="Barcode" className="h-auto max-w-full" style={{ maxWidth: '20mm', height: 'auto' }} />
=======
  <div style={{ width: '28mm', height: '16mm', padding: '1mm', boxSizing: 'border-box' }} className='flex items-center justify-center gap-2 border border-gray-300 overflow-hidden'>
    <div className='text-[6px] font-bold transform -rotate-90 whitespace-nowrap flex-shrink-0'>
      {productName || '제품명'}
    </div>
    {isLoadingBarcode ? (
      <div className='text-[5px] text-gray-400'>로딩 중...</div>
    ) : barcodeImage ? (
      <div className='flex-shrink min-w-0 flex justify-center overflow-hidden'>
        <img src={barcodeImage} alt='Barcode' className='h-auto max-w-full' style={{ maxWidth: '18mm', height: 'auto' }} />
>>>>>>> origin/label-print
      </div>
    ) : null}
  </div>
));

<<<<<<< HEAD
export default LabelPrintModal;
=======
export default LabelPrintModal;
>>>>>>> origin/label-print
