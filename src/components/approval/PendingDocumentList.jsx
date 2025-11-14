<<<<<<< HEAD
import { FileText, Calendar, User, CheckCircle, XCircle, Eye } from 'lucide-react';

const PendingDocumentList = () => {
    const pendingData = [
        {
            id: 1,
            docNumber: 'DOC-2024-0001',
            title: '불량 보고서',
            document: '불량 보고서',
            user: '현재사용자',
            badge: '결재 대기',
            createdDate: '2024-01-15'
        },
        {
            id: 2,
            docNumber: 'DOC-2024-0002',
            title: '1공장 생산 완료',
            document: '생산 완료 보고서',
            user: '현재사용자',
            badge: '결재 대기',
            createdDate: '2024-01-14'
        },
    ]
=======
import { useState, useEffect } from 'react';
import { approvalAPI } from '../../api';

const PendingDocumentList = () => {
    const [pendingData, setPendingData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPendingDocuments();
    }, []);

    const loadPendingDocuments = async () => {
        try {
            setLoading(true);
            const response = await approvalAPI.getInbox();
            const data = response.data?.data || response.data || [];
            const docsList = Array.isArray(data) ? data : [];
            
            // PENDING 상태인 문서만 필터링
            const pendingDocs = docsList
                .filter(doc => doc.status === 'PENDING' || doc.status === 'pending')
                .map(doc => ({
                    id: doc.id,
                    title: doc.title || doc.document_title || '제목 없음',
                    document: doc.type || doc.document_type || '문서',
                    user: doc.author?.name || doc.author_name || doc.created_by || '작성자 없음',
                    badge: '결재 대기',
                    status: doc.status,
                }));
            
            setPendingData(pendingDocs);
        } catch (error) {
            console.error('결재 대기 문서 로드 실패:', error);
            setPendingData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            if (!window.confirm('이 문서를 승인하시겠습니까?')) {
                return;
            }
            await approvalAPI.approve(id, {});
            alert('문서가 승인되었습니다.');
            loadPendingDocuments();
        } catch (error) {
            console.error('문서 승인 실패:', error);
            alert('문서 승인에 실패했습니다.');
        }
    };

    const handleReject = async (id) => {
        try {
            const reason = window.prompt('반려 사유를 입력하세요:');
            if (!reason) {
                return;
            }
            await approvalAPI.reject(id, { reason });
            alert('문서가 반려되었습니다.');
            loadPendingDocuments();
        } catch (error) {
            console.error('문서 반려 실패:', error);
            alert('문서 반려에 실패했습니다.');
        }
    };

    const handleViewDetail = async (id) => {
        try {
            const response = await approvalAPI.getApproval(id);
            const doc = response.data?.data || response.data;
            alert(`문서 상세 정보:\n제목: ${doc.title || 'N/A'}\n작성자: ${doc.author?.name || 'N/A'}\n상태: ${doc.status || 'N/A'}`);
        } catch (error) {
            console.error('문서 상세 조회 실패:', error);
            alert('문서 상세 정보를 불러올 수 없습니다.');
        }
    };
>>>>>>> origin/label-print

    return (
        <div className="rounded-xl bg-white shadow-sm">
            {/* 헤더 */}
<<<<<<< HEAD
            <div className="border-b border-gray-200 bg-[#FEF3E8] px-6 py-4">
                <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-[#674529]" />
                    <h3 className="text-base font-semibold text-[#674529]">
                        내 결재 대기 문서 ({pendingData.length}건)
                    </h3>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                    결재 승인이 필요한 문서 목록입니다
                </p>
            </div>

            {/* 문서 리스트 */}
            <div className="p-6">
                <div className="space-y-4">
                    {pendingData.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                            {/* 상단 영역 */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-medium text-gray-500">{item.docNumber}</span>
                                        <span className="bg-[#ffedd4] text-[#f65814] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                            {item.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#674529] mb-3">{item.title}</h3>
                                    <div className="flex items-center text-sm text-gray-600 gap-4">
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                            <span>{item.document}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span>{item.user}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>{item.createdDate}</span>
                                        </div>
=======
            <p className="text-gray-800 font-medium mb-6">내 결재 대기 문서</p>

            {/* 문서 리스트 */}
            {loading ? (
                <div className="text-center py-8 text-gray-500">불러오는 중...</div>
            ) : pendingData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">결재 대기 문서가 없습니다.</div>
            ) : (
                <div className="space-y-4">
                    {pendingData.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                            {/* 상단 영역 */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <div className="flex items-center text-sm text-gray-600 gap-2">
                                        <span className="font-medium">{item.document}</span>
                                        <span>•</span>
                                        <span>{item.user}</span>
>>>>>>> origin/label-print
                                    </div>
                                </div>
                                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                                    {item.badge}
                                </span>
                            </div>

                            {/* 버튼 영역 */}
<<<<<<< HEAD
                            <div className="flex gap-2 pt-3 border-t border-gray-100">
                                <button className="flex items-center gap-2 px-4 py-2 bg-[#d4edda] text-[#28a745] rounded-xl hover:bg-[#c3e6cb] transition-colors text-sm font-medium">
                                    <CheckCircle className="h-4 w-4" />
                                    승인
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#dc3545] border border-[#dc3545] rounded-xl hover:bg-[#f8d7da] transition-colors text-sm font-medium">
                                    <XCircle className="h-4 w-4" />
                                    반려
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#674529] border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
                                    <Eye className="h-4 w-4" />
=======
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleApprove(item.id)}
                                    className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    승인
                                </button>
                                <button 
                                    onClick={() => handleReject(item.id)}
                                    className="flex items-center gap-1 px-4 py-2 bg-white text-red-500 border border-red-500 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    반려
                                </button>
                                <button 
                                    onClick={() => handleViewDetail(item.id)}
                                    className="flex items-center gap-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
>>>>>>> origin/label-print
                                    상세보기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
<<<<<<< HEAD
            </div>
=======
            )}
>>>>>>> origin/label-print
        </div>
    )
}

export default PendingDocumentList;