import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Package,
  Truck,
  Factory,
  Settings,
  Users,
  Tags,
  BarChart3,
  Home,
  FileText,
  FolderOpen,
} from 'lucide-react'; 

const Sidebar = ({ activeNav, setActiveNav }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState({
    기초정보: false,
    입출고관리: false,
    제조관리: false,
    배송관리: false,
    생산관리: false,
    전자결재: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`flex h-screen flex-col border-r bg-white transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* 로고/헤더 영역 */}
      <div className='flex-shrink-0 border-b px-4 py-3'>
        <div className='flex items-center justify-between'>
          {!isCollapsed ? (
            <>
              <div className='flex items-center space-x-2'>
                <div className='h-7 w-7 rounded bg-[#674529]'></div>
                <div>
                  <div className='text-sm font-bold'>애니콩</div>
                  <div className='text-[10px] text-gray-500'>펫 베이커리</div>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className='text-gray-400 hover:text-gray-600'
              >
                <ChevronDown size={18} className='rotate-[-90deg]' />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleSidebar}
                className='flex h-10 w-10 items-center justify-center text-gray-400 hover:text-gray-600'
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className='flex-1 overflow-y-auto p-3'>
        {/* 대시보드 */}
        <div className='mb-2'>
          <button
            onClick={() => setActiveNav('대시보드')}
            className={`flex items-center rounded text-left text-sm ${
              isCollapsed
                ? 'aspect-square w-full justify-center p-2'
                : 'w-full space-x-1.5 p-1.5'
            } ${
              activeNav === '대시보드'
                ? 'bg-[#674529] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title='대시보드'
          >
            <Home size={16} />
            {!isCollapsed && <span>대시보드</span>}
          </button>
        </div>

        {/* 기초정보 섹션 */}
        <div className='mb-2'>
          <button
            onClick={() => setActiveNav('기초정보')}
            className={`flex items-center rounded text-left text-sm ${
              isCollapsed
                ? 'aspect-square w-full justify-center p-2'
                : 'w-full space-x-1.5 p-1.5'
            } ${
              activeNav === '기초정보'
                ? 'bg-[#674529] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title='기초정보'
          >
            <Settings size={16} />
            {!isCollapsed && <span>기초정보</span>}
          </button>
        </div>

        {/* 재고관리 */}
        <div className='mb-2'>
          <button
            onClick={() => setActiveNav('재고관리')}
            className={`flex items-center rounded text-left text-sm ${
              isCollapsed
                ? 'aspect-square w-full justify-center p-2'
                : 'w-full space-x-1.5 p-1.5'
            } ${
              activeNav === '재고관리'
                ? 'bg-[#674529] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title='재고관리'
          >
            <BarChart3 size={16} />
            {!isCollapsed && <span>재고관리</span>}
          </button>
        </div>

        {/* 입출고관리 */}
        <div className='mb-2'>
          <button
            onClick={() =>
              isCollapsed
                ? setActiveNav('입출고관리-nav1')
                : toggleSection('입출고관리')
            }
            className={`flex items-center rounded text-left text-sm ${
              isCollapsed
                ? 'aspect-square w-full justify-center p-2'
                : 'w-full justify-between p-1.5'
            } ${
              isCollapsed && activeNav === '입출고관리-nav1'
                ? 'bg-[#674529] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title='입출고관리'
          >
            <div
              className={`flex items-center ${!isCollapsed && 'space-x-1.5'}`}
            >
              <Package size={16} />
              {!isCollapsed && <span>입출고관리</span>}
            </div>
            {!isCollapsed && (
              <>
                {openSections.입출고관리 ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </>
            )}
          </button>
          {!isCollapsed && openSections.입출고관리 && (
            <div className='ml-5 mt-1 space-y-0.5'>
              <button
                onClick={() => setActiveNav('입출고관리-nav1')}
                className={`block w-full rounded p-1.5 text-left text-xs ${
                  activeNav === '입출고관리-nav1'
                    ? 'bg-[#674529] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                입고관리
              </button>
              <button
                onClick={() => setActiveNav('입출고관리-nav2')}
                className={`block w-full rounded p-1.5 text-left text-xs ${
                  activeNav === '입출고관리-nav2'
                    ? 'bg-[#674529] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                출고관리
              </button>
            </div>
          )}
        </div>

        {/* 제조관리 */}
        <div className='mb-2'>
          <button
            onClick={() =>
              isCollapsed
                ? setActiveNav('제조관리-nav1')
                : toggleSection('제조관리')
            }
            className={`flex items-center rounded text-left text-sm ${
              isCollapsed
                ? 'aspect-square w-full justify-center p-2'
                : 'w-full justify-between p-1.5'
            } ${
              isCollapsed && activeNav === '제조관리-nav1'
                ? 'bg-[#674529] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title='제조관리'
          >
            <div
              className={`flex items-center ${!isCollapsed && 'space-x-1.5'}`}
            >
              <Factory size={16} />
              {!isCollapsed && <span>제조관리</span>}
            </div>
            {!isCollapsed && (
              <>
                {openSections.제조관리 ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </>
            )}
          </button>
          {!isCollapsed && openSections.제조관리 && (
            <div className='ml-5 mt-1 space-y-0.5'>
              <button
                onClick={() => setActiveNav('제조관리-nav1')}
                className={`block w-full rounded p-1.5 text-left text-xs ${
                  activeNav === '제조관리-nav1'
                    ? 'bg-[#674529] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                1공장 전처리
              </button>
              <button
                onClick={() => setActiveNav('제조관리-nav2')}
                className={`block w-full rounded p-1.5 text-left text-xs ${
                  activeNav === '제조관리-nav2'
                    ? 'bg-[#674529] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                공장간 이동
              </button>
              <button
                onClick={() => setActiveNav('제조관리-nav3')}
                className={`block w-full rounded p-1.5 text-left text-xs ${
                  activeNav === '제조관리-nav3'
                    ? 'bg-[#674529] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                2공장 제조
              </button>
              <button
                onClick={() => setActiveNav('제조관리-nav4')}
                className={`block w-full rounded p-1.5 text-left text-xs ${
                  activeNav === '제조관리-nav4'
                    ? 'bg-[#674529] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                작업내용추가
              </button>
            </div>
          )}
        </div>

        {/* 배송관리 */}
        <div className='mb-2'>
          <button
            onClick={() =>
              isCollapsed
                ? setActiveNav('배송관리-nav1')
                : toggleSection('배송관리')
            }
            className={`flex items-center rounded text-left text-sm ${
              isCollapsed
                ? 'aspect-square w-full justify-center p-2'
                : 'w-full justify-between p-1.5'
            } ${
              isCollapsed && activeNav === '배송관리-nav1'
                ? 'bg-[#674529] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title='배송관리'
          >
            <div
              className={`flex items-center ${!isCollapsed && 'space-x-1.5'}`}
            >
              <Truck size={16} />
              {!isCollapsed && <span>배송관리</span>}
            </div>
            {!isCollapsed && (
              <>
                {openSections.배송관리 ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </>
            )}
          </button>
          {!isCollapsed && openSections.배송관리 && (
            <div className='ml-5 mt-1 space-y-0.5'>
              <button
                onClick={() => setActiveNav('배송관리-nav1')}
                className={`block w-full rounded p-1.5 text-left text-xs ${
                  activeNav === '배송관리-nav1'
                    ? 'bg-[#674529] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                B2B 출고
              </button>
              <button
                onClick={() => setActiveNav('배송관리-nav2')}
                className={`block w-full rounded p-1.5 text-left text-xs ${
                  activeNav === '배송관리-nav2'
                    ? 'bg-[#674529] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                B2C 출고
              </button>
              <button
                onClick={() => setActiveNav('배송관리-nav3')}
                className={`block w-full rounded p-1.5 text-left text-xs ${
                  activeNav === '배송관리-nav3'
                    ? 'bg-[#674529] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                출고 간편등록
              </button>
            </div>
          )}
        </div>

        {/* 생산관리 */}
        <div className='mb-2'>
          <button
            onClick={() =>
              isCollapsed
                ? setActiveNav('생산관리-nav1')
                : toggleSection('생산관리')
            }
            className={`flex items-center rounded text-left text-sm ${
              isCollapsed
                ? 'aspect-square w-full justify-center p-2'
                : 'w-full justify-between p-1.5'
            } ${
              isCollapsed && activeNav === '생산관리-nav1'
                ? 'bg-[#674529] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title='생산관리'
          >
            <div
              className={`flex items-center ${!isCollapsed && 'space-x-1.5'}`}
            >
              <FolderOpen size={16} />
              {!isCollapsed && <span>생산관리</span>}
            </div>
            {!isCollapsed && (
              <>
                {openSections.생산관리 ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </>
            )}
          </button>
          {!isCollapsed && openSections.생산관리 && (
            <div className='ml-5 mt-1 space-y-0.5'>
              <button
                onClick={() => setActiveNav('생산관리-nav1')}
                className={`block w-full rounded p-1.5 text-left text-xs ${
                  activeNav === '생산관리-nav1'
                    ? 'bg-[#674529] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                생산지시서 관리
              </button>
              <button
                onClick={() => setActiveNav('생산관리-nav2')}
                className={`block w-full rounded p-1.5 text-left text-xs ${
                  activeNav === '생산관리-nav2'
                    ? 'bg-[#674529] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                제조이력 캘린더
              </button>
            </div>
          )}
        </div>

        {/* 전자결재 */}
        <div className='mb-2'>
          <button
            onClick={() =>
              isCollapsed
                ? setActiveNav('전자결재-nav1')
                : toggleSection('전자결재')
            }
            className={`flex items-center rounded text-left text-sm ${
              isCollapsed
                ? 'aspect-square w-full justify-center p-2'
                : 'w-full justify-between p-1.5'
            } ${
              isCollapsed && activeNav === '전자결재-nav1'
                ? 'bg-[#674529] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title='전자결재'
          >
            <div
              className={`flex items-center ${!isCollapsed && 'space-x-1.5'}`}
            >
              <FileText size={16} />
              {!isCollapsed && <span>전자결재</span>}
            </div>
            {!isCollapsed && (
              <>
                {openSections.전자결재 ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </>
            )}
          </button>
          {!isCollapsed && openSections.전자결재 && (
            <div className='ml-5 mt-1 space-y-0.5'>
              <button
                onClick={() => setActiveNav('전자결재-nav1')}
                className={`block w-full rounded p-1.5 text-left text-xs ${
                  activeNav === '전자결재-nav1'
                    ? 'bg-[#674529] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                결재시스템
              </button>
              <button
                onClick={() => setActiveNav('전자결재-nav2')}
                className={`block w-full rounded p-1.5 text-left text-xs ${
                  activeNav === '전자결재-nav2'
                    ? 'bg-[#674529] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                문서보관함
              </button>
            </div>
          )}
        </div>

        {/* 라벨관리 */}
        <div className='mb-2'>
          <button
            onClick={() => setActiveNav('라벨관리')}
            className={`flex items-center rounded text-left text-sm ${
              isCollapsed
                ? 'aspect-square w-full justify-center p-2'
                : 'w-full space-x-1.5 p-1.5'
            } ${
              activeNav === '라벨관리'
                ? 'bg-[#674529] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title='라벨관리'
          >
            <Tags size={16} />
            {!isCollapsed && <span>라벨관리</span>}
          </button>
        </div>

        {/* 사용자 관리 */}
        <div className='mb-2'>
          <button
            onClick={() => setActiveNav('사용자관리')}
            className={`flex items-center rounded text-left text-sm ${
              isCollapsed
                ? 'aspect-square w-full justify-center p-2'
                : 'w-full space-x-1.5 p-1.5'
            } ${
              activeNav === '사용자관리'
                ? 'bg-[#674529] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title='사용자 관리'
          >
            <Users size={16} />
            {!isCollapsed && <span>사용자 관리</span>}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
