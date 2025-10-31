import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StatusSummaryBar from '../components/manufacturing/StatusSummaryBar';
import WorkOrderList from '../components/manufacturing/WorkOrderList';
import TransferRegistration from '../components/manufacturing/TransferRegistration';
import TransferStatus from '../components/manufacturing/TransferStatus';
import TransferOut from '../components/manufacturing/TransferOut';
import TransferIn from '../components/manufacturing/TransferIn';
import WorkOrderFormAPI from '../components/manufacturing/WorkOrderFormAPI';
import { ArrowRightLeft } from 'lucide-react';
import { factoryService } from '../services';

const Manufacturing = ({ subPage }) => {
  const { factoryId } = useParams();
  const [factoryName, setFactoryName] = useState('');

  useEffect(() => {
    if (factoryId && subPage === 'factory') {
      fetchFactoryName();
    }
  }, [factoryId, subPage]);

  const fetchFactoryName = async () => {
    try {
      const response = await factoryService.getAll();
      const factory = response.data?.find(f => f.id === parseInt(factoryId));
      setFactoryName(factory?.name || '');
    } catch (error) {
      console.error('공장 정보 조회 실패:', error);
    }
  };
  const renderContent = () => {
    switch (subPage) {
      case 'nav1':
        // 제조이력 캘린더
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#674529] mb-4">제조이력 캘린더</h2>
              <p className="text-gray-600">제조이력 캘린더 페이지입니다.</p>
            </div>
          </div>
        );

      case 'nav2':
        // 1공장 전처리
        return (
          <div className="p-6">
            <StatusSummaryBar />
            <WorkOrderList />
          </div>
        );

      case 'nav3':
        // 공장간 이동
        return (
          <div>
            <div className='mb-1 flex items-center space-x-2'>
              <ArrowRightLeft className='h-5 w-5 text-[#674529]'/>
              <h2 className="text-lg font-semibold text-[#674529]">공장간 이동 관리</h2>
            </div>
              {/* 출고/입고 분리 */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TransferOut />
                <TransferIn />
              </div>
              <TransferStatus />
          </div>
        );

      case 'nav4':
        // 2공장 제조
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#674529] mb-4">2공장 제조</h2>
              <p className="text-gray-600">2공장 제조 관리 페이지입니다.</p>
            </div>
          </div>
        );

      case 'nav5':
        // 작업지시서 관리
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#674529] mb-4">작업지시서 관리</h2>
              <p className="text-gray-600">작업지시서 관리 페이지입니다.</p>
            </div>
          </div>
        );

      case 'factory':
        // 공장별 작업지시서
        return (
          <div className="p-6">
            <WorkOrderFormAPI factoryId={factoryId} factoryName={factoryName} />
          </div>
        );

      default:
        // 기본값: nav1 표시
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#674529] mb-4">제조이력 캘린더</h2>
              <p className="text-gray-600">제조이력 캘린더 페이지입니다.</p>
            </div>
          </div>
        );
    }
  };

  return renderContent();
};

export default Manufacturing;