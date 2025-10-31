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
            <col className='w-[10%]' />
            <col className='w-[18%]' />
            <col className='w-[10%]' />
            <col className='w-[10%]' />
            <col className='w-[10%]' />
            <col className='w-[10%]' />
            <col className='w-[10%]' />
            <col className='w-[22%]' />
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
                출고량
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                바코드번호
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                출고 유형
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                공장
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                출고일시
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                작업
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {completedData.map((data) => (
              <tr key={data.id}>
                <td className='px-4 py-4 text-sm font-medium text-gray-900'>
                  {data.item?.code || data.itemCode || '-'}
                </td>
                <td className='px-4 py-4 text-sm text-gray-900'>
                  {data.item?.name || data.itemName || '-'}
                </td>
                <td className='px-4 py-4 text-sm text-gray-700'>
                  {data.quantity} {data.unit}
                </td>
                <td className='px-4 py-4 text-sm text-gray-700'>
                  {data.barcode || '-'}
                </td>
                <td className='px-4 py-4 text-sm text-gray-700'>
                  <span className={`rounded px-2 py-1 text-xs ${
                    data.typeRaw === 'SHIPPING' || data.issueType === 'SHIPPING'
                      ? 'bg-blue-100 text-blue-700'
                      : data.typeRaw === 'PRODUCTION' || data.issueType === 'PRODUCTION'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {data.type || data.typeRaw || data.issueType || '출고'}
                  </span>
                </td>
                <td className='px-4 py-4 text-sm text-gray-700'>
                  {data.fromFactory?.name || data.factory?.name || '-'}
                </td>
                <td className='px-4 py-4 text-sm text-gray-700'>
                  {data.time || data.shippedDate || '-'}
                </td>
                <td className='px-4 py-4'>
                  <div className='flex items-center justify-end space-x-2'>
                    <button
                      onClick={() => onCancel(data.id)}
                      className='flex items-center space-x-1 rounded-xl bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100'
                    >
                      <X className='h-4 w-4' />
                      <span>출고 취소</span>
                    </button>
                    <button
                      onClick={() => onLabelPrint(data)}
                      className='flex items-center space-x-1 rounded-xl bg-[#674529] hover:bg-[#553821] px-3 py-1.5 text-sm font-medium text-white transition-colors'
                    >
                      <Printer className='h-4 w-4 ' />
                      <span>라벨 프린터</span>
                    </button>
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

export default ShippingCompletedList;
