import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import InventoryTabSelector from '../components/inventory/InventoryTabSelector';
import InventoryStatusFilter from '../components/inventory/InventoryStatusFilter';
import InventoryStatusSummary from '../components/inventory/InventoryStatusSummary';
import InventoryStatusList from '../components/inventory/InventoryStatusList';
import InventoryMovementList from '../components/inventory/InventoryMovementList';
import WarehouseUtilization from '../components/inventory/WarehouseUtilization';
import WarehouseTransfer from '../components/inventory/WarehouseTransfer';
import TemperatureInput from '../components/inventory/TemperatureInput';
import TemperatureList from '../components/inventory/TemperatureList';
import { factoryService } from '../services';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('status');
  const [filters, setFilters] = useState({
    category: '전체',
    warehouse: '전체',
    status: '전체',
    searchTerm: '',
  });
  const [temperatureRefresh, setTemperatureRefresh] = useState(0);
  const [factoryList, setFactoryList] = useState([]);
  const [selectedFactoryId, setSelectedFactoryId] = useState('');

  useEffect(() => {
    const loadFactories = async () => {
      try {
        const resp = await factoryService.getAll({ page: 1, limit: 100 });
        const data = resp.data?.rows || resp.data || [];
        setFactoryList(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('공장 목록 조회 실패:', e);
        setFactoryList([]);
      }
    };
    loadFactories();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // 필터에 따라 데이터를 다시 불러오는 로직 추가
    console.log('필터 변경:', newFilters);
  };

  const handleExport = () => {
    // 데이터 내보내기 로직
    console.log('데이터 내보내기');
    alert('데이터를 내보내는 중입니다...');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'status':
        return (
          <>
            <InventoryStatusFilter onFilterChange={handleFilterChange} />
            <InventoryStatusSummary />
            <InventoryStatusList filters={{ ...filters, factoryId: selectedFactoryId }} />
          </>
        );
      case 'tracking':
        return (
          <>
            <InventoryMovementList factoryId={selectedFactoryId} />
          </>
        );
      case 'transfer':
        return (
          <>
            <WarehouseTransfer />
          </>
        );
      case 'temperature':
        return (
          <>
            <TemperatureInput 
              onTemperatureAdded={() => setTemperatureRefresh(prev => prev + 1)} 
            />
            <TemperatureList 
              refreshTrigger={temperatureRefresh} 
            />
          </>
        );
      case 'dashboard':
        return (
          <>
            <WarehouseUtilization />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <div className='mb-1 flex items-center space-x-2'>
            <BarChart3 className='h-5 w-5 text-[#674529]' />
            <h1 className='text-lg font-semibold text-[#674529]'>
              재고/이력 조회
            </h1>
          </div>
          <p className='text-sm text-gray-600'>
            공장, 창고, 로트, 유통기한 필터 및 바코드 히스토리
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <label className='text-xs text-gray-600'>공장</label>
          <select
            value={selectedFactoryId}
            onChange={(e) => setSelectedFactoryId(e.target.value)}
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
          >
            <option value=''>전체</option>
            {factoryList.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleExport}
          className='flex items-center space-x-2 rounded-xl border border-[#674529] bg-white px-4 py-2.5 font-medium text-[#674529] transition-colors hover:bg-gray-50'
        >
          <span>데이터 내보내기</span>
        </button>
      </div>

      {/* 탭 선택 */}
      <InventoryTabSelector activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 컨텐츠 */}
      {renderContent()}
    </div>
  );
};

export default Inventory;