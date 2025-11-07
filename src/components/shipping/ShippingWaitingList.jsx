import { Package, Calendar, X } from 'lucide-react';
import { useState } from 'react';
import ShippingList from './ShippingList';

const ShippingWaitingList = ({ waitingData, onAddShipping, onShip }) => {
  const [shippingInputs, setShippingInputs] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (id, field, value) => {
    setShippingInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleShip = (item, uniqueKey) => {
    // uniqueKey가 전달되지 않으면 item.id 또는 고유 키 생성
    const key = uniqueKey || item.id || `${item.itemCode || 'item'}_${waitingData.indexOf(item)}`;
    const inputs = shippingInputs[key] || {};
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
    setShippingInputs((prev) => {
      const newInputs = { ...prev };
      delete newInputs[key];
      return newInputs;
    });
  };

  return (
    <>
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
            <col className='w-[12%]' />
            <col className='w-[28%]' />
            <col className='w-[12%]' />
            <col className='w-[12%]' />
            <col className='w-[12%]' />
            <col className='w-[10%]' />
            <col className='w-[14%]' />
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
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {waitingData.map((item, index) => {
              // 고유 키 생성: id가 있으면 id 사용, 없으면 itemCode와 index 조합
              const uniqueKey = item.id || `${item.itemCode || 'item'}_${index}`;
              
              return (
                <tr key={uniqueKey}>
                  <td className='px-4 py-4 text-sm font-medium text-gray-900'>
                    {item.itemCode}
                  </td>
                  <td className='px-4 py-4 text-sm text-gray-900'>
                    {item.itemName}
                  </td>
                  <td className='px-4 py-4 text-sm text-gray-700'>
                    {item.expectedQuantity}
                  </td>
                  <td className='px-4 py-4'>
                    <input
                      type='number'
                      placeholder='10'
                      value={shippingInputs[uniqueKey]?.shippedQuantity || ''}
                      onChange={(e) =>
                        handleInputChange(uniqueKey, 'shippedQuantity', e.target.value)
                      }
                      className='w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                    />
                  </td>
                  <td className='px-4 py-4'>
                    <input
                      type='number'
                      placeholder='1'
                      value={shippingInputs[uniqueKey]?.unitCount ?? ''}
                      onChange={(e) =>
                        handleInputChange(uniqueKey, 'unitCount', e.target.value)
                      }
                      className='w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                    />
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex items-center space-x-1 text-sm text-gray-700'>
                      <Calendar className='h-4 w-4 text-gray-500' />
                      <span>{item.expectedDate}</span>
                    </div>
                  </td>
                  <td className='flex w-full items-center gap-2 px-4 py-4'>
                    <button
                      onClick={() => handleShip(item, uniqueKey)}
                      className='rounded-xl bg-[#674529] hover:bg-[#553821] px-4 py-2 text-sm font-medium text-white transition-colors'
                    >
                      출고
                    </button>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className='rounded-xl border border-[#674529] bg-white px-4 py-2 text-sm font-medium text-[#674529] transition-colors hover:bg-gray-50'
                    >
                      배송 정보
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

      {/* 배송 정보 모달 */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='relative mx-4 w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl'>
            {/* 모달 헤더 */}
            <div className='flex items-center justify-end px-6 pt-4'>
              <button
                onClick={() => setIsModalOpen(false)}
                className='rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* 모달 콘텐츠 */}
            <div className='overflow-y-auto px-6 pb-6' style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <ShippingList />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShippingWaitingList;
