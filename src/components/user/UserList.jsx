import { useEffect, useState } from 'react';
import { Users, AlertTriangle, CheckCircle2, Edit, Trash2 } from 'lucide-react';
import { authAPI } from '../../api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getUsers();
        const data = response.data?.data || response.data || [];
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('사용자 목록 로드 실패:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className='rounded-xl border border-gray-200 bg-white shadow-sm'>
      {/* 헤더 */}
      <div className='border-b border-gray-200 p-4'>
        <div className='flex items-center space-x-2'>
          <Users className='h-5 w-5 text-[#674529]' />
          <h2 className='text-base text-[#674529]'>사용자 목록</h2>
        </div>
      </div>

      {/* 테이블 */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                ID
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                사용자명
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                이메일
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                역할
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                부서
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                공장
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                상태
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                작업
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {loading ? (
              <tr>
                <td colSpan={8} className='px-4 py-6 text-center text-sm text-gray-500'>
                  불러오는 중...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className='px-4 py-6 text-center text-sm text-gray-500'>
                  사용자가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const role = user.role || '일반';
                const roleBg = role === '관리자' ? 'bg-purple-100' : role === '품질관리' ? 'bg-orange-100' : 'bg-green-100';
                const roleText = role === '관리자' ? 'text-purple-700' : role === '품질관리' ? 'text-orange-700' : 'text-green-700';
                const status = '활성';
                const statusBg = 'bg-green-100';
                const statusText = 'text-green-700';

                return (
                  <tr key={user.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3 text-sm text-gray-900'>{user.id}</td>
                    <td className='px-4 py-3 text-sm text-gray-900'>{user.full_name || user.name || user.username || ''}</td>
                    <td className='px-4 py-3 text-sm text-gray-600'>
                      {user.email || ''}
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${roleBg} ${roleText}`}
                      >
                        {role}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {user.department || ''}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {user.position || ''}
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${statusBg} ${statusText}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center space-x-2'>
                        <CheckCircle2 className='h-5 w-5 text-[#86A956]' />
                        <button className='text-gray-900 hover:text-[#674529]'>
                          <Edit className='h-4 w-4' />
                        </button>
                        <button className='text-red-600'>
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
