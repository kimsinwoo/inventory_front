import { useState } from 'react';
import { Scan, Package, MapPin, Thermometer, Calendar, AlertCircle } from 'lucide-react';
import Barcode from 'react-barcode';
import { barcodeService } from '../../services';

const BarcodeScanTab = () => {
  const [barcode, setBarcode] = useState('');
  const [inventoryData, setInventoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!barcode || barcode.trim().length === 0) {
      setError('바코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setInventoryData(null);

    try {
      const response = await barcodeService.scan(barcode.trim());
      const data = response.data;
      
      // 히스토리도 함께 가져오기 (공장별 재고와 최근 이동 경로 표시용)
      try {
        const historyResponse = await barcodeService.getHistory(barcode.trim());
        const historyData = historyResponse.data;
        
        // 공장별 재고량 계산
        if (!data.factoryInventories && historyData.history && historyData.history.length > 0) {
          const factoryMap = {};
          
          historyData.history.forEach((item) => {
            if (item.fromFactory && item.typeRaw === 'TRANSFER_OUT') {
              const key = item.fromFactory.id || item.fromFactory.name;
              if (!factoryMap[key]) {
                factoryMap[key] = {
                  factoryName: item.fromFactory.name,
                  factoryType: item.fromFactory.type,
                  quantity: 0,
                };
              }
              factoryMap[key].quantity -= item.quantity || 0;
            }
            
            if (item.toFactory) {
              const key = item.toFactory.id || item.toFactory.name;
              if (!factoryMap[key]) {
                factoryMap[key] = {
                  factoryName: item.toFactory.name,
                  factoryType: item.toFactory.type,
                  quantity: 0,
                };
              }
              factoryMap[key].quantity += item.quantity || 0;
            }
          });

          data.factoryInventories = Object.values(factoryMap).filter(f => f.quantity > 0);
        }

        // 최근 이동 경로 계산
        if (!data.recentMovements && historyData.history && historyData.history.length > 0) {
          const movements = historyData.history
            .filter(item => item.typeRaw === 'TRANSFER_IN' || item.typeRaw === 'TRANSFER_OUT' || item.typeRaw === 'RECEIVE')
            .slice(0, 5)
            .map(item => ({
              factoryName: item.toFactory?.name || item.fromFactory?.name,
              factory: item.toFactory || item.fromFactory,
              occurredAt: item.occurredAt,
            }));
          
          data.recentMovements = movements;
        }
      } catch (historyErr) {
        console.warn('히스토리 조회 실패 (스캔은 성공):', historyErr);
      }
      
      setInventoryData(data);
    } catch (err) {
      console.error('바코드 스캔 실패:', err);
      setError(err.response?.data?.message || '바코드 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Normal: { label: '정상', color: 'bg-green-100 text-green-800' },
      LowStock: { label: '재고부족', color: 'bg-yellow-100 text-yellow-800' },
      Expiring: { label: '유통기한 임박', color: 'bg-orange-100 text-orange-800' },
      Expired: { label: '유통기한 만료', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.Normal;
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className='space-y-6'>
      {/* 바코드 입력 영역 */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold text-gray-800'>바코드 스캔</h2>
        <div className='flex space-x-3'>
          <div className='flex-1'>
            <input
              type='text'
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='바코드 번호를 입력하거나 스캔하세요 (예: 17307240001234)'
              className='w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
            />
          </div>
          <button
            onClick={handleScan}
            disabled={isLoading}
            className='flex items-center space-x-2 rounded-lg bg-[#674529] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#553821] disabled:cursor-not-allowed disabled:bg-gray-300'
          >
            <Scan className='h-5 w-5' />
            <span>{isLoading ? '조회 중...' : '스캔'}</span>
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className='flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-red-800'>
          <AlertCircle className='h-5 w-5' />
          <span className='text-sm'>{error}</span>
        </div>
      )}

      {/* 재고 정보 표시 */}
      {inventoryData && (
        <div className='space-y-6'>
          {/* 기본 정보 카드 */}
          <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-800'>재고 정보</h3>
              {getStatusBadge(inventoryData.inventory?.status)}
            </div>

            <div className='grid grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <Package className='mt-1 h-5 w-5 text-[#674529]' />
                  <div>
                    <p className='text-xs text-gray-500'>품목명</p>
                    <p className='font-medium text-gray-900'>{inventoryData.item?.name || '-'}</p>
                    <p className='text-xs text-gray-500'>코드: {inventoryData.item?.code || '-'}</p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <MapPin className='mt-1 h-5 w-5 text-[#674529]' />
                  <div>
                    <p className='text-xs text-gray-500'>보관 위치</p>
                    <p className='font-medium text-gray-900'>{inventoryData.factory?.name || '-'}</p>
                    <p className='text-xs text-gray-500'>{inventoryData.factory?.type || '-'}</p>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <Package className='mt-1 h-5 w-5 text-[#674529]' />
                  <div>
                    <p className='text-xs text-gray-500'>재고 수량</p>
                    <p className='text-2xl font-bold text-[#674529]'>
                      {inventoryData.inventory?.quantity || 0} {inventoryData.inventory?.unit || 'kg'}
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <Calendar className='mt-1 h-5 w-5 text-[#674529]' />
                  <div>
                    <p className='text-xs text-gray-500'>유통기한</p>
                    <p className='font-medium text-gray-900'>
                      {inventoryData.inventory?.expirationDate || '-'}
                    </p>
                    <p className='text-xs text-gray-500'>
                      입고일: {inventoryData.inventory?.receivedAt?.split('T')[0] || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 보관 조건 카드 */}
          {inventoryData.storageCondition && (
            <div className='rounded-xl border border-gray-200 bg-white p-6'>
              <h3 className='mb-4 flex items-center space-x-2 text-lg font-semibold text-gray-800'>
                <Thermometer className='h-5 w-5 text-[#674529]' />
                <span>보관 조건</span>
              </h3>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <p className='text-xs text-gray-500'>보관 방법</p>
                  <p className='font-medium text-gray-900'>
                    {inventoryData.storageCondition.name || '-'}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-500'>온도 범위</p>
                  <p className='font-medium text-gray-900'>
                    {inventoryData.storageCondition.temperatureRange || '-'}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-500'>습도 범위</p>
                  <p className='font-medium text-gray-900'>
                    {inventoryData.storageCondition.humidityRange || '-'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 바코드 정보 */}
          <div className='rounded-xl border border-gray-200 bg-white p-6'>
            <h3 className='mb-4 text-lg font-semibold text-gray-800'>바코드 정보</h3>
            <div className='flex items-center justify-center rounded-lg bg-gray-50 p-8'>
              <Barcode 
                value={inventoryData.inventory?.barcode || barcode}
                format="CODE128"
                width={2}
                height={80}
                displayValue={true}
                fontSize={16}
                margin={10}
              />
            </div>
          </div>

          {/* 공장별 재고량 */}
          {inventoryData.factoryInventories && inventoryData.factoryInventories.length > 0 && (
            <div className='rounded-xl border border-gray-200 bg-white p-6'>
              <h3 className='mb-4 text-lg font-semibold text-gray-800'>공장별 재고 현황</h3>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
                {inventoryData.factoryInventories.map((factory, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4'
                  >
                    <div className='flex items-center space-x-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#674529] text-white'>
                        <MapPin className='h-5 w-5' />
                      </div>
                      <div>
                        <p className='font-medium text-gray-900'>{factory.factoryName || factory.name}</p>
                        <p className='text-xs text-gray-500'>{factory.factoryType || factory.type || '공장'}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-xl font-bold text-[#674529]'>
                        {factory.quantity || 0}
                      </p>
                      <p className='text-xs text-gray-500'>{factory.unit || inventoryData.inventory?.unit || 'kg'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 최근 이동 위치 */}
          {inventoryData.recentMovements && inventoryData.recentMovements.length > 0 && (
            <div className='rounded-xl border border-gray-200 bg-white p-6'>
              <h3 className='mb-4 text-lg font-semibold text-gray-800'>최근 이동 경로</h3>
              <div className='flex items-center space-x-2 overflow-x-auto pb-2'>
                {inventoryData.recentMovements.map((movement, index) => (
                  <div key={index} className='flex items-center space-x-2'>
                    <div className='flex-shrink-0 rounded-lg bg-gray-100 px-4 py-2'>
                      <div className='flex items-center space-x-2'>
                        <MapPin className='h-4 w-4 text-[#674529]' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {movement.factoryName || movement.factory?.name || '-'}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {movement.date?.split('T')[0] || movement.occurredAt?.split('T')[0] || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {index < inventoryData.recentMovements.length - 1 && (
                      <div className='flex-shrink-0 text-gray-400'>→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 안내 메시지 (데이터 없을 때) */}
      {!inventoryData && !error && !isLoading && (
        <div className='rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center'>
          <Scan className='mx-auto h-16 w-16 text-gray-400' />
          <p className='mt-4 text-lg font-medium text-gray-600'>바코드를 스캔해주세요</p>
          <p className='mt-2 text-sm text-gray-500'>
            바코드 번호를 입력하거나 바코드 스캐너로 스캔하세요
          </p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanTab;

