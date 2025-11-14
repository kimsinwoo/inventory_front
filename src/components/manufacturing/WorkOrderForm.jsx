// src/pages/WorkOrder/WorkOrderForm.jsx
import { useState, useEffect, useMemo } from 'react';
import { workOrdersAPI, bomsAPI, factoriesAPI } from '../../api';

const WorkOrderForm = () => {
  const [boms, setBoms] = useState([]);
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    bomId: '',
    factoryId: '',
    plannedQuantity: '',
    scheduledStartDate: '',
    scheduledEndDate: '',
    notes: '',
  });

  useEffect(() => {
    void loadBoms();
    void loadFactories();
  }, []);

<<<<<<< HEAD
  // 담당자별 이름 매핑
  const namesByManager = {
    '대표': ['김대표'],
    '이사': ['최이사', '정이사', '강이사'],
    '팀장': ['나팀장', '윤팀장', '송팀장'],
    '직원': ['홍직원', '조직원', '한직원'],
    '알바': ['김알바', '이알바', '박알바']
=======
  const loadBoms = async () => {
    try {
      const response = await bomsAPI.getBoms();
      const root = response.data ?? {};
      const rows = Array.isArray(root) ? root : root.rows ?? [];
      setBoms(rows);
    } catch (error) {
      console.error('BOM 목록 로드 실패:', error);
      setBoms([]);
    }
>>>>>>> origin/label-print
  };

  const loadFactories = async () => {
    try {
      const response = await factoriesAPI.getFactories();
      const data = response.data?.data ?? response.data ?? [];
      const list = Array.isArray(data) ? data : [];
      setFactories(list);
    } catch (error) {
      console.error('공장 목록 로드 실패:', error);
      setFactories([]);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedBom = useMemo(() => {
    if (!formData.bomId) return undefined;
    const id = Number(formData.bomId);
    if (Number.isNaN(id)) return undefined;
    return boms.find(b => b.id === id);
  }, [formData.bomId, boms]);

  const selectedFactory = useMemo(() => {
    if (!formData.factoryId) return undefined;
    const id = Number(formData.factoryId);
    if (Number.isNaN(id)) return undefined;
    return factories.find(f => f.id === id);
  }, [formData.factoryId, factories]);

  const selectedProductItemId = useMemo(() => {
    if (!selectedBom) return undefined;
    return (
      selectedBom.product_item_id ??
      selectedBom.productItemId ??
      selectedBom.product_item?.id ??
      selectedBom.productItem?.id
    );
  }, [selectedBom]);

  const selectedUnit = useMemo(() => {
    if (!selectedBom) return 'EA';
    return (
      selectedBom.unit ??
      selectedBom.product_item?.unit ??
      selectedBom.productItem?.unit ??
      'EA'
    );
  }, [selectedBom]);

  const selectedProductName = useMemo(() => {
    if (!selectedBom) return '';
    return (
      selectedBom.product_item?.name ??
      selectedBom.productItem?.name ??
      selectedBom.product_name ??
      selectedBom.name ??
      ''
    );
  }, [selectedBom]);

  const formatDateTime = value => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString();
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.bomId || !formData.factoryId || !formData.plannedQuantity) {
      alert('BOM, 공장, 계획 수량을 모두 입력해주세요.');
      return;
    }

    if (!selectedBom) {
      alert('선택한 BOM 정보를 찾을 수 없습니다.');
      return;
    }

    if (!selectedProductItemId) {
      alert('선택한 BOM에 완제품/반제품 ID가 없습니다. BOM 설정을 확인해주세요.');
      return;
    }

    const plannedQuantityNumber = Number(formData.plannedQuantity);
    if (!Number.isFinite(plannedQuantityNumber) || plannedQuantityNumber <= 0) {
      alert('계획 수량은 0보다 큰 숫자여야 합니다.');
      return;
    }

    const payload = {
      productItemId: Number(selectedProductItemId),
      bomId: Number(formData.bomId),
      factoryId: Number(formData.factoryId),
      plannedQuantity: plannedQuantityNumber,
      scheduledStartDate: formatDateTime(formData.scheduledStartDate),
      scheduledEndDate: formatDateTime(formData.scheduledEndDate),
      notes: formData.notes.trim() === '' ? undefined : formData.notes.trim(),
    };

    try {
      setLoading(true);
      await workOrdersAPI.createWorkOrder(payload);
      alert('작업 지시서가 등록되었습니다.');
      setFormData({
        bomId: '',
        factoryId: '',
        plannedQuantity: '',
        scheduledStartDate: '',
        scheduledEndDate: '',
        notes: '',
      });
    } catch (error) {
      console.error('작업 지시서 등록 실패:', error);
      const message =
        error?.response?.data?.message ??
        error?.message ??
        '작업 지시서 등록에 실패했습니다.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedBomName = selectedBom?.name ?? (selectedBom ? `BOM-${selectedBom.id}` : '');
  const selectedFactoryName = selectedFactory?.name ?? '';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl text-[#674529] mb-6">작업 지시서 등록</h3>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-4">
          <label className="w-32 text-sm text-gray-700">BOM 선택</label>
          <select
            value={formData.bomId}
            onChange={e => handleChange('bomId', e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
            required
          >
            <option value="">BOM을 선택하세요</option>
            {boms.map(bom => (
              <option key={bom.id} value={bom.id}>
                {bom.name ?? `BOM-${bom.id}`}
              </option>
            ))}
          </select>
        </div>

<<<<<<< HEAD
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">제목</label>
              <input
                type="text"
                placeholder="Title"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">작업 내용</label>
              <select className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400">
                <option>세척</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">원재료명</label>
              <input
                type="text"
                placeholder="딸기"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">작업량</label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="100"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <span className="text-sm text-gray-600">kg</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">작업 예정일</label>
              <input
                type="date"
                defaultValue="2025-10-21"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">담당자</label>
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option value="" disabled hidden>담당자 선택</option>
                {managerOptions.map((manager) => (
                  <option key={manager} value={manager}>
                    {manager}
                  </option>
                ))}
              </select>
            </div>

            {selectedManager && (
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm text-gray-700">이름</label>
                <select className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400">
                  <option value="" disabled hidden>이름 선택</option>
                  {namesByManager[selectedManager]?.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button className="px-8 py-2 bg-[#674529] text-white text-sm rounded hover:bg-[#553821] transition-colors">
                작업 지시서 등록
              </button>
            </div>
=======
        <div className="flex items-center gap-4">
          <label className="w-32 text-sm text-gray-700">완제품/반제품</label>
          <div className="flex-1 px-3 py-2 text-sm border border-gray-100 rounded bg-gray-50 text-gray-800">
            {selectedProductName || '-'}
>>>>>>> origin/label-print
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="w-32 text-sm text-gray-700">공장</label>
          <select
            value={formData.factoryId}
            onChange={e => handleChange('factoryId', e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
            required
          >
            <option value="">공장을 선택하세요</option>
            {factories.map(factory => (
              <option key={factory.id} value={factory.id}>
                {factory.name}
              </option>
            ))}
          </select>
        </div>

<<<<<<< HEAD
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">제목</label>
              <input
                type="text"
                placeholder="Title"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">BOM</label>
              <select className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400">
                <option value="" disabled hidden>BOM 선택</option>
                {bomOptions.map((bom) => (
                  <option key={bom} value={bom}>
                    {bom}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">수량</label>
              <input
                type="text"
                defaultValue="1"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">작업 예정일</label>
              <input
                type="date"
                defaultValue="2025-10-21"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-gray-700">담당자</label>
              <select
                value={selectedManagerBom}
                onChange={(e) => setSelectedManagerBom(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option value="" disabled hidden>담당자 선택</option>
                {managerOptions.map((manager) => (
                  <option key={manager} value={manager}>
                    {manager}
                  </option>
                ))}
              </select>
            </div>

            {selectedManagerBom && (
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm text-gray-700">이름</label>
                <select className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400">
                  <option value="" disabled hidden>이름 선택</option>
                  {namesByManager[selectedManagerBom]?.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button className="px-8 py-2 bg-[#674529] text-white text-sm rounded hover:bg-[#553821] transition-colors">
                작업 지시서 등록
              </button>
            </div>
=======
        <div className="flex items-center gap-4">
          <label className="w-32 text-sm text-gray-700">계획 수량</label>
          <div className="flex-1 flex items-center gap-2">
            <input
              type="number"
              min="1"
              step="1"
              value={formData.plannedQuantity}
              onChange={e => handleChange('plannedQuantity', e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="예: 100"
              required
            />
            <span className="text-sm text-gray-600">{selectedUnit}</span>
>>>>>>> origin/label-print
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="w-32 text-sm text-gray-700">작업 시작 예정</label>
          <input
            type="datetime-local"
            value={formData.scheduledStartDate}
            onChange={e => handleChange('scheduledStartDate', e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="w-32 text-sm text-gray-700">작업 종료 예정</label>
          <input
            type="datetime-local"
            value={formData.scheduledEndDate}
            onChange={e => handleChange('scheduledEndDate', e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        <div className="flex items-start gap-4">
          <label className="w-32 text-sm text-gray-700 pt-1">비고</label>
          <textarea
            value={formData.notes}
            onChange={e => handleChange('notes', e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
            rows={4}
            maxLength={500}
            placeholder="필요 시 작업 지시서에 대한 비고를 입력하세요. (최대 500자)"
          />
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-2.5 bg-[#674529] text-white text-sm rounded hover:bg-[#553821] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '등록 중...' : '작업 지시서 등록'}
          </button>
        </div>

        {(selectedBom || selectedFactory) && (
          <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
            {selectedBom && (
              <p className="mb-1">
                <span className="font-semibold text-gray-700">선택된 BOM:</span>{' '}
                {selectedBomName}
              </p>
            )}
            {selectedProductItemId && (
              <p className="mb-1">
                <span className="font-semibold text-gray-700">완제품/반제품 ID:</span>{' '}
                {selectedProductItemId}
              </p>
            )}
            {selectedFactory && (
              <p>
                <span className="font-semibold text-gray-700">공장:</span>{' '}
                {selectedFactoryName} (ID: {selectedFactory.id})
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default WorkOrderForm;
