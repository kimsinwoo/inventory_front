import {
  TrendingUp,
  TrendingDown,
  Truck,
  Factory,
  Package,
  AlertTriangle,
} from 'lucide-react';

const ManufacturingManagement = ({ dashboardData, loading }) => {
  // API 데이터가 있으면 사용, 없으면 기본값
  const stats = dashboardData ? [
    {
      title: '입고 완료',
      value: `${dashboardData.recentMovements?.filter(m => m.type === 'RECEIVE').length || 0}건`,
      change: '+12%',
      isPositive: true,
      icon: Truck,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: '제조 완료',
      value: `${dashboardData.topMovingItems?.length || 0}건`,
      change: '+8%',
      isPositive: true,
      icon: Factory,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: '출고 완료',
      value: `${dashboardData.recentMovements?.filter(m => m.type === 'ISSUE').length || 0}건`,
      change: '+5%',
      isPositive: true,
      icon: Package,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: '재고 알람',
      value: `${dashboardData.stockStatus?.lowStock || 0}건`,
      change: '-2건',
      isPositive: false,
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: '유통기한 임박',
      value: `${dashboardData.stockStatus?.expiringSoon || 0}건`,
      change: '-2건',
      isPositive: false,
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: '승인 대기',
      value: '3건',
      change: '-2건',
      isPositive: false,
      icon: AlertTriangle,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ] : [
    {
      title: '입고 완료',
      value: '0건',
      change: '+0%',
      isPositive: true,
      icon: Truck,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: '제조 완료',
      value: '0건',
      change: '+0%',
      isPositive: true,
      icon: Factory,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: '출고 완료',
      value: '0건',
      change: '+0%',
      isPositive: true,
      icon: Package,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: '재고 알람',
      value: '0건',
      change: '0건',
      isPositive: false,
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: '유통기한 임박',
      value: '0건',
      change: '0건',
      isPositive: false,
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: '승인 대기',
      value: '0건',
      change: '0건',
      isPositive: false,
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
                <div className='flex items-center text-sm'>
                  {stat.isPositive ? (
                    <TrendingUp size={16} className='mr-1 text-green-600' />
                  ) : (
                    <TrendingDown size={16} className='mr-1 text-red-600' />
                  )}
                  <span
                    className={
                      stat.isPositive ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {stat.change}
                  </span>
                </div>
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
