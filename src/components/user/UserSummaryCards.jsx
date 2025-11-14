<<<<<<< HEAD
import { useSelector } from 'react-redux';
=======
import { useState, useEffect } from 'react';
>>>>>>> origin/label-print
import { Users } from 'lucide-react';
import { authAPI } from '../../api';

const UserSummaryCards = () => {
<<<<<<< HEAD
  const { users } = useSelector((state) => state.user);

  // 사용자 데이터에서 통계 계산
  const userData = users.data || [];
  const totalUsers = userData.length;
  const productionTeam = userData.filter((user) => user.department === '생산팀').length;
  const managementTeam = userData.filter((user) => user.department === '경영지원팀').length;

  const summaryData = [
    {
      label: '전체 사용자',
      count: totalUsers,
=======
  const [summaryData, setSummaryData] = useState([
    {
      label: '전체 사용자',
      count: 0,
>>>>>>> origin/label-print
      icon: Users,
      bgColor: 'bg-[#674529]',
      iconColor: 'text-white',
    },
    {
      label: '생산팀',
<<<<<<< HEAD
      count: productionTeam,
=======
      count: 0,
>>>>>>> origin/label-print
      icon: Users,
      bgColor: 'bg-orange-300',
      iconColor: 'text-white',
    },
    {
      label: '경영지원팀',
<<<<<<< HEAD
      count: managementTeam,
=======
      count: 0,
>>>>>>> origin/label-print
      icon: Users,
      bgColor: 'bg-[#86A956]',
      iconColor: 'text-white',
    },
  ]);

  useEffect(() => {
    loadUserSummary();
  }, []);

  const loadUserSummary = async () => {
    try {
      const response = await authAPI.getUsers();
      const data = response.data?.data || response.data || [];
      const usersList = Array.isArray(data) ? data : [];
      
      // 전체 사용자 수
      const totalUsers = usersList.length;
      
      // 생산팀 사용자 수
      const productionUsers = usersList.filter(user => 
        user.department === '생산' || user.department === 'production'
      ).length;
      
      // 경영지원팀 사용자 수
      const supportUsers = usersList.filter(user => 
        user.department === '경영지원' || user.department === 'support' || user.department === '경영지원팀'
      ).length;
      
      setSummaryData([
        {
          label: '전체 사용자',
          count: totalUsers,
          icon: Users,
          bgColor: 'bg-[#674529]',
          iconColor: 'text-white',
        },
        {
          label: '생산팀',
          count: productionUsers,
          icon: Users,
          bgColor: 'bg-orange-300',
          iconColor: 'text-white',
        },
        {
          label: '경영지원팀',
          count: supportUsers,
          icon: Users,
          bgColor: 'bg-[#86A956]',
          iconColor: 'text-white',
        },
      ]);
    } catch (error) {
      console.error('사용자 요약 정보 로드 실패:', error);
    }
  };

  return (
    <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {summaryData.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className='flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm'
          >
            <div>
              <p className='mb-1 text-sm text-gray-600'>{item.label}</p>
              <p className='text-2xl font-bold text-gray-900'>{item.count}</p>
            </div>
            <div className={`rounded-xl ${item.bgColor} p-3`}>
              <Icon className={`h-6 w-6 ${item.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserSummaryCards;
