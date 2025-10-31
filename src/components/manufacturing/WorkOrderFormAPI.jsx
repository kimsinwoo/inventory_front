import { useState, useEffect } from 'react';
import { ClipboardList, Package, Plus, X, Save, CheckCircle, PlayCircle, AlertCircle } from 'lucide-react';
import { factoryService, itemService, bomService, workOrderService } from '../../services';
import AlertModal from '../common/AlertModal';
import ProductionCompleteModalAPI from './ProductionCompleteModalAPI';

const WorkOrderFormAPI = ({ factoryId, factoryName }) => {
  const [formData, setFormData] = useState({
    productItemId: '',
    bomId: '',
    factoryId: factoryId || '',
    plannedQuantity: '',
    scheduledStartDate: '',
    scheduledEndDate: '',
    notes: '',
  });

  const [factories, setFactories] = useState([]);
  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedBomDetails, setSelectedBomDetails] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [completeModal, setCompleteModal] = useState({ isOpen: false, order: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFactories();
    fetchProducts();
    fetchBoms();
    fetchWorkOrders();
  }, []);

  useEffect(() => {
    if (factoryId) {
      setFormData(prev => ({ ...prev, factoryId: parseInt(factoryId) }));
      fetchWorkOrders();
    }
  }, [factoryId]);

  useEffect(() => {
    if (formData.bomId) {
      fetchBomDetails(formData.bomId);
    }
  }, [formData.bomId]);

  const fetchFactories = async () => {
    try {
      const response = await factoryService.getAll();
      setFactories(response.data || []);
    } catch (error) {
      console.error('공장 목록 조회 실패:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await itemService.getAll();
      console.log('품목 API 응답:', response);
      
      // 완제품만 필터링 (code가 'FIN'으로 시작하는 것)
      const allItems = response.data || response || [];
      console.log('전체 품목:', allItems);
      
      const finishedProducts = allItems.filter(
        item => item.code && item.code.toUpperCase().startsWith('FIN')
      );
      console.log('완제품 필터링 결과 (FIN으로 시작):', finishedProducts);
      
      setProducts(finishedProducts);
      
      // 완제품이 없으면 경고
      if (finishedProducts.length === 0) {
        console.warn('⚠️ 완제품(FIN으로 시작하는 품목)이 없습니다.');
        showAlert('완제품(품목코드가 FIN으로 시작)이 없습니다. 먼저 완제품을 등록해주세요.', 'warning');
      }
    } catch (error) {
      console.error('완제품 목록 조회 실패:', error);
      showAlert('완제품 목록을 불러오는데 실패했습니다.', 'error');
    }
  };

  const fetchBoms = async () => {
    try {
      const response = await bomService.getAll();
      console.log('BOM API 응답:', response);
      
      // 백엔드 응답이 {ok: true, rows: [...]} 형태
      const bomList = response.rows || response.data || [];
      console.log('BOM 목록:', bomList);
      
      setBoms(bomList);
      
      if (bomList.length === 0) {
        console.warn('⚠️ BOM이 없습니다.');
        showAlert('등록된 BOM이 없습니다. 먼저 BOM을 등록해주세요.', 'warning');
      }
    } catch (error) {
      console.error('BOM 목록 조회 실패:', error);
      showAlert('BOM 목록을 불러오는데 실패했습니다.', 'error');
    }
  };

  const fetchBomDetails = async (bomId) => {
    try {
      const response = await bomService.getById(bomId);
      console.log('BOM 상세 API 응답:', response);
      
      // response.data 또는 response 자체가 BOM 상세 정보
      const bomDetails = response.data || response;
      console.log('BOM 상세 정보:', bomDetails);
      
      setSelectedBomDetails(bomDetails);
    } catch (error) {
      console.error('BOM 상세 조회 실패:', error);
      setSelectedBomDetails(null);
    }
  };

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const params = factoryId ? { factoryId: parseInt(factoryId) } : {};
      const response = await workOrderService.getAll(params);
      setWorkOrders(response.data || []);
    } catch (error) {
      console.error('작업지시서 목록 조회 실패:', error);
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'info', title = '알림') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.productItemId) {
      showAlert('생산할 완제품을 선택해주세요.', 'error');
      return;
    }

    if (!formData.bomId) {
      showAlert('BOM을 선택해주세요.', 'error');
      return;
    }

    if (!formData.factoryId) {
      showAlert('생산 공장을 선택해주세요.', 'error');
      return;
    }

    if (!formData.plannedQuantity || formData.plannedQuantity <= 0) {
      showAlert('계획 생산 수량을 입력해주세요.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productItemId: parseInt(formData.productItemId),
        bomId: parseInt(formData.bomId),
        factoryId: parseInt(formData.factoryId),
        plannedQuantity: parseFloat(formData.plannedQuantity),
      };

      if (formData.scheduledStartDate) {
        payload.scheduledStartDate = new Date(formData.scheduledStartDate).toISOString();
      }

      if (formData.scheduledEndDate) {
        payload.scheduledEndDate = new Date(formData.scheduledEndDate).toISOString();
      }

      if (formData.notes) {
        payload.notes = formData.notes;
      }

      const response = await workOrderService.create(payload);
      showAlert(response.message || '작업지시서가 생성되었습니다.', 'success');

      // 폼 초기화
      setFormData({
        productItemId: '',
        bomId: '',
        factoryId: factoryId || '',
        plannedQuantity: '',
        scheduledStartDate: '',
        scheduledEndDate: '',
        notes: '',
      });
      setSelectedBomDetails(null);

      // 목록 새로고침
      fetchWorkOrders();
    } catch (error) {
      console.error('작업지시서 생성 실패:', error);
      showAlert(error.response?.data?.message || '작업지시서 생성에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartProduction = async (orderId) => {
    try {
      const response = await workOrderService.start(orderId);
      showAlert(response.message || '생산이 시작되었습니다.', 'success');
      fetchWorkOrders();
    } catch (error) {
      console.error('작업 시작 실패:', error);
      showAlert(error.response?.data?.message || '작업 시작에 실패했습니다.', 'error');
    }
  };

  const handleOpenCompleteModal = (order) => {
    setCompleteModal({ isOpen: true, order });
  };

  const handleCloseCompleteModal = () => {
    setCompleteModal({ isOpen: false, order: null });
  };

  const handleCompleteProduction = async (orderId, completeData) => {
    handleCloseCompleteModal();
    
    try {
      const response = await workOrderService.complete(orderId, completeData);
      
      // 상세 결과 표시
      const result = response.data;
      const consumedCount = result.consumedMaterials?.length || 0;
      const producedName = result.producedProduct?.itemName || '완제품';
      const producedQty = result.producedProduct?.quantity || 0;
      const producedUnit = result.producedProduct?.unit || '';

      // 소비된 원재료 상세 정보
      let consumedDetails = '';
      if (result.consumedMaterials && result.consumedMaterials.length > 0) {
        consumedDetails = '\n\n📋 소비된 원재료:\n';
        result.consumedMaterials.forEach(material => {
          consumedDetails += `  • ${material.itemName}: ${material.consumed} ${material.unit}`;
          if (material.traces && material.traces.length > 0) {
            consumedDetails += ` (LOT ${material.traces.length}개)\n`;
          } else {
            consumedDetails += '\n';
          }
        });
      }

      showAlert(
        `생산이 완료되었습니다!\n\n` +
        `📦 생산: ${producedName} ${producedQty}${producedUnit}\n` +
        `🔧 원재료 ${consumedCount}종 자동 출고 완료\n` +
        `✅ 완제품 재고 자동 입고 완료` +
        consumedDetails,
        'success',
        '생산 완료'
      );

      fetchWorkOrders();
    } catch (error) {
      console.error('생산 완료 처리 실패:', error);
      
      const errorData = error.response?.data;
      let errorMessage = errorData?.message || '생산 완료 처리에 실패했습니다.';
      
      // 재고 부족 에러인 경우 상세 정보 추가
      if (errorMessage.includes('출고 가능한 재고가 없습니다')) {
        errorMessage = `❌ ${errorMessage}\n\n` +
          `💡 해결 방법:\n` +
          `1. 입고관리에서 해당 원재료를 먼저 입고하세요\n` +
          `2. 입고할 공장이 작업지시서의 생산 공장과 동일한지 확인하세요\n` +
          `3. 재고관리에서 현재 재고 현황을 확인하세요`;
      } else if (errorMessage.includes('재고가 부족합니다')) {
        // 재고 부족 상세 정보가 있으면 추가
        if (errorData?.detail && errorData.detail.length > 0) {
          errorMessage += '\n\n📋 부족한 원재료:\n';
          errorData.detail.forEach(item => {
            errorMessage += `  • ${item.itemName}: 필요 ${item.required}${item.unit}, 현재 ${item.available}${item.unit}\n`;
          });
          errorMessage += '\n💡 부족한 원재료를 먼저 입고하세요.';
        }
      }
      
      showAlert(errorMessage, 'error', '생산 완료 실패');
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('취소 사유를 입력하세요:');
    if (reason === null) return;

    try {
      const response = await workOrderService.cancel(orderId, reason);
      showAlert(response.message || '작업지시서가 취소되었습니다.', 'info');
      fetchWorkOrders();
    } catch (error) {
      console.error('작업 취소 실패:', error);
      showAlert(error.response?.data?.message || '작업 취소에 실패했습니다.', 'error');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('작업지시서를 삭제하시겠습니까?')) return;

    try {
      const response = await workOrderService.delete(orderId);
      showAlert(response.message || '작업지시서가 삭제되었습니다.', 'success');
      fetchWorkOrders();
    } catch (error) {
      console.error('작업지시서 삭제 실패:', error);
      showAlert(error.response?.data?.message || '작업지시서 삭제에 실패했습니다.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: '대기', color: 'bg-yellow-100 text-yellow-800' },
      IN_PROGRESS: { label: '진행중', color: 'bg-blue-100 text-blue-800' },
      COMPLETED: { label: '완료', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: '취소', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 디버깅 정보 */}
      <div className="rounded-lg bg-gray-100 p-3 text-xs">
        <p className="font-semibold text-gray-700">🔍 로딩 상태:</p>
        <p className="text-gray-600">완제품: {products.length}개 | BOM: {boms.length}개 | 공장: {factories.length}개</p>
      </div>

      {/* 작업지시서 작성 폼 */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center space-x-2">
          <ClipboardList className="h-6 w-6 text-[#674529]" />
          <h2 className="text-xl font-semibold text-[#674529]">
            작업지시서 작성 {factoryName && `- ${factoryName}`}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                생산할 완제품 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.productItemId}
                onChange={(e) => setFormData({ ...formData, productItemId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
              >
                <option value="">
                  {products.length === 0 ? '로딩 중...' : '완제품을 선택하세요'}
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
              {products.length === 0 && (
                <p className="mt-1 text-xs text-red-600">
                  ⚠️ 품목이 없습니다. 먼저 기초정보에서 완제품을 등록하세요.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                BOM (자재명세서) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.bomId}
                onChange={(e) => setFormData({ ...formData, bomId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
              >
                <option value="">
                  {boms.length === 0 ? '로딩 중...' : 'BOM을 선택하세요'}
                </option>
                {boms.map((bom) => (
                  <option key={bom.id} value={bom.id}>
                    {bom.name}
                  </option>
                ))}
              </select>
              {boms.length === 0 && (
                <p className="mt-1 text-xs text-red-600">
                  ⚠️ BOM이 없습니다. 먼저 기초정보에서 BOM을 등록하세요.
                </p>
              )}
            </div>
          </div>

          {/* BOM 상세 정보 표시 */}
          {selectedBomDetails && (
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-blue-900">필요 원재료</h4>
              <div className="space-y-1">
                {selectedBomDetails.components?.map((comp, index) => (
                  <div key={index} className="flex items-center justify-between text-sm text-blue-800">
                    <span>{comp.item?.name || comp.itemName}</span>
                    <span className="font-medium">
                      {comp.quantity} {comp.unit} (완제품 1단위당)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                생산 공장 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.factoryId}
                onChange={(e) => setFormData({ ...formData, factoryId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                disabled={!!factoryId}
              >
                <option value="">선택</option>
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                계획 생산 수량 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.plannedQuantity}
                onChange={(e) => setFormData({ ...formData, plannedQuantity: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                placeholder="100"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">단위</label>
              <input
                type="text"
                value={products.find(p => p.id === parseInt(formData.productItemId))?.unit || 'kg'}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                생산 예정 시작일
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledStartDate}
                onChange={(e) => setFormData({ ...formData, scheduledStartDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                생산 예정 완료일
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledEndDate}
                onChange={(e) => setFormData({ ...formData, scheduledEndDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
              />
            </div>
          </div>

          {/* 비고 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">비고</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
              placeholder="특이사항 및 요청사항을 입력하세요 (최대 500자)"
            />
          </div>

          {/* 안내 메시지 */}
          <div className="rounded-lg bg-yellow-50 p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">생산 완료 시 자동 처리:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  <li>BOM 기반 원재료 FIFO 자동 출고</li>
                  <li>완제품 자동 입고 및 바코드 생성</li>
                  <li>모든 재고 이동 이력 자동 기록</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 rounded-lg bg-[#674529] px-6 py-2.5 font-medium text-white hover:bg-[#553821] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? '저장 중...' : '지시서 저장'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 작업지시서 목록 */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">작업지시서 목록</h3>

        {loading ? (
          <div className="py-12 text-center text-gray-500">로딩 중...</div>
        ) : workOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <ClipboardList className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4">작성된 작업지시서가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workOrders.map((order) => (
              <div key={order.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-900">
                        {order.work_order_number || order.workOrderNumber}
                      </h4>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-gray-500">완제품</p>
                        <p className="font-medium text-gray-900">
                          {order.product?.name || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">계획 수량</p>
                        <p className="font-medium text-gray-900">
                          {order.planned_quantity || order.plannedQuantity} {order.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">공장</p>
                        <p className="font-medium text-gray-900">
                          {order.factory?.name || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">BOM</p>
                        <p className="font-medium text-gray-900">
                          {order.bom?.name || '-'}
                        </p>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">비고</p>
                        <p className="text-sm text-gray-700">{order.notes}</p>
                      </div>
                    )}

                    {(order.actual_start_date || order.actual_end_date) && (
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                        {order.actual_start_date && (
                          <div>
                            <span>시작: </span>
                            <span className="font-medium text-gray-700">
                              {new Date(order.actual_start_date).toLocaleString('ko-KR')}
                            </span>
                          </div>
                        )}
                        {order.actual_end_date && (
                          <div>
                            <span>완료: </span>
                            <span className="font-medium text-gray-700">
                              {new Date(order.actual_end_date).toLocaleString('ko-KR')}
                            </span>
                          </div>
                        )}
                        {order.actual_quantity && (
                          <div>
                            <span>실제 생산: </span>
                            <span className="font-medium text-green-700">
                              {order.actual_quantity} {order.unit}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="ml-4 flex flex-col space-y-2">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStartProduction(order.id)}
                          className="flex items-center space-x-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          <PlayCircle className="h-4 w-4" />
                          <span>생산 시작</span>
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="flex items-center space-x-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                        >
                          <X className="h-4 w-4" />
                          <span>삭제</span>
                        </button>
                      </>
                    )}

                    {order.status === 'IN_PROGRESS' && (
                      <>
                        <button
                          onClick={() => handleOpenCompleteModal(order)}
                          className="flex items-center space-x-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>생산 완료</span>
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center space-x-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                        >
                          <X className="h-4 w-4" />
                          <span>취소</span>
                        </button>
                      </>
                    )}

                    {order.status === 'COMPLETED' && (
                      <div className="rounded-lg bg-green-50 px-4 py-2 text-center">
                        <CheckCircle className="mx-auto h-5 w-5 text-green-600" />
                        <p className="mt-1 text-xs font-medium text-green-600">완료됨</p>
                      </div>
                    )}

                    {order.status === 'CANCELLED' && (
                      <div className="rounded-lg bg-red-50 px-4 py-2 text-center">
                        <X className="mx-auto h-5 w-5 text-red-600" />
                        <p className="mt-1 text-xs font-medium text-red-600">취소됨</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      <ProductionCompleteModalAPI
        isOpen={completeModal.isOpen}
        onClose={handleCloseCompleteModal}
        onComplete={handleCompleteProduction}
        order={completeModal.order}
      />
    </div>
  );
};

export default WorkOrderFormAPI;

