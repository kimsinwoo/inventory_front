import { Package, Calendar, Printer, X } from 'lucide-react';
import { useState } from 'react';

const ShippingWaitingList = ({ waitingData, onAddShipping, onShip, onLabelPrint, onDelete }) => {
  const [shippingInputs, setShippingInputs] = useState({});

  const handleInputChange = (id, field, value) => {
    setShippingInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleShip = (item) => {
    const inputs = shippingInputs[item.id] || {};
    const shippedQuantity = inputs.shippedQuantity || '';
    const unitCount = inputs.unitCount || '1'; // 기본값 1

    if (!shippedQuantity) {
      alert('출고량을 입력해주세요.');
      return;
    }

    onShip({
      ...item,
      shippedQuantity,
      unitCount,
    });

    // 입력값 초기화
    setShippingInputs((prev) => ({
      ...prev,
      [item.id]: { shippedQuantity: '', unitCount: '' },
    }));
  };

  return (
    <div className='rounded-xl border border-gray-200 bg-white shadow-sm'>
      {/* 헤더 */}
      <div className='border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Package className='h-5 w-5 text-[#674529]' />
            <h3 className='text-base text-[#674529]'>
              출고 대기 목록 ({waitingData.length}건)
            </h3>
          </div>
          <button
            onClick={onAddShipping}
            className='rounded-xl border border-[#674529] bg-white px-4 py-2 text-sm font-medium text-[#674529] transition-colors hover:bg-gray-50'
          >
            출고 목록 추가
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className='overflow-x-auto'>
        <table className='w-full table-fixed'>
          <colgroup>
            <col className='w-[10%]' />
            <col className='w-[22%]' />
            <col className='w-[10%]' />
            <col className='w-[10%]' />
            <col className='w-[10%]' />
            <col className='w-[12%]' />
            <col className='w-[26%]' />
          </colgroup>
          <thead>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                품목코드
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                품목명
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                주문량
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                출고량
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                묶음 수
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                출고예정일
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                작업
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {waitingData.map((item) => (
              <tr key={item.id}>
                <td className='px-4 py-4 text-sm font-medium text-gray-900'>
                  {item.item?.code || item.itemCode || '-'}
                </td>
                <td className='px-4 py-4 text-sm text-gray-900'>
                  {item.item?.name || item.itemName || '-'}
                </td>
                <td className='px-4 py-4 text-sm text-gray-700'>
                  {item.expectedQuantity || `${item.quantity} ${item.unit}`}
                </td>
                <td className='px-4 py-4'>
                  <input
                    type='number'
                    placeholder='10'
                    value={shippingInputs[item.id]?.shippedQuantity || ''}
                    onChange={(e) =>
                      handleInputChange(item.id, 'shippedQuantity', e.target.value)
                    }
                    className='w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                  />
                </td>
                <td className='px-4 py-4'>
                  <input
                    type='number'
                    placeholder='1'
                    value={shippingInputs[item.id]?.unitCount ?? ''}
                    onChange={(e) =>
                      handleInputChange(item.id, 'unitCount', e.target.value)
                    }
                    className='w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                  />
                </td>
                <td className='px-4 py-4'>
                  <div className='flex items-center space-x-1 text-sm text-gray-700'>
                    <Calendar className='h-4 w-4 text-gray-500' />
                    <span>{item.scheduledDate || item.expectedDate || '-'}</span>
                  </div>
                </td>
                <td className='px-4 py-4'>
                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() => handleShip(item)}
                      className='rounded-xl bg-[#674529] hover:bg-[#553821] px-3 py-1.5 text-sm font-medium text-white transition-colors'
                    >
                      출고
                    </button>
                    <button
                      onClick={() => {
                        const inputs = shippingInputs[item.id] || {};
                        const shippedQuantity = inputs.shippedQuantity || '';
                        const unitCount = inputs.unitCount || '1';
                        
                        if (!shippedQuantity) {
                          alert('출고량을 입력해주세요.');
                          return;
                        }
                        
                        onLabelPrint({
                          ...item,
                          shippedQuantity,
                          unitCount,
                        });
                      }}
                      className='flex items-center space-x-1 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-colors'
                    >
                      <Printer className='h-4 w-4' />
                      <span>라벨</span>
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item.id)}
                        className='flex items-center space-x-1 rounded-xl bg-red-50 hover:bg-red-100 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors'
                        title='삭제'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShippingWaitingList;
