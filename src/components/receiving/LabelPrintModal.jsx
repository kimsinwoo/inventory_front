import { X, Snowflake, Microwave } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { labelAPI, itemsAPI } from '../../api';
import usePdfDownload from '../common/usePdfDownload';

const LabelPrintModal = ({ isOpen, onClose, onPrintComplete, itemData }) => {
  const [labelSize, setLabelSize] = useState('');
  const [manufactureDate, setManufactureDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [quantity, setQuantity] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [printers, setPrinters] = useState([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [itemDetail, setItemDetail] = useState(null);
  const [labelTemplate, setLabelTemplate] = useState(null);
  const [calculatedExpiryDate, setCalculatedExpiryDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const previewRef = useRef(null);
  const { downloadPdf, isLoading: isPdfLoading } = usePdfDownload();

  // 제품명은 itemData에서 고정으로 사용
  const productName = itemData?.itemName || itemData?.name || '';

  // 아이템 상세 정보 가져오기
  useEffect(() => {
    if (!isOpen || !itemData?.itemCode) return;
    const fetchItemDetail = async () => {
      try {
        const response = await itemsAPI.getItemByCode(itemData.itemCode);
        const item = response.data?.data || response.data || {};
        setItemDetail(item);
      } catch (error) {
        console.error('아이템 정보 가져오기 실패:', error);
      }
    };
    fetchItemDetail();
  }, [isOpen, itemData?.itemCode]);

  // 라벨 템플릿 가져오기 (item.code와 registration_number 매칭)
  useEffect(() => {
    if (!isOpen || !itemData?.itemCode) return;
    const fetchLabelTemplate = async () => {
      try {
        // item.code를 registration_number로 사용하여 labeltemplate 가져오기
        const response = await labelAPI.getLabelTemplate(itemData.itemCode);
        const template = response.data?.data || response.data || null;
        setLabelTemplate(template);
      } catch (error) {
        console.error('라벨 템플릿 가져오기 실패:', error);
        // 에러가 발생해도 계속 진행 (템플릿이 없을 수 있음)
        setLabelTemplate(null);
      }
    };
    fetchLabelTemplate();
  }, [isOpen, itemData?.itemCode]);

  // 프린터 목록 가져오기
  useEffect(() => {
    if (!isOpen) return;
    const fetchPrinters = async () => {
      try {
        setIsLoadingPrinters(true);
        const response = await labelAPI.getPrinters();
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
      } catch (error) {
        console.error('프린터 목록 가져오기 실패:', error);
      } finally {
        setIsLoadingPrinters(false);
      }
    };
    fetchPrinters();
  }, [isOpen]);

  // 제조일자 변경 시 유통기한 자동 계산
  useEffect(() => {
    if (!manufactureDate) {
      setCalculatedExpiryDate('');
      return;
    }

    // labelTemplate에서 유통기한 가져오기 (우선순위)
    // 유통기한 필드명: expiration_date, expiry_date, shelf_life 등 가능
    const expiryDaysStr = labelTemplate?.expiration_date || 
                         labelTemplate?.expiry_date || 
                         labelTemplate?.shelf_life ||
                         labelTemplate?.expiration_days ||
                         labelTemplate?.expiry_days ||
                         itemDetail?.expiration_date || 
                         itemDetail?.expiry_date || 
                         '';

    console.log('유통기한 계산 디버그:', {
      manufactureDate,
      labelTemplateKeys: labelTemplate ? Object.keys(labelTemplate) : null,
      labelTemplateExpiration: labelTemplate?.expiration_date,
      labelTemplateExpiry: labelTemplate?.expiry_date,
      labelTemplateShelfLife: labelTemplate?.shelf_life,
      itemDetailExpiration: itemDetail?.expiration_date,
      itemDetailExpiry: itemDetail?.expiry_date,
      expiryDaysStr
    });

    if (!expiryDaysStr || expiryDaysStr === '') {
      console.log('유통기한 정보 없음 - labelTemplate:', labelTemplate, 'itemDetail:', itemDetail);
      setCalculatedExpiryDate('');
      return;
    }

    // 숫자 형식으로 변환 (예: "30", "365" 등)
    // 문자열에서 숫자만 추출 (예: "30일" -> 30)
    const expiryDaysMatch = expiryDaysStr.toString().trim().match(/\d+/);
    const expiryDays = expiryDaysMatch ? parseInt(expiryDaysMatch[0]) : parseInt(expiryDaysStr.toString().trim());
    
    console.log('유통기한 일수:', expiryDays, '원본:', expiryDaysStr);
    
    if (isNaN(expiryDays) || expiryDays <= 0) {
      console.log('유통기한 일수 유효하지 않음:', expiryDays);
      setCalculatedExpiryDate('');
      return;
    }

    try {
      const manufacture = new Date(manufactureDate);
      if (isNaN(manufacture.getTime())) {
        console.log('제조일자 유효하지 않음:', manufactureDate);
        setCalculatedExpiryDate('');
        return;
      }

      // 제조일자에 유통기한 일수를 더함
      const expiry = new Date(manufacture);
      expiry.setDate(expiry.getDate() + expiryDays);
      const calculatedDate = expiry.toISOString().split('T')[0];
      console.log('계산된 유통기한:', calculatedDate, '제조일자:', manufactureDate, '유통기한 일수:', expiryDays);
      setCalculatedExpiryDate(calculatedDate);
    } catch (error) {
      console.error('유통기한 계산 실패:', error);
      setCalculatedExpiryDate('');
    }
  }, [
    manufactureDate, 
    labelTemplate?.expiration_date, 
    labelTemplate?.expiry_date, 
    labelTemplate?.shelf_life,
    labelTemplate?.expiration_days,
    labelTemplate?.expiry_days,
    itemDetail?.expiration_date, 
    itemDetail?.expiry_date
  ]);

  if (!isOpen) return null;

  // 바코드 이미지 생성
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

  // 라벨 크기를 labelType으로 변환
  const getLabelType = () => {
    if (labelSize === '100X100') return 'large';
    if (labelSize === '80X60') return 'medium';
    if (labelSize === '40X20') return 'small';
    if (labelSize === '26X15' || labelSize === '15X26') return 'verysmall';
    return null;
  };

  // 모든 필드가 입력되었는지 확인
  const isFormValid = () => {
    return (
      labelSize &&
      labelSize !== '템플릿 양식 선택' &&
      productName &&
      manufactureDate &&
      quantity &&
      quantity !== '' &&
      selectedPrinter
    );
  };

  const handlePrint = async () => {
    if (isProcessing) return;

    const labelData = {
      labelSize,
      productName,
      manufactureDate,
      expiryDate: calculatedExpiryDate,
      quantity,
      printerName: selectedPrinter,
      itemData,
    };
    console.log('라벨 프린트:', labelData);

    setIsProcessing(true);

    try {
      // 1. 먼저 PDF 다운로드
      const previewElement = previewRef.current;
      if (previewElement) {
        const labelType = getLabelType();
        const filename = `라벨_${productName}_${manufactureDate}_${labelSize}.pdf`;
        
        console.log('PDF 다운로드 시작...');
        const pdfResult = await downloadPdf(previewElement, {
          filename: filename,
          orientation: 'portrait',
          scale: 2,
          margin: 10,
        });

        if (!pdfResult.success) {
          throw new Error(pdfResult.error || 'PDF 다운로드에 실패했습니다.');
        }
        console.log('PDF 다운로드 완료');
      }

      // 2. PDF 다운로드 완료 후 라벨 프린트 작업 진행
      console.log('라벨 프린트 작업 시작...');
      const printResult = await labelAPI.saveTemplate(labelData);
      console.log('라벨 프린트 작업 완료:', printResult);

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
    }
  };

  const labelType = getLabelType();
  const barcodeImage = generateBarcode();

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-4xl rounded-xl bg-white shadow-xl'>
        {/* 모달 헤더 */}
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-[#674529]'>라벨 프린트</h2>
          <button 
            onClick={onClose}
            className='rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className='px-6 py-4'>
          <div className='grid grid-cols-2 gap-6'>
            {/* 왼쪽: 설정 영역 */}
            <div className='space-y-4'>
              {/* 템플릿 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  템플릿
                </label>
                <select
                  value={labelSize}
                  onChange={(e) => setLabelSize(e.target.value)}
                  className='w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#674529] focus:outline-none transition-colors'
                >
                  <option value='템플릿 양식 선택'>템플릿 양식 선택</option>
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
              </div>

              {/* 제조일자 */}
              <div>
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
                  {(labelTemplate?.expiration_date || labelTemplate?.expiry_date || labelTemplate?.shelf_life || itemDetail?.expiration_date || itemDetail?.expiry_date) && (
                    <p className='mt-1 text-xs text-gray-500'>
                      유통기한: {labelTemplate?.expiration_date || labelTemplate?.expiry_date || labelTemplate?.shelf_life || itemDetail?.expiration_date || itemDetail?.expiry_date}일
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
                      manufactureDate={manufactureDate}
                      expiryDate={calculatedExpiryDate}
                      barcodeImage={barcodeImage}
                    />
                  )}
                  {labelType === 'medium' && (
                    <MediumLabelContent
                      productName={labelTemplate?.item_name || productName}
                      storageCondition={labelTemplate?.storage_condition || itemDetail?.storageCondition || itemDetail?.storage_condition || '냉동'}
                      registrationNumber={labelTemplate?.registration_number || itemDetail?.code || itemData?.itemCode || ''}
                      categoryAndForm={labelTemplate?.category_and_form || itemDetail?.category || ''}
                      ingredients={labelTemplate?.ingredients || itemDetail?.ingredients || ''}
                      manufactureDate={manufactureDate}
                      expiryDate={calculatedExpiryDate}
                    />
                  )}
                  {labelType === 'small' && (
                    <SmallLabelContent
                      productName={productName}
                      manufactureDate={manufactureDate}
                      expiryDate={calculatedExpiryDate}
                      barcodeImage={barcodeImage}
                    />
                  )}
                  {labelType === 'verysmall' && (
                    <VerySmallLabelContent
                      productName={productName}
                      manufactureDate={manufactureDate}
                      expiryDate={calculatedExpiryDate}
                      barcodeImage={barcodeImage}
                    />
                  )}
                </div>
              ) : (
                <div className='text-center text-gray-500 text-sm py-12'>
                  템플릿 양식을 선택하면 미리보기가 표시됩니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className='flex items-center justify-center border-t border-gray-200 px-6 py-4'>
          <button
            onClick={handlePrint}
            disabled={!isFormValid() || isProcessing || isPdfLoading}
            className={`w-32 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors ${
              isFormValid() && !isProcessing && !isPdfLoading
                ? 'bg-[#674529] hover:bg-[#5a3d22] cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isProcessing || isPdfLoading ? '처리 중...' : '프린트'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 라벨 컴포넌트들
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
          <img src={barcodeImage} alt="Barcode" className="w-32 h-auto mb-1" />
          <div className="text-[8px] font-mono">8 800278 470831</div>
        </div>
        <div className="text-[9px] text-right space-y-0.5">
          {manufactureDate && <p><span className="font-semibold">제조일자:</span> {manufactureDate}</p>}
          <p><span className="font-semibold">유통기한:</span> {expiryDate || '-'}</p>
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
      <p className="tracking-widest">{manufactureDate ? manufactureDate.split('').join(' ') : '-'}</p>
    </div>
    <div className="text-[7px] mb-2">
      <p className="font-semibold mb-0.5">유 통 기 한</p>
      <p className="tracking-widest">{expiryDate ? expiryDate.split('').join(' ') : '-'}</p>
    </div>
  </div>
);

const VerySmallLabelContent = ({ productName, manufactureDate, expiryDate, barcodeImage }) => (
  <div className="w-[26mm] h-[15mm] p-1 flex items-center justify-center gap-2 border-2 border-gray-200">
    <div className="text-[6px] font-bold transform -rotate-90 whitespace-nowrap">
      {productName || '제품명'}
    </div>
    {barcodeImage && <img src={barcodeImage} alt="Barcode" className="w-16 h-auto" />}
  </div>
);

export default LabelPrintModal;
