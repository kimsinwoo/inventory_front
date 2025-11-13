import { X } from 'lucide-react';
import { useState, useMemo } from 'react';

const ShippingConfirmModal = ({ isOpen, onClose, onConfirm, onLabelPrint, itemData }) => {
  // 1) 훅은 항상 최상단에서 무조건 호출
  const [transferType, setTransferType] = useState('CUSTOMER'); // 기본값: CUSTOMER

  // itemCategory 추출 (라벨 프린트 규칙 결정에 사용)
  const itemCategory = useMemo(() => {
    if (!itemData) return '';

    return (
      itemData.itemCategory ||
      itemData.item?.category ||
      itemData.item?.categoryLabel ||
      itemData.category ||
      itemData.categoryLabel ||
      ''
    );
  }, [itemData]);

  // 라벨 프린트 규칙 결정
  // - 공장간/창고간 이동: 라벨 프린트 없음 (바코드 그대로 유지)
  // - 완제품(Finished): 라벨 프린트 (현재 방식 사용)
  // - 고객/B2B 배송: 라벨 프린트 (현재 방식 사용)
  const shouldPrintLabel = useMemo(() => {
    if (!itemData) return false;

    if (transferType === 'FACTORY_TRANSFER' || transferType === 'WAREHOUSE_TRANSFER') {
      return false; // 공장간/창고간 이동: 라벨 프린트 없음
    }
    if (
      transferType === 'CUSTOMER' ||
      transferType === 'B2B' ||
      itemCategory === 'Finished' ||
      itemCategory === '완제품'
    ) {
      return true; // 고객/B2B 배송 또는 완제품: 라벨 프린트
    }
    return false; // 기본값: 라벨 프린트 없음
  }, [transferType, itemCategory, itemData]);

  // 2) 훅 선언 끝난 뒤에 조건부 리턴
  if (!isOpen || !itemData) return null;

  const handleLabelPrintClick = () => {
    if (!onLabelPrint) return;

    if (shouldPrintLabel) {
      onLabelPrint({
        ...itemData,
        transferType,
      });
    } else {
      alert('공장간/창고간 이동은 라벨 프린트가 필요 없습니다. 바코드가 그대로 유지됩니다.');
    }
  };

  const handleConfirmClick = () => {
    if (!onConfirm) return;

    if (shouldPrintLabel && window.confirm(
      '출고 전에 라벨을 프린트하시겠습니까?\n\n(라벨 프린트 버튼을 클릭하시면 라벨 프린트 모달이 열립니다)'
    )) {
      if (onLabelPrint) {
        onLabelPrint({
          ...itemData,
          transferType,
        });
      }
      return;
    }

    onConfirm({
      ...itemData,
      transferType,
    });
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-md rounded-xl bg-white shadow-xl'>
        {/* 모달 헤더 */}
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-[#674529]'>출고 확인</h2>
          <button
            onClick={onClose}
            className='rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className='px-6 py-4'>
          <p className='mb-4 text-sm text-gray-700'>
            이대로 출고를 진행하시겠습니까?
          </p>

          <div className='space-y-3 rounded-lg bg-gray-50 p-4'>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>품목코드:</span>
              <span className='font-medium text-gray-900'>{itemData.itemCode}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>품목명:</span>
              <span className='font-medium text-gray-900'>{itemData.itemName}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>주문량:</span>
              <span className='font-medium text-gray-900'>
                {itemData.expectedQuantity}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>출고량:</span>
              <span className='font-medium text-gray-900'>
                {itemData.shippedQuantity}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>묶음 수:</span>
              <span className='font-medium text-gray-900'>{itemData.unitCount}</span>
            </div>

            {/* 이동 유형 선택 */}
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                이동 유형 <span className='text-red-500'>*</span>
              </label>
              <select
                value={transferType}
                onChange={(e) => setTransferType(e.target.value)}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
              >
                <option value='CUSTOMER'>고객 배송 (CUSTOMER)</option>
                <option value='FACTORY_TRANSFER'>공장 간 이동 (FACTORY_TRANSFER)</option>
                <option value='WAREHOUSE_TRANSFER'>창고 간 이동 (WAREHOUSE_TRANSFER)</option>
                <option value='B2B'>B2B 거래 (B2B)</option>
              </select>
              {!shouldPrintLabel && (
                <p className='mt-1 text-xs text-gray-500'>
                  공장간/창고간 이동은 라벨 프린트가 필요 없습니다. 바코드가 그대로 유지됩니다.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className='flex items-center justify-end space-x-3 border-t border-gray-200 px-6 py-4'>
          <button
            onClick={onClose}
            className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
          >
            취소하기
          </button>
          <button
            onClick={handleLabelPrintClick}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              shouldPrintLabel
                ? 'border-[#674529] bg-white text-[#674529] hover:bg-gray-50'
                : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!shouldPrintLabel}
            title={
              shouldPrintLabel
                ? '라벨 프린트'
                : '공장간/창고간 이동은 라벨 프린트가 필요 없습니다'
            }
          >
            라벨 프린트
          </button>
          <button
            onClick={handleConfirmClick}
            className='rounded-lg bg-[#674529] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#553821]'
          >
            출고하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingConfirmModal;
