import { CheckCircle2, Printer, X } from 'lucide-react';

const ShippingCompletedList = ({ completedData, onCancel, onLabelPrint }) => {

  return (
    <div className='rounded-xl border border-gray-200 bg-white shadow-sm'>
      {/* 헤더 */}
      <div className='border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center space-x-2'>
          <CheckCircle2 className='h-5 w-5 text-[#674529]' />
          <h3 className='text-base text-[#674529]'>
            출고 완료 목록 ({completedData.length}건)
          </h3>
        </div>
      </div>

      {/* 테이블 */}
      <div className='overflow-x-auto'>
        <table className='w-full table-fixed'>
          <colgroup>
            <col className='w-[12%]' />
            <col className='w-[20%]' />
            <col className='w-[12%]' />
            <col className='w-[12%]' />
            <col className='w-[12%]' />
            <col className='w-[32%]' />
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
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {completedData.map((item, index) => {
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
                <td className='px-4 py-4 text-sm text-gray-700'>
                  {item.shippedQuantity}
                </td>
                <td className='px-4 py-4 text-sm text-gray-700'>
                  {item.unitCount}
                </td>
                <td className='px-4 py-4'>
                  <div className='flex items-center justify-end space-x-2'>
                    <button
                      onClick={() => onCancel(item.id)}
                      className='flex items-center space-x-1 rounded-xl bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100'
                    >
                      <X className='h-4 w-4' />
                      <span>출고 취소</span>
                    </button>
                    <button
                      onClick={() => onLabelPrint(item)}
                      className='flex items-center space-x-1 rounded-xl bg-[#674529] hover:bg-[#553821] px-3 py-1.5 text-sm font-medium text-white transition-colors'
                    >
                      <Printer className='h-4 w-4 ' />
                      <span>라벨 프린터</span>
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShippingCompletedList;
