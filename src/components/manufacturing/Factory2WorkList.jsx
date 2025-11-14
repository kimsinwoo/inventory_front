<<<<<<< HEAD
import { BarChart3, Clock, CheckCircle, Users, Factory } from "lucide-react";
=======
import { useState, useEffect } from "react";
import { BarChart3, Clock, CheckCircle, Users } from "lucide-react";
import { workOrdersAPI, authAPI } from "../../api";
>>>>>>> origin/label-print

const Factory2WorkList = () => {
  const [statusCards, setStatusCards] = useState([
    {
      label: "진행중 작업",
      count: 0,
      icon: <BarChart3 className="w-5 h-5" />,
      iconBgColor: "bg-[#FDB572]",
      textColor: "text-gray-600"
    },
    {
      label: "대기 작업",
      count: 0,
      icon: <Clock className="w-5 h-5" />,
      iconBgColor: "bg-[#A8D08D]",
      textColor: "text-gray-600"
    },
    {
      label: "완료 작업",
      count: 0,
      icon: <CheckCircle className="w-5 h-5" />,
      iconBgColor: "bg-[#674529]",
      textColor: "text-gray-600"
    },
    {
      label: "작업자",
      count: 0,
      icon: <Users className="w-5 h-5" />,
      iconBgColor: "bg-yellow-700",
      textColor: "text-gray-600"
    }
  ]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // 작업 지시서 통계 로드
      const statsResponse = await workOrdersAPI.getStats();
      const statsData = statsResponse.data?.data || statsResponse.data || {};
      
      // 사용자 수 로드 (작업자)
      const usersResponse = await authAPI.getUsers();
      const usersData = usersResponse.data?.data || usersResponse.data || [];
      const workersCount = Array.isArray(usersData) ? usersData.filter(user => 
        user.department === '생산' || user.department === 'production'
      ).length : 0;
      
      setStatusCards([
        {
          label: "진행중 작업",
          count: statsData.in_progress || statsData.inProgress || 0,
          icon: <BarChart3 className="w-5 h-5" />,
          iconBgColor: "bg-[#FDB572]",
          textColor: "text-gray-600"
        },
        {
          label: "대기 작업",
          count: statsData.pending || statsData.waiting || 0,
          icon: <Clock className="w-5 h-5" />,
          iconBgColor: "bg-[#A8D08D]",
          textColor: "text-gray-600"
        },
        {
          label: "완료 작업",
          count: statsData.completed || statsData.done || 0,
          icon: <CheckCircle className="w-5 h-5" />,
          iconBgColor: "bg-[#674529]",
          textColor: "text-gray-600"
        },
        {
          label: "작업자",
          count: workersCount,
          icon: <Users className="w-5 h-5" />,
          iconBgColor: "bg-yellow-700",
          textColor: "text-gray-600"
        }
      ]);
    } catch (error) {
      console.error('작업 통계 로드 실패:', error);
    }
  };

  return (
    <div className="mb-6">
      <div className="items-center mb-5">
        <div className='mb-3 flex items-center space-x-2'>
          <Factory className='h-5 w-5 text-[#674529]'/>
          <h2 className="text-lg font-semibold text-[#674529]">2공장 제조</h2>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {statusCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 flex items-center justify-between border border-gray-200"
          >
            <div className="flex-1">
              <p className={`text-sm font-medium ${card.textColor} mb-2`}>
                {card.label}
              </p>
              <p className="text-3xl font-bold text-gray-900">{card.count}</p>
            </div>
            <div
              className={`${card.iconBgColor} text-white w-12 h-12 rounded-xl flex items-center justify-center`}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Factory2WorkList;