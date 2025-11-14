import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useDispatch, useSelector } from 'react-redux';
import { fetchWorkOrders } from '../../store/modules/manufacturing/action';
import { selectWorkOrders, selectWorkOrdersLoading } from '../../store/modules/manufacturing/selectors';
=======
import { workOrdersAPI } from '../../api';
>>>>>>> origin/label-print

const WorkOrderList = () => {
  const dispatch = useDispatch();
  const [filterType, setFilterType] = useState('전체');
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
  // Redux에서 작업 지시서 목록 가져오기
  const workOrdersFromRedux = useSelector(selectWorkOrders);
  const loading = useSelector(selectWorkOrdersLoading);

  // 컴포넌트 마운트 시 작업 지시서 목록 조회
  useEffect(() => {
    dispatch(fetchWorkOrders.request());
  }, [dispatch]);

  const workOrders = workOrdersFromRedux || [];
=======
  useEffect(() => {
    const loadWorkOrders = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filterType !== '전체') {
          // 필터링 로직 추가 가능
        }
        const response = await workOrdersAPI.getWorkOrders(params);
        const data = response.data?.data || response.data || [];
        setWorkOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('작업 지시서 목록 로드 실패:', error);
        setWorkOrders([]);
      } finally {
        setLoading(false);
      }
    };
    loadWorkOrders();
  }, [filterType]);
>>>>>>> origin/label-print

  return (
    <div>
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl text-[#674529]">작업 지시서 목록</h3>
          {loading && (
            <span className="text-sm text-gray-500">로딩 중...</span>
          )}
        </div>

        <div className="mb-6">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none"
          >
            <option value="전체">전체</option>
            <option value="내 작업">내 작업</option>
          </select>
        </div>

        <div className="space-y-6">
<<<<<<< HEAD
          {workOrders.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              작업 지시서가 없습니다.
            </div>
          ) : (
            workOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-1">{order.title}</h4>
                    <p className="text-sm text-gray-600">{order.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">작업자: {order.manager}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-x-8 gap-y-3 text-sm">
                  <div className="justify-between">
                    <span className="text-gray-600">원재료코드</span>
                    <p className="text-gray-900 font-medium">{order.materialCode}</p>
                  </div>
                  <div className="justify-between">
                    <span className="text-gray-600">원재료명</span>
                    <p className="text-gray-900 font-medium">{order.material}</p>
                  </div>
                  <div className="justify-between">
                    <span className="text-gray-600">필요량</span>
                    <p className="text-gray-900 font-medium">{order.quantity}</p>
                  </div>
                  <div className="justify-between">
                    <span className="text-gray-600">작업예정일</span>
                    <p className="text-gray-900 font-medium">{order.deadlineDate}</p>
                  </div>
                </div>
              </div>
            ))
=======
          {loading ? (
            <div className="text-center py-8 text-gray-500">불러오는 중...</div>
          ) : workOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">작업 지시서가 없습니다.</div>
          ) : (
            workOrders.map((order) => {
              const workOrderNumber = order.work_order_number || order.id || '';
              const productItem = order.ProductItem || order.productItem || {};
              const scheduledStartDate = order.scheduled_start_date || order.scheduledStartDate || '';
              const plannedQuantity = order.planned_quantity || order.plannedQuantity || 0;
              const unit = productItem.unit || 'EA';
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-1">{workOrderNumber}</h4>
                      <p className="text-sm text-gray-600">{productItem.name || '제품명 없음'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">상태: {order.status || 'PENDING'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-x-8 gap-y-3 text-sm">
                    <div className="justify-between">
                      <span className="text-gray-600">작업번호</span>
                      <p className="text-gray-900 font-medium">{workOrderNumber}</p>
                    </div>
                    <div className="justify-between">
                      <span className="text-gray-600">제품명</span>
                      <p className="text-gray-900 font-medium">{productItem.name || ''}</p>
                    </div>
                    <div className="justify-between">
                      <span className="text-gray-600">계획 수량</span>
                      <p className="text-gray-900 font-medium">{plannedQuantity} {unit}</p>
                    </div>              
                    <div className="justify-between">
                      <span className="text-gray-600">작업예정일</span>
                      <p className="text-gray-900 font-medium">{scheduledStartDate ? scheduledStartDate.split('T')[0] : ''}</p>
                    </div>
                  </div>
                </div>
              );
            })
>>>>>>> origin/label-print
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkOrderList;
