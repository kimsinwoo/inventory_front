import { useState, useEffect } from "react";
import { workOrdersAPI } from "../../api";

const Factory2OrderList = () => {
    const [filterType, setFilterType] = useState('전체');
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWorkOrders();
    }, [filterType]);

    const loadWorkOrders = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterType === '내 작업') {
                // 현재 사용자의 작업만 필터링 (나중에 구현)
                // params.user_id = currentUser.id;
            }
            const response = await workOrdersAPI.getWorkOrders(params);
            const data = response.data?.data || response.data || [];
            const ordersList = Array.isArray(data) ? data : [];
            
            // API 데이터를 컴포넌트 형식에 맞게 변환
            const formattedOrders = ordersList.map(order => ({
                id: order.id || `WO-${order.id}`,
                title: order.title || '작업 지시서',
                product: order.work_content || order.product_name || `${order.title || '작업'} - ${order.quantity || 0}개`,
                material: order.material_name || order.material || '-',
                quantity: order.quantity ? `${order.quantity} ${order.unit || 'kg'}` : '-',
                deadlineTime: order.scheduled_date ? order.scheduled_date.split('T')[0] : order.deadline_time || '-',
                manager: order.manager?.full_name || order.manager_name || order.manager || '-',
            }));
            
            setWorkOrders(formattedOrders);
        } catch (error) {
            console.error('제조 지시서 목록 로드 실패:', error);
            setWorkOrders([]);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div>
        <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl text-[#674529]">제조 지시서 목록</h3>
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

        {loading ? (
            <div className="text-center py-8 text-gray-500">불러오는 중...</div>
        ) : workOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">제조 지시서가 없습니다.</div>
        ) : (
            <div className="space-y-6">
                {workOrders.map((order) => (
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
                    <p className="text-gray-900 font-medium">{order.id}</p>
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
                    <p className="text-gray-900 font-medium">{order.deadlineTime}</p>
                </div>
                </div>
            </div>
                ))}
            </div>
        )}
    </div>
    </div>
    );
}

export default Factory2OrderList;