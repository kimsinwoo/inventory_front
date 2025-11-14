import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className='h-12 w-12 text-green-500' />;
      case 'error':
        return <AlertCircle className='h-12 w-12 text-red-500' />;
      case 'warning':
        return <AlertCircle className='h-12 w-12 text-yellow-500' />;
      default:
        return <Info className='h-12 w-12 text-blue-500' />;
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-md rounded-xl bg-white shadow-xl'>
        {/* 모달 헤더 */}
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-[#674529]'>
            {title || '알림'}
          </h2>
          <button
            onClick={onClose}
            className='rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className='px-6 py-8'>
          <div className='flex flex-col items-center space-y-4'>
            {getIcon()}
            <p className='text-center text-gray-700'>{message === "Cannot add or update a child row: a foreign key constraint fails (`inventory_development`.`PlannedTransactions`, CONSTRAINT `PlannedTransactions_ibfk_3` FOREIGN KEY (`requested_by_user_id`) REFERENCES `Users` (`id`) ON UPDATE CASCADE)" ? "사용자 정보를 확인해주세요." : message}</p>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className='flex items-center justify-center px-6 py-4'>
          <button
            onClick={onClose}
            className='w-24 rounded-lg bg-[#674529] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#553821]'
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
