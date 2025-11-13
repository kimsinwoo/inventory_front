import { X, AlertCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LabelTemplateCreationModal = ({ isOpen, onClose, itemData }) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  if (!isOpen) return null;

  const handleNavigateToLabel = () => {
    setIsNavigating(true);
    
    // 라벨 페이지로 이동하기 전에 데이터 저장
    if (itemData) {
      const labelData = {
        itemId: itemData.itemId || itemData.id,
        itemName: itemData.itemName || itemData.productName,
        productName: itemData.itemName || itemData.productName || itemData.productName,
        storageCondition: itemData.storageCondition || '냉동',
        registrationNumber: itemData.itemCode || itemData.registrationNumber || '',
        categoryAndForm: itemData.categoryAndForm || itemData.category || '',
        ingredients: itemData.ingredients || '',
        rawMaterials: itemData.rawMaterials || '',
        actualWeight: itemData.actualWeight || '',
        labelType: 'large',
      };
      
      // localStorage에 데이터 저장 (Label.jsx에서 읽어서 사용)
      localStorage.setItem('selectedLabelData', JSON.stringify(labelData));
    }
    
    // 라벨 페이지로 이동
    navigate('/label');
    
    // 모달 닫기
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-md rounded-xl bg-white shadow-xl'>
        {/* 모달 헤더 */}
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-orange-500' />
            <h2 className='text-lg font-semibold text-[#674529]'>라벨 템플릿 생성 필요</h2>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className='px-6 py-4'>
          <div className='mb-4 rounded-lg bg-orange-50 p-4'>
            <p className='text-sm text-gray-700 mb-2'>
              라벨 프린트를 위해 필요한 정보가 없습니다.
            </p>
            <p className='text-sm font-medium text-orange-800'>
              라벨 템플릿을 생성해주세요!
            </p>
          </div>

          {itemData && (
            <div className='mb-4 rounded-lg bg-gray-50 p-4'>
              <p className='text-xs font-medium text-gray-600 mb-2'>품목 정보:</p>
              <div className='space-y-1 text-sm text-gray-700'>
                {itemData.itemCode && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>품목코드:</span>
                    <span className='font-medium'>{itemData.itemCode}</span>
                  </div>
                )}
                {itemData.itemName && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>품목명:</span>
                    <span className='font-medium'>{itemData.itemName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className='mb-4 rounded-lg bg-blue-50 p-4'>
            <p className='text-xs text-blue-800'>
              <strong>안내:</strong> 라벨 템플릿 생성 페이지로 이동하여 필요한 정보를 입력하면, 
              이후 라벨 프린트가 정상적으로 작동합니다.
            </p>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className='flex items-center justify-end space-x-3 border-t border-gray-200 px-6 py-4'>
          <button
            onClick={onClose}
            className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
          >
            나중에
          </button>
          <button
            onClick={handleNavigateToLabel}
            disabled={isNavigating}
            className='rounded-lg bg-[#674529] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#553821] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isNavigating ? (
              '이동 중...'
            ) : (
              <>
                라벨 템플릿 생성하기
                <ArrowRight className='h-4 w-4' />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabelTemplateCreationModal;

