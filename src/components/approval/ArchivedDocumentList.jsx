<<<<<<< HEAD
import { useState, useMemo } from 'react';
import { FileText, Download, Calendar, User, ChevronDown } from 'lucide-react';
import Pagination from '../common/Pagination';

const ArchivedDocumentList = () => {
    const [filters, setFilters] = useState({
        type: '전체',
        searchTerm: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
    };

    const handleReset = () => {
        setFilters({
            type: '전체',
            searchTerm: '',
        });
        setCurrentPage(1); // 초기화 시 첫 페이지로 이동
    };

    const archivedDocuments = [
        {
            id: 1,
            docNumber: 'DOC-2024-0001',
            title: '1월 1주차 생산 원료 보고서',
            type: '생산 원료 보고서',
            author: '김생산',
            createdDate: '2024-01-15',
            approvedDate: '2024-01-17',
            approver: '이관리자'
        },
        {
            id: 2,
            docNumber: 'DOC-2024-0002',
            title: '안전점검표 (1월 2주차)',
            type: '안전점검표',
            author: '안전관리자',
            createdDate: '2024-01-12',
            approvedDate: '2024-01-13',
            approver: '박부장'
        },
        {
            id: 3,
            docNumber: 'DOC-2024-0003',
            title: '12월 재고 실사 보고서',
            type: '재고 실사 보고서',
            author: '재고담당',
            createdDate: '2024-01-10',
            approvedDate: '2024-01-11',
            approver: '최부장'
        },
        {
            id: 4,
            docNumber: 'DOC-2024-0004',
            title: '2월 품질검사 결과 보고서',
            type: '품질검사 보고서',
            author: '품질담당',
            createdDate: '2024-02-05',
            approvedDate: '2024-02-07',
            approver: '이관리자'
        },
        {
            id: 5,
            docNumber: 'DOC-2024-0005',
            title: '설비 유지보수 계획서',
            type: '유지보수 계획서',
            author: '설비담당',
            createdDate: '2024-02-01',
            approvedDate: '2024-02-03',
            approver: '박부장'
        },
        {
            id: 6,
            docNumber: 'DOC-2024-0006',
            title: '3월 1주차 생산 원료 보고서',
            type: '생산 원료 보고서',
            author: '김생산',
            createdDate: '2024-03-01',
            approvedDate: '2024-03-03',
            approver: '이관리자'
        },
        {
            id: 7,
            docNumber: 'DOC-2024-0007',
            title: '환경안전 점검표 (3월)',
            type: '안전점검표',
            author: '안전관리자',
            createdDate: '2024-03-10',
            approvedDate: '2024-03-12',
            approver: '최부장'
        },
        {
            id: 8,
            docNumber: 'DOC-2024-0008',
            title: '2월 재고 실사 보고서',
            type: '재고 실사 보고서',
            author: '재고담당',
            createdDate: '2024-02-20',
            approvedDate: '2024-02-22',
            approver: '박부장'
        },
        {
            id: 9,
            docNumber: 'DOC-2024-0009',
            title: '4월 생산 계획서',
            type: '생산 계획서',
            author: '김생산',
            createdDate: '2024-03-25',
            approvedDate: '2024-03-27',
            approver: '이관리자'
        },
        {
            id: 10,
            docNumber: 'DOC-2024-0010',
            title: '작업장 안전교육 결과 보고서',
            type: '교육 보고서',
            author: '안전관리자',
            createdDate: '2024-03-15',
            approvedDate: '2024-03-17',
            approver: '최부장'
        },
        {
            id: 11,
            docNumber: 'DOC-2024-0011',
            title: '3월 품질검사 결과 보고서',
            type: '품질검사 보고서',
            author: '품질담당',
            createdDate: '2024-03-20',
            approvedDate: '2024-03-22',
            approver: '박부장'
        },
        {
            id: 12,
            docNumber: 'DOC-2024-0012',
            title: '설비 교체 신청서',
            type: '설비 신청서',
            author: '설비담당',
            createdDate: '2024-04-01',
            approvedDate: '2024-04-03',
            approver: '이관리자'
        },
        {
            id: 13,
            docNumber: 'DOC-2024-0013',
            title: '4월 1주차 생산 원료 보고서',
            type: '생산 원료 보고서',
            author: '김생산',
            createdDate: '2024-04-05',
            approvedDate: '2024-04-07',
            approver: '이관리자'
        },
        {
            id: 14,
            docNumber: 'DOC-2024-0014',
            title: '소방안전 점검표 (4월)',
            type: '안전점검표',
            author: '안전관리자',
            createdDate: '2024-04-10',
            approvedDate: '2024-04-12',
            approver: '최부장'
        },
    ];

    const documentTypes = ['전체', '최신순', '오래된순'];

    // 정렬 및 필터링 로직
    const filteredAndSortedDocuments = useMemo(() => {
        // 1. 필터링
        let filtered = archivedDocuments.filter((doc) => {
            // 검색어 필터
            if (filters.searchTerm.trim()) {
                const search = filters.searchTerm.toLowerCase().trim();
                const docNumber = doc.docNumber.toLowerCase();
                const title = doc.title.toLowerCase();
                const type = doc.type.toLowerCase();
                const author = doc.author.toLowerCase();

                if (!docNumber.includes(search) && !title.includes(search) && !type.includes(search) && !author.includes(search)) {
                    return false;
                }
            }

            return true;
        });

        // 2. 정렬
        if (filters.type === '최신순') {
            filtered = [...filtered].sort((a, b) => new Date(b.approvedDate) - new Date(a.approvedDate));
        } else if (filters.type === '오래된순') {
            filtered = [...filtered].sort((a, b) => new Date(a.approvedDate) - new Date(b.approvedDate));
        }

        return filtered;
    }, [archivedDocuments, filters]);

    // 페이지네이션 계산
    const totalPages = Math.ceil(filteredAndSortedDocuments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDocuments = filteredAndSortedDocuments.slice(startIndex, endIndex);

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="space-y-6">
            {/* 필터 및 검색 섹션 */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-[#674529]">필터 및 검색</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* 문서 유형 */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#000]">
                            문서 유형
                        </label>
                        <div className="relative">
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="w-full cursor-pointer appearance-none rounded-xl border-0 bg-[#f3f3f5] px-4 py-2.5 text-[#000] outline-none transition-all"
                            >
                                {documentTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#674529]" />
                        </div>
                    </div>

                    {/* 검색 */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#000]">
                            검색
                        </label>
                        <input
                            type="text"
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            placeholder="문서번호, 제목, 유형, 작성자"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 placeholder-gray-400 outline-none"
                        />
                    </div>

                    {/* 초기화 버튼 */}
                    <div className="flex items-end">
                        <button
                            onClick={handleReset}
                            className="w-full rounded-xl border border-gray-300 bg-white px-6 py-2.5 font-medium text-[#000] transition-colors hover:bg-gray-50"
                        >
                            초기화
                        </button>
                    </div>
                </div>
            </div>

            {/* 문서 목록 */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="border-b border-gray-200 bg-[#FEF3E8] px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-[#674529]" />
                        <h3 className="text-base font-semibold text-[#674529]">
                            보관 문서 목록 ({filteredAndSortedDocuments.length}건
                            {archivedDocuments.length !== filteredAndSortedDocuments.length && ` / ${archivedDocuments.length}건`})
                        </h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                        승인 완료되어 보관된 문서 목록입니다
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    문서번호
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    제목
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    유형
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    작성자
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    작성일
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    승인일
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    최종 승인자
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                                    다운로드
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentDocuments.map((doc) => (
                                <tr
                                    key={doc.id}
                                    className="transition-colors hover:bg-gray-50/50"
                                >
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                        {doc.docNumber}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900">{doc.title}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{doc.type}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-700">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span>{doc.author}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-700">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>{doc.createdDate}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-700">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>{doc.approvedDate}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                        {doc.approver}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-center">
                                            <button
                                                className="rounded-lg p-2 text-[#674529] transition-colors hover:bg-[#FEF3E8]"
                                                title="문서 다운로드"
                                            >
                                                <Download className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 */}
                <div className="px-6 py-4 border-t border-gray-200">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={filteredAndSortedDocuments.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
=======
import { useState, useEffect } from 'react';
import { FileText, Eye, Download } from 'lucide-react';
import { approvalAPI } from '../../api';

const ArchivedDocumentList = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadArchivedDocuments();
    }, []);

    const loadArchivedDocuments = async () => {
        try {
            setLoading(true);
            const response = await approvalAPI.getInbox();
            const data = response.data?.data || response.data || [];
            const docsList = Array.isArray(data) ? data : [];
            
            // APPROVED 또는 REJECTED 상태인 문서만 필터링
            const archivedDocs = docsList
                .filter(doc => {
                    const status = doc.status?.toUpperCase();
                    return status === 'APPROVED' || status === 'REJECTED';
                })
                .map(doc => {
                    const statusMap = {
                        'APPROVED': { text: '승인완료', color: 'bg-[#d4edda] text-[#28a745]' },
                        'REJECTED': { text: '반려', color: 'bg-[#f8d7da] text-[#dc3545]' },
                    };
                    const statusInfo = statusMap[doc.status?.toUpperCase()] || { text: doc.status || '완료', color: 'bg-gray-100 text-gray-600' };
                    
                    return {
                        id: doc.id,
                        docNumber: doc.document_number || doc.documentNumber || `DOC-${doc.id}`,
                        title: doc.title || doc.document_title || '문서 제목 없음',
                        type: doc.type || doc.document_type || '기타',
                        status: statusInfo.text,
                        statusColor: statusInfo.color,
                        createdDate: doc.created_at ? doc.created_at.split('T')[0] : doc.created_date || '',
                        author: doc.author?.name || doc.author_name || doc.created_by || '작성자 없음',
                    };
                });
            
            setDocuments(archivedDocs);
        } catch (error) {
            console.error('보관 문서 목록 로드 실패:', error);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='overflow-hidden rounded-xl bg-white shadow-sm'>
            <div className='border-b border-gray-200 bg-[#FEF3E8] px-6 py-4'>
                <div className='flex items-center space-x-2'>
                    <FileText className='h-5 w-5 text-[#674529]' />
                    <h3 className='text-base font-semibold text-[#674529]'>
                        문서보관함 전체 완료 리스트
                    </h3>
                </div>
                <p className='mt-1 text-sm text-gray-600'>
                    승인 완료 또는 반려된 문서 목록입니다
                </p>
            </div>

            <div className='overflow-x-auto'>
                <table className='w-full'>
                    <thead className='bg-gray-50 border-b border-gray-200'>
                        <tr>
                            <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                문서번호
                            </th>
                            <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                제목
                            </th>
                            <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                유형
                            </th>
                            <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                상태
                            </th>
                            <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                작성자
                            </th>
                            <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                작성일
                            </th>
                            <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                작업
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100'>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className='px-4 py-8 text-center text-sm text-gray-500'>
                                    불러오는 중...
                                </td>
                            </tr>
                        ) : documents.length === 0 ? (
                            <tr>
                                <td colSpan={7} className='px-4 py-8 text-center text-sm text-gray-500'>
                                    보관된 문서가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            documents.map((doc) => (
                                <tr
                                    key={doc.id}
                                    className='transition-colors hover:bg-gray-50/50'
                                >
                                    <td className='px-4 py-4 text-sm font-medium text-gray-900'>
                                        {doc.docNumber}
                                    </td>
                                    <td className='px-4 py-4 text-sm text-gray-900'>{doc.title}</td>
                                    <td className='px-4 py-4 text-sm text-gray-700'>{doc.type}</td>
                                    <td className='px-4 py-4'>
                                        <span
                                            className={`inline-flex rounded px-3 py-1 text-xs font-medium ${doc.statusColor}`}
                                        >
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className='px-4 py-4 text-sm text-gray-700'>
                                        {doc.author}
                                    </td>
                                    <td className='px-4 py-4 text-sm text-gray-700'>
                                        {doc.createdDate}
                                    </td>
                                    <td className='px-4 py-4'>
                                        <div className='flex items-center space-x-2'>
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        const response = await approvalAPI.getApproval(doc.id);
                                                        const detail = response.data?.data || response.data;
                                                        alert(`문서 상세 정보:\n제목: ${detail.title || 'N/A'}\n작성자: ${detail.author?.name || 'N/A'}\n상태: ${detail.status || 'N/A'}`);
                                                    } catch (error) {
                                                        console.error('문서 상세 조회 실패:', error);
                                                        alert('문서 상세 정보를 불러올 수 없습니다.');
                                                    }
                                                }}
                                                className='text-gray-500 transition-colors hover:text-[#674529]'
                                            >
                                                <Eye className='h-5 w-5' />
                                            </button>
                                            {doc.status === '승인완료' && (
                                                <button className='text-gray-500 transition-colors hover:text-[#674529]'>
                                                    <Download className='h-5 w-5' />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
>>>>>>> origin/label-print
            </div>
        </div>
    )
}

export default ArchivedDocumentList;