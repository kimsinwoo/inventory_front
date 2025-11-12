import { X } from 'lucide-react';

const ShippingConfirmModal = ({ isOpen, onClose, onConfirm, onLabelPrint, itemData }) => {
  if (!isOpen || !itemData) return null;

  const handleLabelPrintClick = () => {
    if (onLabelPrint) {
      onLabelPrint(itemData);
    }
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

          <div className='space-y-2 rounded-lg bg-gray-50 p-4'>
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
            className='rounded-lg border border-[#674529] bg-white px-4 py-2 text-sm font-medium text-[#674529] transition-colors hover:bg-gray-50'
          >
            라벨 프린트
          </button>
          <button
            onClick={onConfirm}
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
