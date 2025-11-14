const BasicTabSelector = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'items', name: '품목 등록' },
    { id: 'processes', name: '공장 정보' },
    { id: 'bom', name: 'BOM 관리' },
    { id: 'storage', name: '보관 조건' },
  ];

  return (
    <div className='mb-6 flex space-x-0 rounded-xl bg-[#E8E8E8] p-1'>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 rounded-xl px-6 py-1 font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-white text-[#000] shadow-sm'
              : 'bg-transparent text-gray-600 hover:text-[#000]'
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
};

export default BasicTabSelector;
