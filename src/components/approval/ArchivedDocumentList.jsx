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
            </div>
        </div>
    )
}

export default ArchivedDocumentList;