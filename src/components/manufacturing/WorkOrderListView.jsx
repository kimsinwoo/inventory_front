// src/pages/WorkOrder/WorkOrderListView.jsx
import { useState, useEffect } from 'react';
import { workOrdersAPI } from '../../api';

const WorkOrderListView = () => {
  const [filterType, setFilterType] = useState('전체');
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadWorkOrders();
  }, [filterType]);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType === '내 작업') {
        // 필요 시 현재 사용자 기준 필터링
        // params.created_by_user_id = currentUser.id;
      }
      const response = await workOrdersAPI.getWorkOrders(params);
      const root = response.data ?? {};
      const rows = Array.isArray(root) ? root : root.rows ?? root.data ?? [];
      const list = Array.isArray(rows) ? rows : [];

      const formatted = list.map(order => ({
        id: order.id,
        workOrderNumber: order.work_order_number ?? order.workOrderNumber ?? '-',
        productName:
          order.product?.name ??
          order.product_name ??
          order.productName ??
          '-',
        bomName: order.bom?.name ?? order.bom_name ?? order.bomName ?? '-',
        quantity: order.planned_quantity
          ? `${order.planned_quantity} ${order.unit ?? ''}`.trim()
          : '-',
        scheduledStartDate: order.scheduled_start_date
          ? String(order.scheduled_start_date).split('T')[0]
          : '-',
        scheduledEndDate: order.scheduled_end_date
          ? String(order.scheduled_end_date).split('T')[0]
          : '-',
        factory:
          order.factory?.name ?? order.factory_name ?? order.factoryName ?? '-',
        status: order.status ?? 'PENDING',
      }));

      setWorkOrders(formatted);
    } catch (error) {
      console.error('작업 지시서 목록 로드 실패:', error);
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl text-[#674529]">작업 지시서 목록</h3>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none"
        >
          <option value="전체">전체</option>
          <option value="내 작업">내 작업</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">불러오는 중...</div>
      ) : workOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">작업 지시서가 없습니다.</div>
      ) : (
        <div className="space-y-4">
          {workOrders.map(order => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-5"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    {order.workOrderNumber}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {order.productName} / {order.bomName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">
                    공장: {order.factory}
                  </p>
                  <p className="text-xs text-gray-500">
                    상태: {order.status}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-x-8 gap-y-3 text-sm">
                <div>
                  <span className="text-gray-600 block">계획 수량</span>
                  <p className="text-gray-900 font-medium">{order.quantity}</p>
                </div>
                <div>
                  <span className="text-gray-600 block">시작 예정일</span>
                  <p className="text-gray-900 font-medium">
                    {order.scheduledStartDate}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 block">종료 예정일</span>
                  <p className="text-gray-900 font-medium">
                    {order.scheduledEndDate}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 block">ID</span>
                  <p className="text-gray-900 font-medium">{order.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkOrderListView;
