import { useState, useEffect } from 'react';
import { FileText, Eye, Download, CheckCircle, XCircle } from 'lucide-react';
import { approvalService } from '../../services';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await approvalService.getInbox();
      const docs = response.data || response || [];
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error('결재 문서 조회 실패:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('이 문서를 승인하시겠습니까?')) return;

    try {
      await approvalService.approve(id);
      alert('문서가 승인되었습니다!');
      fetchDocuments();
    } catch (error) {
      console.error('승인 실패:', error);
      alert('승인에 실패했습니다.');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('반려 사유를 입력하세요:');
    if (!reason) return;

    try {
      await approvalService.reject(id, reason);
      alert('문서가 반려되었습니다.');
      fetchDocuments();
    } catch (error) {
      console.error('반려 실패:', error);
      alert('반려에 실패했습니다.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case '결재중':
        return 'bg-[#ffedd4] text-[#f65814]';
      case 'approved':
      case '승인완료':
        return 'bg-[#d4edda] text-[#28a745]';
      case 'rejected':
      case '반려':
        return 'bg-[#f8d7da] text-[#dc3545]';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '결재중';
      case 'approved':
        return '승인완료';
      case 'rejected':
        return '반려';
      default:
        return status;
    }
  };

  return (
    <div className='overflow-hidden rounded-xl bg-white shadow-sm'>
      <div className='border-b border-gray-200 bg-[#FEF3E8] px-6 py-4'>
        <div className='flex items-center space-x-2'>
          <FileText className='h-5 w-5 text-[#674529]' />
          <h3 className='text-base font-semibold text-[#674529]'>
            전체 결재 문서
          </h3>
        </div>
        <p className='mt-1 text-sm text-gray-600'>
          시스템에 등록된 모든 결재 문서 목록입니다
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">로딩 중...</div>
      ) : documents.length === 0 ? (
        <div className="p-8 text-center text-gray-500">결재 대기 문서가 없습니다.</div>
      ) : (
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
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className='transition-colors hover:bg-gray-50/50'
                >
                  <td className='px-4 py-4 text-sm font-medium text-gray-900'>
                    {doc.docNumber || `DOC-${doc.id}`}
                  </td>
                  <td className='px-4 py-4 text-sm text-gray-900'>{doc.title || '-'}</td>
                  <td className='px-4 py-4 text-sm text-gray-700'>{doc.type || '-'}</td>
                  <td className='px-4 py-4'>
                    <span
                      className={`inline-flex rounded px-3 py-1 text-xs font-medium ${getStatusColor(doc.status)}`}
                    >
                      {getStatusText(doc.status)}
                    </span>
                  </td>
                  <td className='px-4 py-4 text-sm text-gray-700'>
                    {doc.author || doc.authorName || '-'}
                  </td>
                  <td className='px-4 py-4 text-sm text-gray-700'>
                    {doc.createdDate || doc.createdAt
                      ? new Date(doc.createdDate || doc.createdAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex items-center space-x-2'>
                      {doc.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(doc.id)}
                            className='flex items-center space-x-1 rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200'
                          >
                            <CheckCircle className='h-4 w-4' />
                            <span>승인</span>
                          </button>
                          <button
                            onClick={() => handleReject(doc.id)}
                            className='flex items-center space-x-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200'
                          >
                            <XCircle className='h-4 w-4' />
                            <span>반려</span>
                          </button>
                        </>
                      )}
                      <button className='text-gray-500 transition-colors hover:text-[#674529]'>
                        <Eye className='h-5 w-5' />
                      </button>
                      {(doc.status === 'approved' || doc.status === '승인완료') && (
                        <button className='text-gray-500 transition-colors hover:text-[#674529]'>
                          <Download className='h-5 w-5' />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
