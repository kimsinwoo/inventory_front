import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { approvalAPI } from '../../api';

const DocumentStatusSummary = () => {
  const [summaryCards, setSummaryCards] = useState([
    {
      id: 1,
      title: '전체 문서',
      value: 0,
      icon: <FileText className='h-6 w-6' />,
      bgColor: 'bg-[#724323]',
      iconTextColor: 'text-[#fff]',
    },
    {
      id: 2,
      title: '결재 대기',
      value: 0,
      icon: <Clock className='h-6 w-6' />,
      bgColor: 'bg-[#ffedd4]',
      iconTextColor: 'text-[#f65814]',
    },
    {
      id: 3,
      title: '승인 완료',
      value: 0,
      icon: <CheckCircle className='h-6 w-6' />,
      bgColor: 'bg-[#d4edda]',
      iconTextColor: 'text-[#28a745]',
    },
    {
      id: 4,
      title: '반려',
      value: 0,
      icon: <XCircle className='h-6 w-6' />,
      bgColor: 'bg-[#f8d7da]',
      iconTextColor: 'text-[#dc3545]',
    },
  ]);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const response = await approvalAPI.getInbox();
      const data = response.data?.data || response.data || [];
      const docsList = Array.isArray(data) ? data : [];
      
      // 상태별 카운트 계산
      const total = docsList.length;
      const pending = docsList.filter(doc => {
        const status = doc.status?.toUpperCase();
        return status === 'PENDING' || status === 'pending';
      }).length;
      const approved = docsList.filter(doc => {
        const status = doc.status?.toUpperCase();
        return status === 'APPROVED' || status === 'approved';
      }).length;
      const rejected = docsList.filter(doc => {
        const status = doc.status?.toUpperCase();
        return status === 'REJECTED' || status === 'rejected';
      }).length;
      
      setSummaryCards([
        {
          id: 1,
          title: '전체 문서',
          value: total,
          icon: <FileText className='h-6 w-6' />,
          bgColor: 'bg-[#724323]',
          iconTextColor: 'text-[#fff]',
        },
        {
          id: 2,
          title: '결재 대기',
          value: pending,
          icon: <Clock className='h-6 w-6' />,
          bgColor: 'bg-[#ffedd4]',
          iconTextColor: 'text-[#f65814]',
        },
        {
          id: 3,
          title: '승인 완료',
          value: approved,
          icon: <CheckCircle className='h-6 w-6' />,
          bgColor: 'bg-[#d4edda]',
          iconTextColor: 'text-[#28a745]',
        },
        {
          id: 4,
          title: '반려',
          value: rejected,
          icon: <XCircle className='h-6 w-6' />,
          bgColor: 'bg-[#f8d7da]',
          iconTextColor: 'text-[#dc3545]',
        },
      ]);
    } catch (error) {
      console.error('문서 요약 정보 로드 실패:', error);
    }
  };

  return (
    <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
      {summaryCards.map((card) => (
        <div
          key={card.id}
          className='rounded-xl bg-white p-6 shadow-sm'
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='mb-1 text-sm text-gray-600'>{card.title}</p>
              <p className='text-3xl font-bold text-[#674529]'>{card.value}</p>
            </div>
            <div
              className={`h-14 w-14 ${card.bgColor} flex items-center justify-center rounded-xl`}
            >
              <div className={`${card.iconTextColor}`}>{card.icon}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentStatusSummary;
