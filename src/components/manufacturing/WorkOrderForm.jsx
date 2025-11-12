import { useState, useEffect } from 'react';
import { workOrdersAPI, bomsAPI, authAPI } from '../../api';

const WorkOrderForm = () => {
  const [bomOptions, setBomOptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 폼 데이터 - 작업 내용
  const [workFormData, setWorkFormData] = useState({
    title: '',
    workContent: '세척',
    materialName: '',
    quantity: '',
    scheduledDate: '',
    managerId: '',
  });

  // 폼 데이터 - BOM
  const [bomFormData, setBomFormData] = useState({
    bomId: '',
    quantity: '1',
    scheduledDate: '',
    managerId: '',
  });

  useEffect(() => {
    loadBoms();
    loadUsers();
  }, []);

  const loadBoms = async () => {
    try {
      const response = await bomsAPI.getBoms();
      const data = response.data?.data || response.data || [];
      const bomsList = Array.isArray(data) ? data : [];
      setBomOptions(bomsList.map(bom => ({
        id: bom.id,
        name: bom.name || bom.product_name || `BOM-${bom.id}`,
      })));
    } catch (error) {
      console.error('BOM 목록 로드 실패:', error);
      setBomOptions([]);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      const data = response.data?.data || response.data || [];
      const usersList = Array.isArray(data) ? data : [];
      setUsers(usersList);
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
      setUsers([]);
    }
  };

  const handleWorkInputChange = (field, value) => {
    setWorkFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBomInputChange = (field, value) => {
    setBomFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!workFormData.title || !workFormData.materialName || !workFormData.quantity || !workFormData.managerId) {
        alert('모든 필수 필드를 입력해주세요.');
        return;
      }
      const workData = {
        title: workFormData.title,
        work_content: workFormData.workContent,
        material_name: workFormData.materialName,
        quantity: parseFloat(workFormData.quantity) || 0,
        scheduled_date: workFormData.scheduledDate,
        manager_id: parseInt(workFormData.managerId),
      };
      await workOrdersAPI.createWorkOrder(workData);
      alert('작업 지시서가 등록되었습니다.');
      // 폼 초기화
      setWorkFormData({
        title: '',
        workContent: '세척',
        materialName: '',
        quantity: '',
        scheduledDate: '',
        managerId: '',
      });
    } catch (error) {
      console.error('작업 지시서 등록 실패:', error);
      alert('작업 지시서 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBomSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!bomFormData.bomId || !bomFormData.managerId) {
        alert('BOM과 담당자를 선택해주세요.');
        return;
      }
      const bomData = {
        bom_id: parseInt(bomFormData.bomId),
        quantity: parseInt(bomFormData.quantity) || 1,
        scheduled_date: bomFormData.scheduledDate,
        manager_id: parseInt(bomFormData.managerId),
      };
      await workOrdersAPI.createWorkOrder(bomData);
      alert('BOM 작업 지시서가 등록되었습니다.');
      // 폼 초기화
      setBomFormData({
        bomId: '',
        quantity: '1',
        scheduledDate: '',
        managerId: '',
      });
    } catch (error) {
      console.error('BOM 작업 지시서 등록 실패:', error);
      alert('BOM 작업 지시서 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 사용자 목록에서 고유한 position 목록 추출
  const positions = [...new Set(users.map(user => user.position).filter(Boolean))];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl text-[#674529] mb-6">작업 지시서 등록</h3>

      <div className="grid grid-cols-2 gap-6">
        {/* 좌측 - 작업 내용 */}
        <div className="border border-gray-200 rounded-lg p-5">
          <h4 className="text-base font-semibold text-[#674529] mb-4 text-center">작업 내용</h4>

          <form onSubmit={handleWorkSubmit} className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">제목</label>
              <input
                type="text"
                placeholder="Title"
                value={workFormData.title}
                onChange={(e) => handleWorkInputChange('title', e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">작업 내용</label>
              <select
                value={workFormData.workContent}
                onChange={(e) => handleWorkInputChange('workContent', e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option value="세척">세척</option>
                <option value="전처리">전처리</option>
                <option value="제조">제조</option>
                <option value="포장">포장</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">원재료명</label>
              <input
                type="text"
                placeholder="딸기"
                value={workFormData.materialName}
                onChange={(e) => handleWorkInputChange('materialName', e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">작업량</label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="100"
                  value={workFormData.quantity}
                  onChange={(e) => handleWorkInputChange('quantity', e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
                />
                <span className="text-sm text-gray-600">kg</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">작업 예정일</label>
              <input
                type="date"
                value={workFormData.scheduledDate}
                onChange={(e) => handleWorkInputChange('scheduledDate', e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">담당자</label>
              <select
                value={workFormData.managerId}
                onChange={(e) => handleWorkInputChange('managerId', e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                required
              >
                <option value="">담당자 선택</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.username} ({user.position || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-[#674529] text-white text-sm rounded hover:bg-[#553821] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '등록 중...' : '작업 지시서 등록'}
              </button>
            </div>
          </form>
        </div>

        {/* 우측 - BOM */}
        <div className="border border-gray-200 rounded-lg p-5">
          <h4 className="text-base font-semibold text-[#674529] mb-4 text-center">BOM</h4>

          <form onSubmit={handleBomSubmit} className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">BOM</label>
              <select
                value={bomFormData.bomId}
                onChange={(e) => handleBomInputChange('bomId', e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                required
              >
                <option value="">BOM 선택</option>
                {bomOptions.map((bom) => (
                  <option key={bom.id} value={bom.id}>
                    {bom.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">수량</label>
              <input
                type="number"
                value={bomFormData.quantity}
                onChange={(e) => handleBomInputChange('quantity', e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                min="1"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">작업 예정일</label>
              <input
                type="date"
                value={bomFormData.scheduledDate}
                onChange={(e) => handleBomInputChange('scheduledDate', e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">담당자</label>
              <select
                value={bomFormData.managerId}
                onChange={(e) => handleBomInputChange('managerId', e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                required
              >
                <option value="">담당자 선택</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.username} ({user.position || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-[#674529] text-white text-sm rounded hover:bg-[#553821] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '등록 중...' : '작업 지시서 등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderForm;
