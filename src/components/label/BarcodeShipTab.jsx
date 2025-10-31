import { useState } from 'react';
import { Send, Scan, AlertCircle, CheckCircle } from 'lucide-react';
import { barcodeService } from '../../services';

const BarcodeShipTab = () => {
  const [barcode, setBarcode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingCompany, setShippingCompany] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingMessage, setShippingMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState(null);

  const shippingCompanies = [
    'CJ대한통운',
    '롯데택배',
    '우체국택배',
    '한진택배',
    '로젠택배',
    '기타',
  ];

  const handleShip = async () => {
    if (!barcode || !quantity || !customerName) {
      setError('바코드, 수량, 고객명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setResult(null);

    try {
      const response = await barcodeService.ship({
        barcode: barcode.trim(),
        quantity: parseFloat(quantity),
        customerName,
        customerAddress: customerAddress || undefined,
        customerPhone: customerPhone || undefined,
        shippingCompany: shippingCompany || undefined,
        trackingNumber: trackingNumber || undefined,
        shippingMessage: shippingMessage || undefined,
      });

      setResult(response.data);
      setSuccess('배송 처리가 완료되었습니다!');

      // 폼 초기화
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (err) {
      console.error('배송 처리 실패:', err);
      setError(err.response?.data?.message || '배송 처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setBarcode('');
    setQuantity('');
    setCustomerName('');
    setCustomerAddress('');
    setCustomerPhone('');
    setShippingCompany('');
    setTrackingNumber('');
    setShippingMessage('');
    setError('');
    setSuccess('');
    setResult(null);
  };

  return (
    <div className='space-y-6'>
      <div className='rounded-xl border border-gray-200 bg-white p-6'>
        <h3 className='mb-6 flex items-center space-x-2 text-lg font-semibold text-gray-800'>
          <Send className='h-5 w-5 text-[#674529]' />
          <span>바코드 배송 처리</span>
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

        {/* 배송 결과 */}
        {result && (
          <div className='mb-6 rounded-xl border border-green-200 bg-green-50 p-6'>
            <h4 className='mb-4 font-semibold text-green-900'>배송 처리 완료</h4>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-green-600'>품목명</p>
                  <p className='font-medium text-green-900'>{result.itemName || '-'}</p>
                </div>
                <div>
                  <p className='text-green-600'>배송 수량</p>
                  <p className='font-medium text-green-900'>
                    {result.quantity} {result.unit}
                  </p>
                </div>
              </div>

              {result.customer && (
                <div className='rounded-lg border border-green-300 bg-white p-4'>
                  <p className='mb-2 text-sm font-medium text-green-700'>고객 정보</p>
                  <div className='space-y-1 text-sm'>
                    <p className='text-gray-700'>
                      <span className='font-medium'>이름:</span> {result.customer.name}
                    </p>
                    {result.customer.phone && (
                      <p className='text-gray-700'>
                        <span className='font-medium'>연락처:</span> {result.customer.phone}
                      </p>
                    )}
                    {result.customer.address && (
                      <p className='text-gray-700'>
                        <span className='font-medium'>주소:</span> {result.customer.address}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {result.shipping && (
                <div className='rounded-lg border border-green-300 bg-white p-4'>
                  <p className='mb-2 text-sm font-medium text-green-700'>배송 정보</p>
                  <div className='space-y-1 text-sm'>
                    {result.shipping.company && (
                      <p className='text-gray-700'>
                        <span className='font-medium'>택배사:</span> {result.shipping.company}
                      </p>
                    )}
                    {result.shipping.trackingNumber && (
                      <p className='text-gray-700'>
                        <span className='font-medium'>송장번호:</span> {result.shipping.trackingNumber}
                      </p>
                    )}
                    {result.shipping.message && (
                      <p className='text-gray-700'>
                        <span className='font-medium'>메시지:</span> {result.shipping.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 배송 폼 */}
        <div className='space-y-4'>
          {/* 바코드 */}
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

          {/* 배송 수량 */}
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              배송 수량 <span className='text-red-500'>*</span>
            </label>
            <input
              type='number'
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder='10'
              className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
            />
          </div>

          {/* 고객 정보 섹션 */}
          <div className='rounded-lg bg-gray-50 p-4'>
            <h4 className='mb-3 text-sm font-semibold text-gray-700'>고객 정보</h4>
            <div className='space-y-3'>
              <div>
                <label className='mb-1 block text-xs font-medium text-gray-600'>
                  고객명 <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder='홍길동'
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                />
              </div>

              <div>
                <label className='mb-1 block text-xs font-medium text-gray-600'>연락처</label>
                <input
                  type='tel'
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder='010-1234-5678'
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                />
              </div>

              <div>
                <label className='mb-1 block text-xs font-medium text-gray-600'>배송 주소</label>
                <input
                  type='text'
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder='서울시 강남구 테헤란로 123'
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                />
              </div>
            </div>
          </div>

          {/* 배송 정보 섹션 */}
          <div className='rounded-lg bg-gray-50 p-4'>
            <h4 className='mb-3 text-sm font-semibold text-gray-700'>배송 정보</h4>
            <div className='space-y-3'>
              <div>
                <label className='mb-1 block text-xs font-medium text-gray-600'>택배사</label>
                <select
                  value={shippingCompany}
                  onChange={(e) => setShippingCompany(e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                >
                  <option value=''>택배사 선택</option>
                  {shippingCompanies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='mb-1 block text-xs font-medium text-gray-600'>송장 번호</label>
                <input
                  type='text'
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder='123456789012'
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                />
              </div>

              <div>
                <label className='mb-1 block text-xs font-medium text-gray-600'>배송 메시지</label>
                <textarea
                  value={shippingMessage}
                  onChange={(e) => setShippingMessage(e.target.value)}
                  placeholder='문 앞에 놔주세요'
                  rows={2}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleShip}
            disabled={isLoading}
            className='w-full rounded-lg bg-[#674529] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#553821] disabled:cursor-not-allowed disabled:bg-gray-300'
          >
            {isLoading ? '처리 중...' : '배송 처리'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeShipTab;

