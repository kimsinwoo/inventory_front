import {
  TrendingUp,
  TrendingDown,
  Truck,
  Factory,
  Package,
  AlertTriangle,
} from 'lucide-react';

const ManufacturingManagement = ({ dashboardData = {}, loading }) => {
  // 데이터 접근 방식을 실제 데이터 구조에 맞게 수정
  const stats = [
    {
      title: '입고 완료',
      value:
        dashboardData['입고 완료'] && typeof dashboardData['입고 완료'].today === 'number'
          ? `${dashboardData['입고 완료'].today}건`
          : '0건',
      icon: Truck,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: '제조 완료',
      value:
        dashboardData['제조 완료'] && typeof dashboardData['제조 완료'].today === 'number'
          ? `${dashboardData['제조 완료'].today}건`
          : '0건',
      icon: Factory,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: '출고 완료',
      value:
        dashboardData['출고 완료'] && typeof dashboardData['출고 완료'].today === 'number'
          ? `${dashboardData['출고 완료'].today}건`
          : '0건',
      icon: Package,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: '재고 알람',
      value:
        dashboardData['재고 알람'] && typeof dashboardData['재고 알람'].count === 'number'
          ? `${dashboardData['재고 알람'].count}건`
          : '0건',
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: '유통기한 임박',
      value:
        dashboardData['유통기한 임박'] && typeof dashboardData['유통기한 임박'].count === 'number'
          ? `${dashboardData['유통기한 임박'].count}건`
          : '0건',
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: '승인 대기',
      value:
        dashboardData['승인 대기'] && typeof dashboardData['승인 대기'].count === 'number'
          ? `${dashboardData['승인 대기'].count}건`
          : '0건',
      icon: AlertTriangle,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className='rounded-xl bg-white p-6 shadow-sm'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <p className='mb-2 text-sm text-gray-600'>{stat.title}</p>
                <h3 className='mb-2 text-3xl font-bold text-gray-900'>
                  {stat.value}
                </h3>
              </div>
              <div
                className={`${stat.bgColor} flex items-center justify-center rounded-xl p-3`}
              >
                <Icon size={24} className={stat.iconColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ManufacturingManagement;
