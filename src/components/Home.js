import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import DevelopmentBanner from './common/DevelopmentBanner';
import { factoryService } from '../services';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState('대시보드');
  const [factories, setFactories] = useState([]);

  useEffect(() => {
    fetchFactories();
  }, []);

  const fetchFactories = async () => {
    try {
      const response = await factoryService.getAll();
      setFactories(response.data || []);
    } catch (error) {
      console.error('공장 목록 조회 실패:', error);
    }
  };

  // URL에 따라 activeNav 업데이트
  useEffect(() => {
    const path = location.pathname;
    const pathMap = {
      '/dash': '대시보드',
      '/basic': '기초정보',
      '/receiving/nav1': '입출고관리-nav1',
      '/receiving/nav2': '입출고관리-nav2',
      '/manufacturing/nav1': '제조관리-nav1',
      '/manufacturing/nav2': '제조관리-nav2',
      '/manufacturing/nav3': '제조관리-nav3',
      '/manufacturing/nav4': '제조관리-nav4',
      '/manufacturing/nav5': '제조관리-nav5',
      '/inventory': '재고관리',
      '/shipping/nav1': '배송관리-nav1',
      '/shipping/nav2': '배송관리-nav2',
      '/shipping/nav3': '배송관리-nav3',
      '/approval/nav1': '전자결재-nav1',
      '/approval/nav2': '전자결재-nav2',
      '/label': '라벨관리',
      '/user/nav1': '사용자관리-nav1',
      '/user/nav2': '사용자관리-nav2',
    };

    // 공장별 작업지시서 경로 처리
    const factoryMatch = path.match(/^\/manufacturing\/factory\/(\d+)$/);
    if (factoryMatch) {
      setActiveNav(`제조관리-factory-${factoryMatch[1]}`);
      return;
    }

    setActiveNav(pathMap[path] || '대시보드');
  }, [location.pathname]);

  // activeNav 변경 시 URL 업데이트
  const handleNavChange = (nav) => {
    setActiveNav(nav);
    
    // 공장별 작업지시서 네비게이션 처리
    const factoryMatch = nav.match(/^제조관리-factory-(\d+)$/);
    if (factoryMatch) {
      navigate(`/manufacturing/factory/${factoryMatch[1]}`);
      return;
    }

    const navMap = {
      대시보드: '/dash',
      기초정보: '/basic',
      '입출고관리-nav1': '/receiving/nav1',
      '입출고관리-nav2': '/receiving/nav2',
      '입출고관리-nav3': '/receiving/nav3',
      '입출고관리-nav4': '/receiving/nav4',
      '제조관리-nav1': '/manufacturing/nav1',
      '제조관리-nav2': '/manufacturing/nav2',
      '제조관리-nav3': '/manufacturing/nav3',
      '제조관리-nav4': '/manufacturing/nav4',
      '제조관리-nav5': '/manufacturing/nav5',
      재고관리: '/inventory',
      '배송관리-nav1': '/shipping/nav1',
      '배송관리-nav2': '/shipping/nav2',
      '배송관리-nav3': '/shipping/nav3',
      '배송관리-nav4': '/shipping/nav4',
      '전자결재-nav1': '/approval/nav1',
      '전자결재-nav2': '/approval/nav2',
      라벨관리: '/label',
      사용자관리: '/user',
      '사용자관리-nav1': '/user/nav1',
      '사용자관리-nav2': '/user/nav2',
    };

    navigate(navMap[nav] || '/dash');
  };

  return (
    <>
      {/* 개발 모드 배너 */}
      <DevelopmentBanner />

      <div className='flex h-screen' style={{ backgroundColor: '#f9f6f2' }}>
        {/* 왼쪽 사이드바 */}
        <Sidebar activeNav={activeNav} setActiveNav={handleNavChange} />

        {/* 메인 콘텐츠 영역 */}
        <div className='flex-1 overflow-auto'>
          {/* 상단 탭 네비게이션 */}
          <TopNavigation />

          {/* 메인 콘텐츠 */}
          <div className='p-8'>
            {/* 라우트된 페이지 렌더링 */}
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
