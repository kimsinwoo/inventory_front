import { useState } from 'react';
import { PackageOpen, Scan, AlertCircle, CheckCircle } from 'lucide-react';
import { barcodeService } from '../../services';

const BarcodeIssueTab = () => {
  const [barcode, setBarcode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [issueType, setIssueType] = useState('SHIPPING');
  const [customerName, setCustomerName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [note, setNote] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState(null);

  const issueTypes = [
    { value: 'SHIPPING', label: '배송용' },
    { value: 'PRODUCTION', label: '생산용' },
    { value: 'DISPOSAL', label: '폐기' },
    { value: 'SAMPLE', label: '샘플' },
    { value: 'OTHER', label: '기타' },
  ];

  const handleIssue = async () => {
    if (!barcode || !quantity) {
      setError('바코드와 수량을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setResult(null);

    try {
      const response = await barcodeService.issue({
        barcode: barcode.trim(),
        quantity: parseFloat(quantity),
        issueType,
        customerName: customerName || undefined,
        trackingNumber: trackingNumber || undefined,
        note: note || undefined,
      });

      setResult(response.data);
      setSuccess('출고가 완료되었습니다!');

      // 폼 초기화
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (err) {
      console.error('출고 실패:', err);
      setError(err.response?.data?.message || '출고에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setBarcode('');
    setQuantity('');
    setIssueType('SHIPPING');
    setCustomerName('');
    setTrackingNumber('');
    setNote('');
    setError('');
    setSuccess('');
    setResult(null);
  };

  return (
    <div className='space-y-6'>
      <div className='rounded-xl border border-gray-200 bg-white p-6'>
        <h3 className='mb-6 flex items-center space-x-2 text-lg font-semibold text-gray-800'>
          <PackageOpen className='h-5 w-5 text-[#674529]' />
          <span>바코드 기반 출고</span>
        </h3>

        {/* 메시지 */}
        {error && (
          <div className='mb-4 flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-red-800'>
            <AlertCircle className='h-5 w-5' />
            <span className='text-sm'>{error}</span>
          </div>
        )}

        {success && (
          <div className='mb-4 flex items-center space-x-2 rounded-lg bg-green-50 p-4 text-green-800'>
            <CheckCircle className='h-5 w-5' />
            <span className='text-sm'>{success}</span>
          </div>
        )}

        {/* 출고 결과 */}
        {result && (
          <div className='mb-6 rounded-xl border border-green-200 bg-green-50 p-6'>
            <h4 className='mb-4 font-semibold text-green-900'>출고 완료</h4>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <p className='text-green-600'>품목명</p>
                <p className='font-medium text-green-900'>{result.itemName || '-'}</p>
              </div>
              <div>
                <p className='text-green-600'>출고 수량</p>
                <p className='font-medium text-green-900'>
                  {result.quantity} {result.unit}
                </p>
              </div>
              <div>
                <p className='text-green-600'>남은 수량</p>
                <p className='font-medium text-green-900'>
                  {result.remainingQuantity} {result.unit}
                </p>
              </div>
              <div>
                <p className='text-green-600'>출고 유형</p>
                <p className='font-medium text-green-900'>
                  {issueTypes.find((t) => t.value === result.issueType)?.label || result.issueType}
                </p>
              </div>
              {result.customerName && (
                <div>
                  <p className='text-green-600'>고객명</p>
                  <p className='font-medium text-green-900'>{result.customerName}</p>
                </div>
              )}
              {result.trackingNumber && (
                <div>
                  <p className='text-green-600'>송장 번호</p>
                  <p className='font-medium text-green-900'>{result.trackingNumber}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 출고 폼 */}
        <div className='space-y-4'>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              바코드 번호 <span className='text-red-500'>*</span>
            </label>
            <div className='flex space-x-2'>
              <input
                type='text'
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder='바코드를 스캔하거나 입력하세요'
                className='flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
              />
              <button className='flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200'>
                <Scan className='h-4 w-4' />
                <span>스캔</span>
              </button>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                출고 수량 <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder='30'
                className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
              />
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>출고 유형</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
              >
                {issueTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {issueType === 'SHIPPING' && (
            <>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>고객명</label>
                <input
                  type='text'
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder='홍길동'
                  className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                />
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>송장 번호</label>
                <input
                  type='text'
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder='123456789'
                  className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                />
              </div>
            </>
          )}

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>메모</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='메모를 입력하세요'
              rows={3}
              className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
            />
          </div>

          <button
            onClick={handleIssue}
            disabled={isLoading}
            className='w-full rounded-lg bg-[#674529] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#553821] disabled:cursor-not-allowed disabled:bg-gray-300'
          >
            {isLoading ? '처리 중...' : '출고'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeIssueTab;

