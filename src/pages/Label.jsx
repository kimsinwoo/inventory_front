import { useState } from 'react';
import { Scan, History, Truck, PackageOpen, Send } from 'lucide-react';
import BarcodeScanTab from '../components/label/BarcodeScanTab';
import BarcodeHistoryTab from '../components/label/BarcodeHistoryTab';
import FactoryTransferTab from '../components/label/FactoryTransferTab';
import BarcodeIssueTab from '../components/label/BarcodeIssueTab';
import BarcodeShipTab from '../components/label/BarcodeShipTab';

const Label = () => {
  const [activeTab, setActiveTab] = useState('scan');

  const tabs = [
    { id: 'scan', name: '바코드 스캔', icon: Scan },
    { id: 'history', name: '이력 조회', icon: History },
    { id: 'transfer', name: '공장 이동', icon: Truck },
    { id: 'issue', name: '바코드 출고', icon: PackageOpen },
    { id: 'ship', name: '바코드 배송', icon: Send },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'scan':
        return <BarcodeScanTab />;
      case 'history':
        return <BarcodeHistoryTab />;
      case 'transfer':
        return <FactoryTransferTab />;
      case 'issue':
        return <BarcodeIssueTab />;
      case 'ship':
        return <BarcodeShipTab />;
      default:
        return <BarcodeScanTab />;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      {/* 페이지 헤더 */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-[#674529]'>바코드 관리</h1>
        <p className='mt-2 text-gray-600'>
          바코드를 스캔하여 재고 조회, 공장 이동, 출고/배송 처리를 할 수 있습니다.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className='mb-6 flex space-x-1 rounded-xl bg-white p-1 shadow-sm'>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center space-x-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#674529] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className='h-5 w-5' />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* 탭 컨텐츠 */}
      <div className='rounded-xl bg-white p-6 shadow-sm'>{renderTabContent()}</div>
    </div>
  );
};

export default Label;
