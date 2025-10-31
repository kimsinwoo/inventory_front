import { X, Package, Calendar, Hash, Factory } from 'lucide-react';
import { useState } from 'react';
import Barcode from 'react-barcode';
import { barcodeService } from '../../services';

const LabelPrintModal = ({ isOpen, onClose, onPrintComplete, itemData }) => {
  const [labelSize, setLabelSize] = useState('');
  const [category, setCategory] = useState('');
  const [manufactureDate, setManufactureDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [quantity, setQuantity] = useState('');
  const [generatedBarcode, setGeneratedBarcode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  // 모든 필드가 입력되었는지 확인
  const isFormValid = () => {
    return (
      labelSize &&
      labelSize !== '템플릿 양식 선택' &&
      category &&
      category !== '제품명 선택' &&
      manufactureDate &&
      quantity &&
      quantity !== ''
    );
  };

  const handlePrint = async () => {
    if (!isFormValid()) return;

    setIsGenerating(true);
    try {
      // 1단계: 바코드 생성
      const barcodeResponse = await barcodeService.generateLabel({
        itemId: itemData?.item?.id || itemData?.itemId || 1,
        quantity: parseFloat(quantity) || parseFloat(itemData?.receivedQuantity) || parseFloat(itemData?.shippedQuantity) || 0,
        receivedAt: new Date(manufactureDate).toISOString(),
      });

      const barcode = barcodeResponse.data?.barcode || barcodeResponse.barcode;
      setGeneratedBarcode(barcode);

      const labelData = {
        labelSize,
        category,
        manufactureDate,
        quantity,
        itemData,
        barcode, // 생성된 바코드 추가
      };

      console.log('라벨 프린트:', labelData);

      // 프린트 완료 후 콜백 호출
      if (onPrintComplete) {
        onPrintComplete(labelData);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('바코드 생성 실패:', error);
      alert('바코드 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 바코드 번호 표시 (생성된 바코드 또는 임시)
  const displayBarcode = () => {
    return generatedBarcode || '8800278470831';
  };

  // 유통기한 계산 (제조일로부터 12개월 후)
  const calculateExpiryDate = () => {
    if (!manufactureDate) return '';
    const date = new Date(manufactureDate);
    date.setMonth(date.getMonth() + 12);
    return date.toISOString().split('T')[0];
  };

  // Large 라벨 (100X100) 렌더링
  const renderLargeLabel = () => (
    <div className='w-full rounded-lg border-2 border-gray-400 bg-white p-3 shadow-md' style={{ aspectRatio: '1/1', minHeight: '380px', fontSize: '9pt', lineHeight: '1.4' }}>
      <div className='flex h-full flex-col justify-between'>
        {/* 상단: 제품명 + 냉동 배지 */}
        <div className='flex items-start justify-between'>
          <div className='text-lg font-bold'>{category || '제품명 미선택'}</div>
          <div className='flex h-14 w-14 flex-col items-center justify-center rounded-md border-2 border-black text-center text-xs'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='mb-1 h-7 w-7'>
              <path d="M32 8v48M8 32h48M16 16l32 32M48 16L16 48"/>
            </svg>
            냉동식품
          </div>
        </div>

        {/* 본문 정보 */}
        <div className='flex-1 text-left text-xs' style={{ fontSize: '7.5pt', lineHeight: '1.3' }}>
          <p className='mb-0.5'>등록번호: 제IIIRAX0009호 / 제품명: {category || '미선택'}</p>
          <p className='mb-0.5'>종류 및 형태: 단미사료 / 혼합성-혼합제 / 큐브</p>
          <p className='mb-0.5'>성분량: 조단백질 36% 이상, 조지방 25% 이하, 조회분 5% 이하, 조섬유 5% 이하, 수분 10% 이하</p>
          <p className='mb-0.5'>원료의 명칭: 쌀, 계란, 두부, 브로콜리, 당근, 닭가슴살, 단호박, 코코넛오일</p>
          <p className='mb-0.5'>실제중량: 50g</p>
          <p className='mb-0.5'>사료의 용도: 애완동물용</p>
          <p className='mb-0.5'>제조일자: 유통기한으로부터 12개월 전</p>
          <p className='mb-0.5'>주의사항: 반려동물 이외에는 급여하지 마십시오.</p>
        </div>

        {/* 하단: 바코드 + 날짜 + 전자레인지 */}
        <div className='flex items-end justify-between'>
          <div className='text-center'>
            {generatedBarcode ? (
              <Barcode value={generatedBarcode} format='CODE128' width={1.2} height={35} displayValue={true} fontSize={10} margin={0} />
            ) : (
              <div className='rounded bg-gray-100 px-4 py-2 text-xs text-gray-500'>바코드 생성 전</div>
            )}
          </div>
          <div className='text-left text-xs'>
            <p>제조일자: {manufactureDate || '미입력'}</p>
            <p>유통기한: {calculateExpiryDate() || '미입력'}</p>
            <p>제품수량: {quantity ? `${quantity}개` : '미입력'}</p>
          </div>
          <div className='text-center text-xs'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" fill="none" stroke="#000" strokeWidth="2" className='mx-auto mb-1 h-7 w-10'>
              <rect x="2" y="8" width="52" height="32" rx="2"/>
              <circle cx="58" cy="16" r="2"/>
              <circle cx="58" cy="24" r="2"/>
              <circle cx="58" cy="32" r="2"/>
            </svg>
            30초~2분
          </div>
        </div>
      </div>
    </div>
  );

  // Medium 라벨 (80X60) 렌더링
  const renderMediumLabel = () => (
    <div className='w-full rounded-lg border-2 border-gray-400 bg-white p-2 shadow-md' style={{ aspectRatio: '4/3', minHeight: '240px' }}>
      <div className='flex h-full flex-col justify-start text-left'>
        <h2 className='mb-1.5 text-base font-bold'>{category || '제품명 미선택'}</h2>
        <div className='mb-1 text-xs' style={{ fontSize: '8pt', lineHeight: '1.4' }}>
          <p>등록번호: 제IIIRAX0009호 / 제품명: 댕치킨</p>
          <p>종류 및 현태: 단미사료 / 혼합성-혼합제 / 큐브</p>
          <p>성분량: 조단백질 36% 이상</p>
        </div>
        <p className='mb-0.5 text-xs'>제조일자: {manufactureDate || '미입력'}</p>
        <p className='mb-0.5 text-xs'>유통기한: {calculateExpiryDate() || '미입력'}</p>
        <p className='mb-2 text-xs'>제품수량: {quantity ? `${quantity}개` : '미입력'}</p>
        
        {generatedBarcode && (
          <div className='mt-auto text-center'>
            <Barcode value={generatedBarcode} format='CODE128' width={1} height={30} displayValue={true} fontSize={8} margin={0} />
          </div>
        )}
      </div>
    </div>
  );

  // Small 라벨 (40X20) 렌더링
  const renderSmallLabel = () => {
    const formatDateSpaced = (date) => {
      return date ? date.split('').join(' ') : '미 입 력';
    };

    return (
      <div className='w-full rounded-lg border-2 border-gray-400 bg-white p-1.5 shadow-md' style={{ aspectRatio: '2/1', minHeight: '140px' }}>
        <div className='flex h-full flex-col text-xs' style={{ fontSize: '7pt' }}>
          <div className='mb-1'>
            <p className='mb-0'>제 조 날 짜</p>
            <p className='font-mono'>{formatDateSpaced(manufactureDate)}</p>
          </div>
          <div className='mb-2'>
            <p className='mb-0'>유 통 기 한</p>
            <p className='font-mono'>{formatDateSpaced(calculateExpiryDate())}</p>
          </div>
          <div className='mt-auto flex items-center justify-center'>
            <h5 className='mr-2 transform text-xs font-bold' style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              {category || '제품명'}
            </h5>
            {generatedBarcode ? (
              <Barcode value={generatedBarcode} format='CODE128' width={0.8} height={25} displayValue={false} margin={0} />
            ) : (
              <div className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-500'>바코드</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 라벨 크기에 따라 적절한 렌더링 함수 선택
  const renderLabelPreview = () => {
    if (!labelSize || labelSize === '템플릿 양식 선택') {
      return (
        <div className='flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50'>
          <p className='text-sm text-gray-500'>템플릿을 선택하세요</p>
        </div>
      );
    }

    switch (labelSize) {
      case '100X100':
        return renderLargeLabel();
      case '80X60':
        return renderMediumLabel();
      case '40X20':
      case '15X26':
        return renderSmallLabel();
      default:
        return (
          <div className='flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50'>
            <p className='text-sm text-gray-500'>지원하지 않는 템플릿입니다</p>
          </div>
        );
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-2xl rounded-xl bg-white shadow-xl'>
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
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                >
                  <option value='템플릿 양식 선택'>템플릿 양식 선택</option>
                  <option value='100X100'>100X100</option>
                  <option value='80X60'>80X60</option>
                  <option value='40X20'>40X20</option>
                  <option value='15X26'>15X26</option>
                </select>
              </div>

              {/* 제품명 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  제품명
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                >
                  <option value='제품명 선택'>제품명 선택</option>
                  <option value='당근'>당근</option>
                  <option value='닭고기 (가슴살)'>닭고기 (가슴살)</option>
                  <option value='소고기(등심)'>소고기(등심)</option>
                  <option value='고구마'>고구마</option>
                </select>
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
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                />
              </div>

              {/* 제품수량 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  제품수량
                </label>
                <input
                  type='number'
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                  placeholder='100'
                />
              </div>
            </div>

            {/* 오른쪽: 미리보기 영역 */}
            <div className='flex flex-col items-center justify-center'>
              <div className='mb-2 text-center'>
                <p className='text-sm font-semibold text-gray-700'>라벨 미리보기</p>
                <p className='text-xs text-gray-500'>
                  {labelSize || '템플릿 미선택'} {labelSize && `(${labelSize}mm)`}
                </p>
              </div>
              
              {/* 실제 라벨 미리보기 */}
              {renderLabelPreview()}

              {/* 안내 메시지 */}
              <div className='mt-3 text-center'>
                <p className='text-xs text-gray-600'>
                  💡 모든 정보를 입력하면 실제 라벨을 확인할 수 있습니다
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className='flex items-center justify-center border-t border-gray-200 px-6 py-4'>
          <button
            onClick={handlePrint}
            disabled={!isFormValid() || isGenerating}
            className={`w-32 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
              isFormValid() && !isGenerating
                ? 'bg-[#674529] hover:bg-[#553821] cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isGenerating ? '생성 중...' : '프린트'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabelPrintModal;
