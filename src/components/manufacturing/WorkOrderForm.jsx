import { useState, useEffect } from 'react';
import { ClipboardList, Package, Calendar, User, FileText, Plus, X, Save, CheckCircle, PlayCircle } from 'lucide-react';
import { factoryService, itemService, transactionService } from '../../services';
import AlertModal from '../common/AlertModal';
import ProductionCompleteModal from './ProductionCompleteModal';

const WorkOrderForm = ({ factoryId, factoryName }) => {
  const [formData, setFormData] = useState({
    orderNumber: `WO-${Date.now()}`,
    orderDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    factoryId: factoryId || '',
    managerId: '',
    managerName: '',
    status: 'PENDING',
    note: '',
    items: [],
  });

  const [factories, setFactories] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [completeModal, setCompleteModal] = useState({ isOpen: false, order: null });

  useEffect(() => {
    fetchFactories();
    fetchItems();
    loadWorkOrders();
  }, []);

  useEffect(() => {
    if (factoryId) {
      setFormData(prev => ({ ...prev, factoryId: parseInt(factoryId) }));
    }
  }, [factoryId]);

  const fetchFactories = async () => {
    try {
      const response = await factoryService.getAll();
      setFactories(response.data || []);
    } catch (error) {
      console.error('공장 목록 조회 실패:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await itemService.getAll();
      setItemList(response.data || []);
    } catch (error) {
      console.error('품목 목록 조회 실패:', error);
    }
  };

  const loadWorkOrders = () => {
    try {
      const saved = localStorage.getItem('workOrders');
      if (saved) {
        setWorkOrders(JSON.parse(saved));
      }
    } catch (error) {
      console.error('작업지시서 로드 실패:', error);
    }
  };

  const saveWorkOrders = (orders) => {
    try {
      localStorage.setItem('workOrders', JSON.stringify(orders));
      setWorkOrders(orders);
    } catch (error) {
      console.error('작업지시서 저장 실패:', error);
    }
  };

  const showAlert = (message, type = 'info', title = '알림') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: Date.now(),
          itemId: '',
          itemName: '',
          quantity: '',
          unit: 'kg',
          note: '',
        },
      ],
    });
  };

  const handleRemoveItem = (id) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id),
    });
  };

  const handleItemChange = (id, field, value) => {
    setFormData({
      ...formData,
      items: formData.items.map(item => {
        if (item.id === id) {
          if (field === 'itemId') {
            const selectedItem = itemList.find(i => i.id === parseInt(value));
            return {
              ...item,
              itemId: value,
              itemName: selectedItem?.name || '',
              unit: selectedItem?.unit || 'kg',
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      }),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.targetDate) {
      showAlert('목표 완료일을 입력해주세요.', 'error');
      return;
    }

    if (!formData.factoryId) {
      showAlert('공장을 선택해주세요.', 'error');
      return;
    }

    if (!formData.managerName) {
      showAlert('담당자명을 입력해주세요.', 'error');
      return;
    }

    if (formData.items.length === 0) {
      showAlert('최소 1개 이상의 품목을 추가해주세요.', 'error');
      return;
    }

    const invalidItems = formData.items.filter(item => !item.itemId || !item.quantity);
    if (invalidItems.length > 0) {
      showAlert('모든 품목의 정보를 입력해주세요.', 'error');
      return;
    }

    // 작업지시서 저장
    const newWorkOrder = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    const updatedOrders = [newWorkOrder, ...workOrders];
    saveWorkOrders(updatedOrders);

    showAlert('작업지시서가 저장되었습니다.', 'success');

    // 폼 초기화
    setFormData({
      orderNumber: `WO-${Date.now()}`,
      orderDate: new Date().toISOString().split('T')[0],
      targetDate: '',
      factoryId: factoryId || '',
      managerId: '',
      managerName: '',
      status: 'PENDING',
      note: '',
      items: [],
    });
  };

  const handleStartProduction = (orderId) => {
    const updatedOrders = workOrders.map(order => {
      if (order.id === orderId) {
        return { ...order, status: 'IN_PROGRESS', startedAt: new Date().toISOString() };
      }
      return order;
    });
    saveWorkOrders(updatedOrders);
    showAlert('생산이 시작되었습니다.', 'success');
  };

  const handleOpenCompleteModal = (order) => {
    setCompleteModal({ isOpen: true, order: { ...order, factoryName } });
  };

  const handleCloseCompleteModal = () => {
    setCompleteModal({ isOpen: false, order: null });
  };

  const handleCompleteProduction = async (orderWithActualQuantities) => {
    handleCloseCompleteModal();

    try {
      // 각 품목별로 재고 입고 처리 (실제 생산량 사용)
      for (const item of orderWithActualQuantities.items) {
        const actualQty = item.actualQuantity || item.quantity;
        
        try {
          await transactionService.receive({
            itemId: parseInt(item.itemId),
            factoryId: parseInt(orderWithActualQuantities.factoryId),
            quantity: parseFloat(actualQty),
            unit: item.unit,
            note: orderWithActualQuantities.productionNote 
              ? `작업지시서 ${orderWithActualQuantities.orderNumber} 생산 완료 - ${orderWithActualQuantities.productionNote}`
              : `작업지시서 ${orderWithActualQuantities.orderNumber} 생산 완료`,
            lotNumber: `PROD-${orderWithActualQuantities.orderNumber}-${item.itemId}-${Date.now()}`,
            transactionType: 'RECEIVE',
          });
          console.log(`품목 ${item.itemName} 재고 ${actualQty}${item.unit} 추가 완료`);
        } catch (error) {
          console.error(`품목 ${item.itemName} 재고 추가 실패:`, error);
          throw error;
        }
      }

      // 작업지시서 상태 업데이트
      const updatedOrders = workOrders.map(o => {
        if (o.id === orderWithActualQuantities.id) {
          return { 
            ...o, 
            status: 'COMPLETED', 
            completedAt: new Date().toISOString(),
            completedBy: '현재 사용자', // 실제 사용자 정보로 대체
            actualItems: orderWithActualQuantities.items,
            productionNote: orderWithActualQuantities.productionNote,
          };
        }
        return o;
      });
      saveWorkOrders(updatedOrders);

      const totalItems = orderWithActualQuantities.items.reduce((sum, item) => {
        return sum + (parseFloat(item.actualQuantity) || parseFloat(item.quantity));
      }, 0);

      showAlert(
        `생산이 완료되었습니다.\n${orderWithActualQuantities.items.length}개 품목, 총 ${totalItems.toFixed(2)}단위가 재고에 추가되었습니다.`,
        'success',
        '생산 완료'
      );
    } catch (error) {
      console.error('생산 완료 처리 실패:', error);
      showAlert(
        '생산 완료 처리 중 오류가 발생했습니다.\n일부 품목의 재고 추가가 실패했을 수 있습니다.',
        'error',
        '오류 발생'
      );
    }
  };

  const handleCancelOrder = (orderId) => {
    if (!window.confirm('작업지시서를 취소하시겠습니까?')) {
      return;
    }

    const updatedOrders = workOrders.map(order => {
      if (order.id === orderId) {
        return { ...order, status: 'CANCELLED', cancelledAt: new Date().toISOString() };
      }
      return order;
    });
    saveWorkOrders(updatedOrders);
    showAlert('작업지시서가 취소되었습니다.', 'info');
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

  const filteredWorkOrders = factoryId
    ? workOrders.filter(order => order.factoryId === parseInt(factoryId))
    : workOrders;

  return (
    <div className="space-y-6">
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                지시서 번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                readOnly
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                작성일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                목표 완료일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                담당자명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                placeholder="담당자명 입력"
              />
            </div>
          </div>

          {/* 품목 리스트 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                생산 품목 <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-1 rounded-lg bg-[#674529] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#553821]"
              >
                <Plus className="h-4 w-4" />
                <span>품목 추가</span>
              </button>
            </div>

            {formData.items.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">품목을 추가해주세요</p>
              </div>
            ) : (
              <div className="space-y-2">
                {formData.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="flex-1 grid grid-cols-1 gap-2 md:grid-cols-4">
                      <select
                        value={item.itemId}
                        onChange={(e) => handleItemChange(item.id, 'itemId', e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                      >
                        <option value="">품목 선택</option>
                        {itemList.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                        placeholder="수량"
                      />

                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                        placeholder="단위"
                      />

                      <input
                        type="text"
                        value={item.note}
                        onChange={(e) => handleItemChange(item.id, 'note', e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                        placeholder="비고"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="flex-shrink-0 rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 비고 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">비고</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
              placeholder="특이사항 및 요청사항을 입력하세요"
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="flex items-center space-x-2 rounded-lg bg-[#674529] px-6 py-2.5 font-medium text-white hover:bg-[#553821]"
            >
              <Save className="h-5 w-5" />
              <span>지시서 저장</span>
            </button>
          </div>
        </form>
      </div>

      {/* 작업지시서 목록 */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">작업지시서 목록</h3>

        {filteredWorkOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <ClipboardList className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4">작성된 작업지시서가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWorkOrders.map((order) => (
              <div key={order.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-900">{order.orderNumber}</h4>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-gray-500">작성일</p>
                        <p className="font-medium text-gray-900">{order.orderDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">목표일</p>
                        <p className="font-medium text-gray-900">{order.targetDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">공장</p>
                        <p className="font-medium text-gray-900">
                          {factories.find(f => f.id === order.factoryId)?.name || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">담당자</p>
                        <p className="font-medium text-gray-900">{order.managerName}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-gray-500">생산 품목</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {order.items.map((item, index) => (
                          <span key={index} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200">
                            {item.itemName}: {item.quantity} {item.unit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {order.note && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">비고</p>
                        <p className="text-sm text-gray-700">{order.note}</p>
                      </div>
                    )}

                    {/* 시작/완료 시간 표시 */}
                    {(order.startedAt || order.completedAt) && (
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                        {order.startedAt && (
                          <div>
                            <span>시작: </span>
                            <span className="font-medium text-gray-700">
                              {new Date(order.startedAt).toLocaleString('ko-KR')}
                            </span>
                          </div>
                        )}
                        {order.completedAt && (
                          <div>
                            <span>완료: </span>
                            <span className="font-medium text-gray-700">
                              {new Date(order.completedAt).toLocaleString('ko-KR')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex flex-col space-y-2 ml-4">
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
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center space-x-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                        >
                          <X className="h-4 w-4" />
                          <span>취소</span>
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

      <ProductionCompleteModal
        isOpen={completeModal.isOpen}
        onClose={handleCloseCompleteModal}
        onComplete={handleCompleteProduction}
        order={completeModal.order}
      />
    </div>
  );
};

export default WorkOrderForm;

