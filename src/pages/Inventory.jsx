import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import InventoryTabSelector from '../components/inventory/InventoryTabSelector';
import InventoryStatusFilter from '../components/inventory/InventoryStatusFilter';
import InventoryStatusSummary from '../components/inventory/InventoryStatusSummary';
import InventoryStatusList from '../components/inventory/InventoryStatusList';
import InventoryMovementList from '../components/inventory/InventoryMovementList';
import InventoryAlertsSummary from '../components/inventory/InventoryAlertsSummary';
import WarehouseUtilization from '../components/inventory/WarehouseUtilization';
import TemperatureInput from '../components/inventory/TemperatureInput';
import TemperatureList from '../components/inventory/TemperatureList';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('status');
  const [filters, setFilters] = useState({
    category: '전체',
    warehouse: '전체',
    status: '전체',
    searchTerm: '',
  });

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
            <InventoryStatusList filters={filters} />
          </>
        );
      case 'tracking':
        return (
          <>
            <InventoryMovementList />
          </>
        );
      case 'dashboard':
        return (
          <>
            <WarehouseUtilization />
          </>
        );
        case 'temperature':
          return (
            <>
              <TemperatureInput />
              <TemperatureList />
            </>
          )
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
